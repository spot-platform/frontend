'use client';

import { IconStar } from '@tabler/icons-react';
import type {
    SpotReview,
    SpotSettlementApproval,
    TimelineEvent,
} from '@/entities/spot/types';
import { SpotSettlementActions } from '@/features/spot/client/detail/SpotSettlementActions';
import { useMainChatStore } from '../../model/use-main-chat-store';
import type { SpotChatRoom } from '../../model/types';

type Props = { room: SpotChatRoom };

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
    }).format(new Date(iso));
}

function formatPoints(value: number): string {
    return `${value.toLocaleString('ko-KR')}P`;
}

function SettlementTile({
    settlement,
}: {
    settlement?: SpotSettlementApproval | null;
}) {
    if (!settlement) {
        return (
            <div className="rounded-xl border border-dashed border-border-soft bg-card p-3">
                <p className="text-sm font-semibold text-foreground">정산</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    아직 정산 요청이 없어요. 오너가 활동 내역을 정리해 제출해야
                    해요.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border-soft bg-card p-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">정산</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {settlement.status === 'APPROVED'
                        ? '승인 완료'
                        : '승인 대기'}
                </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
                {settlement.summary || '정산 내역 확인이 필요해요.'}
            </p>
            <div className="mt-2 space-y-1.5">
                {settlement.lineItems.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between text-xs"
                    >
                        <span className="text-muted-foreground">
                            {item.label}
                        </span>
                        <span className="font-semibold text-foreground">
                            {formatPoints(item.amount)}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-2 border-t border-border-soft pt-2 text-xs">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">요청 금액</span>
                    <span className="font-bold text-foreground">
                        {formatPoints(settlement.requestedAmount)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function ClosedPhasePanel({ room }: Props) {
    const spot = room.spot;
    const loadRoom = useMainChatStore((state) => state.loadRoom);
    const reviews = spot.reviews;
    const closedEvent = spot.timeline.find(
        (e) => e.kind === 'COMPLETED' || e.kind === 'CANCELLED',
    );
    const workflow = {
        spotId: spot.id,
        progressLabel: '활동 종료 · 정산 단계',
        settlementApproval: spot.settlement ?? undefined,
    };

    return (
        <section className="space-y-3 rounded-2xl border border-border-soft bg-muted p-4">
            <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    종료 단계
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                    {closedEvent?.kind === 'CANCELLED'
                        ? '스팟이 취소됐어요'
                        : '스팟이 마무리됐어요'}
                </p>
                {closedEvent && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDate(closedEvent.createdAt)} 처리됨
                    </p>
                )}
            </div>

            <SettlementTile settlement={spot.settlement} />
            <SpotSettlementActions
                spotId={spot.id}
                spotStatus={spot.status}
                workflow={workflow}
                currentUserId={room.currentUserId}
                authorId={spot.authorId}
                forfeitPool={spot.forfeitPool}
                onSettled={() => void loadRoom(room.id)}
            />
            <ReviewTile reviews={reviews} />
            <TimelineTile events={spot.timeline} />
        </section>
    );
}

function ReviewTile({ reviews }: { reviews: SpotReview[] }) {
    if (reviews.length === 0) {
        return (
            <div className="rounded-xl border border-border-soft bg-card p-3">
                <div className="flex items-center gap-2">
                    <IconStar
                        size={14}
                        className="text-muted-foreground"
                        stroke={2}
                    />
                    <p className="text-sm font-semibold text-foreground">
                        후기
                    </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    아직 작성된 후기가 없어요
                </p>
            </div>
        );
    }

    const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return (
        <div className="rounded-xl border border-border-soft bg-card p-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <IconStar
                        size={14}
                        className="fill-amber-400 text-amber-400"
                    />
                    <p className="text-sm font-semibold text-foreground">
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
                        className="rounded-lg bg-muted px-3 py-2"
                    >
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="font-medium text-text-secondary">
                                {review.reviewerNickname} →{' '}
                                {review.targetNickname}
                            </span>
                            <span className="font-semibold text-amber-600">
                                ★ {review.rating}
                            </span>
                        </div>
                        {review.comment && (
                            <p className="mt-1 text-xs leading-5 text-text-secondary">
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
        <div className="rounded-xl border border-border-soft bg-card p-3">
            <p className="mb-2 text-sm font-semibold text-foreground">
                타임라인
            </p>
            <div className="space-y-1.5">
                {recent.map((event) => (
                    <div
                        key={event.id}
                        className="flex items-baseline justify-between gap-3 text-xs"
                    >
                        <span className="truncate text-text-secondary">
                            {event.content ?? eventKindLabel(event.kind)}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
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
