// 대량 페르소나 생성 + 홈 기반 방황(home-anchored wandering) + 개별 일정.
// 각 페르소나는 home 주변 wanderRadius 안에서 trip(이동) ↔ dwell(정지) 사이클을 개별 페이스로 반복.
// 위치는 rAF 루프에서 lerp 보간되어 throttled 로 방출 → 클러스터링 훅에서 useDeferredValue + throttle 로 소비.
// 클러스터 생성/소멸 시나리오를 UI 단에서 스트레스 테스트하기 위한 훅.

'use client';

import { useEffect, useReducer, useRef } from 'react';
import type { Persona, PersonaArchetype } from '@/entities/persona/types';
import { SPOT_CATEGORIES, type SpotCategory } from '@/entities/spot/categories';
import type { GeoCoord } from '@/entities/spot/types';

export type SwarmBbox = {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
};

export type UseMockPersonaSwarmOptions = {
    n: number;
    enabled: boolean;
    bbox: SwarmBbox;
    /** 동네(home hotspot) 수. 페르소나는 이 중 하나에 소속되어 home 좌표가 주변에 찍힘. */
    homeCount?: number;
    /** home 으로부터 방황 최소 반경(m). */
    wanderRadiusMinM?: number;
    /** home 으로부터 방황 최대 반경(m). */
    wanderRadiusMaxM?: number;
    /** 1회 trip(이동) 최소 시간(ms). 도보 기준 느리게. */
    tripDurationMinMs?: number;
    /** 1회 trip(이동) 최대 시간(ms). */
    tripDurationMaxMs?: number;
    /** 목적지 도착 후 정지(dwell) 최소 시간(ms). */
    dwellDurationMinMs?: number;
    /** 목적지 도착 후 정지(dwell) 최대 시간(ms). */
    dwellDurationMaxMs?: number;
    /** join/leave 이벤트 주기(ms). */
    churnMs?: number;
    /** 매 churn 에서 교체되는 페르소나 비율(0..1). */
    churnRate?: number;
    /** 위치 방출 throttle(ms). */
    emitThrottleMs?: number;
};

type UseMockPersonaSwarmReturn = {
    personas: Persona[];
    personaPositions: Map<string, GeoCoord>;
};

type PersonaMotionState = {
    persona: Persona;
    home: GeoCoord;
    wanderRadiusM: number;
    origin: GeoCoord;
    target: GeoCoord;
    tripStartMs: number;
    tripEndMs: number;
    dwellEndMs: number;
    currentCoord: GeoCoord;
};

type SwarmState = {
    personas: Persona[];
    positions: Map<string, GeoCoord>;
};

type SwarmAction =
    | { type: 'reset' }
    | {
          type: 'seed';
          personas: Persona[];
          positions: Map<string, GeoCoord>;
      }
    | { type: 'churn'; removedIds: string[]; added: Persona[] }
    | { type: 'emitPositions'; positions: Map<string, GeoCoord> };

const EMPTY_STATE: SwarmState = {
    personas: [],
    positions: new Map(),
};

function swarmReducer(state: SwarmState, action: SwarmAction): SwarmState {
    switch (action.type) {
        case 'reset':
            return EMPTY_STATE;
        case 'seed':
            return {
                personas: action.personas,
                positions: action.positions,
            };
        case 'churn': {
            const removed = new Set(action.removedIds);
            const survivors = state.personas.filter((p) => !removed.has(p.id));
            return {
                personas: [...survivors, ...action.added],
                positions: state.positions,
            };
        }
        case 'emitPositions':
            return { ...state, positions: action.positions };
    }
}

const ARCHETYPES: PersonaArchetype[] = [
    'explorer',
    'helper',
    'creator',
    'connector',
    'learner',
];

const EMOJIS = ['🏃', '🧘', '💻', '🥾', '🎨', '🎵', '☕', '📚', '🍳', '🧗'];
const NAMES = [
    '민지',
    '서연',
    '지훈',
    '현우',
    '수빈',
    '하연',
    '도윤',
    '예린',
    '재민',
    '소연',
    '준호',
    '유진',
    '정우',
    '채원',
    '승민',
    '시은',
];

function rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function randIn<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randCoordInBbox(bbox: SwarmBbox): GeoCoord {
    return {
        lat: rand(bbox.swLat, bbox.neLat),
        lng: rand(bbox.swLng, bbox.neLng),
    };
}

function metersToLatDeg(m: number): number {
    return m / 111_320;
}
function metersToLngDeg(m: number, latDeg: number): number {
    const denom = 111_320 * Math.cos((latDeg * Math.PI) / 180);
    return m / (denom === 0 ? 1 : denom);
}

/** 균일 분포로 원반 내 랜덤 좌표 (sqrt(random) 로 중심 편향 제거). */
function randCoordInDisk(center: GeoCoord, radiusM: number): GeoCoord {
    const r = Math.sqrt(Math.random()) * radiusM;
    const angle = Math.random() * Math.PI * 2;
    return {
        lat: center.lat + metersToLatDeg(r * Math.sin(angle)),
        lng: center.lng + metersToLngDeg(r * Math.cos(angle), center.lat),
    };
}

function makePersona(seq: number, home: GeoCoord): Persona {
    const category = randIn(SPOT_CATEGORIES) as SpotCategory;
    return {
        id: `swarm-${seq}-${Math.random().toString(36).slice(2, 7)}`,
        emoji: randIn(EMOJIS),
        name: randIn(NAMES),
        archetype: randIn(ARCHETYPES),
        initialCoord: randCoordInDisk(home, 20),
        category,
        intent: Math.random() < 0.5 ? 'offer' : 'request',
    };
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}
function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

type DurationOpts = {
    wanderMin: number;
    wanderMax: number;
    tripMin: number;
    tripMax: number;
    dwellMin: number;
    dwellMax: number;
};

function newMotionState(
    persona: Persona,
    home: GeoCoord,
    nowMs: number,
    opts: DurationOpts,
    stagger: boolean,
): PersonaMotionState {
    const wanderRadiusM = rand(opts.wanderMin, opts.wanderMax);
    const target = randCoordInDisk(home, wanderRadiusM);
    const tripDuration = rand(opts.tripMin, opts.tripMax);
    const dwellDuration = rand(opts.dwellMin, opts.dwellMax);
    // 초기 seed 시 stagger=true → 각 페르소나가 trip/dwell 사이클의 임의 지점에서 시작.
    const offset = stagger ? Math.random() * (tripDuration + dwellDuration) : 0;
    const tripStartMs = nowMs - offset;
    return {
        persona,
        home,
        wanderRadiusM,
        origin: persona.initialCoord,
        target,
        tripStartMs,
        tripEndMs: tripStartMs + tripDuration,
        dwellEndMs: tripStartMs + tripDuration + dwellDuration,
        currentCoord: persona.initialCoord,
    };
}

function advanceMotion(
    s: PersonaMotionState,
    now: number,
    opts: DurationOpts,
): void {
    if (now < s.tripEndMs) {
        const total = s.tripEndMs - s.tripStartMs;
        const raw = total <= 0 ? 1 : (now - s.tripStartMs) / total;
        const t = easeInOut(Math.max(0, Math.min(1, raw)));
        s.currentCoord = {
            lat: lerp(s.origin.lat, s.target.lat, t),
            lng: lerp(s.origin.lng, s.target.lng, t),
        };
        return;
    }
    if (now < s.dwellEndMs) {
        s.currentCoord = s.target;
        return;
    }
    // 새 trip 시작
    const tripDuration = rand(opts.tripMin, opts.tripMax);
    const dwellDuration = rand(opts.dwellMin, opts.dwellMax);
    s.origin = s.target;
    s.target = randCoordInDisk(s.home, s.wanderRadiusM);
    s.tripStartMs = now;
    s.tripEndMs = now + tripDuration;
    s.dwellEndMs = s.tripEndMs + dwellDuration;
    s.currentCoord = s.origin;
}

export function useMockPersonaSwarm({
    n,
    enabled,
    bbox,
    homeCount,
    wanderRadiusMinM = 80,
    wanderRadiusMaxM = 350,
    tripDurationMinMs = 18_000,
    tripDurationMaxMs = 55_000,
    dwellDurationMinMs = 8_000,
    dwellDurationMaxMs = 28_000,
    churnMs = 8_000,
    churnRate = 0.06,
    emitThrottleMs = 200,
}: UseMockPersonaSwarmOptions): UseMockPersonaSwarmReturn {
    const [state, dispatch] = useReducer(swarmReducer, EMPTY_STATE);

    const seqRef = useRef<number>(1);
    const motionStatesRef = useRef<Map<string, PersonaMotionState>>(new Map());
    const homesRef = useRef<GeoCoord[]>([]);

    const { swLat, swLng, neLat, neLng } = bbox;

    const durationOpts: DurationOpts = {
        wanderMin: wanderRadiusMinM,
        wanderMax: wanderRadiusMaxM,
        tripMin: tripDurationMinMs,
        tripMax: tripDurationMaxMs,
        dwellMin: dwellDurationMinMs,
        dwellMax: dwellDurationMaxMs,
    };
    const durationOptsRef = useRef<DurationOpts>(durationOpts);
    useEffect(() => {
        durationOptsRef.current = durationOpts;
    });

    useEffect(() => {
        if (!enabled) {
            dispatch({ type: 'reset' });
            motionStatesRef.current = new Map();
            homesRef.current = [];
            return;
        }
        const currentBbox: SwarmBbox = { swLat, swLng, neLat, neLng };
        const hotspotCount = Math.max(3, homeCount ?? Math.ceil(n / 12));
        const hotspots: GeoCoord[] = [];
        for (let i = 0; i < hotspotCount; i += 1) {
            hotspots.push(randCoordInBbox(currentBbox));
        }
        homesRef.current = hotspots;

        const now = performance.now();
        const seeded: Persona[] = [];
        const states = new Map<string, PersonaMotionState>();
        const initialPositions = new Map<string, GeoCoord>();

        for (let i = 0; i < n; i += 1) {
            const home = hotspots[i % hotspots.length];
            const persona = makePersona(seqRef.current, home);
            seqRef.current += 1;
            seeded.push(persona);
            const motion = newMotionState(
                persona,
                home,
                now,
                durationOptsRef.current,
                true,
            );
            states.set(persona.id, motion);
            initialPositions.set(persona.id, motion.currentCoord);
        }
        motionStatesRef.current = states;
        dispatch({
            type: 'seed',
            personas: seeded,
            positions: initialPositions,
        });
    }, [enabled, n, homeCount, swLat, swLng, neLat, neLng]);

    useEffect(() => {
        if (!enabled) return;
        let raf = 0;
        let lastEmit = 0;

        const tick = (now: number) => {
            const states = motionStatesRef.current;
            for (const s of states.values()) {
                advanceMotion(s, now, durationOptsRef.current);
            }
            if (now - lastEmit >= emitThrottleMs) {
                const next = new Map<string, GeoCoord>();
                for (const [id, s] of states) next.set(id, s.currentCoord);
                dispatch({ type: 'emitPositions', positions: next });
                lastEmit = now;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [enabled, emitThrottleMs]);

    useEffect(() => {
        if (!enabled) return;
        const interval = setInterval(() => {
            const states = motionStatesRef.current;
            const currentIds = [...states.keys()];
            if (currentIds.length < 2) return;

            const swapCount = Math.max(
                1,
                Math.floor(currentIds.length * churnRate),
            );
            const pool = [...currentIds];
            const removedIds: string[] = [];
            for (let i = 0; i < swapCount && pool.length > 1; i += 1) {
                const idx = Math.floor(Math.random() * pool.length);
                const [removedId] = pool.splice(idx, 1);
                removedIds.push(removedId);
                states.delete(removedId);
            }
            const added: Persona[] = [];
            const hotspots = homesRef.current;
            const now = performance.now();
            for (let i = 0; i < swapCount; i += 1) {
                const home =
                    hotspots.length > 0
                        ? hotspots[Math.floor(Math.random() * hotspots.length)]
                        : {
                              lat: (swLat + neLat) / 2,
                              lng: (swLng + neLng) / 2,
                          };
                const persona = makePersona(seqRef.current, home);
                seqRef.current += 1;
                added.push(persona);
                const motion = newMotionState(
                    persona,
                    home,
                    now,
                    durationOptsRef.current,
                    false,
                );
                states.set(persona.id, motion);
            }
            dispatch({ type: 'churn', removedIds, added });
        }, churnMs);
        return () => clearInterval(interval);
    }, [enabled, churnMs, churnRate, swLat, swLng, neLat, neLng]);

    return {
        personas: state.personas,
        personaPositions: state.positions,
    };
}
