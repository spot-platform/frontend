'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Input, Modal } from '@frontend/design-system';
import { payKeys, usePointBalance } from '@/features/pay';
import { BottomSheet } from '@/shared/ui';
import { useMainChatStore } from '@/features/chat/model/use-main-chat-store';
import { useBottomNavMessageStore } from '@/shared/model/bottom-nav-message-store';
import {
    addPlatformForfeit,
    consumeMockPoints,
    refundMockPoints,
} from '@/features/pay/model/mock';
import type {
    FeedApplicationRole,
    FeedItem,
    FeedManagementFlow,
} from '../../model/types';
import {
    applyMockFeedApplication,
    getMockFeedCategoryAveragePricingGuide,
} from '../../model/mock';
import {
    PARTICIPATION_DEPOSIT_RATE,
    type FeedParticipationRole,
    resolveParticipationAvailability,
    resolveParticipationDeposit,
    resolveParticipationPricing,
} from '../../model/participation';
import {
    resolveCancellationOutcome,
    type CancellationOutcome,
} from '../../model/cancellation-policy';
import { useCancelFeedApplication } from '../../model/use-feed';

function formatCurrency(value: number, maximumFractionDigits = 0) {
    return `${value.toLocaleString('ko-KR', {
        minimumFractionDigits: 0,
        maximumFractionDigits,
    })}원`;
}

function getRoleLabel(role: FeedParticipationRole) {
    return role === 'SUPPORTER' ? '서포터' : '파트너';
}

function getActionLabel(role: FeedParticipationRole) {
    return role === 'SUPPORTER' ? '서포터로 참여하기' : '파트너로 참여하기';
}

function sanitizeFundingGoalInput(value: string) {
    const digitsOnly = value.replace(/\D/g, '');

    if (!digitsOnly) {
        return '';
    }

    return String(Number.parseInt(digitsOnly, 10));
}

function parseFundingGoal(value: string) {
    if (!value) {
        return null;
    }

    const parsed = Number.parseInt(value, 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getCategoryAverageDeltaCopy(delta: number) {
    if (delta === 0) {
        return '현재 목표는 카테고리 평균과 같아요.';
    }

    const direction = delta > 0 ? '높아요' : '낮아요';

    return `현재 목표는 평균보다 ${formatCurrency(Math.abs(delta))} ${direction}.`;
}

export function FeedParticipationActions({
    item,
    management,
}: {
    item: FeedItem;
    management?: FeedManagementFlow;
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const balanceQuery = usePointBalance();
    const createOrSelectFeedParticipationRoom = useMainChatStore(
        (state) => state.createOrSelectFeedParticipationRoom,
    );
    const showBottomNavMessage = useBottomNavMessageStore(
        (state) => state.showMessage,
    );
    const cancelFeedApplication = useCancelFeedApplication();
    const [selectedRole, setSelectedRole] =
        useState<FeedParticipationRole | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supporterGoalInput, setSupporterGoalInput] = useState('');
    const [cancelOpen, setCancelOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const availability = useMemo(
        () => resolveParticipationAvailability(item, management),
        [item, management],
    );
    const defaultTargetAmount = useMemo(
        () => management?.demand.fundingGoal ?? item.price,
        [item.price, management],
    );
    const categoryAverageGuide = useMemo(
        () => getMockFeedCategoryAveragePricingGuide(item.category),
        [item.category],
    );
    const supporterGoalAmount = parseFundingGoal(supporterGoalInput);
    const deposit = useMemo(
        () =>
            selectedRole === 'SUPPORTER' && supporterGoalAmount != null
                ? resolveParticipationPricing(item, management, {
                      role: 'SUPPORTER',
                      desiredFundingGoal: supporterGoalAmount,
                      categoryAverageGoal:
                          categoryAverageGuide?.averageFundingGoal,
                  }).deposit
                : resolveParticipationDeposit(item, management),
        [
            categoryAverageGuide?.averageFundingGoal,
            item,
            management,
            selectedRole,
            supporterGoalAmount,
        ],
    );
    const pricing = useMemo(
        () =>
            resolveParticipationPricing(item, management, {
                role: selectedRole ?? 'PARTNER',
                desiredFundingGoal:
                    selectedRole === 'SUPPORTER'
                        ? supporterGoalAmount
                        : undefined,
                categoryAverageGoal: categoryAverageGuide?.averageFundingGoal,
            }),
        [
            categoryAverageGuide?.averageFundingGoal,
            item,
            management,
            selectedRole,
            supporterGoalAmount,
        ],
    );
    const currentBalance = balanceQuery.data?.data.balance ?? null;
    const projectedBalance =
        currentBalance != null ? currentBalance - deposit : null;
    const hasSufficientBalance =
        projectedBalance != null && projectedBalance >= 0;
    const supporterGoalError =
        selectedRole === 'SUPPORTER' && supporterGoalAmount == null
            ? '희망 목표 금액을 입력해 주세요.'
            : undefined;
    const canConfirm =
        selectedRole != null &&
        supporterGoalError == null &&
        hasSufficientBalance &&
        !isSubmitting &&
        !balanceQuery.isLoading;

    useEffect(() => {
        if (selectedRole !== 'SUPPORTER') {
            return;
        }

        setSupporterGoalInput(String(defaultTargetAmount));
    }, [defaultTargetAmount, selectedRole]);

    const openSheet = (role: FeedParticipationRole) => setSelectedRole(role);
    const closeSheet = () => {
        if (isSubmitting) {
            return;
        }

        setSelectedRole(null);
    };

    const handleConfirm = async () => {
        if (!selectedRole || !canConfirm) {
            return;
        }

        setIsSubmitting(true);

        try {
            const room = createOrSelectFeedParticipationRoom({
                item,
                role: selectedRole,
                deposit,
            });

            showBottomNavMessage(
                '스팟 참여가 완료되었어요. 팀 채팅에서 바로 이어가세요.',
                '/chat',
            );
            const nextBalance = consumeMockPoints(
                deposit,
                `${item.title} 참여 보증금`,
            );
            applyMockFeedApplication(item.id, {
                proposal: `${getRoleLabel(selectedRole)} 참여 요청`,
                role: selectedRole as FeedApplicationRole,
                deposit,
            });
            item.myApplicationStatus = 'APPLIED';
            item.myApplicationRole = selectedRole as FeedApplicationRole;
            item.myApplicationDeposit = deposit;
            queryClient.setQueryData(payKeys.balance, nextBalance);
            queryClient.invalidateQueries({ queryKey: ['pay', 'history'] });
            queryClient.invalidateQueries({ queryKey: ['my', 'profile'] });
            setSelectedRole(null);
            router.push(`/chat?roomId=${room.id}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancelOutcome: CancellationOutcome | null = useMemo(() => {
        if (
            item.myApplicationStatus !== 'APPLIED' ||
            item.myApplicationRole == null ||
            item.myApplicationDeposit == null
        ) {
            return null;
        }
        return resolveCancellationOutcome({
            stage: 'FEED',
            role: item.myApplicationRole,
            cause: 'SELF',
            deposit: item.myApplicationDeposit,
        });
    }, [
        item.myApplicationStatus,
        item.myApplicationRole,
        item.myApplicationDeposit,
    ]);

    const handleCancelConfirm = async () => {
        if (!cancelOutcome || item.myApplicationDeposit == null) {
            return;
        }

        setIsCancelling(true);

        try {
            await cancelFeedApplication.mutateAsync(item.id);

            if (cancelOutcome.refund > 0) {
                const nextBalance = refundMockPoints(
                    cancelOutcome.refund,
                    `${item.title} 신청 취소 환불`,
                );
                queryClient.setQueryData(payKeys.balance, nextBalance);
            }

            const forfeitTotal =
                cancelOutcome.forfeit.toPool +
                cancelOutcome.forfeit.toPlatformFee;
            if (forfeitTotal > 0) {
                addPlatformForfeit(forfeitTotal);
            }

            item.myApplicationStatus = 'CANCELLED';
            item.myApplicationRole = undefined;
            item.myApplicationDeposit = undefined;

            queryClient.invalidateQueries({ queryKey: ['pay', 'history'] });
            queryClient.invalidateQueries({ queryKey: ['my', 'profile'] });
            showBottomNavMessage('신청을 취소했어요.', '');
            setCancelOpen(false);
        } finally {
            setIsCancelling(false);
        }
    };

    const helperCopy = (() => {
        if (supporterGoalError) {
            return supporterGoalError;
        }

        if (balanceQuery.isLoading) {
            return '내 포인트를 확인한 뒤 참여를 확정할 수 있어요.';
        }

        if (currentBalance == null) {
            return '현재 포인트를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.';
        }

        if (!hasSufficientBalance) {
            return '보증금보다 잔액이 부족해 지금은 참여를 확정할 수 없어요.';
        }

        return '확정 후에는 개인 채팅이 아니라 팀 채팅으로 바로 연결돼요.';
    })();

    const isApplied = item.myApplicationStatus === 'APPLIED';

    return (
        <>
            <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
                {isApplied ? (
                    <Button
                        fullWidth
                        size="lg"
                        variant="secondary"
                        className="rounded-full"
                        onClick={() => setCancelOpen(true)}
                    >
                        신청 취소
                    </Button>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            fullWidth
                            size="lg"
                            variant="secondary"
                            disabled={availability.supporterDisabled}
                            className="rounded-full"
                            onClick={() => openSheet('SUPPORTER')}
                        >
                            {getActionLabel('SUPPORTER')}
                        </Button>
                        <Button
                            fullWidth
                            size="lg"
                            disabled={availability.partnerDisabled}
                            className="rounded-full bg-accent active:translate-y-px active:opacity-90"
                            onClick={() => openSheet('PARTNER')}
                        >
                            {getActionLabel('PARTNER')}
                        </Button>
                    </div>
                )}
            </div>

            <Modal
                open={cancelOpen}
                onClose={() => {
                    if (isCancelling) return;
                    setCancelOpen(false);
                }}
                title="신청을 취소하시겠어요?"
                description={
                    item.myApplicationRole === 'SUPPORTER'
                        ? '요청 피드는 서포터 이탈 시 보증금의 70%가 몰수됩니다.'
                        : '파트너 신청은 매칭 전까지 전액 환불됩니다.'
                }
                size="sm"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            disabled={isCancelling}
                            onClick={() => setCancelOpen(false)}
                        >
                            유지하기
                        </Button>
                        <Button
                            disabled={isCancelling || !cancelOutcome}
                            onClick={handleCancelConfirm}
                            className="bg-accent"
                        >
                            취소 확정
                        </Button>
                    </>
                }
            >
                {cancelOutcome && (
                    <dl className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                        <div className="flex items-center justify-between">
                            <dt className="text-gray-500">환불 예정</dt>
                            <dd className="font-semibold text-gray-900">
                                {cancelOutcome.refund.toLocaleString('ko-KR')}P
                            </dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-gray-500">몰수</dt>
                            <dd className="font-semibold text-gray-900">
                                {(
                                    cancelOutcome.forfeit.toPool +
                                    cancelOutcome.forfeit.toPlatformFee
                                ).toLocaleString('ko-KR')}
                                P
                            </dd>
                        </div>
                    </dl>
                )}
            </Modal>

            <BottomSheet
                open={selectedRole != null}
                onClose={closeSheet}
                title={
                    selectedRole
                        ? `${getRoleLabel(selectedRole)} 참여 확인`
                        : '참여 확인'
                }
                snapPoint="full"
            >
                <div className="pb-3">
                    <div className="divide-y divide-gray-200 border-y border-gray-200">
                        <section className="py-4">
                            <p className="text-sm font-semibold text-gray-900">
                                참여 전에 꼭 확인해 주세요.
                            </p>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                보증금은 참여 의사를 확인한 뒤 팀 채팅으로
                                이동하기 위한 임시 예치 금액이에요. 확정 후 진행
                                안내와 역할 조율은 팀 채팅에서 이어집니다.
                            </p>
                        </section>

                        <section className="py-4">
                            <div className="space-y-3">
                                {selectedRole === 'SUPPORTER' ? (
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        label="희망 목표 금액"
                                        value={supporterGoalInput}
                                        onChange={(event) =>
                                            setSupporterGoalInput(
                                                sanitizeFundingGoalInput(
                                                    event.target.value,
                                                ),
                                            )
                                        }
                                        placeholder={formatCurrency(
                                            defaultTargetAmount,
                                        )}
                                        hint="입력한 목표 금액을 기준으로 보증금 미리보기가 바로 바뀌어요."
                                        error={supporterGoalError}
                                        className="rounded-2xl"
                                    />
                                ) : null}

                                {categoryAverageGuide ? (
                                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {categoryAverageGuide.category}{' '}
                                            카테고리 평균 목표 금액
                                        </p>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {formatCurrency(
                                                categoryAverageGuide.averageFundingGoal,
                                            )}{' '}
                                            ·{' '}
                                            {
                                                categoryAverageGuide.benchmarkLabel
                                            }
                                        </p>
                                        <p className="mt-2 text-xs leading-5 text-gray-500">
                                            {categoryAverageGuide.note}
                                        </p>
                                        {pricing.categoryAverageDelta !=
                                        null ? (
                                            <p className="mt-2 text-xs font-medium text-gray-600">
                                                {getCategoryAverageDeltaCopy(
                                                    pricing.categoryAverageDelta,
                                                )}
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        </section>

                        <section className="py-4">
                            <dl className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-center justify-between gap-4">
                                    <dt>
                                        {selectedRole === 'SUPPORTER'
                                            ? '입력한 목표 기준 보증금'
                                            : '보증금'}
                                    </dt>
                                    <dd className="font-semibold text-gray-900">
                                        {formatCurrency(deposit)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt>
                                        {selectedRole === 'SUPPORTER'
                                            ? '이번에 입력한 희망 목표'
                                            : '현재 공고 목표 금액'}
                                    </dt>
                                    <dd className="font-semibold text-gray-900">
                                        {formatCurrency(pricing.targetAmount)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt>내 포인트</dt>
                                    <dd className="font-semibold text-gray-900">
                                        {currentBalance != null
                                            ? formatCurrency(currentBalance)
                                            : balanceQuery.isLoading
                                              ? '확인 중'
                                              : '정보 없음'}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt>내 포인트 - 보증금 = 잔액</dt>
                                    <dd
                                        className={`font-semibold ${
                                            projectedBalance != null &&
                                            projectedBalance < 0
                                                ? 'text-red-500'
                                                : 'text-gray-900'
                                        }`}
                                    >
                                        {projectedBalance != null
                                            ? formatCurrency(projectedBalance)
                                            : '계산 대기 중'}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                <p className="font-semibold text-gray-900">
                                    {selectedRole === 'PARTNER'
                                        ? '보증금 계산 방식'
                                        : '입력 목표 기준 계산 방식'}
                                </p>
                                <p className="mt-2 leading-6">
                                    {formatCurrency(pricing.targetAmount)} ÷{' '}
                                    {pricing.maxHeadcount}명 = 1인 기준{' '}
                                    {formatCurrency(
                                        pricing.participantShare,
                                        1,
                                    )}
                                </p>
                                <p className="leading-6">
                                    1인 기준{' '}
                                    {formatCurrency(
                                        pricing.participantShare,
                                        1,
                                    )}{' '}
                                    ×{' '}
                                    {Math.round(
                                        PARTICIPATION_DEPOSIT_RATE * 100,
                                    )}
                                    % = {formatCurrency(pricing.deposit)}
                                </p>
                                {pricing.categoryAverageDeposit != null ? (
                                    <p className="mt-2 text-xs leading-5 text-gray-500">
                                        같은 인원 기준 카테고리 평균 보증금은{' '}
                                        {formatCurrency(
                                            pricing.categoryAverageDeposit,
                                        )}
                                        이에요.
                                    </p>
                                ) : null}
                            </div>
                        </section>

                        <section className="py-4">
                            <p className="text-sm leading-6 text-gray-600">
                                {helperCopy}
                            </p>
                            {availability.remainingPartnerSlots > 0 && (
                                <p className="mt-2 text-xs text-gray-400">
                                    현재 남은 파트너 슬롯{' '}
                                    {availability.remainingPartnerSlots}개
                                </p>
                            )}
                        </section>
                    </div>

                    <Button
                        fullWidth
                        size="lg"
                        disabled={!canConfirm}
                        onClick={handleConfirm}
                        className="mt-4 rounded-full bg-accent active:translate-y-px active:opacity-90"
                    >
                        {selectedRole
                            ? `${getRoleLabel(selectedRole)}로 참여 확정하기`
                            : '참여 확정하기'}
                    </Button>
                </div>
            </BottomSheet>
        </>
    );
}
