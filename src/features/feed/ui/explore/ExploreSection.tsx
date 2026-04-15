'use client';

import { useMemo, useState } from 'react';
import { Chip } from '@frontend/design-system';
import { FeedCard } from '../FeedCard';
import { CategoryGrid } from '../CategoryGrid';
import { MOCK_FEED } from '../../model/mock';
import type { FeedCategory, FeedItem } from '../../model/types';

const SORT_OPTIONS = ['추천순', '마감임박', '인기순', '최신순'] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const TYPE_FILTERS = [
    { value: 'ALL', label: '전체' },
    { value: 'OFFER', label: '해볼래?' },
    { value: 'REQUEST', label: '알려줘!' },
] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number]['value'];

function getTimeValue(deadline?: string): number {
    if (!deadline) return Number.POSITIVE_INFINITY;
    return new Date(deadline).getTime();
}

function sortItems(items: FeedItem[], sort: SortOption): FeedItem[] {
    const arr = [...items];

    if (sort === '마감임박') {
        return arr.sort(
            (a, b) => getTimeValue(a.deadline) - getTimeValue(b.deadline),
        );
    }

    if (sort === '인기순') {
        return arr.sort((a, b) => b.views + b.likes - (a.views + a.likes));
    }

    if (sort === '최신순') {
        return arr.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return arr.sort((a, b) => {
        const requestWeightA = a.type === 'REQUEST' ? 1 : 0;
        const requestWeightB = b.type === 'REQUEST' ? 1 : 0;

        if (requestWeightA !== requestWeightB) {
            return requestWeightB - requestWeightA;
        }

        return b.likes + b.views - (a.likes + a.views);
    });
}

export function ExploreSection() {
    const [selectedCategory, setSelectedCategory] = useState<
        FeedCategory | '전체'
    >('전체');
    const [sort, setSort] = useState<SortOption>('추천순');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

    const sortedItems = useMemo(() => {
        const filtered = MOCK_FEED.filter((item) => {
            if (
                selectedCategory !== '전체' &&
                item.category !== selectedCategory
            )
                return false;
            if (typeFilter === 'OFFER')
                return item.type === 'OFFER' || item.type === 'RENT';
            if (typeFilter === 'REQUEST') return item.type === 'REQUEST';
            return true;
        });

        return sortItems(filtered, sort);
    }, [selectedCategory, sort, typeFilter]);

    return (
        <div className="flex flex-col gap-8">
            <CategoryGrid
                selected={selectedCategory}
                onChange={setSelectedCategory}
            />

            <div className="flex flex-col gap-3 px-4">
                <div className="flex gap-1.5">
                    {TYPE_FILTERS.map(({ value, label }) => (
                        <Chip
                            key={value}
                            onClick={() => setTypeFilter(value)}
                            selected={typeFilter === value}
                            size="sm"
                        >
                            {label}
                        </Chip>
                    ))}
                </div>
                <div className="flex gap-3 px-1">
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
                                        : 'font-normal text-gray-400'
                                }`}
                            >
                                {option}
                            </Chip>
                        );
                    })}
                </div>
            </div>

            <div className="divide-y divide-gray-100 border-y border-gray-100 bg-white">
                {sortedItems.length > 0 ? (
                    sortedItems.map((item) => (
                        <FeedCard key={item.id} item={item} />
                    ))
                ) : (
                    <p className="px-4 py-8 text-center text-sm text-gray-400">
                        해당 조건의 피드가 없습니다
                    </p>
                )}
            </div>
        </div>
    );
}
