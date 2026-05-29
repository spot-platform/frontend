export const MAP_FEED_CARD_DECK_ANIMATION = {
    cardTopDvh: 22,
    cardWidth: 'min(92vw, 420px)',
    stackStepDvh: 1.4,
    enterY: '60dvh',
    downExitY: '60dvh',
    horizontalExitOffset: '130%',
    horizontalExitRotate: 12,
    horizontalExitDuration: 0.32,
    staggerDelay: 0.09,
    rotateBase: 1.2,
    rotateStep: 0.4,
    scaleStep: 0.025,
    spring: {
        type: 'spring' as const,
        stiffness: 240,
        damping: 28,
        mass: 0.7,
    },
    stackSpring: {
        type: 'spring' as const,
        stiffness: 240,
        damping: 28,
    },
    horizontalEase: [0.32, 0.72, 0, 1] as [number, number, number, number],
} as const;

export type CardDeckExitDirection = 'down' | 'left' | 'right';
