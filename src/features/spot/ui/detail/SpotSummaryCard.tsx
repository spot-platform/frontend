import { StatusBadge, TypeBadge, UserAvatar } from '@/shared/ui';
import type { SpotDetail } from '@/entities/spot/types';

interface SpotSummaryCardProps {
    spot: SpotDetail;
}

export function SpotSummaryCard({ spot }: SpotSummaryCardProps) {
    return (
        <div className="mx-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
            <div className="mb-2.5 flex items-center gap-1.5">
                <TypeBadge type={spot.type} size="md" />
                <StatusBadge status={spot.status} size="md" />
            </div>
            <h1 className="text-lg font-bold leading-snug text-gray-900">
                {spot.title}
            </h1>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">
                {spot.description}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-base font-bold text-gray-900">
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
