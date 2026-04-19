// 스팟 생애주기(SpotLifecycle) 기반 클러스터 생성 mock.
// 기존 geometric clustering(useActivityClusters)이 "우연히 겹침" 이라면 이 훅은 "스팟이 있음 → 참여자들이 모임" 의미.
// 각 SpotLifecycle 은 한 스팟의 생애(created → participants join/leave → matched → closed) 를 단일 객체로 보유.
// BE 연동 시 이 훅을 SpotLifecycle 스트림 구독으로 교체하면 나머지 렌더링 코드는 그대로 재사용.

'use client';

import { useEffect, useReducer, useRef } from 'react';
import type { Persona } from '@/entities/persona/types';
import type { SpotCategory } from '@/entities/spot/categories';
import type { GeoCoord } from '@/entities/spot/types';
import type { ActivityCluster, PersonaRef } from '@/features/map/model/types';

export type SpotLifecycleStatus = 'OPEN' | 'MATCHED' | 'CLOSED';

export type SpotParticipantEntry = {
    personaId: string;
    joinedAtMs: number;
    /** null 이면 아직 참여 중 (혹은 closedAtMs 에서 암시적으로 종료). */
    leftAtMs: number | null;
};

/** 한 스팟의 생애주기를 단일 객체로 기술. BE 에서 그대로 보내줄 수 있는 형태. */
export type SpotLifecycle = {
    spotId: string;
    location: GeoCoord;
    category: SpotCategory;
    intent: 'offer' | 'request';
    title: string;
    createdAtMs: number;
    /** OPEN → MATCHED 전환 시각. null 이면 MATCHED 된 적 없음. */
    matchedAtMs: number | null;
    /** 스팟이 사라지는 시각. */
    closedAtMs: number;
    participants: SpotParticipantEntry[];
};

export type SpotLifecycleSnapshot = {
    spotId: string;
    location: GeoCoord;
    category: SpotCategory;
    intent: 'offer' | 'request';
    title: string;
    status: SpotLifecycleStatus;
    currentParticipantIds: string[];
    ageMs: number;
};

export type UseMockSpotLifecyclesOptions = {
    enabled: boolean;
    personas: Persona[];
    /** 페르소나 현재 위치. 신규 스팟 host 좌표 seed 로 사용. 없으면 initialCoord 폴백. */
    positions?: Map<string, GeoCoord>;
    targetActiveSpots?: number;
    /** 새 스팟 생성 체크 주기(ms). */
    spawnIntervalMs?: number;
    spotLifespanMinMs?: number;
    spotLifespanMaxMs?: number;
    /** 스팟당 최소 참여자 수 (클러스터 표시 임계). */
    participantMinCount?: number;
    /** 스팟당 최대 참여자 수. */
    participantMaxCount?: number;
    /** 클러스터 state emit 주기(ms). */
    emitIntervalMs?: number;
    /** closedAtMs 이후 dying 애니 유지 시간(ms). */
    deathGraceMs?: number;
    /** 새 스팟 birth pulse 유효 시간(ms). */
    birthPulseMs?: number;
};

export type UseMockSpotLifecyclesReturn = {
    clusters: ActivityCluster[];
    /** 디버깅/대시보드용 snapshot. clusters 로 충분하면 무시 가능. */
    snapshots: SpotLifecycleSnapshot[];
    /** 현재까지 생성된 모든 lifecycle. 상세 인스펙션용. */
    lifecycles: SpotLifecycle[];
};

type State = {
    clusters: ActivityCluster[];
    snapshots: SpotLifecycleSnapshot[];
    lifecycles: SpotLifecycle[];
};

type Action = { type: 'reset' } | { type: 'emit'; state: State };

const EMPTY_STATE: State = { clusters: [], snapshots: [], lifecycles: [] };

function reducer(_: State, action: Action): State {
    switch (action.type) {
        case 'reset':
            return EMPTY_STATE;
        case 'emit':
            return action.state;
    }
}

const TITLE_TEMPLATES: Record<
    SpotCategory,
    { offer: string[]; request: string[] }
> = {
    요리: {
        offer: ['홈쿠킹 모여서 해봐요', '이탈리안 클래스 3인 모집'],
        request: ['같이 요리 배우실 분', '초심자 요리 모임'],
    },
    운동: {
        offer: ['러닝 크루 오늘 저녁', '주말 HIIT 같이'],
        request: ['운동 메이트 구해요', '아침 요가 파트너'],
    },
    음악: {
        offer: ['어쿠스틱 잼 세션', '합주 모임'],
        request: ['기타 같이 치실 분', '보컬 연습 파트너'],
    },
    공예: {
        offer: ['도자기 원데이', '가죽공예 같이'],
        request: ['공방 같이 가실 분', '금속공예 입문'],
    },
    코딩: {
        offer: ['사이드프로젝트 같이', 'Next.js 스터디'],
        request: ['코딩 스터디 같이', '리액트 멘토 모집'],
    },
    등산: {
        offer: ['청계산 오전 등산', '북한산 일출'],
        request: ['등산 크루 구해요', '초보 등산 파트너'],
    },
    요가: {
        offer: ['공원 모닝 요가', '하타요가 클래스'],
        request: ['요가 클래스 같이 갈 분', '명상 파트너'],
    },
    미술: {
        offer: ['야외 스케치 모임', '수채화 원데이'],
        request: ['드로잉 같이 하실 분', '미술관 동행'],
    },
    볼더링: {
        offer: ['볼더링 같이 갈 분', '클라이밍 크루'],
        request: ['볼더링 초심자 모임', '같이 오를 분'],
    },
};

function rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function randIn<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickTitle(
    category: SpotCategory,
    intent: 'offer' | 'request',
): string {
    const bucket = TITLE_TEMPLATES[category]?.[intent];
    if (bucket && bucket.length > 0) return randIn(bucket);
    return intent === 'offer' ? '같이 하실 분' : '모임 참여 원해요';
}

function sampleN<T>(arr: T[], n: number): T[] {
    const pool = [...arr];
    const picked: T[] = [];
    const count = Math.min(n, pool.length);
    for (let i = 0; i < count; i += 1) {
        const idx = Math.floor(Math.random() * pool.length);
        const [item] = pool.splice(idx, 1);
        picked.push(item);
    }
    return picked;
}

function createLifecycle(
    personas: Persona[],
    positions: Map<string, GeoCoord>,
    now: number,
    seq: number,
    participantMin: number,
    participantMax: number,
    lifespanMin: number,
    lifespanMax: number,
): SpotLifecycle | null {
    if (personas.length < participantMin) return null;
    const host = randIn(personas);
    const hostPos = positions.get(host.id) ?? host.initialCoord;
    const category = host.category;
    const intent = host.intent;

    const lifespan = rand(lifespanMin, lifespanMax);
    const closedAtMs = now + lifespan;
    // MATCHED 전환은 25~55% 지점.
    const matchedAtMs = now + lifespan * rand(0.25, 0.55);

    const wantCount = Math.max(
        participantMin,
        Math.min(
            participantMax,
            Math.floor(rand(participantMin, participantMax + 1)),
        ),
    );
    const sameCategory = personas.filter(
        (p) => p.category === category && p.intent === intent,
    );
    const others = sampleN(
        sameCategory.filter((p) => p.id !== host.id),
        wantCount - 1,
    );
    const roster = [host, ...others];

    // 참여자들의 join 시각을 스팟 수명 앞쪽에 분산.
    // host 는 t=0, 나머지는 0~40% 사이에 도착.
    const participants: SpotParticipantEntry[] = roster.map((p, i) => {
        const joinedAtMs = i === 0 ? now : now + lifespan * rand(0.02, 0.4);
        // 약 15% 확률로 일찍 이탈.
        const willLeaveEarly = Math.random() < 0.15;
        const leftAtMs = willLeaveEarly
            ? now + lifespan * rand(0.5, 0.95)
            : null;
        return { personaId: p.id, joinedAtMs, leftAtMs };
    });

    return {
        spotId: `spot-${seq}-${Math.random().toString(36).slice(2, 7)}`,
        location: {
            lat: hostPos.lat + rand(-0.0003, 0.0003),
            lng: hostPos.lng + rand(-0.0003, 0.0003),
        },
        category,
        intent,
        title: pickTitle(category, intent),
        createdAtMs: now,
        matchedAtMs,
        closedAtMs,
        participants,
    };
}

function deriveSnapshot(lc: SpotLifecycle, now: number): SpotLifecycleSnapshot {
    const status: SpotLifecycleStatus =
        now >= lc.closedAtMs
            ? 'CLOSED'
            : lc.matchedAtMs !== null && now >= lc.matchedAtMs
              ? 'MATCHED'
              : 'OPEN';
    const currentParticipantIds = lc.participants
        .filter(
            (p) =>
                p.joinedAtMs <= now &&
                (p.leftAtMs === null || p.leftAtMs > now) &&
                now < lc.closedAtMs,
        )
        .map((p) => p.personaId);
    return {
        spotId: lc.spotId,
        location: lc.location,
        category: lc.category,
        intent: lc.intent,
        title: lc.title,
        status,
        currentParticipantIds,
        ageMs: Math.max(0, now - lc.createdAtMs),
    };
}

export function useMockSpotLifecycles({
    enabled,
    personas,
    positions,
    targetActiveSpots,
    spawnIntervalMs = 3_000,
    spotLifespanMinMs = 40_000,
    spotLifespanMaxMs = 120_000,
    participantMinCount = 2,
    participantMaxCount = 5,
    emitIntervalMs = 400,
    deathGraceMs = 800,
    birthPulseMs = 1_200,
}: UseMockSpotLifecyclesOptions): UseMockSpotLifecyclesReturn {
    const [state, dispatch] = useReducer(reducer, EMPTY_STATE);

    const lifecyclesRef = useRef<Map<string, SpotLifecycle>>(new Map());
    const seqRef = useRef<number>(1);
    const personasRef = useRef<Persona[]>(personas);
    const positionsRef = useRef<Map<string, GeoCoord>>(new Map());
    const lastSpawnRef = useRef<number>(0);

    useEffect(() => {
        personasRef.current = personas;
    }, [personas]);

    useEffect(() => {
        if (positions) positionsRef.current = positions;
    }, [positions]);

    useEffect(() => {
        if (!enabled) {
            lifecyclesRef.current = new Map();
            lastSpawnRef.current = 0;
            dispatch({ type: 'reset' });
            return;
        }

        const tick = () => {
            const now = performance.now();
            const lifecycles = lifecyclesRef.current;
            const pool = personasRef.current;
            const posMap = positionsRef.current;

            // GC: closedAtMs + grace 이후 lifecycle 제거.
            for (const [id, lc] of lifecycles) {
                if (now > lc.closedAtMs + deathGraceMs) {
                    lifecycles.delete(id);
                }
            }

            // 현재 활성 스팟 수 (아직 closed 되지 않은 것).
            let activeCount = 0;
            for (const lc of lifecycles.values()) {
                if (now >= lc.createdAtMs && now < lc.closedAtMs) {
                    activeCount += 1;
                }
            }

            // Spawn: spawnIntervalMs 간격 & active < target 일 때 확률적으로 신규 생성.
            const target =
                targetActiveSpots ?? Math.max(3, Math.ceil(pool.length / 25));
            if (
                now - lastSpawnRef.current >= spawnIntervalMs &&
                activeCount < target &&
                pool.length >= participantMinCount &&
                Math.random() < 0.7
            ) {
                const newLc = createLifecycle(
                    pool,
                    posMap,
                    now,
                    seqRef.current,
                    participantMinCount,
                    participantMaxCount,
                    spotLifespanMinMs,
                    spotLifespanMaxMs,
                );
                seqRef.current += 1;
                if (newLc) {
                    lifecycles.set(newLc.spotId, newLc);
                    lastSpawnRef.current = now;
                }
            }

            // Compute snapshots + clusters.
            const snapshots: SpotLifecycleSnapshot[] = [];
            const clusters: ActivityCluster[] = [];
            const personaLookup = new Map(pool.map((p) => [p.id, p]));

            for (const lc of lifecycles.values()) {
                if (now < lc.createdAtMs) continue;
                const snap = deriveSnapshot(lc, now);
                snapshots.push(snap);

                const isDying = now >= lc.closedAtMs;
                const isPulse = !isDying && snap.ageMs < birthPulseMs;

                // 참여자 refs. dying 중엔 원본 roster 그대로 표시 (떠나는 애니).
                const idsToRender = isDying
                    ? lc.participants.map((p) => p.personaId)
                    : snap.currentParticipantIds;
                if (!isDying && idsToRender.length < participantMinCount) {
                    continue;
                }
                const personaRefs: PersonaRef[] = idsToRender.map((id) => {
                    const p = personaLookup.get(id);
                    return {
                        id,
                        emoji: p?.emoji ?? '❔',
                        name: p?.name ?? '익명',
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
                });
            }

            dispatch({
                type: 'emit',
                state: {
                    clusters,
                    snapshots,
                    lifecycles: [...lifecycles.values()],
                },
            });
        };

        tick();
        const interval = setInterval(tick, emitIntervalMs);
        return () => clearInterval(interval);
    }, [
        enabled,
        targetActiveSpots,
        spawnIntervalMs,
        spotLifespanMinMs,
        spotLifespanMaxMs,
        participantMinCount,
        participantMaxCount,
        emitIntervalMs,
        deathGraceMs,
        birthPulseMs,
    ]);

    return state;
}
