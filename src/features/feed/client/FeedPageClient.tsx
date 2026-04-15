'use client';

import { HomeSection } from '../ui/home/HomeSection';
import { ExploreSection } from '../ui/explore/ExploreSection';
import { Main } from '@/shared/ui';

interface FeedPageClientProps {
    activeTab: string;
}

export function FeedPageClient({ activeTab }: FeedPageClientProps) {
    const safeTab = activeTab === 'EXPLORE' ? 'EXPLORE' : 'HOME';

    return (
        <Main className="flex flex-col pb-4">
            {safeTab === 'HOME' && <HomeSection />}
            {safeTab === 'EXPLORE' && <ExploreSection />}
        </Main>
    );
}
