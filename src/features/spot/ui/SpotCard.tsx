'use client';

import Link from 'next/link';
import { formatRelativeTime } from '@/shared/lib/format-time';
import { StatusBadge, TypeBadge } from '@/shared/ui';
import type { Spot } from '@/entities/spot/types';

interface SpotCardProps {
    spot: Spot;
    currentUserId?: string;
}

const STATUS_BORDER: Record<Spot['status'], string> = {
    OPEN: 'border-l-emerald-400',
    MATCHED: 'border-l-blue-400',
    CLOSED: 'border-l-gray-300',
    CANCELLED: 'border-l-red-300',
};

const STATUS_STRIP: Record<Spot['status'], string> = {
    OPEN: '모집 진행 중',
    MATCHED: '활동 진행 중',
    CLOSED: '활동 완료',
    CANCELLED: '취소됨',
};

const STATUS_STRIP_COLOR: Record<Spot['status'], string> = {
    OPEN: 'text-emerald-600',
    MATCHED: 'text-blue-600',
    CLOSED: 'text-gray-400',
    CANCELLED: 'text-red-400',
};

export function SpotCard({ spot, currentUserId }: SpotCardProps) {
    const isAuthor = currentUserId === spot.authorId;
    const relativeTime = formatRelativeTime(spot.createdAt);

    return (
        <Link href={`/spot/${spot.id}`} className="block active:opacity-80">
            <article
                className={`mx-4 rounded-xl border border-gray-200 border-l-4 bg-white px-4 py-3.5 ${STATUS_BORDER[spot.status]}`}
            >
                {/* 상단: 뱃지 행 */}
                <div className="mb-2 flex items-center gap-1.5">
                    <StatusBadge status={spot.status} />
                    <TypeBadge type={spot.type} />
                    {isAuthor && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                            내 스팟
                        </span>
                    )}
                </div>

                {/* 제목 */}
                <h3 className="line-clamp-1 text-sm font-semibold text-gray-900">
                    {spot.title}
                </h3>

                {/* 포인트 + 상대시간 */}
                <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                        {spot.pointCost.toLocaleString('ko-KR')}P
                    </span>
                    <span className="text-xs text-gray-400">
                        {relativeTime}
                    </span>
                </div>

                {/* 상태 스트립 */}
                <div className="mt-2.5 flex items-center gap-1.5">
                    <span
                        className={`text-xs font-semibold ${STATUS_STRIP_COLOR[spot.status]}`}
                    >
                        {STATUS_STRIP[spot.status]}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                        {spot.authorNickname}
                    </span>
                </div>
            </article>
        </Link>
    );
}
