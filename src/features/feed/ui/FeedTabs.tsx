'use client';

import { useRouter } from 'next/navigation';
import { Tabs } from '@/shared/ui/Tabs';
import type { FeedTabType } from '../model/types';

const FEED_TABS: { value: FeedTabType; label: string }[] = [
    { value: 'HOME', label: '홈' },
    { value: 'EXPLORE', label: '피드' },
];

interface FeedTabsProps {
    activeTab: string;
}

function isFeedTabType(value: string): value is FeedTabType {
    return FEED_TABS.some((tab) => tab.value === value);
}

export function FeedTabs({ activeTab }: FeedTabsProps) {
    const router = useRouter();
    const safeActiveTab: FeedTabType = isFeedTabType(activeTab)
        ? activeTab
        : 'HOME';

    function handleChange(value: FeedTabType) {
        router.push('/feed?tab=' + value);
    }

    return (
        <div className="py-3 flex justify-center">
            <Tabs
                className="w-fit"
                tabs={FEED_TABS}
                active={safeActiveTab}
                onChange={handleChange}
            />
        </div>
    );
}
