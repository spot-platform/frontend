'use client';

import { type Variants } from 'framer-motion';

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const slideUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const staggerChildren: Variants = {
    visible: { transition: { staggerChildren: 0.08 } },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

/**
 * 슬라이드 전환 variants — direction: -1(prev) | 1(next)
 * custom prop으로 direction을 받는다.
 */
export const slideCard = (xOffset: number = 60): Variants => ({
    enter: (direction: number) => ({
        x: direction * xOffset,
        scale: 0.9,
        opacity: 0,
    }),
    center: {
        x: 0,
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
    },
    exit: (direction: number) => ({
        x: direction * -xOffset,
        scale: 0.9,
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
    }),
});
