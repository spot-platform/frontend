'use client';

// FeedCategory multi-select chips. Values mirror features/feed FeedCategory union.

import { Chip } from '@frontend/design-system';

const INTEREST_OPTIONS: readonly string[] = [
    '음악',
    '요리',
    '운동',
    '공예',
    '언어',
    '기타',
];

type InterestTagPickerProps = {
    value: string[];
    onToggle: (interest: string) => void;
    className?: string;
};

export function InterestTagPicker({
    value,
    onToggle,
    className,
}: InterestTagPickerProps) {
    return (
        <div
            className={className ?? 'flex flex-wrap gap-2'}
            role="group"
            aria-label="관심 카테고리"
        >
            {INTEREST_OPTIONS.map((option) => {
                const isSelected = value.includes(option);
                return (
                    <Chip
                        key={option}
                        tone="brand"
                        selected={isSelected}
                        onClick={() => onToggle(option)}
                        aria-pressed={isSelected}
                    >
                        {option}
                    </Chip>
                );
            })}
        </div>
    );
}
