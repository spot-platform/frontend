'use client';

import { useRouter } from 'next/navigation';
import { Tabs } from '@/shared/ui/Tabs';

type SupporterFeedTab = 'REQUEST' | 'HOME';

const SUPPORTER_TABS: { value: SupporterFeedTab; label: string }[] = [
    { value: 'REQUEST', label: '요청 탐색' },
    { value: 'HOME', label: '홈' },
];

function isSupporterTab(value: string): value is SupporterFeedTab {
    return SUPPORTER_TABS.some((tab) => tab.value === value);
}

interface SupporterFeedTabsProps {
    activeTab: string;
}

export function SupporterFeedTabs({ activeTab }: SupporterFeedTabsProps) {
    const router = useRouter();
    const safeActiveTab: SupporterFeedTab = isSupporterTab(activeTab)
        ? activeTab
        : 'HOME';

    function handleChange(value: SupporterFeedTab) {
        router.push('/feed?tab=' + value);
    }

    return (
        <div className="py-3 flex justify-center">
            <Tabs
                className="w-fit"
                tabs={SUPPORTER_TABS}
                active={safeActiveTab}
                onChange={handleChange}
            />
        </div>
    );
}
