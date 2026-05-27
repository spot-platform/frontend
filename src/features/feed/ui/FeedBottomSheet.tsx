'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
    type BottomSheetSnapPoint,
    PersistentDrawer,
} from '@frontend/design-system';
import { useAuthStore } from '@/shared/model/auth-store';
import { buildSpotCardLookup } from '@/features/simulation/model/spot-card-adapter';
import { useLayerAwareInfiniteFeedList } from '../model/use-feed';
import { useFilterStore } from '@/features/map/model/use-filter-store';
import type { SpotCategory } from '@/entities/spot/categories';
import { FeedCard } from './FeedCard';
import { AttractivenessMiniGauge } from './preference/AttractivenessMiniGauge';
import { filterVisibleFeedItems } from '../model/feed-filter';
import type { FeedItem } from '../model/types';

type FeedBottomSheetProps = {
    open: boolean;
    snapPoint: BottomSheetSnapPoint;
    onSnapChange: (snap: BottomSheetSnapPoint) => void;
    onOpenChange?: (open: boolean) => void;
    feedType?: 'all' | 'offer' | 'request';
    categories?: SpotCategory[];
};

type SpotCardEntry = {
    person_fitness_score?: number;
    attractiveness_score?: number;
};

function getSimulationScore(
    item: FeedItem,
    lookup: Map<string, SpotCardEntry>,
): { fitness?: number; attractiveness?: number } {
    if (!item.spotId) return {};
    const card = lookup.get(item.spotId);
    if (!card) return {};
    return {
        fitness: card.person_fitness_score,
        attractiveness: card.attractiveness_score,
    };
}

const BOTTOM_SHEET_PAGE_SIZE = 10;

function toFeedTypeParam(feedType: FeedBottomSheetProps['feedType']) {
    if (feedType === 'offer') return 'OFFER' as const;
    if (feedType === 'request') return 'REQUEST' as const;
    return undefined;
}

export function FeedBottomSheet({
    open,
    snapPoint,
    onSnapChange,
    onOpenChange,
    feedType = 'all',
    categories = [],
}: FeedBottomSheetProps) {
    const userPersona = useAuthStore((state) => state.userPersona);
    const role = userPersona?.role ?? null;
    const searchQuery = useFilterStore((s) => s.searchQuery);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const feedListParams = useMemo(
        () => ({
            type: toFeedTypeParam(feedType),
            category: categories.length === 1 ? categories[0] : undefined,
            sort: 'latest',
            page: 0,
            size: BOTTOM_SHEET_PAGE_SIZE,
        }),
        [feedType, categories],
    );
    const {
        data: feedData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useLayerAwareInfiniteFeedList(feedListParams);
    const feedItems = useMemo(
        () => feedData?.pages.flatMap((page) => page.data) ?? [],
        [feedData?.pages],
    );
    const spotCardLookup = useMemo(() => buildSpotCardLookup([]), []);

    useEffect(() => {
        if (!open || snapPoint === 'peek' || !hasNextPage) return;
        const node = loadMoreRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isFetchingNextPage) {
                    void fetchNextPage();
                }
            },
            { root: null, rootMargin: '160px 0px' },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage, open, snapPoint]);

    const filtered = filterVisibleFeedItems(feedItems, {
        feedType,
        categories,
        searchQuery,
    });
    const totalFeedCount =
        feedData?.pages.at(-1)?.meta?.total ?? filtered.length;

    return (
        <PersistentDrawer
            open={open}
            onOpenChange={onOpenChange}
            snapPoint={snapPoint}
            onSnapChange={onSnapChange}
            dismissible
            className="inset-x-3 rounded-t-2xl"
        >
            {snapPoint !== 'peek' && (
                <>
                    <p className="mb-3 text-xs font-medium text-muted-foreground">
                        주변 모임 {filtered.length}개
                        {typeof totalFeedCount === 'number' &&
                            totalFeedCount > filtered.length &&
                            ` / 전체 ${totalFeedCount}개`}
                    </p>
                    <div className="flex flex-col divide-y divide-border-soft">
                        {filtered.map((item) => {
                            const scores = getSimulationScore(
                                item,
                                spotCardLookup,
                            );
                            // 파트너는 카드 내부 배지로만 표기 (FeedCard가 role/score 가드).
                            // 서포터 본인 카드에서만 매력도 표시 — spotId 연결된 아이템에만.
                            const showAttractiveness =
                                role === 'SUPPORTER' &&
                                scores.attractiveness != null;

                            return (
                                <div key={item.id}>
                                    {showAttractiveness &&
                                        scores.attractiveness != null && (
                                            <div className="flex items-center gap-2 px-4 pt-3">
                                                <AttractivenessMiniGauge
                                                    score={
                                                        scores.attractiveness
                                                    }
                                                />
                                            </div>
                                        )}
                                    <FeedCard
                                        item={item}
                                        fitnessScore={scores.fitness}
                                    />
                                </div>
                            );
                        })}
                        {filtered.length === 0 && !isLoading && (
                            <div className="flex h-40 items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    조건에 맞는 모임이 없어요
                                </p>
                            </div>
                        )}
                        {(hasNextPage || isFetchingNextPage || isLoading) && (
                            <div
                                ref={loadMoreRef}
                                className="flex h-16 items-center justify-center"
                            >
                                <p className="text-xs text-muted-foreground">
                                    {isFetchingNextPage || isLoading
                                        ? '피드를 더 불러오는 중이에요'
                                        : '아래로 더 내려보세요'}
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {snapPoint === 'peek' && (
                <div className="flex items-baseline justify-between px-1">
                    <span className="text-sm font-bold tracking-tight text-foreground">
                        이 동네 피드{' '}
                        <span className="text-primary">{filtered.length}</span>
                        {typeof totalFeedCount === 'number' &&
                            totalFeedCount > filtered.length && (
                                <span className="text-muted-foreground">
                                    /{totalFeedCount}
                                </span>
                            )}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                        위로 올려서 목록 ↑
                    </span>
                </div>
            )}
        </PersistentDrawer>
    );
}
