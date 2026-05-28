import { describe, expect, it } from 'vitest';

import {
    getVisiblePromotedCardRange,
    MAX_PROMOTED_FEED_CARDS,
} from './map-feed-card-pager';

describe('getVisiblePromotedCardRange', () => {
    it('keeps all promoted cards visible while the stack is under the max', () => {
        expect(getVisiblePromotedCardRange(6, 60)).toEqual({
            safePromoted: 6,
            visibleStart: 0,
            visibleEnd: 6,
        });
    });

    it('keeps only the latest seven promoted cards visible after overflow', () => {
        expect(getVisiblePromotedCardRange(8, 60)).toEqual({
            safePromoted: 8,
            visibleStart: 1,
            visibleEnd: 8,
        });
        expect(getVisiblePromotedCardRange(60, 60)).toEqual({
            safePromoted: 60,
            visibleStart: 60 - MAX_PROMOTED_FEED_CARDS,
            visibleEnd: 60,
        });
    });

    it('clamps promoted count to available items and never goes below zero', () => {
        expect(getVisiblePromotedCardRange(10, 3)).toEqual({
            safePromoted: 3,
            visibleStart: 0,
            visibleEnd: 3,
        });
        expect(getVisiblePromotedCardRange(-2, 3)).toEqual({
            safePromoted: 0,
            visibleStart: 0,
            visibleEnd: 0,
        });
    });
});
