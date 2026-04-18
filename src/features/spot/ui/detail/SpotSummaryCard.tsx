import { StatusBadge, TypeBadge, UserAvatar } from '@/shared/ui';
import type { SpotDetail } from '@/entities/spot/types';

interface SpotSummaryCardProps {
    spot: SpotDetail;
}

export function SpotSummaryCard({ spot }: SpotSummaryCardProps) {
    return (
        <div className="mx-4 rounded-2xl border border-border-soft bg-card px-5 py-4 shadow-sm">
            <div className="mb-2.5 flex items-center gap-1.5">
                <TypeBadge type={spot.type} size="md" />
                <StatusBadge status={spot.status} size="md" />
            </div>
            <h1 className="text-lg font-bold leading-snug text-foreground">
                {spot.title}
            </h1>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {spot.description}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-border-soft pt-3">
                <span className="text-base font-bold text-foreground">
                    {spot.pointCost.toLocaleString('ko-KR')}P
                </span>
                <UserAvatar
                    userId={spot.authorId}
                    nickname={spot.authorNickname}
                    size="xs"
                    showLabel
                    className="flex-row-reverse gap-1.5"
                />
            </div>
        </div>
    );
}
