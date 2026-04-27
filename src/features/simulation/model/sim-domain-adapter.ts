// useSimRun 의 출력(SimManifest + lifecycle 청크 + tick 시간축)을 기존 맵 도메인
// (Persona[] / SpotLifecycle[] / ActivityCluster[]) 으로 변환하는 어댑터.
//
// 설계 의도: 기존 MapClient 의 렌더 파이프라인(필터, 클러스터 카드, ticker, SpotInfoCard) 은
// 그대로 두고 데이터 소스만 sim 으로 바꾸기 위함. tick→ms 변환은 useSimRun 이 노출하는
// playbackStartMsRef + tickDurationMsRef 를 사용해 SpotInfoCard 의 ms 기반 비교를 만족.
//
// 입력은 모두 안정적으로 fetch 된 fixture(=immutable) 라 가정 — 매 emit 마다 lifecycle 객체를
// 새로 만들지 않고, manifest+events 로부터 한 번 빌드한 뒤 useDomain 훅에서 currentTick 에 따라
// participants 의 도착 여부만 다시 계산한다.

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { Persona } from '@/entities/persona/types';
import type { SpotCategory } from '@/entities/spot/categories';
import type { GeoCoord } from '@/entities/spot/types';
import type {
    LifecycleEvent,
    Movement,
    SimManifest,
} from '@/entities/spot/sim-stream-types';
import type { ActivityCluster, PersonaRef } from '@/features/map/model/types';
import type {
    SpotLifecycle,
    SpotParticipantEntry,
} from '@/features/simulation/model/use-mock-spot-lifecycles';

import { fetchSimMovements } from '@/features/simulation/mock/mock-sim-api';

// ─── SimAgent → Persona ────────────────────────────────────────────────────
// background agent 는 movement 가 없어 시각적으로 home 좌표에 정적으로 박힌다.
// 화면이 한 점에 뭉치는 것 + 휴면 dot 의미 없음 → Persona 변환에서 제외한다.
// (region 통계 같은 비시각 용도가 필요해지면 별도 export 함수에서 다룬다.)

export function simAgentsToPersonas(manifest: SimManifest): Persona[] {
    const placeMap = new Map(
        manifest.places.map((p) => [p.place_id, p] as const),
    );
    return manifest.agents
        .filter((a) => a.agent_role === 'protagonist')
        .map((a) => {
            const home = placeMap.get(a.home_region_id);
            const initialCoord: GeoCoord = home
                ? { lat: home.lat, lng: home.lng }
                : { lat: 0, lng: 0 };
            return {
                id: a.agent_id,
                emoji: a.emoji,
                name: a.name,
                archetype: a.archetype,
                initialCoord,
                category: a.category,
                intent: a.intent,
            };
        });
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
    /** participants(host + joiner). joinedAtMs 는 movement.depart_tick 기준. leftAtMs 는 NO_SHOW 시 closed 직전. */
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
        const tracker: Tracker = {
            seed: {
                spotId,
                location: { lat: place.lat, lng: place.lng },
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
                break;
            case 'SPOT_MATCHED':
                t.seed.matchedTick = ev.tick;
                break;
            case 'SPOT_STARTED':
                t.startedTick = ev.tick;
                break;
            case 'SPOT_COMPLETED':
                t.seed.closedTick = ev.tick;
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
    for (const ev of lifecycle) {
        if (ev.event_type !== 'NO_SHOW' || !ev.agent_id) continue;
        const t = map.get(ev.spot_id);
        if (!t) continue;
        const cutoff = (t.startedTick ?? ev.tick) - 0.01;
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

type UseSimDomainOptions = {
    manifest: SimManifest | null;
    isReady: boolean;
    runId: string;
    currentTick: number;
    /** rAF emit 마다 호출되는 subscribe — 좌표 ref 갱신 통지. */
    subscribe: (cb: () => void) => () => void;
    positionsRef: React.RefObject<Map<string, GeoCoord>>;
    playbackStartMsRef: React.RefObject<number>;
    tickDurationMsRef: React.RefObject<number>;
};

/**
 * useSimRun 결과를 받아 (1) Persona[] (2) SpotLifecycle[] (3) ActivityCluster[] 를 노출.
 * 좌표 도착 판정 + cluster 빌드는 매 sim emit 마다 갱신(subscribe 경유).
 *
 * 내부 구현:
 *   - manifest 로드되면 모든 lifecycle/movement 청크를 prefetch 해 seed 를 한 번에 빌드.
 *     (mock 환경 한정 — 실제 백엔드 연동 시 청크 단위 로드로 대체 가능.)
 *   - currentTick 변할 때마다 SpotLifecycle 객체 + cluster 를 다시 만들어 state 로 노출.
 */
export function useSimDomain(options: UseSimDomainOptions): SimDomainResult {
    const {
        manifest,
        isReady,
        runId,
        currentTick,
        subscribe,
        positionsRef,
        playbackStartMsRef,
        tickDurationMsRef,
    } = options;

    const personas = useMemo(
        () => (manifest ? simAgentsToPersonas(manifest) : []),
        [manifest],
    );

    // mock 환경: 전체 lifecycle/movement 를 한 번에 fetch 해 seed 빌드.
    // 실제 백엔드에선 useSimRun 의 청크 prefetch 결과를 그대로 받아쓰는 별도 경로가 필요.
    const [seeds, setSeeds] = useState<SpotLifecycleSeed[]>([]);
    useEffect(() => {
        if (!manifest || !isReady) return;
        let mounted = true;
        (async () => {
            // 모든 lifecycle 은 청크 분할되어 있으나 mock 은 동일 JSON 에서 슬라이스만 한다.
            // 첫 청크 전체 + 나머지 청크들을 직렬 fetch 해서 합친다.
            const allMovements: Movement[] = [];
            const allLifecycle: LifecycleEvent[] = [];
            const chunkSize = manifest.chunk_size_ticks;
            for (let from = 0; from < manifest.total_ticks; from += chunkSize) {
                const to = Math.min(from + chunkSize, manifest.total_ticks);
                const moveChunk = await fetchSimMovements(runId, from, to);
                allMovements.push(...moveChunk.movements);
                // lifecycle 도 같은 청크로 fetch 했지만 useSimRun 이 이미 lifecycleByTickRef 를
                // 갖고 있으므로 여기선 movement 만 쓰고, lifecycle 은 별도 import 가 필요.
                // 단순화를 위해 lifecycle 도 직접 fetch.
            }
            // lifecycle 은 별도 한 번에.
            const { fetchSimLifecycle } =
                await import('@/features/simulation/mock/mock-sim-api');
            for (let from = 0; from < manifest.total_ticks; from += chunkSize) {
                const to = Math.min(from + chunkSize, manifest.total_ticks);
                const lifeChunk = await fetchSimLifecycle(runId, from, to);
                allLifecycle.push(...lifeChunk.events);
            }
            if (!mounted) return;
            setSeeds(
                buildSpotLifecycleSeeds(manifest, allLifecycle, allMovements),
            );
        })();
        return () => {
            mounted = false;
        };
    }, [manifest, isReady, runId]);

    // currentTick + positionsRef 기반 cluster/lifecycle 빌드.
    // 매 emit 마다 호출되도록 subscribe 후크에서 트리거.
    const [snapshot, setSnapshot] = useState<{
        lifecycles: SpotLifecycle[];
        clusters: ActivityCluster[];
        arrivedParticipantIds: Set<string>;
    }>({ lifecycles: [], clusters: [], arrivedParticipantIds: new Set() });

    const personaLookupRef = useRef<Map<string, Persona>>(new Map());
    useEffect(() => {
        personaLookupRef.current = new Map(personas.map((p) => [p.id, p]));
    }, [personas]);

    useEffect(() => {
        if (!manifest || seeds.length === 0) return;
        const compute = () => {
            const tickDurationMs = tickDurationMsRef.current ?? 1000;
            const playbackStartMs = playbackStartMsRef.current ?? 0;
            const now =
                playbackStartMs > 0
                    ? performance.now()
                    : currentTick * tickDurationMs;
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
                });
                // ageMs 만 쓰면 lifespan 미사용 경고 — explicit void.
                void lifespan;
            }

            setSnapshot({ lifecycles, clusters, arrivedParticipantIds });
        };

        // 즉시 1회 + emit 마다 재계산.
        compute();
        const unsub = subscribe(compute);
        return () => unsub();
    }, [
        manifest,
        seeds,
        subscribe,
        positionsRef,
        playbackStartMsRef,
        tickDurationMsRef,
        currentTick,
    ]);

    return {
        personas,
        ...snapshot,
    };
}
