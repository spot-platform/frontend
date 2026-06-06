import { describe, expect, it } from 'vitest';
import type { FeedItem } from './types';
import { resolveFeedCoordinate } from './feed-location';
import { filterVisibleFeedItems } from './feed-filter';
import { getFeedListIsAiParamByLayer } from './feed-layer-filter';

function makeFeed(overrides: Partial<FeedItem> = {}): FeedItem {
    return {
        id: overrides.id ?? 'feed-1',
        title: overrides.title ?? '함께 기타 연습해요',
        location: overrides.location ?? '경기대',
        authorNickname: overrides.authorNickname ?? '진규',
        price: overrides.price ?? 0,
        type: overrides.type ?? 'OFFER',
        status: overrides.status ?? 'OPEN',
        views: overrides.views ?? 0,
        likes: overrides.likes ?? 0,
        ...overrides,
    };
}

describe('feed map helpers', () => {
    it('resolves feed coordinates from normalized coord first', () => {
        const item = makeFeed({
            coord: { lat: 37.2636, lng: 127.0286 },
            lat: 1,
            lng: 2,
        });

        expect(resolveFeedCoordinate(item)).toEqual({
            lat: 37.2636,
            lng: 127.0286,
        });
    });

    it('falls back to top-level lat/lng for backend feed list items', () => {
        const item = makeFeed({ lat: 37.5123, lng: 127.0456 });

        expect(resolveFeedCoordinate(item)).toEqual({
            lat: 37.5123,
            lng: 127.0456,
        });
    });

    it('normalizes string coordinates from backend coordinate payloads', () => {
        const item = makeFeed({
            coordinate: { lat: '37.2636', lng: '127.0286' },
        } as Partial<FeedItem>);

        expect(resolveFeedCoordinate(item)).toEqual({
            lat: 37.2636,
            lng: 127.0286,
        });
    });

    it('falls back to primaryPin coordinates used by contextBuilder feed fixtures', () => {
        const item = makeFeed({
            primaryPin: {
                place_id: 27440700,
                name: '아롬',
                primary_category: 'cafe',
                role: 'main',
                lat: 37.2636,
                lng: 127.0286,
                address: '경기 수원시 장안구 창훈로40번길 9',
                confidence: 1,
            },
        });

        expect(resolveFeedCoordinate(item)).toEqual({
            lat: 37.2636,
            lng: 127.0286,
        });
    });

    it('keeps map marker filters aligned with the visible feed list', () => {
        const feeds = [
            makeFeed({ id: 'offer', type: 'OFFER', category: '음악' }),
            makeFeed({ id: 'request', type: 'REQUEST', category: '요리' }),
            makeFeed({
                id: 'joined',
                type: 'OFFER',
                category: '음악',
                myApplicationStatus: 'ACCEPTED',
            }),
        ];

        expect(
            filterVisibleFeedItems(feeds, {
                feedType: 'offer',
                categories: ['음악'],
                searchQuery: '기타',
            }).map((item) => item.id),
        ).toEqual(['offer']);
    });

    it('keeps AI feeds visible on the map even when real-feed cleanup filters are enabled', () => {
        const feeds = [
            makeFeed({
                id: 'converted-real',
                status: 'MATCHED',
                spotId: 'spot-1',
            }),
            makeFeed({
                id: 'ai-pd',
                isAi: true,
                status: 'MATCHED',
                spotId: 'synthetic-spot',
                myApplicationStatus: 'ACCEPTED',
            }),
        ];

        expect(
            filterVisibleFeedItems(feeds, {
                feedType: 'all',
                categories: [],
                searchQuery: '',
                excludeApplied: true,
                onlyOpenFeeds: true,
            }).map((item) => item.id),
        ).toEqual(['ai-pd']);
    });

    it('maps map layer state to backend isAi feed list filtering', () => {
        expect(getFeedListIsAiParamByLayer('real')).toBe(false);
        expect(getFeedListIsAiParamByLayer('mixed')).toBeUndefined();
        expect(getFeedListIsAiParamByLayer('virtual')).toBe(true);
    });
});
