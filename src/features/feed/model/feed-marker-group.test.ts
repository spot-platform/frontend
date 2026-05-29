import { describe, expect, it } from 'vitest';
import type { FeedItem } from '@/features/feed/model/types';
import { groupFeedMarkersByProximity } from '@/features/feed/model/feed-marker-group';

function createFeed(id: string, lat: number, lng: number): FeedItem {
    return {
        id,
        title: `feed ${id}`,
        location: '경기대',
        authorNickname: '진규',
        price: 0,
        type: 'OFFER',
        status: 'OPEN',
        views: 0,
        likes: 0,
        lat,
        lng,
    };
}

describe('groupFeedMarkersByProximity', () => {
    it('groups feeds at the exact same coordinate into one marker group', () => {
        const groups = groupFeedMarkersByProximity([
            createFeed('a', 37.2636, 127.0286),
            createFeed('b', 37.2636, 127.0286),
            createFeed('c', 37.2645, 127.0295),
        ]);

        expect(groups).toHaveLength(2);
        expect(groups[0]).toMatchObject({
            id: 'feed-group-a-b',
            items: [{ id: 'a' }, { id: 'b' }],
        });
        expect(groups[1]).toMatchObject({
            id: 'feed-c',
            items: [{ id: 'c' }],
        });
    });

    it('groups nearby feeds within the configured threshold', () => {
        const groups = groupFeedMarkersByProximity(
            [
                createFeed('a', 37.2636, 127.0286),
                createFeed('b', 37.26365, 127.02865),
                createFeed('c', 37.2645, 127.0295),
            ],
            { thresholdMeters: 12 },
        );

        expect(groups).toHaveLength(2);
        expect(groups[0].items.map((item) => item.id)).toEqual(['a', 'b']);
        expect(groups[0].coord.lat).toBeCloseTo(37.263625, 6);
        expect(groups[0].coord.lng).toBeCloseTo(127.028625, 6);
    });

    it('ignores feeds without valid coordinates', () => {
        const groups = groupFeedMarkersByProximity([
            createFeed('a', 37.2636, 127.0286),
            { ...createFeed('b', 0, 0), lat: undefined, lng: undefined },
        ]);

        expect(groups).toHaveLength(1);
        expect(groups[0].items).toHaveLength(1);
        expect(groups[0].items[0].id).toBe('a');
    });
});
