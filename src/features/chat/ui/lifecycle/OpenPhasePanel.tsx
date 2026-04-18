'use client';

import { Chip } from '@frontend/design-system';
import { IconCoinMonero, IconUsers } from '@tabler/icons-react';
import { cn } from '@/shared/lib/cn';
import { EmptyState, UserAvatarStatic } from '@/shared/ui';
import { MOCK_FEED, MOCK_FEED_MANAGEMENT } from '@/features/feed/model/mock';
import type {
    FeedManagementFlow,
    FeedParticipantProfile,
    SupporterApplication,
} from '@/features/feed/model/types';
import type { SpotChatRoom } from '../../model/types';

type Props = { room: SpotChatRoom };

const STATUS_STYLES: Record<SupporterApplication['status'], string> = {
    LEADING: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    REVIEWING: 'border-brand-800/10 bg-brand-800/5 text-brand-800',
    WAITING: 'border-border-soft bg-muted text-muted-foreground',
};

const STATUS_LABELS: Record<SupporterApplication['status'], string> = {
    LEADING: '우선 검토',
    REVIEWING: '비교 중',
    WAITING: '대기',
};

function formatCurrency(value: number) {
    return value.toLocaleString('ko-KR') + '원';
}

export function OpenPhasePanel({ room }: Props) {
    const feedItem = room.sourceFeedId
        ? (MOCK_FEED.find((f) => f.id === room.sourceFeedId) ?? null)
        : null;
    const flow: FeedManagementFlow | undefined = room.sourceFeedId
        ? MOCK_FEED_MANAGEMENT[room.sourceFeedId]
        : undefined;

    if (!flow || !feedItem) {
        return (
            <section className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-amber-700 uppercase">
                    모집 단계
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                    아직 매칭 전 상태예요
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    모집 정보가 연결되면 여기에 지원 현황이 표시됩니다.
                </p>
            </section>
        );
    }

    const isRequest = feedItem.type === 'REQUEST';
    const progressPercent = Math.min(
        Math.round((flow.demand.fundedAmount / flow.demand.fundingGoal) * 100),
        100,
    );
    const confirmedPartners = flow.demand.confirmedPartnerProfiles;
    const confirmedCount = confirmedPartners.length;
    const currentAmountLabel =
        flow.demand.currentAmountLabel ??
        (isRequest ? '현재 맞춰본 예산' : '모인 금액');
    const targetAmountLabel =
        flow.demand.targetAmountLabel ??
        (isRequest ? '희망 예산' : '목표 예산');
    const progressLabel =
        flow.demand.progressLabel ?? (isRequest ? '예산 조율도' : '달성률');
    const partnersLabel = isRequest ? '검토 파트너' : '확정 파트너';
    const emptyTitle = isRequest
        ? '아직 도착한 제안이 없어요'
        : '아직 도착한 지원이 없어요';
    const emptyDescription = isRequest
        ? '첫 파트너 제안이 들어오면 여기에서 비교할 수 있어요.'
        : '첫 지원자가 들어오면 여기에서 비교할 수 있어요.';

    return (
        <section className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-amber-700 uppercase">
                        모집 단계
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                        {flow.stageLabel}
                    </p>
                </div>
                <Chip
                    className="border-amber-200 bg-card text-amber-700"
                    size="sm"
                >
                    {flow.demand.deadlineLabel}
                </Chip>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <StatBlock
                    icon={<IconCoinMonero className="h-3.5 w-3.5" />}
                    label={currentAmountLabel}
                    value={formatCurrency(flow.demand.fundedAmount)}
                    meta={`${targetAmountLabel} ${formatCurrency(flow.demand.fundingGoal)}`}
                />
                <StatBlock
                    icon={<IconUsers className="h-3.5 w-3.5" />}
                    label={partnersLabel}
                    value={`${confirmedCount} / ${flow.demand.requiredPartners}명`}
                    meta={`추가 ${Math.max(flow.demand.requiredPartners - confirmedCount, 0)}명 필요`}
                />
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{progressLabel}</span>
                    <span className="font-semibold text-foreground">
                        {progressPercent}%
                    </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-amber-100/60">
                    <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                    {flow.demand.hostNote}
                </p>
            </div>

            <div className="border-t border-amber-100 pt-3">
                <p className="mb-2 text-xs font-semibold text-text-secondary">
                    지원 현황{' '}
                    <span className="text-muted-foreground">
                        {flow.applications.length}건
                    </span>
                </p>
                {flow.applications.length === 0 ? (
                    <EmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                    />
                ) : (
                    <ApplicantGrid applications={flow.applications} />
                )}
            </div>

            {confirmedCount > 0 && (
                <div className="border-t border-amber-100 pt-3">
                    <p className="mb-2 text-xs font-semibold text-text-secondary">
                        참여 중인 파트너{' '}
                        <span className="text-muted-foreground">
                            {confirmedCount}명
                        </span>
                    </p>
                    <AvatarRow profiles={confirmedPartners} />
                </div>
            )}
        </section>
    );
}

function StatBlock({
    icon,
    label,
    value,
    meta,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    meta: string;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                {icon}
                {label}
            </div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
                {value}
            </p>
            <p className="text-[11px] text-muted-foreground">{meta}</p>
        </div>
    );
}

function AvatarRow({ profiles }: { profiles: FeedParticipantProfile[] }) {
    return (
        <div className="flex flex-wrap gap-3">
            {profiles.map((p) => (
                <UserAvatarStatic
                    key={p.id}
                    userId={p.id}
                    nickname={p.nickname}
                    avatarUrl={p.avatarUrl}
                    size="md"
                    showLabel
                />
            ))}
        </div>
    );
}

function ApplicantGrid({
    applications,
}: {
    applications: SupporterApplication[];
}) {
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-3">
            {applications.map((app) => (
                <div
                    key={app.id}
                    className="flex min-w-16 flex-col items-center gap-1.5 text-center"
                >
                    <UserAvatarStatic
                        userId={app.id}
                        nickname={app.nickname}
                        avatarUrl={app.avatarUrl}
                        size="md"
                    />
                    <p className="max-w-14 truncate text-[11px] font-medium text-text-secondary">
                        {app.nickname}
                    </p>
                    <span
                        className={cn(
                            'inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-semibold',
                            STATUS_STYLES[app.status],
                        )}
                    >
                        {STATUS_LABELS[app.status]}
                    </span>
                </div>
            ))}
        </div>
    );
}
