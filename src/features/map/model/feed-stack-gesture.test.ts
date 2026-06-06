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

    it('keeps both side swipes centered instead of opening detail', () => {
        expect(
            resolveFeedStackGesture({
                dx: -150,
                dy: 12,
            }),
        ).toBe('center');

        expect(
            resolveFeedStackGesture({
                dx: 150,
                dy: 12,
            }),
        ).toBe('center');
    });

    it('keeps fast side flicks centered instead of opening detail', () => {
        expect(
            resolveFeedStackGesture({
                dx: -64,
                dy: 8,
                velocityX: -820,
            }),
        ).toBe('center');

        expect(
            resolveFeedStackGesture({
                dx: 64,
                dy: 8,
                velocityX: 820,
            }),
        ).toBe('center');
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
