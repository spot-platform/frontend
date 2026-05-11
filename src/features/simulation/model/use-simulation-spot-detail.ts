'use client';

// 2026-04-27 contextBuilder 디테일(GetSimulationSpotDetail) React Query 훅.
// /spots/:id (실제 BE) 와 도메인이 다르므로 useSpotDetail 과 분리.

import { useQuery } from '@tanstack/react-query';
import { fetchSimulationSpotDetail } from '@/features/simulation/api/sim-api';

export const simulationSpotKeys = {
    all: ['simulation', 'spot'] as const,
    detail: (spotId: string) =>
        [...simulationSpotKeys.all, 'detail', spotId] as const,
};

/**
 * 시뮬레이션 spot 의 상세 정보를 조회한다.
 * spotId 가 null 이면 hook 은 idle 상태 (enabled=false).
 * 응답이 null 이면 이 spot 에 대응하는 contextBuilder detail 이 없는 것 — 정상.
 */
export function useSimulationSpotDetail(spotId: string | null) {
    return useQuery({
        queryKey: simulationSpotKeys.detail(spotId ?? ''),
        queryFn: () => fetchSimulationSpotDetail(spotId as string),
        enabled: Boolean(spotId),
        staleTime: Infinity,
    });
}
