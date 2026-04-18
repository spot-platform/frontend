'use client';

import { Button, Textarea } from '@frontend/design-system';
import { useState } from 'react';
import { IconStar } from '@tabler/icons-react';
import { BottomSheet } from '@/shared/ui';
import { useSubmitReview } from '../../../model/use-reviews';

interface ReviewModalProps {
    open: boolean;
    onClose: () => void;
    spotId: string;
    targetNickname: string;
}

export function ReviewModal({
    open,
    onClose,
    spotId,
    targetNickname,
}: ReviewModalProps) {
    const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
    const [comment, setComment] = useState('');
    const { mutate: submitReview, isPending } = useSubmitReview(spotId);

    function handleSubmit() {
        submitReview(
            { targetNickname, rating, comment: comment.trim() || undefined },
            {
                onSuccess: onClose,
            },
        );
    }

    return (
        <BottomSheet open={open} onClose={onClose} title="후기 남기기">
            <div className="flex flex-col gap-5">
                <p className="text-sm text-text-secondary">
                    <span className="font-semibold text-foreground">
                        {targetNickname}
                    </span>
                    와의 활동은 어떠셨나요?
                </p>

                {/* 별점 */}
                <div className="flex justify-center gap-2">
                    {([1, 2, 3, 4, 5] as const).map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="transition-transform active:scale-90"
                        >
                            <IconStar
                                size={36}
                                className={
                                    star <= rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-border-soft'
                                }
                            />
                        </button>
                    ))}
                </div>

                {/* 코멘트 */}
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="활동 후기를 남겨주세요 (선택)"
                    rows={3}
                    className="resize-none rounded-xl"
                />

                <Button onClick={handleSubmit} disabled={isPending} fullWidth>
                    후기 제출
                </Button>
            </div>
        </BottomSheet>
    );
}
