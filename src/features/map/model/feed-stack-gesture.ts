export type FeedStackGestureAction =
    | 'center'
    | 'next'
    | 'detail-left'
    | 'detail-right';

const SWIPE_DOWN_THRESHOLD = 72;
const SWIPE_SIDE_TRIGGER_THRESHOLD = 136;
const SWIPE_SIDE_VELOCITY_THRESHOLD = 760;
const SWIPE_SIDE_RESTORING_DISTANCE = 48;
const SWIPE_AXIS_DOMINANCE_RATIO = 1.45;

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
    const absVx = Math.abs(velocityX);

    const isMostlyHorizontal =
        absX >= SWIPE_SIDE_RESTORING_DISTANCE &&
        absX >= absY * SWIPE_AXIS_DOMINANCE_RATIO;
    const isSideTrigger =
        isMostlyHorizontal &&
        (absX >= SWIPE_SIDE_TRIGGER_THRESHOLD ||
            absVx >= SWIPE_SIDE_VELOCITY_THRESHOLD);

    if (isSideTrigger) {
        if (dx < 0) return 'detail-left';
        return 'detail-right';
    }

    const isDownSwipe =
        dy >= SWIPE_DOWN_THRESHOLD && dy >= absX * SWIPE_AXIS_DOMINANCE_RATIO;

    if (isDownSwipe) return 'next';

    return 'center';
}
