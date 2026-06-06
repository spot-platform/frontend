'use client';

import { IconHeart } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import type { FeedItem } from '@/features/feed/model/types';
import { FeedCard } from '@/features/feed/ui/FeedCard';
import { MapCardDeckOverlay } from '@/features/map/ui/MapCardDeckOverlay';

type MapFeedStackCardProps = {
    groupId: string;
    items: FeedItem[];
    onCloseAction: () => void;
    onBookmarkAction?: (item: FeedItem) => void;
};

export function MapFeedStackCard({
    groupId,
    items,
    onCloseAction,
    onBookmarkAction,
}: MapFeedStackCardProps) {
    const router = useRouter();

    if (items.length === 0) return null;

    return (
        <MapCardDeckOverlay
            deckId={`feed-stack-${groupId}`}
            ariaLabel="중첩 피드 닫기"
            items={items.map((item) => {
                const bookmarked = Boolean(item.isBookmarked);

                return {
                    id: item.id,
                    content: (
                        <>
                            <FeedCard item={item} />
                            {onBookmarkAction ? (
                                <button
                                    type="button"
                                    data-map-card-action="bookmark"
                                    aria-label={
                                        bookmarked ? '찜 해제' : '찜에 추가'
                                    }
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onBookmarkAction(item);
                                    }}
                                    onPointerDown={(event) =>
                                        event.stopPropagation()
                                    }
                                    className={
                                        bookmarked
                                            ? 'absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 shadow-sm backdrop-blur-md transition-colors hover:bg-red-100'
                                            : 'absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border-soft/70 bg-card/90 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-destructive hover:text-destructive-foreground'
                                    }
                                >
                                    <IconHeart
                                        size={16}
                                        stroke={2}
                                        fill={
                                            bookmarked ? 'currentColor' : 'none'
                                        }
                                    />
                                </button>
                            ) : null}
                        </>
                    ),
                    onDetailAction: () => router.push(`/feed/${item.id}`),
                };
            })}
            onCloseAction={onCloseAction}
            dismissBehavior="next"
            disableContentClick
        />
    );
}
