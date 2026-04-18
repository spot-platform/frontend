import type { ReactNode } from 'react';
import {
    IconCircleCheck,
    IconClock,
    IconReceipt,
    IconThumbUp,
} from '@tabler/icons-react';
import { cn } from '@/shared/lib/cn';
import { SectionCard } from './SectionCard';
import type {
    SpotForfeitPool,
    SpotWorkflow,
    WorkflowApprovalStatus,
} from '@/entities/spot/types';

function formatPoints(value: number) {
    return value.toLocaleString('ko-KR') + 'P';
}

function ApprovalBadge({ status }: { status: WorkflowApprovalStatus }) {
    return (
        <span
            className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700',
            )}
        >
            {status === 'APPROVED' ? '승인 완료' : '승인 대기'}
        </span>
    );
}

export function SpotWorkflowSection({
    workflow,
    forfeitPool,
    actions,
}: {
    workflow: SpotWorkflow;
    forfeitPool?: SpotForfeitPool;
    actions?: ReactNode;
}) {
    const voteSummary = workflow.voteSummary;

    return (
        <SectionCard title="운영 현황">
            <div className="flex flex-col gap-4">
                <div className="rounded-2xl bg-brand-800/5 px-4 py-3.5">
                    <p className="text-xs font-semibold text-brand-800">
                        현재 단계
                    </p>
                    <p className="mt-1 text-base font-bold text-foreground">
                        {workflow.progressLabel}
                    </p>
                </div>

                {voteSummary && (
                    <div className="rounded-2xl border border-border-soft bg-muted px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                    <IconThumbUp className="h-3.5 w-3.5 text-brand-800" />
                                    파트너 투표 요약
                                </div>
                                <p className="mt-1 text-sm font-bold text-foreground">
                                    {voteSummary.question}
                                </p>
                            </div>
                            <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-brand-800">
                                합의도 {voteSummary.consensusRate}%
                            </span>
                        </div>

                        <div className="mt-4 flex flex-col gap-2.5">
                            {voteSummary.options.map((option) => {
                                const percent = Math.round(
                                    (option.count / voteSummary.totalVotes) *
                                        100,
                                );

                                return (
                                    <div
                                        key={option.label}
                                        className="flex flex-col gap-1.5"
                                    >
                                        <div className="flex items-center justify-between text-xs">
                                            <span
                                                className={cn(
                                                    'font-medium text-text-secondary',
                                                    option.isWinner &&
                                                        'font-semibold text-brand-800',
                                                )}
                                            >
                                                {option.label}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {percent}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-card">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full',
                                                    option.isWinner
                                                        ? 'bg-brand-800'
                                                        : 'bg-border-strong',
                                                )}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                            {voteSummary.summary}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-muted-foreground">
                            최다 선택 안건 · {voteSummary.decidedLabel}
                        </p>
                    </div>
                )}

                {workflow.finalApproval && (
                    <div className="rounded-2xl border border-border-soft px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                    {workflow.finalApproval.status ===
                                    'APPROVED' ? (
                                        <IconCircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    ) : (
                                        <IconClock className="h-3.5 w-3.5 text-amber-600" />
                                    )}
                                    호스트 최종 승인
                                </div>
                                <p className="mt-1 text-sm font-bold text-foreground">
                                    {workflow.finalApproval.approverNickname}님
                                    확인 단계
                                </p>
                            </div>
                            <ApprovalBadge
                                status={workflow.finalApproval.status}
                            />
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                            {workflow.finalApproval.note}
                        </p>
                        {workflow.finalApproval.approvedAt && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                승인 시각 ·{' '}
                                {new Date(
                                    workflow.finalApproval.approvedAt,
                                ).toLocaleString('ko-KR')}
                            </p>
                        )}
                    </div>
                )}

                {workflow.settlementApproval && (
                    <div className="rounded-2xl border border-border-soft bg-muted px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                    <IconReceipt className="h-3.5 w-3.5 text-accent" />
                                    정산 승인 상태
                                </div>
                                <p className="mt-1 text-sm font-bold text-foreground">
                                    요청{' '}
                                    {formatPoints(
                                        workflow.settlementApproval
                                            .requestedAmount,
                                    )}
                                </p>
                            </div>
                            <ApprovalBadge
                                status={workflow.settlementApproval.status}
                            />
                        </div>

                        <div className="mt-4 rounded-2xl bg-card px-4 py-3">
                            <div className="space-y-2">
                                {workflow.settlementApproval.lineItems.map(
                                    (lineItem) => (
                                        <div
                                            key={lineItem.label}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-muted-foreground">
                                                {lineItem.label}
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {formatPoints(lineItem.amount)}
                                            </span>
                                        </div>
                                    ),
                                )}
                                {forfeitPool && forfeitPool.toPool > 0 && (
                                    <div className="flex items-center justify-between text-sm italic text-muted-foreground">
                                        <span>자동 산입 · 이탈자 보증금</span>
                                        <span className="font-semibold">
                                            {formatPoints(forfeitPool.toPool)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {workflow.settlementApproval.status ===
                                'APPROVED' && (
                                <div className="mt-3 border-t border-border-soft pt-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            최종 승인 금액
                                        </span>
                                        <span className="font-bold text-brand-800">
                                            {formatPoints(
                                                workflow.settlementApproval
                                                    .approvedAmount,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                            {workflow.settlementApproval.summary}
                        </p>

                        {actions}
                    </div>
                )}

                {!workflow.settlementApproval && actions && (
                    <div className="rounded-2xl border border-dashed border-border-soft px-4 py-4">
                        <p className="text-sm font-semibold text-foreground">
                            정산 대기
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            활동이 끝났어요. 호스트가 정산 내역을 제출해 주세요.
                        </p>
                        {actions}
                    </div>
                )}
            </div>
        </SectionCard>
    );
}
