'use client';

import { useState } from 'react';
import { Chip } from '@frontend/design-system';
import { FeedCard } from '../FeedCard';
import { CategoryGrid } from '../CategoryGrid';
import { MOCK_FEED } from '../../model/mock';
import type { FeedItem, FeedItemType, FeedCategory } from '../../model/types';
import { Tabs } from '@/shared/ui';

const SUB_TYPES: { value: FeedItemType; label: string }[] = [
    { value: 'OFFER', label: '강의' },
    { value: 'RENT', label: '대여' },
];

const SORT_OPTIONS = ['추천순', '마감임박', '인기순', '최신순'] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

function sortItems(items: FeedItem[], sort: SortOption): FeedItem[] {
    const arr = [...items];
    if (sort === '마감임박') {
        return arr.sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return (
                new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            );
        });
    }
    if (sort === '인기순') return arr.sort((a, b) => b.views - a.views);
    if (sort === '최신순')
        return arr.sort((a, b) => Number(b.id) - Number(a.id));
    return arr.sort(
        (a, b) => (b.progressPercent ?? 0) - (a.progressPercent ?? 0),
    );
}

export function OfferSection() {
    const [selectedCategory, setSelectedCategory] = useState<
        FeedCategory | '전체'
    >('전체');
    const [selectedType, setSelectedType] = useState<FeedItemType>('OFFER');
    const [sort, setSort] = useState<SortOption>('추천순');

    const filtered = MOCK_FEED.filter((item) => {
        if (item.type !== selectedType) return false;
        if (selectedCategory === '전체') return true;
        return item.category === selectedCategory;
    });

    const sorted = sortItems(filtered, sort);

    return (
        <div className="flex flex-col gap-5">
            {/* 서브 타입 필터: 강의 / 대여 */}
            <Tabs
                tabs={SUB_TYPES}
                active={selectedType}
                onChange={setSelectedType}
                size="md"
                className="px-4"
            />

            {/* 카테고리 그리드 */}
            <CategoryGrid
                selected={selectedCategory}
                onChange={setSelectedCategory}
            />

            {/* 정렬 필터 */}
            <div className="flex gap-3 px-4">
                {SORT_OPTIONS.map((option) => {
                    const isActive = sort === option;

                    return (
                        <Chip
                            key={option}
                            onClick={() => setSort(option)}
                            selected={isActive}
                            size="sm"
                            className={`min-h-0 border-0 bg-transparent px-0 text-xs ${
                                isActive
                                    ? 'font-bold text-brand-800'
                                    : 'font-normal text-muted-foreground'
                            }`}
                        >
                            {option}
                        </Chip>
                    );
                })}
            </div>

            {/* 피드 목록 */}
            <div className="border-y border-border-soft bg-card divide-y divide-border-soft">
                {sorted.length > 0 ? (
                    sorted.map((item) => <FeedCard key={item.id} item={item} />)
                ) : (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                        해당 카테고리의 모임이 없습니다
                    </p>
                )}
            </div>
        </div>
    );
}
