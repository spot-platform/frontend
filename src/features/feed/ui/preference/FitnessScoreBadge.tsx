'use client';

// 파트너용 person_fitness_score(0~1)를 뱃지로 표기.
// 색상 임계 3단계: <0.4 회색 / 0.4~0.7 브랜드 / >=0.7 액센트.

import { motion } from 'framer-motion';

type FitnessScoreBadgeSize = 'sm' | 'md';

type FitnessScoreBadgeProps = {
    score: number;
    size?: FitnessScoreBadgeSize;
    showLabel?: boolean;
    className?: string;
};

type Tone = {
    background: string;
    foreground: string;
    ringClass: string;
    label: string;
};

function scoreTone(score: number): Tone {
    if (score >= 0.7) {
        return {
            background: 'bg-accent-muted',
            foreground: 'text-accent-dark',
            ringClass: 'ring-accent-dark/20',
            label: '매우 잘 맞아요',
        };
    }
    if (score >= 0.4) {
        return {
            background: 'bg-brand-50',
            foreground: 'text-brand-700',
            ringClass: 'ring-brand-700/15',
            label: '잘 맞아요',
        };
    }
    return {
        background: 'bg-neutral-100',
        foreground: 'text-neutral-700',
        ringClass: 'ring-neutral-400/20',
        label: '가볍게 확인',
    };
}

const SIZE_STYLE: Record<FitnessScoreBadgeSize, string> = {
    sm: 'h-5 gap-1 px-2 text-[10px]',
    md: 'h-7 gap-1.5 px-2.5 text-xs',
};

export function FitnessScoreBadge({
    score,
    size = 'sm',
    showLabel = false,
    className,
}: FitnessScoreBadgeProps) {
    const clamped = Math.max(0, Math.min(1, score));
    const tone = scoreTone(clamped);
    const percent = Math.round(clamped * 100);

    const rootClassName = [
        'inline-flex items-center rounded-full font-semibold ring-1',
        'tabular-nums whitespace-nowrap',
        SIZE_STYLE[size],
        tone.background,
        tone.foreground,
        tone.ringClass,
        className ?? '',
    ]
        .filter(Boolean)
        .join(' ');

    const ariaLabel = showLabel
        ? `나와의 궁합 ${percent}% (${tone.label})`
        : `궁합 ${percent}% (${tone.label})`;

    return (
        <motion.span
            key={percent}
            role="status"
            aria-label={ariaLabel}
            className={rootClassName}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
            {showLabel && <span>나와의 궁합</span>}
            <span>{tone.label}</span>
            <span>{percent}%</span>
        </motion.span>
    );
}
