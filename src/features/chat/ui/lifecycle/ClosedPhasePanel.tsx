'use client';

import { IconStar } from '@tabler/icons-react';
import type { SpotReview, TimelineEvent } from '@/entities/spot/types';
import type { SpotChatRoom } from '../../model/types';

type Props = { room: SpotChatRoom };

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
    }).format(new Date(iso));
}

export function ClosedPhasePanel({ room }: Props) {
    const spot = room.spot;
    const reviews = spot.reviews;
    const closedEvent = spot.timeline.find(
        (e) => e.kind === 'COMPLETED' || e.kind === 'CANCELLED',
    );

    return (
        <section className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-gray-500 uppercase">
                    종료 단계
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                    {closedEvent?.kind === 'CANCELLED'
                        ? '스팟이 취소됐어요'
                        : '스팟이 마무리됐어요'}
                </p>
                {closedEvent && (
                    <p className="mt-1 text-[11px] text-gray-500">
                        {formatDate(closedEvent.createdAt)} 처리됨
                    </p>
                )}
            </div>

            <ReviewTile reviews={reviews} />
            <TimelineTile events={spot.timeline} />
        </section>
    );
}

function ReviewTile({ reviews }: { reviews: SpotReview[] }) {
    if (reviews.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2">
                    <IconStar size={14} className="text-gray-400" stroke={2} />
                    <p className="text-sm font-semibold text-gray-900">후기</p>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    아직 작성된 후기가 없어요
                </p>
            </div>
        );
    }

    const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <IconStar
                        size={14}
                        className="fill-amber-400 text-amber-400"
                    />
                    <p className="text-sm font-semibold text-gray-900">
                        후기 {reviews.length}건
                    </p>
                </div>
                <p className="text-sm font-semibold text-amber-600">
                    ★ {avgRating.toFixed(1)}
                </p>
            </div>
            <div className="mt-2 space-y-2">
                {reviews.slice(0, 2).map((review) => (
                    <div
                        key={review.id}
                        className="rounded-lg bg-gray-50 px-3 py-2"
                    >
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span className="font-medium text-gray-700">
                                {review.reviewerNickname} →{' '}
                                {review.targetNickname}
                            </span>
                            <span className="font-semibold text-amber-600">
                                ★ {review.rating}
                            </span>
                        </div>
                        {review.comment && (
                            <p className="mt-1 text-xs leading-5 text-gray-600">
                                {review.comment}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function TimelineTile({ events }: { events: TimelineEvent[] }) {
    if (events.length === 0) return null;
    const recent = events.slice(-4);
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="mb-2 text-sm font-semibold text-gray-900">타임라인</p>
            <div className="space-y-1.5">
                {recent.map((event) => (
                    <div
                        key={event.id}
                        className="flex items-baseline justify-between gap-3 text-xs"
                    >
                        <span className="truncate text-gray-700">
                            {event.content ?? eventKindLabel(event.kind)}
                        </span>
                        <span className="shrink-0 text-gray-400">
                            {formatDate(event.createdAt)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function eventKindLabel(kind: TimelineEvent['kind']): string {
    switch (kind) {
        case 'CREATED':
            return '스팟 생성';
        case 'MATCHED':
            return '매칭 확정';
        case 'COMPLETED':
            return '스팟 종료';
        case 'CANCELLED':
            return '스팟 취소';
        case 'COMMENT':
            return '댓글';
        case 'SETTLEMENT_REQUESTED':
            return '정산 요청';
        case 'SETTLEMENT_APPROVED':
            return '정산 승인';
        default:
            return '이벤트';
    }
}
