import { MOCK_FEED } from '@/features/feed/model/mock';
import type { FeedItem } from '@/features/feed/model/types';
import { ADMIN_POST_PAGE_SIZE, MOCK_ADMIN_POSTS } from './mock';
import type { AdminPost } from './types';

function getSortedAdminPosts() {
    return [...MOCK_ADMIN_POSTS].sort(
        (left, right) =>
            new Date(right.publishedAt).getTime() -
            new Date(left.publishedAt).getTime(),
    );
}

function getSortedNoticeAdminPosts() {
    return getSortedAdminPosts().filter((post) => post.isNotice);
}

export function getLatestAdminPost(): AdminPost | undefined {
    return getSortedAdminPosts()[0];
}

export function getLatestNoticeAdminPost(): AdminPost | undefined {
    return getSortedNoticeAdminPosts()[0];
}

export function getFeaturedAdminPosts(limit = 3): AdminPost[] {
    return getSortedAdminPosts().slice(0, limit);
}

export function getAdminPostById(id: string): AdminPost | undefined {
    return MOCK_ADMIN_POSTS.find((post) => post.id === id);
}

export function getAdminPostPage(page: number) {
    const sortedPosts = getSortedAdminPosts();
    const totalPages = Math.max(
        1,
        Math.ceil(sortedPosts.length / ADMIN_POST_PAGE_SIZE),
    );
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (currentPage - 1) * ADMIN_POST_PAGE_SIZE;

    return {
        items: sortedPosts.slice(startIndex, startIndex + ADMIN_POST_PAGE_SIZE),
        currentPage,
        totalPages,
    };
}

export function getRelatedOpenFeedItems(post: AdminPost): FeedItem[] {
    const relatedItems = post.relatedFeedIds
        .map((feedId) => MOCK_FEED.find((item) => item.id === feedId))
        .filter((item): item is FeedItem =>
            Boolean(item && item.status === 'OPEN'),
        );

    if (relatedItems.length > 0) {
        return relatedItems;
    }

    return MOCK_FEED.filter(
        (item) =>
            item.status === 'OPEN' && !post.relatedFeedIds.includes(item.id),
    )
        .sort((left, right) => {
            const rightProgress = right.progressPercent ?? 0;
            const leftProgress = left.progressPercent ?? 0;

            if (rightProgress !== leftProgress) {
                return rightProgress - leftProgress;
            }

            const rightCount = right.partnerCount ?? right.applicantCount ?? 0;
            const leftCount = left.partnerCount ?? left.applicantCount ?? 0;
            return rightCount - leftCount;
        })
        .slice(0, 3);
}

export function getAdminPostListHref(page: number) {
    return page > 1 ? `/admin-post?page=${page}` : '/admin-post';
}

export function getAdminPostDetailHref(id: string, page?: number) {
    return page && page > 1
        ? `/admin-post/${id}?page=${page}`
        : `/admin-post/${id}`;
}
