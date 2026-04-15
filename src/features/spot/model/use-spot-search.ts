'use client';

import { useQuery } from '@tanstack/react-query';
import { listMockSpots } from './mock';
import type { Spot } from '@/entities/spot/types';

function filterMock(spots: Spot[], query: string): Spot[] {
    const q = query.toLowerCase();
    return spots.filter(
        (s) =>
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.authorNickname.toLowerCase().includes(q),
    );
}

export function useSpotSearch(query: string) {
    const trimmed = query.trim();

    return useQuery({
        queryKey: ['spots', 'search', trimmed],
        queryFn: async (): Promise<Spot[]> => {
            if (!trimmed) return [];

            await new Promise((resolve) => setTimeout(resolve, 150));
            return filterMock(listMockSpots().data, trimmed);
        },
        enabled: trimmed.length > 0,
        staleTime: 1000 * 30,
    });
}
