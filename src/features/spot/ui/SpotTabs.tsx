'use client';

import { Tabs } from '@/shared/ui';
import type { SpotTabFilter } from '@/entities/spot/types';

const TABS: { value: SpotTabFilter; label: string }[] = [
    { value: 'ACTIVE', label: '진행 중' },
    { value: 'COMPLETED', label: '완료' },
    { value: 'ALL', label: '전체' },
];

interface SpotTabsProps {
    active: SpotTabFilter;
    onChange: (value: SpotTabFilter) => void;
}

export function SpotTabs({ active, onChange }: SpotTabsProps) {
    return (
        <Tabs
            tabs={TABS}
            active={active}
            onChange={onChange}
            className="mx-4"
        />
    );
}
