'use client';

import Link from 'next/link';
import { toast } from '@frontend/design-system';
import {
    useCancelMyFeedApplication,
    useMyFeedApplications,
} from '../../model/use-my';
import { EmptyState } from '@/shared/ui';
import type {
    MyFeedApplication,
    MyFeedApplicationStatus,
} from '../../api/my-api';
import { formatDate } from '../../model/my-page-helpers';
import { MyActionButton } from '../../ui/my-page/MyFormControls';
import { MyPageLayout, MyPageSection } from '../../ui/my-page/MyPageLayout';
import { getErrorMessage } from '../../ui/my-page/my-page-client-utils';

const STATUS_COPY: Record<
    MyFeedApplicationStatus,
    { label: string; className: string; description: string }
> = {
    APPLIED: {
        label: '신청 대기',
        className: 'bg-neutral-100 text-warning',
        description: '호스트가 아직 신청을 확인 중이에요.',
    },
    PENDING: {
        label: '신청 대기',
        className: 'bg-neutral-100 text-warning',
        description: '호스트가 아직 신청을 확인 중이에요.',
    },
    ACCEPTED: {
        label: '승인됨',
        className: 'bg-success/10 text-success',
        description:
            '승인된 신청이에요. 이후 채팅이나 스팟 흐름을 확인해 주세요.',
    },
    REJECTED: {
        label: '거절됨',
        className: 'bg-muted text-muted-foreground',
        description: '호스트가 이번 신청을 거절했어요.',
    },
    CANCELLED: {
        label: '취소됨',
        className: 'bg-muted text-muted-foreground',
        description: '내가 취소한 신청이에요.',
    },
};

function formatCurrency(value: number) {
    return `${value.toLocaleString('ko-KR')}원`;
}

function getRoleLabel(role: MyFeedApplication['appliedRole']) {
    return role === 'SUPPORTER' ? '서포터' : '파트너';
}

function canCancel(status: MyFeedApplicationStatus) {
    return status === 'APPLIED' || status === 'PENDING';
}

export function MyApplicationsPageClient() {
    const applicationsQuery = useMyFeedApplications();
    const cancelApplicationMutation = useCancelMyFeedApplication();
    const applications = applicationsQuery.data?.data ?? [];

    const handleCancel = async (item: MyFeedApplication) => {
        try {
            await cancelApplicationMutation.mutateAsync(item.feedItemId);
            toast.success('신청을 취소했어요.');
        } catch (error) {
            toast.error(getErrorMessage(error, '신청을 취소하지 못했어요.'));
        }
    };

    return (
        <MyPageLayout
            title="신청한 피드"
            description="맵에서 숨겨진 내가 신청한 피드도 여기서 다시 보고, 대기 중인 신청은 바로 취소할 수 있어요."
        >
            <MyPageSection
                title="내 신청 목록"
                description="최근 신청한 순서대로 상태를 보여줘요."
                contentClassName="py-0"
            >
                {applicationsQuery.isPending && applications.length === 0 ? (
                    <div className="space-y-3 py-4">
                        <div className="h-24 animate-pulse rounded-xl bg-muted" />
                        <div className="h-24 animate-pulse rounded-xl bg-muted" />
                    </div>
                ) : applicationsQuery.isError && applications.length === 0 ? (
                    <EmptyState
                        title="신청 목록을 불러오지 못했어요"
                        action={{
                            label: '다시 시도',
                            onClick: () => applicationsQuery.refetch(),
                        }}
                    />
                ) : applications.length === 0 ? (
                    <EmptyState
                        title="신청한 피드가 없어요"
                        description="맵에서 참여하고 싶은 피드를 신청하면 여기에 모아 보여줘요."
                    />
                ) : (
                    <ul className="-mx-4 divide-y divide-border-soft">
                        {applications.map((item) => {
                            const status = STATUS_COPY[item.status];
                            const isCancelling =
                                cancelApplicationMutation.isPending &&
                                cancelApplicationMutation.variables ===
                                    item.feedItemId;

                            return (
                                <li
                                    key={item.applicationId}
                                    className="px-4 py-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Link
                                                    href={`/feed/${item.feedItemId}`}
                                                    className="text-sm font-semibold text-foreground underline-offset-2 hover:underline"
                                                >
                                                    {item.feedTitle}
                                                </Link>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                {getRoleLabel(item.appliedRole)}{' '}
                                                · 보증금{' '}
                                                {formatCurrency(item.deposit)} ·
                                                신청일{' '}
                                                {formatDate(item.createdAt)}
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                                                {status.description}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col gap-2">
                                            <Link
                                                href={`/feed/${item.feedItemId}`}
                                                className="rounded-xl border border-border-strong bg-card px-4 py-2.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-muted"
                                            >
                                                상세 보기
                                            </Link>
                                            {canCancel(item.status) ? (
                                                <MyActionButton
                                                    variant="secondary"
                                                    onClick={() =>
                                                        handleCancel(item)
                                                    }
                                                    disabled={isCancelling}
                                                    className="text-xs text-destructive"
                                                >
                                                    {isCancelling
                                                        ? '취소 중'
                                                        : '신청 취소'}
                                                </MyActionButton>
                                            ) : null}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </MyPageSection>
        </MyPageLayout>
    );
}
