'use client';

import { Chip } from '@frontend/design-system';
import { useFilterStore } from '@/features/map/model/use-filter-store';
import { SPOT_CATEGORIES } from '@/entities/spot/categories';

const TYPE_CHIPS = [
    { label: '해볼래', value: 'offer' as const },
    { label: '알려줘', value: 'request' as const },
];

export function FilterChipBar() {
    const feedType = useFilterStore((s) => s.feedType);
    const categories = useFilterStore((s) => s.categories);
    const setFeedType = useFilterStore((s) => s.setFeedType);
    const toggleCategory = useFilterStore((s) => s.toggleCategory);

    return (
        <div
            className="pointer-events-auto fixed left-0 right-0 z-20 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{
                top: 'calc(env(safe-area-inset-top) + 4.5rem)',
                paddingLeft: 'calc(env(safe-area-inset-left) + 1rem)',
                paddingRight: 'calc(env(safe-area-inset-right) + 1rem)',
            }}
        >
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

                {SPOT_CATEGORIES.map((cat) => (
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
