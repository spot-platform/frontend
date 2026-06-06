export type FeedStackGestureAction =
    | 'center'
    | 'next'
    | 'detail-left'
    | 'detail-right';

const SWIPE_SIDE_THRESHOLD = 50;
const SWIPE_SIDE_FLICK_THRESHOLD = 36;
const SWIPE_SIDE_VELOCITY_THRESHOLD = 650;
const SWIPE_DOWN_THRESHOLD = 72;
const SWIPE_AXIS_DOMINANCE_RATIO = 1.45;
const SWIPE_SIDE_AXIS_DOMINANCE_RATIO = 1.2;

type ResolveFeedStackGestureInput = {
    dx: number;
    dy: number;
    velocityX?: number;
};

export function resolveFeedStackGesture({
    dx,
    dy,
    velocityX = 0,
}: ResolveFeedStackGestureInput): FeedStackGestureAction {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const absVelocityX = Math.abs(velocityX);

    const isSideSwipe =
        absX >= SWIPE_SIDE_THRESHOLD &&
        absX >= absY * SWIPE_SIDE_AXIS_DOMINANCE_RATIO;
    const isFastSideFlick =
        absX >= SWIPE_SIDE_FLICK_THRESHOLD &&
        absVelocityX >= SWIPE_SIDE_VELOCITY_THRESHOLD &&
        absX >= absY * SWIPE_SIDE_AXIS_DOMINANCE_RATIO;

    if (isSideSwipe || isFastSideFlick) {
        return dx < 0 ? 'detail-left' : 'detail-right';
    }

    const isDownSwipe =
        dy >= SWIPE_DOWN_THRESHOLD && dy >= absX * SWIPE_AXIS_DOMINANCE_RATIO;

    if (isDownSwipe) return 'next';

    return 'center';
}
