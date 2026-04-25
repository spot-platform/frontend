// Sim run 시간/위치 계산 유틸. 서버 응답(MovementChunk) 만 보고 매 프레임 좌표를 산출.
//
// 핵심 모델:
//   - 1 tick = tickDurationMs (재생 시간). 디폴트 1000ms.
//   - tFloat = (now - playbackStartMs) / tickDurationMs   ∈ [0, total_ticks)
//   - agent 위치:
//       활성 movement m 이 있으면 → from→to lerp(progress)
//       없으면(이동 후 dwell) → 마지막 도착 좌표
//       처음 movement 전이면 → home_region_id 좌표
//
// React 와 무관 — 순수 함수만 둔다. 훅은 use-sim-run.ts.

import type {
    AgentTimelineMap,
    GeoCoord,
    Movement,
    PlaceMap,
    SimAgent,
} from '@/entities/spot/sim-stream-types';

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/**
 * 출발 tick 오름차순 정렬된 timeline 에서, depart_tick ≤ tFloat 인 *마지막* movement 반환.
 * 그 movement 가 active(arrive_tick > tFloat) 인지 dwell(arrive_tick ≤ tFloat) 인지는 호출자 판단.
 *
 * 이진 탐색. timeline 길이 K 에 대해 O(log K).
 */
export function findRecentMovement(
    timeline: Movement[],
    tFloat: number,
): Movement | null {
    if (timeline.length === 0) return null;
    if (tFloat < timeline[0].depart_tick) return null;

    let lo = 0;
    let hi = timeline.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >>> 1;
        if (timeline[mid].depart_tick <= tFloat) lo = mid;
        else hi = mid - 1;
    }
    return timeline[lo];
}

/**
 * movement 와 시간으로부터 좌표 산출. easing 없이 선형 보간.
 * - tFloat ≤ depart: from 좌표
 * - depart < tFloat < arrive: lerp
 * - tFloat ≥ arrive: to 좌표 (다음 movement 가 올 때까지 머무름)
 */
export function positionAt(
    m: Movement,
    tFloat: number,
    placeMap: PlaceMap,
): GeoCoord | null {
    const from = placeMap.get(m.from_place_id);
    const to = placeMap.get(m.to_place_id);
    if (!from || !to) return null;

    if (tFloat <= m.depart_tick) {
        return { lat: from.lat, lng: from.lng };
    }
    if (tFloat >= m.arrive_tick) {
        return { lat: to.lat, lng: to.lng };
    }
    const span = m.arrive_tick - m.depart_tick;
    const p = span <= 0 ? 1 : (tFloat - m.depart_tick) / span;
    return {
        lat: lerp(from.lat, to.lat, p),
        lng: lerp(from.lng, to.lng, p),
    };
}

/**
 * agent 가 movement 가 시작되기 전이거나 timeline 자체가 비었을 때의 fallback 좌표.
 * home_region 의 좌표를 반환. 없으면 null.
 */
export function homePosition(
    agent: SimAgent,
    placeMap: PlaceMap,
): GeoCoord | null {
    const home = placeMap.get(agent.home_region_id);
    if (!home) return null;
    return { lat: home.lat, lng: home.lng };
}

/**
 * agent 한 명의 현재 좌표를 결정.
 * 로직:
 *   1) timeline 에서 depart ≤ tFloat 인 가장 최근 movement m 찾기
 *   2) m 없으면 home 좌표
 *   3) m 있으면 positionAt(m) — 이동 중이면 보간, 도착했으면 to 좌표
 */
export function resolveAgentPosition(
    agent: SimAgent,
    timelines: AgentTimelineMap,
    tFloat: number,
    placeMap: PlaceMap,
): GeoCoord | null {
    const tl = timelines.get(agent.agent_id);
    if (!tl || tl.length === 0) {
        return homePosition(agent, placeMap);
    }
    const m = findRecentMovement(tl, tFloat);
    if (!m) {
        return homePosition(agent, placeMap);
    }
    return positionAt(m, tFloat, placeMap);
}

/**
 * 청크들의 movement 배열을 agent_id 별로 그룹핑 + depart_tick ASC 정렬해
 * AgentTimelineMap 으로 빌드. 매 청크 추가 시 호출 가능(idempotent merge).
 */
export function buildAgentTimelines(
    movements: Movement[],
    existing?: AgentTimelineMap,
): AgentTimelineMap {
    const map: AgentTimelineMap = existing
        ? new Map(existing)
        : new Map();

    for (const m of movements) {
        const arr = map.get(m.agent_id);
        if (arr) {
            arr.push(m);
        } else {
            map.set(m.agent_id, [m]);
        }
    }
    // 각 agent 별로 정렬(중복 호출 시 덧붙은 것까지 재정렬).
    for (const arr of map.values()) {
        arr.sort((a, b) => a.depart_tick - b.depart_tick);
    }
    return map;
}

/** 결정적 jitter — agent_id seed 로 ±radiusM 흩뿌림. dwell 자연스러움용. */
export function jitterAround(
    coord: GeoCoord,
    seed: string,
    radiusM = 20,
): GeoCoord {
    const h = hashStringToUnit(seed);
    const angle = h * Math.PI * 2;
    const r = ((hashStringToUnit(seed + 'r') * 2) - 1) * radiusM;
    const dLat = (r * Math.sin(angle)) / 111_320;
    const dLng =
        (r * Math.cos(angle)) /
        (111_320 * Math.cos((coord.lat * Math.PI) / 180) || 1);
    return { lat: coord.lat + dLat, lng: coord.lng + dLng };
}

function hashStringToUnit(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 1_000_000) / 1_000_000;
}