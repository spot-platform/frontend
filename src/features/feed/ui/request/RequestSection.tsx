'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Chip } from '@frontend/design-system';
import { ArrowRight } from 'lucide-react';
import { FeedCard } from '../FeedCard';
import { CategoryGrid } from '../CategoryGrid';
import { MOCK_FEED } from '../../model/mock';
import type { FeedCategory } from '../../model/types';

const BUDGET_FILTERS = ['전체', '~1만원', '1~3만원', '3만원~'] as const;
type BudgetFilter = (typeof BUDGET_FILTERS)[number];

// TODO: API 연동 시 유저 프로필에서 가져올 것
const MY_PREFERRED_CATEGORIES: FeedCategory[] = ['음악', '요리'];

function matchesBudget(price: number, budget: BudgetFilter): boolean {
    if (budget === '전체') return true;
    if (budget === '~1만원') return price <= 10000;
    if (budget === '1~3만원') return price > 10000 && price <= 30000;
    if (budget === '3만원~') return price > 30000;
    return true;
}

/** 선택된 카테고리(또는 내 희망 카테고리)에서 최근 OFFER 포스트 1개 반환 */
function getRecommendedOffer(selected: FeedCategory | '전체') {
    const targetCategories =
        selected === '전체' ? MY_PREFERRED_CATEGORIES : [selected];

    return (
        MOCK_FEED.find(
            (item) =>
                item.type === 'OFFER' &&
                item.status === 'OPEN' &&
                targetCategories.includes(item.category as FeedCategory),
        ) ?? null
    );
}

export function RequestSection() {
    const [selectedCategory, setSelectedCategory] = useState<
        FeedCategory | '전체'
    >('전체');
    const [selectedBudget, setSelectedBudget] = useState<BudgetFilter>('전체');

    const recommended = getRecommendedOffer(selectedCategory);

    const filtered = MOCK_FEED.filter((item) => {
        if (item.type !== 'REQUEST') return false;
        if (!matchesBudget(item.price, selectedBudget)) return false;
        if (selectedCategory === '전체') return true;
        return item.category === selectedCategory;
    });

    return (
        <div className="flex flex-col gap-5">
            {/* 추천 포스트 배너 */}
            {recommended && (
                <Link href={`/feed/${recommended.id}`} className="mx-4 block">
                    <div className="rounded-xl bg-brand-800 px-4 py-3.5">
                        <p className="text-[10px] font-medium text-brand-200">
                            {selectedCategory === '전체'
                                ? `내 희망 카테고리 · ${recommended.category}`
                                : `${selectedCategory} 최근 포스트`}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                            <p className="line-clamp-1 text-sm font-semibold text-white">
                                {recommended.title}
                            </p>
                            <ArrowRight
                                size={16}
                                className="shrink-0 text-white/70"
                            />
                        </div>
                        {recommended.progressPercent != null && (
                            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/20">
                                <div
                                    className="h-full rounded-full bg-white"
                                    style={{
                                        width: `${recommended.progressPercent}%`,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </Link>
            )}

            {/* 카테고리 그리드 */}
            <CategoryGrid
                selected={selectedCategory}
                onChange={setSelectedCategory}
            />

            {/* 예산 범위 필터 칩 */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
                {BUDGET_FILTERS.map((budget) => {
                    const isActive = selectedBudget === budget;

                    return (
                        <Chip
                            key={budget}
                            onClick={() => setSelectedBudget(budget)}
                            selected={isActive}
                            tone="brand"
                            size="md"
                            className={`shrink-0 ${
                                isActive
                                    ? 'border-brand-800 bg-brand-800 text-white'
                                    : 'border-gray-200 bg-gray-100 text-gray-600'
                            }`}
                        >
                            {budget}
                        </Chip>
                    );
                })}
            </div>

            {/* 피드 목록 */}
            <div
                id="request-list"
                className="divide-y divide-gray-100 border-y border-gray-100 bg-white"
            >
                {filtered.length > 0 ? (
                    filtered.map((item) => (
                        <FeedCard key={item.id} item={item} />
                    ))
                ) : (
                    <p className="px-4 py-8 text-center text-sm text-gray-400">
                        해당 카테고리의 요청이 없습니다
                    </p>
                )}
            </div>
        </div>
    );
}
