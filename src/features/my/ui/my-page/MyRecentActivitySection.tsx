import Link from 'next/link';
import { Chip } from '@frontend/design-system';
import { EmptyState, Section, StatusBadge, TypeBadge } from '@/shared/ui';
import type { Participation } from '@/entities/user/types';
import { formatDate, getRoleLabel } from '../../model/my-page-helpers';
import { MyRetryCard } from './MyRetryCard';
import { MySectionHeader } from './MySectionHeader';

type MyRecentActivitySectionProps = {
    participations: Participation[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    isRetrying: boolean;
    onExploreSpot: () => void;
};

export function MyRecentActivitySection({
    participations,
    isLoading,
    isError,
    onRetry,
    isRetrying,
    onExploreSpot,
}: MyRecentActivitySectionProps) {
    return (
        <Section
            gap="md"
            className="rounded-xl border border-border-soft bg-card p-4"
        >
            <div className="flex items-start justify-between gap-3">
                <MySectionHeader
                    eyebrow="Recent activity"
                    title="최근 참여 활동"
                    description="가장 최근에 연결된 스팟 흐름을 이어서 살펴보세요."
                />
                <Link
                    href="/spot"
                    className="shrink-0 text-xs font-semibold text-brand-700"
                >
                    전체 보기
                </Link>
            </div>

            {isLoading && !participations.length ? (
                <ParticipationListSkeleton />
            ) : isError && participations.length === 0 ? (
                <MyRetryCard
                    title="참여 활동을 불러오지 못했어요"
                    description="활동 내역이 잠시 지연되고 있어요. 새로고침 후 다시 확인해 주세요."
                    onRetry={onRetry}
                    isRetrying={isRetrying}
                />
            ) : participations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border-soft bg-surface px-4">
                    <EmptyState
                        title="아직 참여한 스팟이 없어요"
                        description="관심 있는 요청이나 제안을 북마크하거나 새 스팟을 탐색해 보세요."
                        action={{
                            label: '스팟 둘러보기',
                            onClick: onExploreSpot,
                        }}
                    />
                </div>
            ) : (
                <div className="grid gap-3">
                    {participations.map((participation) => (
                        <ParticipationCard
                            key={`${participation.spotId}-${participation.joinedAt}`}
                            participation={participation}
                        />
                    ))}
                </div>
            )}
        </Section>
    );
}

function ParticipationCard({
    participation,
}: {
    participation: Participation;
}) {
    return (
        <Link
            href={`/spot/${participation.spotId}`}
            className="rounded-lg border border-border-soft bg-surface px-4 py-4 transition hover:border-brand-100 hover:bg-brand-50/50"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        <TypeBadge type={participation.spotType} size="sm" />
                        <StatusBadge status={participation.status} size="sm" />
                        <Chip size="sm">
                            {getRoleLabel(participation.role)}
                        </Chip>
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold leading-6 text-foreground">
                        {participation.spotTitle}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {formatDate(participation.joinedAt)} 참여 시작
                    </p>
                </div>
            </div>
        </Link>
    );
}

function ParticipationListSkeleton() {
    return (
        <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
                <div
                    key={index}
                    className="h-28 animate-pulse rounded-lg border border-border-soft bg-surface"
                />
            ))}
        </div>
    );
}
