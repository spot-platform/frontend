export type FeedStackGestureAction = 'center' | 'next';

const SWIPE_DOWN_THRESHOLD = 72;
const SWIPE_AXIS_DOMINANCE_RATIO = 1.45;

type ResolveFeedStackGestureInput = {
    dx: number;
    dy: number;
    velocityX?: number;
};

export function resolveFeedStackGesture({
    dx,
    dy,
}: ResolveFeedStackGestureInput): FeedStackGestureAction {
    const absX = Math.abs(dx);

    const isDownSwipe =
        dy >= SWIPE_DOWN_THRESHOLD && dy >= absX * SWIPE_AXIS_DOMINANCE_RATIO;

    if (isDownSwipe) return 'next';

    return 'center';
}
