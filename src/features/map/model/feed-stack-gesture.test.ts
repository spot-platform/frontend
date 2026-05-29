import { describe, expect, it } from 'vitest';
import { resolveFeedStackGesture } from '@/features/map/model/feed-stack-gesture';

describe('resolveFeedStackGesture', () => {
    it('snaps back to center when horizontal drag is below the side threshold', () => {
        expect(
            resolveFeedStackGesture({
                dx: 96,
                dy: 10,
            }),
        ).toBe('center');
    });

    it('treats both side swipes as detail triggers', () => {
        expect(
            resolveFeedStackGesture({
                dx: -150,
                dy: 12,
            }),
        ).toBe('detail-left');

        expect(
            resolveFeedStackGesture({
                dx: 150,
                dy: 12,
            }),
        ).toBe('detail-right');
    });

    it('requires horizontal dominance before side actions', () => {
        expect(
            resolveFeedStackGesture({
                dx: 150,
                dy: 140,
            }),
        ).toBe('center');
    });

    it('uses down swipe to dismiss or reveal the next stacked card', () => {
        expect(
            resolveFeedStackGesture({
                dx: 12,
                dy: 96,
            }),
        ).toBe('next');
    });
});
