import type { MyRecentViewItem } from '@/entities/user/types';
import type { FeedItem } from '@/features/feed/model/types';

const RECENT_FEED_VIEWS_KEY = 'spot.recentFeedViews.v1';
const MAX_RECENT_FEED_VIEWS = 20;

type RecordableFeed = Pick<
    FeedItem,
    | 'id'
    | 'title'
    | 'description'
    | 'type'
    | 'price'
    | 'authorNickname'
    | 'status'
>;

function readRecentFeedViews(): MyRecentViewItem[] {
    if (typeof window === 'undefined') return [];

    try {
        const raw = window.localStorage.getItem(RECENT_FEED_VIEWS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as MyRecentViewItem[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeRecentFeedViews(items: MyRecentViewItem[]) {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(
            RECENT_FEED_VIEWS_KEY,
            JSON.stringify(items.slice(0, MAX_RECENT_FEED_VIEWS)),
        );
    } catch {
        // localStorage 실패는 최근 본 캐시만 포기한다.
    }
}

export function getRecentFeedViews(params?: { page?: number; size?: number }): {
    data: MyRecentViewItem[];
    meta: { page: number; size: number; total: number; hasNext: boolean };
} {
    const items = readRecentFeedViews();
    const page = params?.page ?? 1;
    const size = params?.size ?? items.length;
    const zeroBasedPage = Math.max(0, page - 1);
    const start = zeroBasedPage * size;
    const data = items.slice(start, start + size);

    return {
        data,
        meta: {
            page,
            size,
            total: items.length,
            hasNext: start + size < items.length,
        },
    };
}

export function recordRecentFeedView(feed: RecordableFeed): void {
    const viewedAt = new Date().toISOString();
    const item: MyRecentViewItem = {
        id: `feed-${feed.id}`,
        targetId: feed.id,
        title: feed.title,
        description: feed.description,
        type: feed.type === 'RENT' ? 'OFFER' : feed.type,
        viewedAt,
        pointCost: feed.price,
        authorNickname: feed.authorNickname,
        status: feed.status,
    };
    const rest = readRecentFeedViews().filter(
        (view) => view.targetId !== feed.id,
    );
    writeRecentFeedViews([item, ...rest]);
}

export function removeRecentFeedView(recentViewId: string): void {
    writeRecentFeedViews(
        readRecentFeedViews().filter((view) => view.id !== recentViewId),
    );
}

export function clearRecentFeedViews(): void {
    writeRecentFeedViews([]);
}
