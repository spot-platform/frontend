import type { HeaderTabOption } from '@/shared/ui/HeaderTabs';

export interface HeaderTabRouteConfig {
    match: (pathname: string) => boolean;
    paramKey: string;
    defaultValue: string;
    options: readonly HeaderTabOption[];
}

export const HEADER_TAB_ROUTES: readonly HeaderTabRouteConfig[] = [
    {
        match: (p) => p === '/feed',
        paramKey: 'tab',
        defaultValue: 'HOME',
        options: [
            { value: 'HOME', label: '홈' },
            { value: 'EXPLORE', label: '피드' },
        ],
    },
    {
        match: (p) => p === '/spot',
        paramKey: 'view',
        defaultValue: 'PARTNER',
        options: [
            { value: 'PARTNER', label: '파트너' },
            { value: 'SUPPORTER', label: '서포터' },
        ],
    },
    {
        match: (p) => p === '/chat',
        paramKey: 'tab',
        defaultValue: 'personal',
        options: [
            { value: 'personal', label: '개인' },
            { value: 'team', label: '팀' },
        ],
    },
];

export function resolveHeaderTabConfig(
    pathname: string,
): HeaderTabRouteConfig | null {
    return HEADER_TAB_ROUTES.find((route) => route.match(pathname)) ?? null;
}
