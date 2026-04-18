'use client';

import { useMemo } from 'react';
import {
    type BottomSheetSnapPoint,
    PersistentDrawer,
} from '@frontend/design-system';
import { useAuthStore } from '@/shared/model/auth-store';
import { MOCK_SPOT_CARDS } from '@/features/simulation/model/mock-api-responses';
import { buildSpotCardLookup } from '@/features/simulation/model/spot-card-adapter';
import { useFilterStore } from '@/features/map/model/use-filter-store';
import type { SpotCategory } from '@/entities/spot/categories';
import { FeedCard } from './FeedCard';
import { AttractivenessMiniGauge } from './preference/AttractivenessMiniGauge';
import { MOCK_FEED } from '../model/mock';
import type { FeedItem } from '../model/types';

type FeedBottomSheetProps = {
    snapPoint: BottomSheetSnapPoint;
    onSnapChange: (snap: BottomSheetSnapPoint) => void;
    feedType?: 'all' | 'offer' | 'request';
    categories?: SpotCategory[];
};

function getSimulationScore(
    item: FeedItem,
    lookup: Map<string, (typeof MOCK_SPOT_CARDS)[number]>,
): { fitness?: number; attractiveness?: number } {
    if (!item.spotId) return {};
    const card = lookup.get(item.spotId);
    if (!card) return {};
    return {
        fitness: card.person_fitness_score,
        attractiveness: card.attractiveness_score,
    };
}

export function FeedBottomSheet({
    snapPoint,
    onSnapChange,
    feedType = 'all',
    categories = [],
}: FeedBottomSheetProps) {
    const userPersona = useAuthStore((state) => state.userPersona);
    const role = userPersona?.role ?? null;
    const searchQuery = useFilterStore((s) => s.searchQuery);
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const spotCardLookup = useMemo(
        () => buildSpotCardLookup(MOCK_SPOT_CARDS),
        [],
    );

    const filtered = MOCK_FEED.filter((item) => {
        if (feedType === 'offer' && item.type !== 'OFFER') return false;
        if (feedType === 'request' && item.type !== 'REQUEST') return false;
        if (
            categories.length > 0 &&
            (!item.category ||
                !categories.includes(item.category as SpotCategory))
        )
            return false;
        if (normalizedQuery.length > 0) {
            const haystack = [
                item.title,
                item.description ?? '',
                item.category ?? '',
                item.location,
                item.authorNickname,
            ]
                .join(' ')
                .toLowerCase();
            if (!haystack.includes(normalizedQuery)) return false;
        }
        return true;
    });

    return (
        <PersistentDrawer
            open
            snapPoint={snapPoint}
            onSnapChange={onSnapChange}
        >
            {snapPoint !== 'peek' && (
                <>
                    <p className="mb-3 text-xs font-medium text-muted-foreground">
                        주변 모임 {filtered.length}개
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
                        {filtered.length === 0 && (
                            <div className="flex h-40 items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    조건에 맞는 모임이 없어요
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {snapPoint === 'peek' && (
                <div className="flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">
                        위로 올려서 모임 목록 보기
                    </p>
                </div>
            )}
        </PersistentDrawer>
    );
}
