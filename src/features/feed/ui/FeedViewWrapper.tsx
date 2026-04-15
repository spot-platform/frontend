'use client';

import { FeedTabs } from './FeedTabs';
import { HomeSection } from './home/HomeSection';
import { ExploreSection } from './explore/ExploreSection';
import { Main } from '@/shared/ui';

interface FeedViewWrapperProps {
    activeTab: string;
}

export function FeedViewWrapper({ activeTab }: FeedViewWrapperProps) {
    const safeTab = activeTab === 'EXPLORE' ? 'EXPLORE' : 'HOME';

    return (
        <Main className="flex flex-col pb-4">
            <FeedTabs activeTab={safeTab} />
            {safeTab === 'HOME' && <HomeSection />}
            {safeTab === 'EXPLORE' && <ExploreSection />}
        </Main>
    );
}
