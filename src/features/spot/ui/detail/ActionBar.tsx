'use client';

import { Button } from '@frontend/design-system';
import type { Spot } from '@/entities/spot/types';

interface ActionBarProps {
    spot: Spot;
    currentUserId: string;
    onMatch: () => void;
    onCancel: () => void;
    onComplete: () => void;
}

export function ActionBar({
    spot,
    currentUserId,
    onMatch,
    onCancel,
    onComplete,
}: ActionBarProps) {
    const isAuthor = spot.authorId === currentUserId;

    if (spot.status === 'CLOSED' || spot.status === 'CANCELLED') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-107.5 border-t border-border-soft bg-card px-4 pb-8 pt-3">
            <div className="flex gap-2">
                {spot.status === 'OPEN' && isAuthor && (
                    <>
                        <Button
                            variant="secondary"
                            onClick={onCancel}
                            className="flex-1 text-text-secondary"
                        >
                            취소하기
                        </Button>
                        <Button onClick={onMatch} className="flex-[2]">
                            매칭하기
                        </Button>
                    </>
                )}

                {spot.status === 'MATCHED' && isAuthor && (
                    <>
                        <Button
                            variant="secondary"
                            onClick={onCancel}
                            className="flex-1 text-text-secondary"
                        >
                            취소하기
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onComplete}
                            className="flex-[2] border-transparent bg-accent text-white shadow-[0_16px_32px_rgba(249,115,22,0.24)] hover:bg-orange-500 focus-visible:ring-orange-100"
                        >
                            완료하기
                        </Button>
                    </>
                )}

                {spot.status === 'MATCHED' && !isAuthor && (
                    <Button
                        variant="secondary"
                        disabled
                        className="flex-1 cursor-default text-muted-foreground"
                    >
                        완료 대기 중
                    </Button>
                )}
            </div>
        </div>
    );
}
