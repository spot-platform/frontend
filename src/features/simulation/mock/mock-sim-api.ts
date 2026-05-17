// Backward-compatible exports for callers that still import the old mock module.
// 실제 데이터는 BE Simulation API(GET /api/sim/runs/{runId}/...)에서 조회한다.
export {
    DEMO_RUN_ID,
    fetchSimManifest,
    fetchSimMovements,
    fetchSimLifecycle,
    fetchSimulationSpotDetail,
} from '../api/sim-api';
