'use client';

import { Chip } from '@frontend/design-system';
import type { PostSpotCategory } from '../model/types';

const CATEGORIES: PostSpotCategory[] = [
    '음식·요리',
    'BBQ·조개',
    '공동구매',
    '교육',
    '운동',
    '공예',
    '음악',
    '기타',
];

interface CategoryTagSelectorProps {
    selected: PostSpotCategory[];
    onChange: (categories: PostSpotCategory[]) => void;
}

export function CategoryTagSelector({
    selected,
    onChange,
}: CategoryTagSelectorProps) {
    const toggle = (cat: PostSpotCategory) => {
        if (selected.includes(cat)) {
            onChange(selected.filter((c) => c !== cat));
        } else {
            onChange([...selected, cat]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
                const isSelected = selected.includes(cat);
                return (
                    <Chip
                        key={cat}
                        onClick={() => toggle(cat)}
                        selected={isSelected}
                        tone="brand"
                    >
                        {cat}
                    </Chip>
                );
            })}
        </div>
    );
}
