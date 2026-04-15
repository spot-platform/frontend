'use client';

import { useState } from 'react';
import { SpotCard } from './SpotCard';
import { SpotTabs } from './SpotTabs';
import { SpotEmptyState } from './SpotEmptyState';
import { SpotCardSkeleton } from './skeletons/SpotCardSkeleton';
import { useSpotList } from '../model/use-spot';
import { MOCK_MY_SPOTS } from '../model/mock';
import type { Spot, SpotTabFilter } from '@/entities/spot/types';

const MOCK_USER_ID = 'user-me';

function filterSpots(spots: Spot[], tab: SpotTabFilter): Spot[] {
    switch (tab) {
        case 'ACTIVE':
            return spots.filter(
                (s) => s.status === 'OPEN' || s.status === 'MATCHED',
            );
        case 'COMPLETED':
            return spots.filter(
                (s) => s.status === 'CLOSED' || s.status === 'CANCELLED',
            );
        case 'ALL':
            return spots;
    }
}

export function SpotList() {
    const [activeTab, setActiveTab] = useState<SpotTabFilter>('ACTIVE');
    const { data, isLoading } = useSpotList({ participating: true });

    // API 응답이 없으면 mock 데이터 사용
    const spots: Spot[] = data?.data ?? MOCK_MY_SPOTS;
    const filtered = filterSpots(spots, activeTab);

    return (
        <div className="flex flex-col gap-4">
            <SpotTabs active={activeTab} onChange={setActiveTab} />

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    <SpotCardSkeleton />
                    <SpotCardSkeleton />
                    <SpotCardSkeleton />
                </div>
            ) : filtered.length === 0 ? (
                <SpotEmptyState tab={activeTab} />
            ) : (
                <ul className="flex flex-col gap-3">
                    {filtered.map((spot) => (
                        <li key={spot.id}>
                            <SpotCard
                                spot={spot}
                                currentUserId={MOCK_USER_ID}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
