// 대량 페르소나 생성 + 홈 기반 방황(home-anchored wandering) + 개별 일정.
// 각 페르소나는 home 주변 wanderRadius 안에서 trip(이동) ↔ dwell(정지) 사이클을 개별 페이스로 반복.
// 위치는 rAF 루프에서 lerp 보간되어 throttled 로 방출 → 클러스터링 훅에서 useDeferredValue + throttle 로 소비.
// 클러스터 생성/소멸 시나리오를 UI 단에서 스트레스 테스트하기 위한 훅.

'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
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
    /** 매 rAF 마다 업데이트되는 현재 위치 ref. React state 가 아니므로 리렌더 미유발. */
    positionsRef: React.RefObject<Map<string, GeoCoord>>;
    /** notify 간격(기본 ~100ms) 마다 호출되는 구독. unsubscribe 함수 리턴. */
    subscribe: (cb: () => void) => () => void;
    /**
     * 스팟 타겟 지정. personaId → 이동해야 할 목적지(spot.location).
     * 지정되면 home 근처 wander 를 중단하고 해당 좌표로 이동 후 그곳에서 대기.
     * null/undefined 로 제거되면 다시 home 근처로 wander 복귀.
     */
    setSpotTargets: (targets: Map<string, GeoCoord>) => void;
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
    /** 'spot' 이면 외부 타겟(스팟)으로 이동 중/대기 중. 'wander' 면 홈 주변 방황. */
    mode: 'wander' | 'spot';
};

type SwarmState = {
    personas: Persona[];
};

type SwarmAction =
    | { type: 'reset' }
    | { type: 'seed'; personas: Persona[] }
    | { type: 'churn'; removedIds: string[]; added: Persona[] };

const EMPTY_STATE: SwarmState = {
    personas: [],
};

function swarmReducer(state: SwarmState, action: SwarmAction): SwarmState {
    switch (action.type) {
        case 'reset':
            return EMPTY_STATE;
        case 'seed':
            return { personas: action.personas };
        case 'churn': {
            const removed = new Set(action.removedIds);
            const survivors = state.personas.filter((p) => !removed.has(p.id));
            return { personas: [...survivors, ...action.added] };
        }
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
        mode: 'wander',
    };
}

const SPOT_DWELL_SENTINEL = Number.MAX_SAFE_INTEGER;

function coordClose(a: GeoCoord, b: GeoCoord, thresholdDeg: number): boolean {
    return (
        Math.abs(a.lat - b.lat) < thresholdDeg &&
        Math.abs(a.lng - b.lng) < thresholdDeg
    );
}

function advanceMotion(
    s: PersonaMotionState,
    now: number,
    opts: DurationOpts,
    spotTarget: GeoCoord | null,
): void {
    // 상태 전이 처리
    if (spotTarget) {
        // 스팟 타겟이 있는데 아직 그 좌표를 target 으로 잡지 않았으면 새 trip 시작.
        if (s.mode !== 'spot' || !coordClose(s.target, spotTarget, 0.00005)) {
            s.origin = s.currentCoord;
            s.target = spotTarget;
            s.tripStartMs = now;
            // 스팟까지 이동 시간은 거리 기반으로 잡으면 좋지만, 일단 기본 trip duration 에
            // 1.3~1.8 배 가중해서 거리 감각만 주고 균일 처리.
            s.tripEndMs = now + rand(opts.tripMin, opts.tripMax) * 1.5;
            s.dwellEndMs = SPOT_DWELL_SENTINEL; // 해제될 때까지 머무름
            s.mode = 'spot';
        }
    } else if (s.mode === 'spot') {
        // 스팟 타겟 해제 → 홈 근처로 귀환 wander trip.
        s.origin = s.currentCoord;
        s.target = randCoordInDisk(s.home, s.wanderRadiusM);
        s.tripStartMs = now;
        s.tripEndMs = now + rand(opts.tripMin, opts.tripMax);
        s.dwellEndMs = s.tripEndMs + rand(opts.dwellMin, opts.dwellMax);
        s.mode = 'wander';
    }

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
    // wander 모드에서만 새 trip 자동 선정 (spot 모드는 SPOT_DWELL_SENTINEL 이라 여기 오지 않음)
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
    // 넓은 wander 반경 + 짧은 trip 으로 뷰포트에서 모션이 확실히 보이도록.
    wanderRadiusMinM = 250,
    wanderRadiusMaxM = 800,
    tripDurationMinMs = 8_000,
    tripDurationMaxMs = 22_000,
    dwellDurationMinMs = 3_000,
    dwellDurationMaxMs = 10_000,
    churnMs = 8_000,
    churnRate = 0.06,
    // 200ms 주기(5Hz) notify — 400ms 에선 wander 이동폭 1m 미만이라 정지처럼 보임.
    emitThrottleMs = 200,
}: UseMockPersonaSwarmOptions): UseMockPersonaSwarmReturn {
    const [state, dispatch] = useReducer(swarmReducer, EMPTY_STATE);

    const seqRef = useRef<number>(1);
    const motionStatesRef = useRef<Map<string, PersonaMotionState>>(new Map());
    const homesRef = useRef<GeoCoord[]>([]);
    const positionsRef = useRef<Map<string, GeoCoord>>(new Map());
    const subscribersRef = useRef<Set<() => void>>(new Set());
    const spotTargetsRef = useRef<Map<string, GeoCoord>>(new Map());

    const subscribe = useCallback((cb: () => void) => {
        const subs = subscribersRef.current;
        subs.add(cb);
        return () => {
            subs.delete(cb);
        };
    }, []);

    const setSpotTargets = useCallback((targets: Map<string, GeoCoord>) => {
        spotTargetsRef.current = targets;
    }, []);

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
            positionsRef.current = new Map();
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
            // stagger 위치 반영을 위해 seed 직후 1회 advance. 안 하면 첫 400ms 간 모두 home 에 몰려 보임.
            advanceMotion(motion, now, durationOptsRef.current, null);
            states.set(persona.id, motion);
            initialPositions.set(persona.id, motion.currentCoord);
        }
        motionStatesRef.current = states;
        positionsRef.current = initialPositions;
        dispatch({ type: 'seed', personas: seeded });
    }, [enabled, n, homeCount, swLat, swLng, neLat, neLng]);

    useEffect(() => {
        if (!enabled) return;
        let raf = 0;
        let lastStep = 0;

        // advance + notify 를 emitThrottleMs 간격으로 함께 실행.
        // 내부 advance 를 60fps 로 돌리면 N 이 클 때 그 자체로 비싸짐 (500 × 60 = 30K ops/s).
        // 어차피 visual 은 notify 간격에만 반응하므로 step 을 묶는다.
        const tick = (now: number) => {
            if (now - lastStep >= emitThrottleMs) {
                const states = motionStatesRef.current;
                const positions = positionsRef.current;
                const spotTargets = spotTargetsRef.current;
                for (const s of states.values()) {
                    const spotTarget = spotTargets.get(s.persona.id) ?? null;
                    advanceMotion(s, now, durationOptsRef.current, spotTarget);
                    positions.set(s.persona.id, s.currentCoord);
                }
                for (const cb of subscribersRef.current) cb();
                lastStep = now;
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
                positionsRef.current.delete(removedId);
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
                positionsRef.current.set(persona.id, motion.currentCoord);
            }
            dispatch({ type: 'churn', removedIds, added });
        }, churnMs);
        return () => clearInterval(interval);
    }, [enabled, churnMs, churnRate, swLat, swLng, neLat, neLng]);

    return {
        personas: state.personas,
        positionsRef,
        subscribe,
        setSpotTargets,
    };
}
