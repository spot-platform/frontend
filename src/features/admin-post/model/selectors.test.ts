import { describe, expect, it } from 'vitest';

import { MOCK_ADMIN_POSTS } from './mock';
import {
    getFeaturedAdminPosts,
    getLatestAdminPost,
    getLatestNoticeAdminPost,
} from './selectors';

describe('admin post selectors', () => {
    it('keeps mock data mixed between notice and curation posts', () => {
        expect(MOCK_ADMIN_POSTS.some((post) => post.isNotice)).toBe(true);
        expect(MOCK_ADMIN_POSTS.some((post) => !post.isNotice)).toBe(true);
    });

    it('returns the latest post overall even when it is not a notice', () => {
        expect(getLatestAdminPost()?.id).toBe('admin-post-1');
        expect(getLatestAdminPost()?.isNotice).toBe(false);
    });

    it('returns the latest notice post for feed notice rendering', () => {
        expect(getLatestNoticeAdminPost()?.id).toBe('admin-post-4');
        expect(getLatestNoticeAdminPost()?.title).toBe(
            '공지: 피드 메인 공지 영역은 운영 알림만 보여드려요',
        );
    });

    it('keeps featured hot spot posts on curation entries', () => {
        expect(getFeaturedAdminPosts(3).map((post) => post.id)).toEqual([
            'admin-post-1',
            'admin-post-2',
            'admin-post-3',
        ]);
        expect(getFeaturedAdminPosts(3).every((post) => !post.isNotice)).toBe(
            true,
        );
    });
});
