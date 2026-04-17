'use client';

import { IconStar } from '@tabler/icons-react';
import { SectionCard } from '../SectionCard';
import { useSpotDetailStore } from '../../../model/spot-detail-store';
import type { SpotReview, Spot } from '@/entities/spot/types';

interface ReviewSectionProps {
    reviews: SpotReview[];
    spot: Spot;
    currentUserId: string;
}

export function ReviewSection({
    reviews,
    spot,
    currentUserId,
}: ReviewSectionProps) {
    const openModal = useSpotDetailStore((s) => s.openModal);

    if (spot.status !== 'CLOSED') return null;

    const myReview = reviews.find((r) => r.reviewerNickname === currentUserId);
    const avgRating =
        reviews.length > 0
            ? (
                  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              ).toFixed(1)
            : null;

    return (
        <SectionCard title="후기">
            {!myReview && (
                <button
                    type="button"
                    onClick={() => openModal('review')}
                    className="mb-3 w-full rounded-xl border border-dashed border-brand-800 py-3 text-sm font-semibold text-brand-800"
                >
                    후기 남기기
                </button>
            )}

            {reviews.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {avgRating && (
                        <div className="flex items-center gap-1.5">
                            <IconStar
                                size={14}
                                className="fill-yellow-400 text-yellow-400"
                            />
                            <span className="text-sm font-bold text-gray-700">
                                {avgRating}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({reviews.length}개 후기)
                            </span>
                        </div>
                    )}
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-xl bg-gray-50 px-4 py-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-600">
                                    {review.reviewerNickname}
                                </span>
                                <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <IconStar
                                            key={i}
                                            size={12}
                                            className={
                                                i < review.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-200'
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                            {review.comment && (
                                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400">아직 후기가 없어요</p>
            )}
        </SectionCard>
    );
}
