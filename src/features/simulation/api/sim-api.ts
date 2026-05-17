import { buildQueryString, clientApiFetch } from '@/lib/client-api';
import type {
    LifecycleChunk,
    MovementChunk,
    SimManifest,
} from '@/entities/spot/sim-stream-types';
import type { SimulationSpotDetail } from '@/entities/spot/simulation-types';

export const DEMO_RUN_ID = 'demo_run_001';

export function fetchSimManifest(runId: string): Promise<SimManifest> {
    return clientApiFetch<SimManifest>(`/sim/runs/${runId}/manifest`);
}

export function fetchSimMovements(
    runId: string,
    fromTick: number,
    toTick: number,
): Promise<MovementChunk> {
    return clientApiFetch<MovementChunk>(
        `/sim/runs/${runId}/movements${buildQueryString({
            fromTick,
            toTick,
        })}`,
    );
}

export function fetchSimLifecycle(
    runId: string,
    fromTick: number,
    toTick: number,
): Promise<LifecycleChunk> {
    return clientApiFetch<LifecycleChunk>(
        `/sim/runs/${runId}/lifecycle${buildQueryString({
            fromTick,
            toTick,
        })}`,
    );
}

// Swagger에는 simulation spot contextBuilder detail 전용 endpoint가 아직 없다.
// 직접 mock import는 제거하되, endpoint가 생기기 전까지 정상 빈 응답으로 처리한다.
export async function fetchSimulationSpotDetail(
    spotId: string,
): Promise<SimulationSpotDetail | null> {
    void spotId;
    return null;
}
