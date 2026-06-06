'use client';

import { IconHeart } from '@tabler/icons-react';
import type { FeedItem } from '@/features/feed/model/types';
import { FeedCard } from '@/features/feed/ui/FeedCard';
import { MapCardDeckOverlay } from '@/features/map/ui/MapCardDeckOverlay';

type MapFeedInfoCardProps = {
    item: FeedItem;
    onCloseAction: () => void;
    onDetailAction: () => void;
    onBookmarkAction?: (item: FeedItem) => void;
};

export function MapFeedInfoCard({
    item,
    onCloseAction,
    onDetailAction,
    onBookmarkAction,
}: MapFeedInfoCardProps) {
    const bookmarked = Boolean(item.isBookmarked);

    return (
        <MapCardDeckOverlay
            deckId={`feed-${item.id}`}
            ariaLabel="피드 카드 닫기"
            items={[
                {
                    id: item.id,
                    content: <FeedCard item={item} />,
                    onDetailAction,
                },
            ]}
            onCloseAction={onCloseAction}
            dismissBehavior="close"
            disableContentClick
            chrome={
                onBookmarkAction ? (
                    <button
                        type="button"
                        data-map-card-action="bookmark"
                        aria-label={bookmarked ? '찜 해제' : '찜에 추가'}
                        onClick={(event) => {
                            event.stopPropagation();
                            onBookmarkAction(item);
                        }}
                        onPointerDown={(event) => event.stopPropagation()}
                        className={
                            bookmarked
                                ? 'absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 shadow-sm backdrop-blur-md transition-colors hover:bg-red-100'
                                : 'absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border-soft/70 bg-card/90 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-destructive hover:text-destructive-foreground'
                        }
                    >
                        <IconHeart
                            size={16}
                            stroke={2}
                            fill={bookmarked ? 'currentColor' : 'none'}
                        />
                    </button>
                ) : undefined
            }
        />
    );
}
