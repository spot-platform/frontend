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
            const nextMapQuery = serializeMapUrlState(next);

            // MapUrlState 외 외부 쿼리 (sim, n 등) 는 보존.
            const merged = new URLSearchParams(searchParams.toString());
            merged.delete('spot');
            merged.delete('persona');
            merged.delete('cluster');
            merged.delete('sheet');
            merged.delete('chat');
            for (const [key, value] of new URLSearchParams(nextMapQuery)) {
                merged.set(key, value);
            }

            const finalQuery = merged.toString();
            if (finalQuery === searchParams.toString()) return;
            router.replace(`${pathname}${finalQuery ? `?${finalQuery}` : ''}`, {
                scroll: false,
            });
        },
        [state, pathname, router, searchParams],
    );

    return [state, update] as const;
}
