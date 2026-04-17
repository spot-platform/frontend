'use client';

import { Chip } from '@frontend/design-system';
import { useFilterStore } from '@/features/map/model/use-filter-store';

const TYPE_CHIPS = [
    { label: '해볼래', value: 'offer' as const },
    { label: '알려줘', value: 'request' as const },
];

const CATEGORY_CHIPS = [
    '요리',
    '운동',
    '음악',
    '공예',
    '코딩',
    '등산',
    '요가',
    '미술',
    '볼더링',
];

export function FilterChipBar() {
    const { feedType, categories, setFeedType, toggleCategory } =
        useFilterStore();

    return (
        <div className="pointer-events-auto fixed left-0 right-0 top-[calc(env(safe-area-inset-top)+4.5rem)] z-20 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex flex-nowrap gap-2.5 pb-2">
                {TYPE_CHIPS.map((chip) => (
                    <Chip
                        key={chip.value}
                        selected={feedType === chip.value}
                        tone="brand"
                        size="md"
                        onClick={() => setFeedType(chip.value)}
                        className="shrink-0 px-4 py-1.5 text-sm shadow-sm"
                    >
                        {chip.label}
                    </Chip>
                ))}

                <div className="mx-1 w-px shrink-0 self-stretch bg-neutral-300" />

                {CATEGORY_CHIPS.map((cat) => (
                    <Chip
                        key={cat}
                        selected={categories.includes(cat)}
                        tone="neutral"
                        size="md"
                        onClick={() => toggleCategory(cat)}
                        className="shrink-0 px-4 py-1.5 text-sm shadow-sm"
                    >
                        {cat}
                    </Chip>
                ))}
            </div>
        </div>
    );
}
