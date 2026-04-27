// Sim run API 의 mock 구현. fetch 시그니처를 흉내내 나중에 real backend 로 교체 시
// 호출부 변경이 필요 없게 둔다.
//
// 데이터 출처: ./run-fixtures/*.json (generate-fixtures.ts 가 생성).
// 청크 분할은 import 한 풀 데이터에서 from_tick / to_tick 으로 슬라이싱.
//
// 청크 경계 정책:
//   - depart_tick 이 [from_tick, to_tick) 인 movement 만 포함.
//   - arrive_tick 이 to_tick 을 넘는 케이스는 그대로 둔다(소비자가 보간 시 뒤쪽 청크가
//     로드되기 전이라도 arrive 좌표까지 정상 계산됨).

import manifestJson from './run-fixtures/demo_run_001.manifest.json';
import movementsJson from './run-fixtures/demo_run_001.movements.json';
import lifecycleJson from './run-fixtures/demo_run_001.lifecycle.json';

import type {
    LifecycleChunk,
    LifecycleEvent,
    Movement,
    MovementChunk,
    SimManifest,
} from '@/entities/spot/sim-stream-types';

const SIMULATED_LATENCY_MS = 80;
const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

/** 모든 fixture 가 동일 run 을 가리킨다고 가정. 차후 multi-run 시 path 분기 추가. */
const KNOWN_RUN_ID = (manifestJson as SimManifest).run_id;

function assertKnownRun(runId: string): void {
    if (runId !== KNOWN_RUN_ID) {
        throw new Error(
            `mock-sim-api: unknown run_id="${runId}", only "${KNOWN_RUN_ID}" available`,
        );
    }
}

export async function fetchSimManifest(runId: string): Promise<SimManifest> {
    await sleep(SIMULATED_LATENCY_MS);
    assertKnownRun(runId);
    return manifestJson as SimManifest;
}

export async function fetchSimMovements(
    runId: string,
    fromTick: number,
    toTick: number,
): Promise<MovementChunk> {
    await sleep(SIMULATED_LATENCY_MS);
    assertKnownRun(runId);
    const all = movementsJson as Movement[];
    const slice = all.filter(
        (m) => m.depart_tick >= fromTick && m.depart_tick < toTick,
    );
    return {
        run_id: runId,
        from_tick: fromTick,
        to_tick: toTick,
        movements: slice,
    };
}

export async function fetchSimLifecycle(
    runId: string,
    fromTick: number,
    toTick: number,
): Promise<LifecycleChunk> {
    await sleep(SIMULATED_LATENCY_MS);
    assertKnownRun(runId);
    const all = lifecycleJson as LifecycleEvent[];
    const slice = all.filter((e) => e.tick >= fromTick && e.tick < toTick);
    return {
        run_id: runId,
        from_tick: fromTick,
        to_tick: toTick,
        events: slice,
    };
}

/** 데모 run 의 id. UI 가 직접 import 해서 useSimRun 에 넘긴다. */
export const DEMO_RUN_ID = KNOWN_RUN_ID;
