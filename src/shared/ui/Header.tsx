'use client';

import { Suspense } from 'react';
import { IconButton } from '@frontend/design-system';
import { IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    resolveHeaderTabConfig,
    type HeaderTabRouteConfig,
} from '@/shared/config/headerTabs';
import { HeaderTabs } from './HeaderTabs';

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const tabConfig = resolveHeaderTabConfig(pathname);

    return (
        <div className="pointer-events-auto fixed left-0 right-0 top-0 z-40 flex h-[calc(var(--spacing-header-h)+env(safe-area-inset-top))] items-center justify-between border-b border-border-soft bg-background/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
            <div className="min-w-0 flex-1">
                {tabConfig ? (
                    <Suspense fallback={null}>
                        <HeaderTabsSlot
                            key={pathname}
                            pathname={pathname}
                            config={tabConfig}
                        />
                    </Suspense>
                ) : null}
            </div>

            <IconButton
                variant="ghost"
                size="sm"
                onClick={() => router.push('/search')}
                label="검색"
                icon={
                    <IconSearch
                        size={20}
                        stroke={2}
                        className="text-foreground"
                    />
                }
            />
        </div>
    );
}

interface HeaderTabsSlotProps {
    pathname: string;
    config: HeaderTabRouteConfig;
}

function HeaderTabsSlot({ pathname, config }: HeaderTabsSlotProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawValue = searchParams.get(config.paramKey);
    const currentValue = config.options.some((o) => o.value === rawValue)
        ? (rawValue as string)
        : config.defaultValue;

    function handleChange(next: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set(config.paramKey, next);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    return (
        <HeaderTabs
            options={config.options}
            value={currentValue}
            onChange={handleChange}
        />
    );
}
