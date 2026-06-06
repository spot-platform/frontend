import { describe, expect, it } from 'vitest';
import { resolveFeedStackGesture } from '@/features/map/model/feed-stack-gesture';

describe('resolveFeedStackGesture', () => {
    it('snaps back to center when horizontal drag is below the side threshold', () => {
        expect(
            resolveFeedStackGesture({
                dx: 32,
                dy: 10,
            }),
        ).toBe('center');
    });

    it('uses both side swipes to open feed detail', () => {
        expect(
            resolveFeedStackGesture({
                dx: -96,
                dy: 12,
            }),
        ).toBe('detail-left');

        expect(
            resolveFeedStackGesture({
                dx: 96,
                dy: 12,
            }),
        ).toBe('detail-right');
    });

    it('lets fast side flicks open detail even with shorter travel', () => {
        expect(
            resolveFeedStackGesture({
                dx: -42,
                dy: 8,
                velocityX: -820,
            }),
        ).toBe('detail-left');

        expect(
            resolveFeedStackGesture({
                dx: 42,
                dy: 8,
                velocityX: 820,
            }),
        ).toBe('detail-right');
    });

    it('requires axis dominance before side or next actions', () => {
        expect(
            resolveFeedStackGesture({
                dx: 96,
                dy: 92,
            }),
        ).toBe('center');

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
