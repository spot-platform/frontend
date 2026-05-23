'use client';

import { useQuery } from '@tanstack/react-query';
import { spotsApi } from '../api/spot-api';
import type { Spot } from '@/entities/spot/types';

export function useSpotSearch(query: string) {
    const trimmed = query.trim();

    return useQuery({
        queryKey: ['spots', 'search', trimmed],
        queryFn: async (): Promise<Spot[]> => {
            if (!trimmed) return [];

            const response = await spotsApi.search({
                q: trimmed,
                scope: 'ALL',
                page: 0,
                size: 20,
            });

            return response.data;
        },
        enabled: trimmed.length > 0,
        staleTime: 1000 * 30,
    });
}
