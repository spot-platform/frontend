'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
    parseMapUrlState,
    serializeMapUrlState,
    type MapUrlState,
} from './map-url';

export type { MapUrlState };

export function useMapUrlState() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const state = useMemo(
        () => parseMapUrlState(new URLSearchParams(searchParams.toString())),
        [searchParams],
    );

    const update = useCallback(
        (patch: Partial<MapUrlState>) => {
            const next: MapUrlState = { ...state, ...patch };
            const nextQuery = serializeMapUrlState(next);
            const currentQuery = searchParams.toString();
            if (nextQuery === currentQuery) return;
            router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ''}`, {
                scroll: false,
            });
        },
        [state, pathname, router, searchParams],
    );

    return [state, update] as const;
}
