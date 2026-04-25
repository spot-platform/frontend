# Sim Run 재생 (모드 A) — 핸드오프

스토리: spotContextBuilder의 시뮬레이터가 만든 "사람들이 spot을 만들고 모이고 활동하는" 로그를 프론트에서 *재생 가능한 시각화*로 보여주기 위한 데이터 계약 + mock 구현.

**상태**: 백엔드 ETL 미구현. **mock 으로 프론트 단독 동작 가능**. 백엔드 합류 시 `mock-sim-api.ts` 를 fetch 호출로 교체만 하면 됨.

---

## 1. 무엇을 받는가 (4종)

모든 타입은 [`src/entities/spot/sim-stream-types.ts`](src/entities/spot/sim-stream-types.ts) 에 정의.

### 1-1) `SimManifest` — 1회 로드

`agents`(protagonist + background), `places`(region + spot), `total_ticks`, `chunk_size_ticks` 등 정적 메타.

```ts
type SimManifest = {
  run_id: string;
  dataset_version: string;          // 어느 publish dataset 기준
  approved_spot_count: number;      // 시각화 대상 spot 수
  filter_kind: 'published_only';
  total_ticks: number;
  tick_duration_ms_default: number; // 클라이언트 디폴트 1 tick 길이(ms)
  chunk_size_ticks: number;
  agents: SimAgent[];
  places: PlaceGeometry[];
};
```

`SimAgent.agent_role`:
- `protagonist`: approved spot 에 host/joiner 로 직접 관여. **movement timeline 보유**.
- `background`: 같은 region 거주, 화면 채움용. **movement 없음**, home 좌표 주변에서 wander(클라이언트 합성).

### 1-2) `MovementChunk` — 청크 단위 prefetch

```ts
type Movement = {
  agent_id: string;
  depart_tick: number;        // 출발 tick
  arrive_tick: number;        // 도착 tick (depart < arrive 보장)
  from_place_id: string;
  to_place_id: string;
  reason: 'create_spot' | 'join_spot' | 'go_home' | 'wander';
  spot_id?: string;
};
```

청크 경계 정책: `depart_tick ∈ [from_tick, to_tick)` 인 것만 포함. `arrive_tick` 이 윈도우를 넘는 건 그대로 둔다(보간은 다음 청크 로드 전에도 정상 동작).

### 1-3) `LifecycleChunk` — 청크 단위 prefetch

`SPOT_CREATED / SPOT_MATCHED / SPOT_CONFIRMED / SPOT_STARTED / SPOT_COMPLETED / NO_SHOW` 6종. 토스트, spot 마커 색 변화, 하이라이트 카드 등에 사용.

### 1-4) (선택) SSE 실시간 스트림 — **현재 단계에선 없음**.

---

## 2. mock 디렉터리

```
src/features/simulation/
├─ mock/
│  ├─ run-fixtures/                   # commit 된 정적 JSON
│  │   ├─ demo_run_001.manifest.json
│  │   ├─ demo_run_001.movements.json
│  │   └─ demo_run_001.lifecycle.json
│  ├─ generate-fixtures.ts            # deterministic seed 생성기
│  └─ mock-sim-api.ts                 # fetchSimManifest / fetchSimMovements / fetchSimLifecycle
└─ model/
   ├─ sim-clock.ts                    # findRecentMovement / positionAt / resolveAgentPosition
   └─ use-sim-run.ts                  # 통합 훅 (manifest 로드 + rAF 재생 + prefetch)
```

### fixture 재생성

```bash
pnpm run gen:sim-fixtures
```

모든 랜덤은 fixed seed. 매번 동일 산출물(diff 안 생김). 분포는 **수원시 simulator 24-tick 첫 청크 실측**에 기반:
- JOIN→CHECK_IN tick 차이 분포 mode=8, 6~15 균등 (이동시간 평균 ≈ 9 tick)
- region 3종: `emd_sinchon` / `emd_jangan` / `emd_yeonmu`
- approved spot 60개, protagonist 약 300명, background 200명, total_ticks 48

조정은 [`generate-fixtures.ts`](src/features/simulation/mock/generate-fixtures.ts) 상단 상수 (`APPROVED_SPOT_COUNT`, `BACKGROUND_AGENT_COUNT`, `TOTAL_TICKS`, `TRAVEL_DIST`) 수정 후 재실행.

---

## 3. 사용법 — 5분 통합

```tsx
'use client';
import { useSimRun } from '@/features/simulation/model/use-sim-run';

export function SimReplayDemo() {
  const sim = useSimRun({ enabled: true });

  if (!sim.isReady) return <div>loading…</div>;
  if (sim.error) return <div>error: {sim.error.message}</div>;

  return (
    <div>
      <div>tick {sim.currentTick} / {sim.manifest!.total_ticks}</div>
      <button onClick={sim.isPlaying ? sim.pause : sim.play}>
        {sim.isPlaying ? '일시정지' : '재생'}
      </button>

      <MapMarkers
        agents={sim.manifest!.agents}
        positionsRef={sim.positionsRef}
        subscribe={sim.subscribe}
      />
    </div>
  );
}
```

### 마커 컴포넌트 패턴 (외부 store 구독)

```tsx
// 매 프레임 setState 폭증 방지: useSyncExternalStore 또는 ref 직접 읽기.
function MapMarkers({ agents, positionsRef, subscribe }) {
  const positions = useSyncExternalStore(
    subscribe,
    () => positionsRef.current,
    () => positionsRef.current,
  );
  return agents.map(a => (
    <Marker key={a.agent_id} coord={positions.get(a.agent_id)} ... />
  ));
}
```

`positionsRef` / `subscribe` 시그니처는 기존 [`useMockPersonaSwarm`](src/features/simulation/model/use-mock-persona-swarm.ts) 와 **완전히 동일**. 기존 마커 컴포넌트 재사용 가능.

---

## 4. 시간 모델 / 보간

```
1 tick = tickDurationMs (default 1000ms)
emit throttle = 200ms (기존 mock 과 동일)
tFloat = (now - playbackStartMs) / tickDurationMs
```

agent 위치 결정 (`sim-clock.ts`):
1. timeline 에서 `depart ≤ tFloat` 인 가장 최근 movement m 찾기 (이진 탐색)
2. `tFloat ≤ depart`: from 좌표
3. `depart < tFloat < arrive`: from→to lerp
4. `tFloat ≥ arrive`: to 좌표 (다음 movement 까지 머무름)
5. m 없거나 timeline 없음: `home_region_id` 좌표

dwell 자연스러움을 위해 도착 후엔 agent_id seed 의 결정적 `±20m` jitter 적용 (옵션 끄기 가능: `dwellJitterM: 0`).

---

## 5. background agent — 화면 채움 가이드

`agent_role === 'background'` 는 **server movement 가 없음**. 시각화 측에서 home 주변 wander 만 자체 합성:

```ts
// useSimRun 훅 내부 emitFrame 에서 background 는 skip.
// 마커 레이어가 자체 wander 로직 수행 (기존 useMockPersonaSwarm 의 wander 알고리즘 재사용).
// home_region_id 좌표를 center 로, ±wanderRadius 내 trip↔dwell 사이클.
```

옵션 패턴:
- `useMockPersonaSwarm` 의 wander 코어를 함수로 떼어내 background agents 에 적용
- 또는 background 는 그냥 home 좌표에 정적 마커 (jitter 만)

---

## 6. 컨트롤 / 상호작용

```ts
const sim = useSimRun({
  runId: DEMO_RUN_ID,         // mock 모드에선 default 로 충분
  enabled: true,
  tickDurationMs: 1000,       // 빠르게 보려면 500
  emitThrottleMs: 200,
  dwellJitterM: 20,
  prefetchAheadTicks: 6,
});

sim.play();     sim.pause();
sim.seek(24);   // tick 24 로 점프
```

`sim.currentLifecycleEvents` 는 `currentTick` 에 발화한 이벤트. 토스트나 하이라이트 카드 발화 트리거로 사용.

---

## 7. 백엔드 합류 시 마이그레이션

`mock-sim-api.ts` 의 세 함수만 fetch 로 교체:

```ts
// before (mock)
import manifestJson from './run-fixtures/demo_run_001.manifest.json';
export async function fetchSimManifest(runId) {
  return manifestJson as SimManifest;
}

// after (real)
export async function fetchSimManifest(runId: string): Promise<SimManifest> {
  const res = await fetch(`/api/sim/runs/${runId}/manifest`);
  if (!res.ok) throw new Error(`manifest ${res.status}`);
  return res.json();
}
```

엔드포인트 계약(백엔드 측 작업 항목):
- `GET /api/sim/runs/{run_id}/manifest` → `SimManifest`
- `GET /api/sim/runs/{run_id}/movements?from_tick=&to_tick=` → `MovementChunk`
- `GET /api/sim/runs/{run_id}/lifecycle?from_tick=&to_tick=` → `LifecycleChunk`

응답 캐시 권장: `Cache-Control: public, max-age=31536000, immutable` + ETag (run_id 가 변경 불가능하다는 가정).

`runId` 화이트리스트 검증은 mock 의 `assertKnownRun` 자리에서 제거.

---

## 8. 의도적으로 *안* 한 것 (스코프 밖)

- **모드 B (지역 특성)**: `local-context-builder` 의 region polygon + 카테고리별 밀집도. 줌아웃 시 다른 모드. 별도 핸드오프 문서 예정.
- **카카오 POI 마커 오버레이**: POI 카탈로그는 *행위 데이터*가 아니므로 시각화 배경에 직접 박지 않음.
- **multi-run UI**: 현재 mock 은 `demo_run_001` 단일 run 만. 백엔드 합류 후 run 목록 API 추가 시 확장.
- **SSE 라이브 스트림**: 현재 단계에선 정적 청크 GET 만. 라이브 진행 중 run 시각화가 필요해지면 그때 추가.

---

## 9. 결정 / 합의 필요 항목

작업하면서 다음 중 어느 쪽을 선호하는지 알려주세요. 디폴트는 그대로 둬도 됨:

1. **background wander 방식**: home 정적 + jitter (단순) vs `useMockPersonaSwarm` wander 코어 재사용 (역동적)
2. **재생 속도 디폴트**: 1 tick = 1000ms (편안) vs 500ms (빠름)
3. **NO_SHOW 시각 표현**: lifecycle 토스트만 (현재) vs spot 근처 어딘가에서 *돌아가는* movement 합성

---

## 10. 파일 인덱스

- 타입: [`src/entities/spot/sim-stream-types.ts`](src/entities/spot/sim-stream-types.ts)
- 유틸: [`src/features/simulation/model/sim-clock.ts`](src/features/simulation/model/sim-clock.ts)
- 훅: [`src/features/simulation/model/use-sim-run.ts`](src/features/simulation/model/use-sim-run.ts)
- mock API: [`src/features/simulation/mock/mock-sim-api.ts`](src/features/simulation/mock/mock-sim-api.ts)
- 생성기: [`src/features/simulation/mock/generate-fixtures.ts`](src/features/simulation/mock/generate-fixtures.ts)
- fixture: [`src/features/simulation/mock/run-fixtures/`](src/features/simulation/mock/run-fixtures/)
- 재생성: `pnpm run gen:sim-fixtures`
