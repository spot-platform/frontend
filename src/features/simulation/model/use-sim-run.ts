'use client';

// Sim run 재생 훅.
//
// 책임:
//   1) manifest + movement/lifecycle 청크를 BE simulation API 로부터 로드.
//   2) playbackStartMs 기반 tFloat 으로 매 프레임 agent 좌표 산출.
//   3) positionsRef + subscribe 인터페이스를 useMockPersonaSwarm 과 동일하게 노출.
//   4) lifecycle 이벤트는 currentLifecycleEvents 로 throttle 단위 push.
//
// React 외부 store 패턴: 좌표 갱신은 ref + subscribers callback 으로만 전파해
// 매 프레임 리렌더 폭증을 막는다(기존 mock 과 동일 정책).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
    AgentTimelineMap,
    GeoCoord,
    LifecycleEvent,
    Movement,
    PlaceMap,
    SimAgent,
    SimManifest,
} from '@/entities/spot/sim-stream-types';

import {
    DEMO_RUN_ID,
    fetchSimLifecycle,
    fetchSimManifest,
    fetchSimMovements,
} from '../api/sim-api';
import {
    buildAgentTimelines,
    findNextMovement,
    findRecentMovement,
    homePosition,
    jitterAround,
    resolveAgentPosition,
} from './sim-clock';

export type UseSimRunOptions = {
    /** 재생할 run 식별자. 미지정 시 데모 run. */
    runId?: string;
    /** false 면 fetch / rAF 모두 정지. */
    enabled?: boolean;
    /** 1 tick 재생 길이(ms). 미지정 시 manifest.tick_duration_ms_default. */
    tickDurationMs?: number;
    /** 위치 emit throttle. 디폴트 200ms (기존 mock 과 일관). */
    emitThrottleMs?: number;
    /** dwell 중 시각적 자연스러움용 jitter(meters). 0 이면 끔. */
    dwellJitterM?: number;
    /** prefetch 트리거 — 윈도우 끝까지 N tick 남았을 때 다음 청크 요청. */
    prefetchAheadTicks?: number;
    /** 같은 행정동 home 출발점을 시각적으로 흩뿌리는 반경(meters). */
    spawnScatterM?: number;
    /** lifecycle/movement 가 모두 비어 있는 긴 휴식 tick 구간은 다음 활동으로 건너뜀. */
    skipEmptyEventTicks?: boolean;
};

export type UseSimRunResult = {
    /** manifest 로드 후 채워짐. 로딩 중엔 null. */
    manifest: SimManifest | null;
    /** 1차 청크가 도착해 재생 가능한 상태. */
    isReady: boolean;
    /** 가장 최근 청크 fetch 실패 시 채워짐. */
    error: Error | null;
    /** 프레임마다 갱신되는 agent_id → 좌표. 기존 mock 의 positionsRef 와 동일 사용성. */
    positionsRef: React.RefObject<Map<string, GeoCoord>>;
    /** emit 시 호출되는 구독자. unsubscribe 함수 반환. */
    subscribe: (cb: () => void) => () => void;
    /** 현재 tick (정수). UI 라벨 용. */
    currentTick: number;
    /** 현재 재생 cycle. cycle 이 바뀌면 같은 agent 도 별도 render instance 로 취급한다. */
    currentCycle: number;
    /** 현재 tick 에 발화한 lifecycle 이벤트들. 다음 emit 까지 동일. */
    currentLifecycleEvents: LifecycleEvent[];
    /** 실제 재생/렌더링에 쓰는 loop period. demo fold 모드에서는 manifest 값보다 짧다. */
    effectiveLoopPeriodTicks: number | null;
    /** Play / Pause 토글. */
    isPlaying: boolean;
    play: () => void;
    pause: () => void;
    /** 임의 tick 으로 점프. */
    seek: (tick: number) => void;
    /**
     * tick 시간축을 performance.now() ms 시간축으로 변환할 때 쓰는 기준점.
     * tick T 의 절대 ms = playbackStartMsRef.current + T * tickDurationMs.
     * pause/seek 호출 시 즉시 갱신된다. 어댑터(예: SpotLifecycle 합성)에서 사용.
     */
    playbackStartMsRef: React.RefObject<number>;
    /** 현재 tick 길이(ms). 어댑터가 tick→ms 변환 시 사용. */
    tickDurationMsRef: React.RefObject<number>;
    /** 현재까지 로드된 movement 버퍼. 도메인 어댑터가 별도 fetch 없이 seed를 점진 갱신할 때 사용. */
    bufferedMovementsRef: React.RefObject<Movement[]>;
    /** 현재까지 로드된 lifecycle 이벤트 버퍼. */
    bufferedLifecycleEventsRef: React.RefObject<LifecycleEvent[]>;
    /** 새 chunk가 버퍼에 반영될 때 증가하는 버전. ref 소비자가 재계산 트리거로 사용. */
    bufferedChunkVersion: number;
};

const DEFAULT_EMIT_THROTTLE_MS = 200;
const DEFAULT_PREFETCH_AHEAD = 6;
const DEFAULT_DWELL_JITTER_M = 20;
const DEFAULT_SPAWN_SCATTER_M = 180;
const MIN_EMPTY_SKIP_TICKS = 3;
const MAX_PREVIEW_OVERLAP_TICKS = 24;
const DEMO_TAIL_FOLD_START_TICK = 24;
const DEMO_TAIL_FOLD_SOURCE_START_TICK = 48;
const DEMO_TAIL_FOLD_WINDOW_TICKS = 24;
const DEMO_TAIL_FOLD_PLAYBACK_LOOP_TICKS = 72;

type RenderCycleTick = {
    cycle: number;
    rawTick: number;
};

function loopPeriodTicks(manifest: SimManifest): number {
    return Math.max(1, manifest.loop_period_ticks ?? manifest.total_ticks);
}

function dataWindowTicks(manifest: SimManifest): number {
    const loopPeriod = loopPeriodTicks(manifest);
    const declaredMaxProjected = manifest.max_projected_tick;
    const tailMaxProjected =
        manifest.projection_tail_ticks != null
            ? loopPeriod + manifest.projection_tail_ticks - 1
            : null;
    return Math.max(
        manifest.total_ticks,
        (declaredMaxProjected ?? manifest.total_ticks - 1) + 1,
        tailMaxProjected != null ? tailMaxProjected + 1 : 0,
    );
}

function cycleForTick(tFloat: number, period: number): number {
    return Math.max(0, Math.floor(tFloat / period));
}

function tickInCycle(tFloat: number, period: number): number {
    return ((tFloat % period) + period) % period;
}

function shouldUseDemoTailFold(manifest: SimManifest, runId: string): boolean {
    return (
        runId === DEMO_RUN_ID &&
        manifest.run_id === DEMO_RUN_ID &&
        dataWindowTicks(manifest) > DEMO_TAIL_FOLD_SOURCE_START_TICK
    );
}

function playbackLoopPeriodTicks(manifest: SimManifest, runId: string): number {
    if (shouldUseDemoTailFold(manifest, runId)) {
        return DEMO_TAIL_FOLD_PLAYBACK_LOOP_TICKS;
    }
    return loopPeriodTicks(manifest);
}

function previewOverlapTicks(manifest: SimManifest, runId: string): number {
    if (shouldUseDemoTailFold(manifest, runId)) return 0;
    const declaredTail = manifest.projection_tail_ticks ?? 0;
    if (declaredTail <= 0) return 0;
    return Math.min(MAX_PREVIEW_OVERLAP_TICKS, declaredTail);
}

function foldedTailTick(rawTick: number, spotBaseTick: number | null): number {
    if (rawTick < DEMO_TAIL_FOLD_SOURCE_START_TICK) return rawTick;
    if (
        spotBaseTick !== null &&
        spotBaseTick >= DEMO_TAIL_FOLD_SOURCE_START_TICK
    ) {
        const foldedBaseOffset =
            (spotBaseTick - DEMO_TAIL_FOLD_START_TICK) %
            DEMO_TAIL_FOLD_WINDOW_TICKS;
        const relativeTick = rawTick - spotBaseTick;
        return (
            DEMO_TAIL_FOLD_START_TICK +
            ((foldedBaseOffset + relativeTick) % DEMO_TAIL_FOLD_WINDOW_TICKS)
        );
    }
    return (
        DEMO_TAIL_FOLD_START_TICK +
        ((rawTick - DEMO_TAIL_FOLD_START_TICK) % DEMO_TAIL_FOLD_WINDOW_TICKS)
    );
}

function renderCycleTicks(
    tFloat: number,
    manifest: SimManifest,
    runId: string,
): RenderCycleTick[] {
    const loopPeriod = playbackLoopPeriodTicks(manifest, runId);
    const dataWindow = shouldUseDemoTailFold(manifest, runId)
        ? loopPeriod
        : dataWindowTicks(manifest);
    const currentCycle = cycleForTick(tFloat, loopPeriod);
    const ticks: RenderCycleTick[] = [];

    for (const cycle of [Math.max(0, currentCycle - 1), currentCycle]) {
        const rawTick = tFloat - cycle * loopPeriod;
        if (rawTick >= 0 && rawTick < dataWindow) {
            ticks.push({ cycle, rawTick });
        }
    }

    const previewTicks = previewOverlapTicks(manifest, runId);
    const rawInCycle = tickInCycle(tFloat, loopPeriod);
    const previewStart = loopPeriod - previewTicks;
    if (previewTicks > 0 && rawInCycle >= previewStart) {
        const nextRawTick = rawInCycle - previewStart;
        ticks.push({ cycle: currentCycle + 1, rawTick: nextRawTick });
    }

    const seen = new Set<string>();
    return ticks.filter((tick) => {
        const key = `${tick.cycle}:${Math.floor(tick.rawTick * 1000)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export function useSimRun(options: UseSimRunOptions = {}): UseSimRunResult {
    const {
        runId = DEMO_RUN_ID,
        enabled = true,
        tickDurationMs,
        emitThrottleMs = DEFAULT_EMIT_THROTTLE_MS,
        dwellJitterM = DEFAULT_DWELL_JITTER_M,
        prefetchAheadTicks = DEFAULT_PREFETCH_AHEAD,
        spawnScatterM = DEFAULT_SPAWN_SCATTER_M,
        skipEmptyEventTicks = true,
    } = options;

    const [manifest, setManifest] = useState<SimManifest | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [currentTick, setCurrentTick] = useState(0);
    const [currentLifecycleEvents, setCurrentLifecycleEvents] = useState<
        LifecycleEvent[]
    >([]);
    const [currentCycle, setCurrentCycle] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const activeManifestRef = useRef<SimManifest | null>(null);
    const activeRunIdRef = useRef<string | null>(null);

    // ── refs (rAF 루프가 직접 참조) ────────────────────────────────────────
    const positionsRef = useRef<Map<string, GeoCoord>>(new Map());
    const subscribersRef = useRef<Set<() => void>>(new Set());

    const placeMapRef = useRef<PlaceMap>(new Map());
    const agentsRef = useRef<SimAgent[]>([]);
    const agentByIdRef = useRef<Map<string, SimAgent>>(new Map());
    const foldedAgentAliasBySpotRef = useRef<Map<string, string>>(new Map());
    const timelinesRef = useRef<AgentTimelineMap>(new Map());
    const lifecycleByTickRef = useRef<Map<number, LifecycleEvent[]>>(new Map());
    const loadedWindowRef = useRef<{ from: number; to: number } | null>(null);
    const inflightChunkRef = useRef<Promise<void> | null>(null);
    const bufferedMovementsRef = useRef<Movement[]>([]);
    const bufferedLifecycleEventsRef = useRef<LifecycleEvent[]>([]);
    const loadedChunkKeysRef = useRef<Set<string>>(new Set());
    const chunkPromiseMapRef = useRef<Map<string, Promise<void>>>(new Map());
    const [bufferedChunkVersion, setBufferedChunkVersion] = useState(0);

    const tickDurationMsRef = useRef<number>(tickDurationMs ?? 1000);
    const playbackStartMsRef = useRef<number>(0);
    const pausedAtTickRef = useRef<number>(0);
    const lastEmittedTickRef = useRef<number>(-1);

    const subscribe = useCallback((cb: () => void) => {
        subscribersRef.current.add(cb);
        return () => {
            subscribersRef.current.delete(cb);
        };
    }, []);

    const notify = useCallback(() => {
        for (const cb of subscribersRef.current) cb();
    }, []);

    // ── manifest 로드 + 첫 청크 ────────────────────────────────────────────
    useEffect(() => {
        if (!enabled) {
            activeRunIdRef.current = null;
            return;
        }
        let mounted = true;
        activeRunIdRef.current = runId;
        setIsReady(false);
        setError(null);

        (async () => {
            try {
                const m = await fetchSimManifest(runId);
                if (!mounted) return;
                activeManifestRef.current = m;
                setManifest(m);
                tickDurationMsRef.current =
                    tickDurationMs ?? m.tick_duration_ms_default;
                placeMapRef.current = new Map(
                    m.places.map((p) => [p.place_id, p] as const),
                );
                agentsRef.current = m.agents;
                agentByIdRef.current = new Map(
                    m.agents.map((agent) => [agent.agent_id, agent] as const),
                );
                foldedAgentAliasBySpotRef.current = new Map();
                timelinesRef.current = new Map();
                lifecycleByTickRef.current = new Map();
                loadedWindowRef.current = null;
                bufferedMovementsRef.current = [];
                bufferedLifecycleEventsRef.current = [];
                loadedChunkKeysRef.current = new Set();
                chunkPromiseMapRef.current = new Map();
                setBufferedChunkVersion(0);

                // 초기 좌표: home 으로 세팅(지터 적용).
                const init = new Map<string, GeoCoord>();
                for (const a of m.agents) {
                    const home = homePosition(a, placeMapRef.current);
                    if (home) {
                        init.set(
                            a.agent_id,
                            dwellJitterM > 0
                                ? jitterAround(home, a.agent_id, dwellJitterM)
                                : home,
                        );
                    }
                }
                positionsRef.current = init;

                // 첫 청크
                const initialChunkTo = Math.min(
                    m.chunk_size_ticks,
                    dataWindowTicks(m),
                );
                await loadChunk(0, initialChunkTo, runId);
                if (shouldUseDemoTailFold(m, runId)) {
                    await loadChunk(initialChunkTo, dataWindowTicks(m), runId);
                }
                if (!mounted) return;
                setIsReady(true);
                notify();
            } catch (e) {
                if (!mounted) return;
                setError(e instanceof Error ? e : new Error(String(e)));
            }
        })();

        return () => {
            mounted = false;
            if (activeRunIdRef.current === runId) {
                activeRunIdRef.current = null;
            }
        };
        // tickDurationMs 변경은 별도 effect 에서 처리.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [runId, enabled]);

    // tickDurationMs prop 변화 반영
    useEffect(() => {
        if (tickDurationMs != null) {
            tickDurationMsRef.current = tickDurationMs;
        }
    }, [tickDurationMs]);

    // ── demo tail fold helpers ───────────────────────────────────────────────
    function ensureFoldedAgentAlias(agentId: string, spotId: string): string {
        const key = `${spotId}:${agentId}`;
        const existing = foldedAgentAliasBySpotRef.current.get(key);
        if (existing) return existing;

        const cloneId = `${agentId}__fold_${spotId}`;
        foldedAgentAliasBySpotRef.current.set(key, cloneId);
        if (!agentByIdRef.current.has(cloneId)) {
            const source = agentByIdRef.current.get(agentId);
            const spot = placeMapRef.current.get(spotId);
            const clone: SimAgent = source
                ? { ...source, agent_id: cloneId, agent_role: 'protagonist' }
                : {
                      agent_id: cloneId,
                      agent_role: 'protagonist',
                      archetype: 'learner',
                      name: '시연 페르소나',
                      emoji: '🙂',
                      home_region_id: spot?.region_id ?? 'emd_ingye',
                      category: spot?.category ?? '공예',
                      intent: spot?.intent ?? 'request',
                  };
            agentByIdRef.current.set(cloneId, clone);
            agentsRef.current = [...agentsRef.current, clone];
            setManifest((prev) => {
                if (!prev || prev.run_id !== runId) return prev;
                const next = { ...prev, agents: agentsRef.current };
                activeManifestRef.current = next;
                return next;
            });
        }
        return cloneId;
    }

    function transformDemoTailFoldChunk(
        movements: Movement[],
        lifecycleEvents: LifecycleEvent[],
    ): { movements: Movement[]; lifecycleEvents: LifecycleEvent[] } {
        const activeManifest = activeManifestRef.current ?? manifest;
        if (!activeManifest || !shouldUseDemoTailFold(activeManifest, runId)) {
            return { movements, lifecycleEvents };
        }

        const spotBaseTicks = new Map<string, number>();
        for (const ev of [
            ...bufferedLifecycleEventsRef.current,
            ...lifecycleEvents,
        ]) {
            if (ev.event_type !== 'SPOT_CREATED') continue;
            const prev = spotBaseTicks.get(ev.spot_id);
            if (prev === undefined || ev.tick < prev) {
                spotBaseTicks.set(ev.spot_id, ev.tick);
            }
        }
        for (const m of movements) {
            if (!m.spot_id) continue;
            const prev = spotBaseTicks.get(m.spot_id);
            if (prev === undefined || m.depart_tick < prev) {
                spotBaseTicks.set(m.spot_id, m.depart_tick);
            }
        }

        const transformAgentId = (
            agentId: string | undefined,
            spotId: string,
            rawTick: number,
        ): string | undefined => {
            if (!agentId) return undefined;
            if (rawTick < DEMO_TAIL_FOLD_SOURCE_START_TICK) return agentId;
            return ensureFoldedAgentAlias(agentId, spotId);
        };

        const foldedMovements = movements.map((m) => {
            const spotBaseTick = m.spot_id
                ? (spotBaseTicks.get(m.spot_id) ?? null)
                : null;
            const departTick = foldedTailTick(m.depart_tick, spotBaseTick);
            const agentId = m.spot_id
                ? transformAgentId(m.agent_id, m.spot_id, m.depart_tick)
                : m.agent_id;
            return {
                ...m,
                agent_id: agentId ?? m.agent_id,
                depart_tick: departTick,
                arrive_tick: departTick + (m.arrive_tick - m.depart_tick),
            };
        });

        const foldedLifecycleEvents = lifecycleEvents.map((ev) => {
            const spotBaseTick = spotBaseTicks.get(ev.spot_id) ?? null;
            const tick = foldedTailTick(ev.tick, spotBaseTick);
            const agentId = transformAgentId(ev.agent_id, ev.spot_id, ev.tick);
            const payload = ev.payload ? { ...ev.payload } : undefined;
            if (payload && typeof payload.persona_id === 'string') {
                payload.persona_id = transformAgentId(
                    payload.persona_id,
                    ev.spot_id,
                    ev.tick,
                );
            }
            if (payload && typeof payload.agent_id === 'string') {
                payload.agent_id = transformAgentId(
                    payload.agent_id,
                    ev.spot_id,
                    ev.tick,
                );
            }
            if (payload && typeof payload.host_persona_id === 'string') {
                payload.host_persona_id = transformAgentId(
                    payload.host_persona_id,
                    ev.spot_id,
                    ev.tick,
                );
            }
            return {
                ...ev,
                tick,
                agent_id: agentId,
                payload,
                scheduled_tick:
                    ev.scheduled_tick === undefined ||
                    ev.scheduled_tick === null
                        ? ev.scheduled_tick
                        : Math.max(tick, tick + (ev.scheduled_tick - ev.tick)),
                expected_closed_at_tick:
                    ev.expected_closed_at_tick === undefined ||
                    ev.expected_closed_at_tick === null
                        ? ev.expected_closed_at_tick
                        : Math.max(
                              tick,
                              tick + (ev.expected_closed_at_tick - ev.tick),
                          ),
            };
        });

        return {
            movements: foldedMovements,
            lifecycleEvents: foldedLifecycleEvents,
        };
    }

    // ── 청크 로더 ──────────────────────────────────────────────────────────
    async function loadChunk(
        from: number,
        to: number,
        rid: string,
    ): Promise<void> {
        const key = `${rid}:${from}:${to}`;
        if (loadedChunkKeysRef.current.has(key)) return;

        const existing = chunkPromiseMapRef.current.get(key);
        if (existing) return existing;

        const promise = (async () => {
            const [moveChunk, lifeChunk] = await Promise.all([
                fetchSimMovements(rid, from, to),
                fetchSimLifecycle(rid, from, to),
            ]);
            if (activeRunIdRef.current !== rid) return;
            const { movements, lifecycleEvents } = transformDemoTailFoldChunk(
                moveChunk.movements,
                lifeChunk.events,
            );

            loadedChunkKeysRef.current.add(key);
            bufferedMovementsRef.current = [
                ...bufferedMovementsRef.current,
                ...movements,
            ];
            bufferedLifecycleEventsRef.current = [
                ...bufferedLifecycleEventsRef.current,
                ...lifecycleEvents,
            ];

            timelinesRef.current = buildAgentTimelines(
                movements,
                timelinesRef.current,
                { staggerCrowdedStarts: true },
            );

            const lcMap = lifecycleByTickRef.current;
            for (const ev of lifecycleEvents) {
                const arr = lcMap.get(ev.tick);
                if (arr) arr.push(ev);
                else lcMap.set(ev.tick, [ev]);
            }

            loadedWindowRef.current = loadedWindowRef.current
                ? { from: loadedWindowRef.current.from, to }
                : { from, to };
            setBufferedChunkVersion((version) => version + 1);
        })().finally(() => {
            chunkPromiseMapRef.current.delete(key);
        });

        chunkPromiseMapRef.current.set(key, promise);
        return promise;
    }

    function maybePrefetch(tFloat: number, m: SimManifest, rid: string): void {
        const w = loadedWindowRef.current;
        const dataWindow = dataWindowTicks(m);
        if (!w) return;
        if (w.to >= dataWindow) return;
        if (inflightChunkRef.current) return;
        if (tFloat < w.to - prefetchAheadTicks) return;

        const nextFrom = w.to;
        const nextTo = Math.min(nextFrom + m.chunk_size_ticks, dataWindow);
        inflightChunkRef.current = loadChunk(nextFrom, nextTo, rid)
            .catch((e) => {
                if (activeRunIdRef.current !== rid) return;
                setError(e instanceof Error ? e : new Error(String(e)));
            })
            .finally(() => {
                inflightChunkRef.current = null;
            });
    }

    function hasActiveMovement(tFloat: number): boolean {
        for (const tl of timelinesRef.current.values()) {
            const recentMovement = findRecentMovement(tl, tFloat);
            if (
                recentMovement &&
                recentMovement.depart_tick <= tFloat &&
                tFloat < recentMovement.arrive_tick
            ) {
                return true;
            }
        }
        return false;
    }

    function findNextActivityTick(tFloat: number): number | null {
        const w = loadedWindowRef.current;
        const loopPeriod = manifest
            ? playbackLoopPeriodTicks(manifest, runId)
            : null;
        if (!w) return null;
        let nextTick = Number.POSITIVE_INFINITY;

        for (const tl of timelinesRef.current.values()) {
            const nextMovement = findNextMovement(tl, tFloat);
            if (nextMovement && nextMovement.depart_tick < nextTick) {
                nextTick = nextMovement.depart_tick;
            }
        }

        for (const tick of lifecycleByTickRef.current.keys()) {
            if (tick > tFloat && tick < nextTick) nextTick = tick;
        }

        if (!Number.isFinite(nextTick)) return null;
        if (loopPeriod !== null && nextTick >= loopPeriod) return null;
        // 로드된 범위 안에서만 안전하게 건너뛴다. 다음 청크 내용은 아직 모르므로 추측하지 않는다.
        return nextTick <= w.to ? nextTick : null;
    }

    function maybeSkipEmptyEventTicks(tFloat: number, now: number): number {
        if (!skipEmptyEventTicks) return tFloat;
        if (manifest && tFloat >= playbackLoopPeriodTicks(manifest, runId)) {
            return tFloat;
        }
        const tickInt = Math.floor(tFloat);
        if (lifecycleByTickRef.current.get(tickInt)?.length) return tFloat;
        if (hasActiveMovement(tFloat)) return tFloat;

        const nextTick = findNextActivityTick(tFloat);
        if (!nextTick || nextTick - tFloat < MIN_EMPTY_SKIP_TICKS) {
            return tFloat;
        }

        const skippedTick = Math.min(
            nextTick,
            manifest ? playbackLoopPeriodTicks(manifest, runId) : nextTick,
        );
        pausedAtTickRef.current = skippedTick;
        playbackStartMsRef.current =
            now - skippedTick * tickDurationMsRef.current;
        return skippedTick;
    }

    // ── 재생 루프 (rAF + emit throttle) ────────────────────────────────────
    useEffect(() => {
        if (!enabled || !isPlaying || !manifest) return;

        let rafId = 0;
        let lastEmitMs = 0;

        const loop = () => {
            const now = performance.now();
            const tFloat =
                (now - playbackStartMsRef.current) /
                Math.max(1, tickDurationMsRef.current);
            const effectiveTFloat = maybeSkipEmptyEventTicks(tFloat, now);

            if (now - lastEmitMs >= emitThrottleMs) {
                lastEmitMs = now;
                emitFrame(effectiveTFloat);
            }

            maybePrefetch(
                Math.min(effectiveTFloat, dataWindowTicks(manifest)),
                manifest,
                runId,
            );
            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, isPlaying, manifest, emitThrottleMs, runId]);

    function emitFrame(tFloat: number): void {
        const placeMap = placeMapRef.current;
        const timelines = timelinesRef.current;
        const agents = agentsRef.current;
        const next = positionsRef.current;
        const m = manifest;
        const loopPeriod = m
            ? playbackLoopPeriodTicks(m, runId)
            : Number.POSITIVE_INFINITY;
        const currentCycleValue = Number.isFinite(loopPeriod)
            ? cycleForTick(tFloat, loopPeriod)
            : 0;
        const cycleTicks = m
            ? renderCycleTicks(tFloat, m, runId)
            : [{ cycle: 0, rawTick: tFloat }];
        const activeKeys = new Set<string>();

        for (const { cycle, rawTick } of cycleTicks) {
            for (const a of agents) {
                const tl = timelines.get(a.agent_id);
                if (a.agent_role === 'background' && (!tl || tl.length === 0)) {
                    // movement 없는 background 는 시각화에서 제외한다.
                    continue;
                }
                const renderAgentId = `${cycle}:${a.agent_id}`;
                activeKeys.add(renderAgentId);

                // 대기 상태 정의:
                //   - timeline 비었음 → 항상 대기
                //   - 첫 movement 전 (rawTick < first.depart_tick) → 대기
                //   - 마지막 movement 가 go_home 이고 도착 완료 → 다시 대기(귀가)
                // 대기 중인 agent 는 positionsRef 에서 좌표를 제거해 마커 자체를 hide.
                const isIdle =
                    !tl ||
                    tl.length === 0 ||
                    rawTick < tl[0].depart_tick ||
                    (tl[tl.length - 1].reason === 'go_home' &&
                        rawTick >= tl[tl.length - 1].arrive_tick);

                if (isIdle) {
                    next.delete(renderAgentId);
                    continue;
                }

                const recentMovement = tl
                    ? findRecentMovement(tl, rawTick)
                    : null;
                const hasReturnedHome =
                    recentMovement?.reason === 'go_home' &&
                    recentMovement.arrive_tick <= rawTick;
                if (hasReturnedHome) {
                    next.delete(renderAgentId);
                    continue;
                }

                const pos = resolveAgentPosition(
                    a,
                    timelines,
                    rawTick,
                    placeMap,
                    {
                        spawnScatterM,
                    },
                );
                if (!pos) continue;
                // spot 도착 후 dwell 은 잔잔한 jitter 만(움직이지 않는 모임 멤버 표현).
                const isDwell =
                    recentMovement !== null &&
                    recentMovement.arrive_tick <= rawTick;
                next.set(
                    renderAgentId,
                    isDwell && dwellJitterM > 0
                        ? jitterAround(
                              pos,
                              renderAgentId + ':' + Math.floor(rawTick),
                              dwellJitterM,
                          )
                        : pos,
                );
            }
        }

        for (const key of [...next.keys()]) {
            if (!activeKeys.has(key)) next.delete(key);
        }

        const tickInt = Math.floor(tickInCycle(tFloat, loopPeriod));
        if (tickInt !== lastEmittedTickRef.current) {
            lastEmittedTickRef.current = tickInt;
            setCurrentTick(tickInt);
            setCurrentCycle(currentCycleValue);
            const lifecycleTicks = [
                ...new Set(cycleTicks.map((tick) => Math.floor(tick.rawTick))),
            ];
            const lifecycleEvents = lifecycleTicks.flatMap(
                (tick) => lifecycleByTickRef.current.get(tick) ?? [],
            );
            setCurrentLifecycleEvents(lifecycleEvents);
        }
        notify();
    }

    // ── 컨트롤 ─────────────────────────────────────────────────────────────
    const play = useCallback(() => {
        if (!manifest) return;
        playbackStartMsRef.current =
            performance.now() -
            pausedAtTickRef.current * tickDurationMsRef.current;
        setIsPlaying(true);
    }, [manifest]);

    const pause = useCallback(() => {
        if (!manifest) return;
        const now = performance.now();
        pausedAtTickRef.current =
            (now - playbackStartMsRef.current) / tickDurationMsRef.current;
        setIsPlaying(false);
    }, [manifest]);

    const seek = useCallback(
        (tick: number) => {
            if (!manifest) return;
            const clamped = Math.max(
                0,
                Math.min(tick, playbackLoopPeriodTicks(manifest, runId)),
            );
            pausedAtTickRef.current = clamped;
            playbackStartMsRef.current =
                performance.now() - clamped * tickDurationMsRef.current;
            // 즉시 한 프레임 반영
            emitFrame(clamped);
        },
        // emitFrame 은 컴포넌트 본체의 일반 함수 선언이라 매 렌더 새 참조다.
        // ref 들만 읽고 클로저 캡처가 없으므로 deps 에서 의도적으로 제외.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [manifest, runId],
    );

    const effectiveLoopPeriodTicks = manifest
        ? playbackLoopPeriodTicks(manifest, runId)
        : null;

    return useMemo(
        () => ({
            manifest,
            isReady,
            error,
            positionsRef,
            subscribe,
            currentTick,
            currentCycle,
            currentLifecycleEvents,
            effectiveLoopPeriodTicks,
            isPlaying,
            play,
            pause,
            seek,
            playbackStartMsRef,
            tickDurationMsRef,
            bufferedMovementsRef,
            bufferedLifecycleEventsRef,
            bufferedChunkVersion,
        }),
        [
            manifest,
            isReady,
            error,
            subscribe,
            currentTick,
            currentCycle,
            currentLifecycleEvents,
            effectiveLoopPeriodTicks,
            isPlaying,
            play,
            pause,
            seek,
            bufferedChunkVersion,
        ],
    );
}
