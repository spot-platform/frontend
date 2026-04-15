'use client';

import { useEffect } from 'react';
import { useSpotNavStore } from '@/shared/model/spot-nav-store';
import { MOCK_MY_SPOTS } from '../model/mock';
import type { SpotView } from '../model/view';
import { SpotMyListSection } from './SpotMyListSection';
import type { Spot } from '@/entities/spot/types';

const MY_USER_ID = 'user-me';

function partitionPartnerSpots(spots: Spot[]) {
    const recruiting = spots.filter(
        (s) => s.status === 'OPEN' && s.authorId === MY_USER_ID,
    );
    const inProgress = spots.filter(
        (s) => s.status === 'MATCHED' && s.authorId === MY_USER_ID,
    );
    return { recruiting, inProgress };
}

function partitionSupporterSpots(spots: Spot[]) {
    // 서포터 뷰: 내가 만든 스팟이 아닌 것 중 MATCHED(지원 완료) 기준
    const applying = spots.filter(
        (s) => s.status === 'OPEN' && s.authorId !== MY_USER_ID,
    );
    const inProgress = spots.filter(
        (s) => s.status === 'MATCHED' && s.authorId !== MY_USER_ID,
    );
    return { applying, inProgress };
}

interface SpotMyListProps {
    view: SpotView;
}

export function SpotMyList({ view }: SpotMyListProps) {
    const { expandedSpotId, setExpandedSpotId, toggleSpot } = useSpotNavStore();

    useEffect(() => {
        setExpandedSpotId(null);
    }, [setExpandedSpotId, view]);

    if (view === 'SUPPORTER') {
        const { applying, inProgress } = partitionSupporterSpots(MOCK_MY_SPOTS);
        return (
            <div className="flex flex-col gap-3">
                <SpotMyListSection
                    title="모집 중"
                    spots={applying}
                    mode="recruiting"
                    expandedSpotId={expandedSpotId}
                    onToggleSpot={toggleSpot}
                    emptyMessage="지원 중인 스팟이 없어요"
                />
                <SpotMyListSection
                    title="진행 중"
                    spots={inProgress}
                    mode="inProgress"
                    emptyMessage="수락된 스팟이 없어요"
                />
            </div>
        );
    }

    const { recruiting, inProgress } = partitionPartnerSpots(MOCK_MY_SPOTS);
    return (
        <div className="flex flex-col gap-3">
            <SpotMyListSection
                title="모집 중"
                spots={recruiting}
                mode="recruiting"
                expandedSpotId={expandedSpotId}
                onToggleSpot={toggleSpot}
                emptyMessage="모집 중인 스팟이 없어요"
            />
            <SpotMyListSection
                title="진행 중"
                spots={inProgress}
                mode="inProgress"
                emptyMessage="진행 중인 스팟이 없어요"
            />
        </div>
    );
}
