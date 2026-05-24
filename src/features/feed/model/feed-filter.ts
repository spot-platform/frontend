import type { SpotCategory } from '@/entities/spot/categories';
import type { FeedItem } from './types';
import { isSearchExcludedFeedItem } from './types';

export type FeedMarkerFilter = {
    feedType: 'all' | 'offer' | 'request';
    categories: readonly SpotCategory[];
    searchQuery: string;
};

export function filterVisibleFeedItems(
    feedItems: readonly FeedItem[],
    { feedType, categories, searchQuery }: FeedMarkerFilter,
): FeedItem[] {
    const q = searchQuery.trim().toLowerCase();

    return feedItems.filter((item) => {
        if (feedType === 'offer' && item.type !== 'OFFER') return false;
        if (feedType === 'request' && item.type !== 'REQUEST') return false;
        if (
            categories.length > 0 &&
            (!item.category ||
                !categories.includes(item.category as SpotCategory))
        ) {
            return false;
        }
        if (q.length > 0) {
            if (isSearchExcludedFeedItem(item)) return false;

            const haystack = [
                item.title,
                item.description ?? '',
                item.category ?? '',
                item.location,
                item.authorNickname,
            ]
                .join(' ')
                .toLowerCase();
            if (!haystack.includes(q)) return false;
        }
        return true;
    });
}
