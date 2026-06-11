// useSimRun 의 출력(SimManifest + lifecycle 청크 + tick 시간축)을 기존 맵 도메인
// (Persona[] / SpotLifecycle[] / ActivityCluster[]) 으로 변환하는 어댑터.
//
// 설계 의도: 기존 MapClient 의 렌더 파이프라인(필터, 클러스터 카드, ticker, SpotInfoCard) 은
// 그대로 두고 데이터 소스만 sim 으로 바꾸기 위함. tick→ms 변환은 useSimRun 이 노출하는
// playbackStartMsRef + tickDurationMsRef 를 사용해 SpotInfoCard 의 ms 기반 비교를 만족.
//
// 입력은 useSimRun 이 tick 진행에 맞춰 로드한 버퍼로 가정 — 별도 API 호출 없이
// 현재까지 도착한 movement/lifecycle 청크만 기존 도메인 모델로 변환한다.

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { Persona } from '@/entities/persona/types';
import type { SpotCategory } from '@/entities/spot/categories';
import type { GeoCoord } from '@/entities/spot/types';
import type {
    LifecycleEvent,
    Movement,
    SimHotspotSignal,
    SimManifest,
} from '@/entities/spot/sim-stream-types';
import type { ActivityCluster, PersonaRef } from '@/features/map/model/types';
import type {
    SpotLifecycle,
    SpotParticipantEntry,
} from '@/features/simulation/model/use-mock-spot-lifecycles';

// ─── SimAgent → Persona ────────────────────────────────────────────────────
// background agent 는 movement 가 없어 시각적으로 home 좌표에 정적으로 박힌다.
// 화면이 한 점에 뭉치는 것 + 휴면 dot 의미 없음 → Persona 변환에서 제외한다.
// (region 통계 같은 비시각 용도가 필요해지면 별도 export 함수에서 다룬다.)

function renderId(cycle: number, id: string): string {
    return `${cycle}:${id}`;
}

function loopPeriodTicks(manifest: SimManifest): number {
    return Math.max(1, manifest.loop_period_ticks ?? manifest.total_ticks);
}

export function simAgentsToPersonas(
    manifest: SimManifest,
    cycles: number[] = [0],
): Persona[] {
    const placeMap = new Map(
        manifest.places.map((p) => [p.place_id, p] as const),
    );
    return cycles.flatMap((cycle) =>
        manifest.agents
            .filter((a) => a.agent_role === 'protagonist')
            .map((a) => {
                const home = placeMap.get(a.home_region_id);
                const initialCoord: GeoCoord = home
                    ? { lat: home.lat, lng: home.lng }
                    : { lat: 0, lng: 0 };
                return {
                    id: renderId(cycle, a.agent_id),
                    emoji: a.emoji,
                    name: a.name,
                    archetype: a.archetype,
                    initialCoord,
                    category: a.category,
                    intent: a.intent,
                };
            }),
    );
}

// ─── lifecycle 이벤트 + movement 청크 → SpotLifecycle[] ────────────────────

type SpotLifecycleSeed = {
    spotId: string;
    location: GeoCoord;
    category: SpotCategory;
    intent: 'offer' | 'request';
    title: string;
    /** tick 단위 시간축. 어댑터가 ms 로 변환해 SpotLifecycle 채움. */
    createdTick: number;
    matchedTick: number | null;
    closedTick: number;
    /** simulator-origin hotspot 신호. AI feed copy 가 아니라 지도 형성/모집 상태 메타데이터다. */
    hotspotSignal?: SimHotspotSignal;
    /** participants(host + joiner). joinedAtMs 는 movement.depart_tick 기준. leftAtMs 는 NO_SHOW/leave 시점. */
    participants: Array<{
        personaId: string;
        joinedTick: number;
        leftTick: number | null;
    }>;
};

/**
 * manifest + 전체 lifecycle/movement 배열로부터 spot 단위 seed 를 빌드.
 * NO_SHOW 는 해당 agent 의 참여를 시작 직전에 끝낸 것으로 처리(leftTick = startedTick - 0.01).
 */
export function buildSpotLifecycleSeeds(
    manifest: SimManifest,
    lifecycle: LifecycleEvent[],
    movements: Movement[],
): SpotLifecycleSeed[] {
    const placeMap = new Map(
        manifest.places.map((p) => [p.place_id, p] as const),
    );

    type Tracker = {
        seed: SpotLifecycleSeed;
        startedTick: number | null;
    };
    const map = new Map<string, Tracker>();

    const ensure = (spotId: string): Tracker | null => {
        const existing = map.get(spotId);
        if (existing) return existing;
        const place = placeMap.get(spotId);
        if (!place || place.place_type !== 'spot') return null;
        const anchor = place.map_anchor;
        const tracker: Tracker = {
            seed: {
                spotId,
                location: anchor
                    ? { lat: anchor.lat, lng: anchor.lng }
                    : { lat: place.lat, lng: place.lng },
                category: place.category ?? '운동',
                intent: place.intent ?? 'offer',
                title: place.title ?? spotId,
                createdTick: 0,
                matchedTick: null,
                closedTick: manifest.total_ticks,
                participants: [],
            },
            startedTick: null,
        };
        map.set(spotId, tracker);
        return tracker;
    };

    for (const ev of lifecycle) {
        const t = ensure(ev.spot_id);
        if (!t) continue;
        switch (ev.event_type) {
            case 'SPOT_CREATED':
                t.seed.createdTick = ev.tick;
                if (
                    ev.scheduled_tick !== undefined &&
                    ev.scheduled_tick !== null
                ) {
                    t.seed.matchedTick = ev.scheduled_tick;
                }
                if (
                    ev.expected_closed_at_tick !== undefined &&
                    ev.expected_closed_at_tick !== null
                ) {
                    t.seed.closedTick = ev.expected_closed_at_tick;
                }
                if (ev.map_anchor) {
                    t.seed.location = {
                        lat: ev.map_anchor.lat,
                        lng: ev.map_anchor.lng,
                    };
                }
                if (ev.hotspot_signal) {
                    t.seed.hotspotSignal = ev.hotspot_signal;
                }
                break;
            case 'SPOT_MATCHED':
                t.seed.matchedTick = ev.tick;
                break;
            case 'SPOT_STARTED':
                t.startedTick = ev.tick;
                break;
            case 'SPOT_COMPLETED':
                t.seed.closedTick = ev.expected_closed_at_tick ?? ev.tick;
                break;
            // SPOT_CONFIRMED 는 seed 에 별도 필드 없음(matched 와 close 사이의 진행 단계).
            // NO_SHOW 는 movement 단계 후 처리.
            default:
                break;
        }
    }

    // movement 로 participants 채움.
    for (const m of movements) {
        if (m.reason !== 'create_spot' && m.reason !== 'join_spot') continue;
        if (!m.spot_id) continue;
        const t = ensure(m.spot_id);
        if (!t) continue;
        // host 는 participants[0] 위치를 만족시키기 위해 create_spot 을 앞에 둔다.
        const entry = {
            personaId: m.agent_id,
            joinedTick: m.depart_tick,
            leftTick: null as number | null,
        };
        if (m.reason === 'create_spot') {
            t.seed.participants.unshift(entry);
        } else {
            t.seed.participants.push(entry);
        }
    }

    // NO_SHOW: agent 가 시작 직전에 이탈한 것으로 표현.
    // PERSONA_LEAVE_SPOT: 완료 후 linger/travel 시작 tick 에 cluster 참여에서 빠진다.
    for (const ev of lifecycle) {
        if (
            ev.event_type !== 'NO_SHOW' &&
            ev.event_type !== 'PERSONA_LEAVE_SPOT'
        ) {
            continue;
        }
        if (!ev.agent_id) continue;
        const t = map.get(ev.spot_id);
        if (!t) continue;
        const cutoff =
            ev.event_type === 'NO_SHOW'
                ? (t.startedTick ?? ev.tick) - 0.01
                : ev.tick;
        for (const p of t.seed.participants) {
            if (p.personaId === ev.agent_id && p.leftTick === null) {
                p.leftTick = cutoff;
            }
        }
    }

    // host 가 movement 에 누락된 경우(이론상 없음)에도 참여자 0 인 spot 은 노출 가치 없으므로 skip.
    return [...map.values()]
        .map((t) => t.seed)
        .filter((s) => s.participants.length > 0);
}

function shiftSeedForCycle(
    seed: SpotLifecycleSeed,
    cycle: number,
    loopPeriod: number,
    cycleOffsetTicks = 0,
): SpotLifecycleSeed {
    const offset = cycle * loopPeriod + cycleOffsetTicks;
    return {
        ...seed,
        spotId: renderId(cycle, seed.spotId),
        createdTick: seed.createdTick + offset,
        matchedTick:
            seed.matchedTick === null ? null : seed.matchedTick + offset,
        closedTick: seed.closedTick + offset,
        hotspotSignal: seed.hotspotSignal,
        participants: seed.participants.map((p) => ({
            personaId: renderId(cycle, p.personaId),
            joinedTick: p.joinedTick + offset,
            leftTick: p.leftTick === null ? null : p.leftTick + offset,
        })),
    };
}

function previewOverlapTicks(manifest: SimManifest): number {
    const declaredTail = manifest.projection_tail_ticks ?? 0;
    if (declaredTail <= 0) return 0;
    return Math.min(MAX_PREVIEW_OVERLAP_TICKS, declaredTail);
}

function shouldPreviewNextCycle(
    manifest: SimManifest,
    currentTick: number,
): boolean {
    const previewTicks = previewOverlapTicks(manifest);
    if (previewTicks <= 0) return false;
    return currentTick >= loopPeriodTicks(manifest) - previewTicks;
}

function renderCyclesForTick(
    manifest: SimManifest,
    currentCycle: number,
    currentTick: number,
): number[] {
    const cycles = [Math.max(0, currentCycle - 1), currentCycle];
    if (shouldPreviewNextCycle(manifest, currentTick)) {
        cycles.push(currentCycle + 1);
    }
    return [...new Set(cycles)];
}

function loopedSpotLifecycleSeeds(
    manifest: SimManifest,
    baseSeeds: SpotLifecycleSeed[],
    currentCycle: number,
    currentTick: number,
): SpotLifecycleSeed[] {
    const loopPeriod = loopPeriodTicks(manifest);
    const cycles = renderCyclesForTick(manifest, currentCycle, currentTick);
    const previewTicks = previewOverlapTicks(manifest);
    const previewNext = shouldPreviewNextCycle(manifest, currentTick);
    const loopSeeds = baseSeeds.filter((seed) => seed.createdTick < loopPeriod);
    return cycles.flatMap((cycle) => {
        const offset =
            previewNext && cycle === currentCycle + 1 ? -previewTicks : 0;
        return loopSeeds.map((seed) =>
            shiftSeedForCycle(seed, cycle, loopPeriod, offset),
        );
    });
}

// ─── seed (tick 단위) → SpotLifecycle (ms 단위) ────────────────────────────

export function seedToSpotLifecycle(
    seed: SpotLifecycleSeed,
    playbackStartMs: number,
    tickDurationMs: number,
): SpotLifecycle {
    const tickToMs = (tick: number): number =>
        playbackStartMs + tick * tickDurationMs;

    const participants: SpotParticipantEntry[] = seed.participants.map((p) => ({
        personaId: p.personaId,
        joinedAtMs: tickToMs(p.joinedTick),
        leftAtMs: p.leftTick === null ? null : tickToMs(p.leftTick),
    }));

    return {
        spotId: seed.spotId,
        location: seed.location,
        category: seed.category,
        intent: seed.intent,
        title: seed.title,
        createdAtMs: tickToMs(seed.createdTick),
        matchedAtMs:
            seed.matchedTick === null ? null : tickToMs(seed.matchedTick),
        closedAtMs: tickToMs(seed.closedTick),
        participants,
    };
}

// ─── 어댑터 훅: useSimRun 결과 → 기존 도메인 객체 ───────────────────────────

export type SimDomainResult = {
    personas: Persona[];
    /** 현재 시각(=performance.now) 기준 활성/사망 spot 모두 포함. 빌더가 tick→ms 변환. */
    lifecycles: SpotLifecycle[];
    clusters: ActivityCluster[];
    /** 물리적으로 spot 좌표에 도착한 참여자 ids. dot → cluster 흡수 판정용. */
    arrivedParticipantIds: Set<string>;
};

const ARRIVAL_THRESHOLD_DEG = 0.0005; // ~55m
const BIRTH_PULSE_TICKS = 1.2;
const DEATH_GRACE_TICKS = 0.8;
const MAX_PREVIEW_OVERLAP_TICKS = 24;

type UseSimDomainOptions = {
    manifest: SimManifest | null;
    isReady: boolean;
    currentTick: number;
    currentCycle: number;
    /** rAF emit 마다 호출되는 subscribe — 좌표 ref 갱신 통지. */
    subscribe: (cb: () => void) => () => void;
    positionsRef: React.RefObject<Map<string, GeoCoord>>;
    playbackStartMsRef: React.RefObject<number>;
    tickDurationMsRef: React.RefObject<number>;
    bufferedMovementsRef: React.RefObject<Movement[]>;
    bufferedLifecycleEventsRef: React.RefObject<LifecycleEvent[]>;
    bufferedChunkVersion: number;
    /** domain snapshot 재계산 최소 간격. 좌표 이동은 ref로 유지하고 React state 갱신만 줄인다. */
    snapshotThrottleMs?: number;
};

/**
 * useSimRun 결과를 받아 (1) Persona[] (2) SpotLifecycle[] (3) ActivityCluster[] 를 노출.
 * 좌표 도착 판정 + cluster 빌드는 매 sim emit 마다 갱신(subscribe 경유).
 *
 * 내부 구현:
 *   - useSimRun 이 로드한 movement/lifecycle 버퍼로 seed 를 점진 빌드한다.
 *   - currentTick 또는 버퍼 버전이 바뀔 때 SpotLifecycle 객체 + cluster 를 다시 만들어 state 로 노출.
 */
export function useSimDomain(options: UseSimDomainOptions): SimDomainResult {
    const {
        manifest,
        isReady,
        currentTick,
        currentCycle,
        subscribe,
        positionsRef,
        playbackStartMsRef,
        tickDurationMsRef,
        bufferedMovementsRef,
        bufferedLifecycleEventsRef,
        bufferedChunkVersion,
        snapshotThrottleMs = 800,
    } = options;

    const renderCycles = useMemo(
        () =>
            manifest
                ? renderCyclesForTick(manifest, currentCycle, currentTick)
                : [],
        [manifest, currentCycle, currentTick],
    );

    const personas = useMemo(
        () => (manifest ? simAgentsToPersonas(manifest, renderCycles) : []),
        [manifest, renderCycles],
    );

    // useSimRun 버퍼에 도착한 청크만 기존 도메인 seed 로 변환한다.
    // 여기서 API를 직접 호출하지 않아야 재생 pacing 과 무관한 eager full-run drain 이 생기지 않는다.
    const seeds = useMemo(() => {
        if (!manifest || !isReady) return [];
        const baseSeeds = buildSpotLifecycleSeeds(
            manifest,
            bufferedLifecycleEventsRef.current,
            bufferedMovementsRef.current,
        );
        return loopedSpotLifecycleSeeds(
            manifest,
            baseSeeds,
            currentCycle,
            currentTick,
        );
        // refs 자체는 안정적이므로 새 청크 도착 신호인 bufferedChunkVersion 으로 재계산한다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [manifest, isReady, bufferedChunkVersion, currentCycle, currentTick]);

    // currentTick + positionsRef 기반 cluster/lifecycle 빌드.
    // 매 emit 마다 호출되도록 subscribe 후크에서 트리거.
    const [snapshot, setSnapshot] = useState<{
        lifecycles: SpotLifecycle[];
        clusters: ActivityCluster[];
        arrivedParticipantIds: Set<string>;
    }>({ lifecycles: [], clusters: [], arrivedParticipantIds: new Set() });
    const lastSnapshotComputeMsRef = useRef(0);
    const lastSnapshotSignatureRef = useRef('');

    const personaLookupRef = useRef<Map<string, Persona>>(new Map());
    useEffect(() => {
        personaLookupRef.current = new Map(personas.map((p) => [p.id, p]));
    }, [personas]);

    useEffect(() => {
        if (!manifest || seeds.length === 0) return;
        const compute = (force = false) => {
            const startedAt = performance.now();
            if (
                !force &&
                startedAt - lastSnapshotComputeMsRef.current <
                    snapshotThrottleMs
            ) {
                return;
            }
            lastSnapshotComputeMsRef.current = startedAt;
            const tickDurationMs = tickDurationMsRef.current ?? 1000;
            const playbackStartMs = playbackStartMsRef.current ?? 0;
            const now =
                playbackStartMs > 0 ? startedAt : currentTick * tickDurationMs;
            // performance.now 기준이 아닌 상대 ms 인 경우(=재생 시작 전), playbackStartMs 를
            // 0 으로 두고 lifecycle 의 ms 좌표도 상대 ms 로 박혀 있다고 가정.
            const effectivePlaybackStart =
                playbackStartMs > 0 ? playbackStartMs : 0;

            const lifecycles: SpotLifecycle[] = seeds.map((s) =>
                seedToSpotLifecycle(s, effectivePlaybackStart, tickDurationMs),
            );

            const arrivedParticipantIds = new Set<string>();
            const clusters: ActivityCluster[] = [];
            const positions = positionsRef.current;
            const seedById = new Map(seeds.map((seed) => [seed.spotId, seed]));

            for (const lc of lifecycles) {
                if (now < lc.createdAtMs) continue;
                const isDying = now >= lc.closedAtMs;
                const ageMs = now - lc.createdAtMs;
                const lifespan = lc.closedAtMs - lc.createdAtMs;
                const isPulse =
                    !isDying && ageMs < BIRTH_PULSE_TICKS * tickDurationMs;
                if (
                    isDying &&
                    now > lc.closedAtMs + DEATH_GRACE_TICKS * tickDurationMs
                ) {
                    continue;
                }

                const currentPids: string[] = [];
                for (const p of lc.participants) {
                    if (p.joinedAtMs > now) continue;
                    if (p.leftAtMs !== null && p.leftAtMs <= now) continue;
                    if (now >= lc.closedAtMs) continue;
                    currentPids.push(p.personaId);
                    const coord = positions.get(p.personaId);
                    if (coord) {
                        const dLat = Math.abs(coord.lat - lc.location.lat);
                        const dLng = Math.abs(coord.lng - lc.location.lng);
                        if (
                            dLat < ARRIVAL_THRESHOLD_DEG &&
                            dLng < ARRIVAL_THRESHOLD_DEG
                        ) {
                            arrivedParticipantIds.add(p.personaId);
                        }
                    }
                }

                const idsToRender = isDying
                    ? lc.participants.map((p) => p.personaId)
                    : currentPids;
                if (!isDying && idsToRender.length < 2) continue;

                const personaRefs: PersonaRef[] = idsToRender.map((id) => {
                    const persona = personaLookupRef.current.get(id);
                    return {
                        id,
                        emoji: persona?.emoji ?? '❔',
                        name: persona?.name ?? '익명',
                    };
                });

                clusters.push({
                    id: lc.spotId,
                    centerCoord: lc.location,
                    category: lc.category,
                    intent: lc.intent,
                    personas: personaRefs,
                    isPulse,
                    isDying,
                    arrivedCount: idsToRender.filter((id) =>
                        arrivedParticipantIds.has(id),
                    ).length,
                    variant: 'discovery',
                    variantLabel: lc.intent === 'offer' ? '형성 중' : '모집 중',
                    hotspotSignal: seedById.get(lc.spotId)?.hotspotSignal,
                });
                // ageMs 만 쓰면 lifespan 미사용 경고 — explicit void.
                void lifespan;
            }

            const signature = `${lifecycles.length}:${clusters
                .map(
                    (cluster) =>
                        `${cluster.id}:${cluster.centerCoord.lat.toFixed(6)},${cluster.centerCoord.lng.toFixed(6)}:${cluster.personas.length}:${cluster.arrivedCount ?? 0}:${cluster.isDying ? 1 : 0}:${JSON.stringify(cluster.hotspotSignal ?? null)}`,
                )
                .join('|')}:${arrivedParticipantIds.size}`;
            if (signature === lastSnapshotSignatureRef.current) return;
            lastSnapshotSignatureRef.current = signature;
            setSnapshot({ lifecycles, clusters, arrivedParticipantIds });
        };

        // 초기 mount/seed 변경은 즉시 반영하고, 이후 rAF emit 은 throttle 로 state 갱신 빈도만 줄인다.
        compute(true);
        const unsub = subscribe(() => compute(false));
        return () => unsub();
    }, [
        manifest,
        seeds,
        subscribe,
        positionsRef,
        playbackStartMsRef,
        tickDurationMsRef,
        currentTick,
        currentCycle,
        snapshotThrottleMs,
    ]);

    return {
        personas,
        ...snapshot,
    };
}
