'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@frontend/design-system';
import { Chip } from '@frontend/design-system';
import { IconEye, IconHeart, IconUsers } from '@tabler/icons-react';
import { cn } from '@/shared/lib/cn';
import { CategoryGrid } from '../CategoryGrid';
import { MOCK_FEED } from '../../model/mock';
import type { FeedCategory, FeedItem } from '../../model/types';

const BUDGET_FILTERS = ['전체', '~1만원', '1~3만원', '3만원~'] as const;
type BudgetFilter = (typeof BUDGET_FILTERS)[number];

function matchesBudget(price: number, budget: BudgetFilter): boolean {
    if (budget === '전체') return true;
    if (budget === '~1만원') return price <= 10000;
    if (budget === '1~3만원') return price > 10000 && price <= 30000;
    if (budget === '3만원~') return price > 30000;
    return true;
}

function formatPrice(price: number): string {
    return price.toLocaleString('ko-KR') + '원';
}

function StatBadge({ icon, count }: { icon: React.ReactNode; count: number }) {
    return (
        <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
            {icon}
            <span>{count.toLocaleString()}</span>
        </span>
    );
}

function SupporterRequestCard({ item }: { item: FeedItem }) {
    const [applied, setApplied] = useState(false);

    return (
        <Link href={`/feed/${item.id}`} className="block active:bg-gray-50">
            <article className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3">
                <div className="flex gap-3">
                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="rounded-full border border-accent px-2 py-0.5 text-[10px] font-semibold text-accent">
                                요청
                            </span>
                            <span className="text-[10px] text-gray-400">
                                서포터 구하는 중
                            </span>
                        </div>
                        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                            {item.title}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-gray-400">
                            {item.location} · {item.authorNickname}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-900">
                                희망 {formatPrice(item.price)}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                            <StatBadge
                                icon={<IconEye size={11} />}
                                count={item.views}
                            />
                            <StatBadge
                                icon={<IconHeart size={11} />}
                                count={item.likes}
                            />
                            <StatBadge
                                icon={<IconUsers size={11} />}
                                count={item.applicantCount ?? 0}
                            />
                        </div>
                    </div>
                </div>

                {/* 서포터 CTA: "지원하기" */}
                <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                    <Button
                        disabled={applied}
                        onClick={() => setApplied(true)}
                        className={cn(
                            'flex-1 rounded-lg shadow-none',
                            applied
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-accent text-white',
                        )}
                    >
                        {applied ? '지원 완료' : '지원하기'}
                    </Button>
                </div>
            </article>
        </Link>
    );
}

export function SupporterRequestSection() {
    const [selectedCategory, setSelectedCategory] = useState<
        FeedCategory | '전체'
    >('전체');
    const [selectedBudget, setSelectedBudget] = useState<BudgetFilter>('전체');

    const filtered = MOCK_FEED.filter((item) => {
        if (item.type !== 'REQUEST') return false;
        if (!matchesBudget(item.price, selectedBudget)) return false;
        if (selectedCategory === '전체') return true;
        return item.category === selectedCategory;
    });

    return (
        <div className="flex flex-col gap-5">
            {/* 카테고리 그리드 */}
            <CategoryGrid
                selected={selectedCategory}
                onChange={setSelectedCategory}
            />

            {/* 예산 필터 */}
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
                                    ? 'border-accent bg-accent text-white'
                                    : 'border-gray-200 bg-gray-100 text-gray-600'
                            }`}
                        >
                            {budget}
                        </Chip>
                    );
                })}
            </div>

            {/* 요청 목록 */}
            <div className="flex flex-col gap-3 px-4">
                {filtered.length > 0 ? (
                    filtered.map((item) => (
                        <SupporterRequestCard key={item.id} item={item} />
                    ))
                ) : (
                    <p className="py-8 text-center text-sm text-gray-400">
                        해당 카테고리의 요청이 없습니다
                    </p>
                )}
            </div>
        </div>
    );
}
