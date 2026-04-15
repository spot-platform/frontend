'use client';

import { Tab } from '@frontend/design-system';

interface TabItem<T extends string> {
    value: T;
    label: string;
}

type TabSize = 'sm' | 'md' | 'lg';

interface TabsProps<T extends string> {
    tabs: readonly TabItem<T>[];
    active: T;
    onChange: (value: T) => void;
    size?: TabSize;
    className?: string;
}

export function Tabs<T extends string>({
    tabs,
    active,
    onChange,
    size = 'sm',
    className,
}: TabsProps<T>) {
    return (
        <Tab
            options={tabs}
            value={active}
            onChange={onChange}
            size={size}
            className={className}
        />
    );
}
