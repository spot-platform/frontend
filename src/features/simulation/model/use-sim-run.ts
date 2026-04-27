'use client';

// Sim run 재생 훅.
//
// 책임:
//   1) manifest + movement/lifecycle 청크를 mock-sim-api 로부터 로드(향후 real fetch 교체).
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
    PlaceMap,
    SimAgent,
    SimManifest,
} from '@/entities/spot/sim-stream-types';

import {
    DEMO_RUN_ID,
    fetchSimLifecycle,
    fetchSimManifest,
    fetchSimMovements,
} from '../mock/mock-sim-api';
import {
    buildAgentTimelines,
    homePosition,
    jitterAround,
    resolveAgentPosition,
} from './sim-clock';

export type UseSimRunOptions = {
    /** 재생할 run 식별자. mock 모드에서는 DEMO_RUN_ID 한정. */
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
    /** 현재 tick 에 발화한 lifecycle 이벤트들. 다음 emit 까지 동일. */
    currentLifecycleEvents: LifecycleEvent[];
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
};

const DEFAULT_EMIT_THROTTLE_MS = 200;
const DEFAULT_PREFETCH_AHEAD = 6;
const DEFAULT_DWELL_JITTER_M = 20;

export function useSimRun(options: UseSimRunOptions = {}): UseSimRunResult {
    const {
        runId = DEMO_RUN_ID,
        enabled = true,
        tickDurationMs,
        emitThrottleMs = DEFAULT_EMIT_THROTTLE_MS,
        dwellJitterM = DEFAULT_DWELL_JITTER_M,
        prefetchAheadTicks = DEFAULT_PREFETCH_AHEAD,
    } = options;

    const [manifest, setManifest] = useState<SimManifest | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [currentTick, setCurrentTick] = useState(0);
    const [currentLifecycleEvents, setCurrentLifecycleEvents] = useState<
        LifecycleEvent[]
    >([]);
    const [isPlaying, setIsPlaying] = useState(false);

    // ── refs (rAF 루프가 직접 참조) ────────────────────────────────────────
    const positionsRef = useRef<Map<string, GeoCoord>>(new Map());
    const subscribersRef = useRef<Set<() => void>>(new Set());

    const placeMapRef = useRef<PlaceMap>(new Map());
    const agentsRef = useRef<SimAgent[]>([]);
    const timelinesRef = useRef<AgentTimelineMap>(new Map());
    const lifecycleByTickRef = useRef<Map<number, LifecycleEvent[]>>(new Map());
    const loadedWindowRef = useRef<{ from: number; to: number } | null>(null);
    const inflightChunkRef = useRef<Promise<void> | null>(null);

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
        if (!enabled) return;
        let mounted = true;
        setIsReady(false);
        setError(null);

        (async () => {
            try {
                const m = await fetchSimManifest(runId);
                if (!mounted) return;
                setManifest(m);
                tickDurationMsRef.current =
                    tickDurationMs ?? m.tick_duration_ms_default;
                placeMapRef.current = new Map(
                    m.places.map((p) => [p.place_id, p] as const),
                );
                agentsRef.current = m.agents;

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
                await loadChunk(
                    0,
                    Math.min(m.chunk_size_ticks, m.total_ticks),
                    runId,
                );
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

    // ── 청크 로더 ──────────────────────────────────────────────────────────
    async function loadChunk(
        from: number,
        to: number,
        rid: string,
    ): Promise<void> {
        const [moveChunk, lifeChunk] = await Promise.all([
            fetchSimMovements(rid, from, to),
            fetchSimLifecycle(rid, from, to),
        ]);

        timelinesRef.current = buildAgentTimelines(
            moveChunk.movements,
            timelinesRef.current,
        );

        const lcMap = lifecycleByTickRef.current;
        for (const ev of lifeChunk.events) {
            const arr = lcMap.get(ev.tick);
            if (arr) arr.push(ev);
            else lcMap.set(ev.tick, [ev]);
        }

        loadedWindowRef.current = loadedWindowRef.current
            ? { from: loadedWindowRef.current.from, to }
            : { from, to };
    }

    function maybePrefetch(tFloat: number, m: SimManifest, rid: string): void {
        const w = loadedWindowRef.current;
        if (!w) return;
        if (w.to >= m.total_ticks) return;
        if (inflightChunkRef.current) return;
        if (tFloat < w.to - prefetchAheadTicks) return;

        const nextFrom = w.to;
        const nextTo = Math.min(nextFrom + m.chunk_size_ticks, m.total_ticks);
        inflightChunkRef.current = loadChunk(nextFrom, nextTo, rid)
            .catch((e) => {
                setError(e instanceof Error ? e : new Error(String(e)));
            })
            .finally(() => {
                inflightChunkRef.current = null;
            });
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
            const clamped = Math.min(tFloat, manifest.total_ticks - 0.0001);

            if (now - lastEmitMs >= emitThrottleMs) {
                lastEmitMs = now;
                emitFrame(clamped);
            }

            maybePrefetch(clamped, manifest, runId);

            // 재생 종료
            if (tFloat >= manifest.total_ticks) {
                pausedAtTickRef.current = manifest.total_ticks;
                setIsPlaying(false);
                return;
            }
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

        for (const a of agents) {
            if (a.agent_role === 'background') {
                // 서버 movement 가 없는 background 는 시각화에서 제외(어댑터에서 hide).
                continue;
            }
            const tl = timelines.get(a.agent_id);

            // 대기 상태 정의:
            //   - timeline 비었음 → 항상 대기
            //   - 첫 movement 전 (tFloat < first.depart_tick) → 대기
            //   - 마지막 movement 가 go_home 이고 도착 완료 → 다시 대기(귀가)
            // 대기 중인 agent 는 positionsRef 에서 좌표를 제거해 마커 자체를 hide.
            const isIdle =
                !tl ||
                tl.length === 0 ||
                tFloat < tl[0].depart_tick ||
                (tl[tl.length - 1].reason === 'go_home' &&
                    tFloat >= tl[tl.length - 1].arrive_tick);

            if (isIdle) {
                next.delete(a.agent_id);
                continue;
            }

            const pos = resolveAgentPosition(a, timelines, tFloat, placeMap);
            if (!pos) continue;
            // spot 도착 후 dwell 은 잔잔한 jitter 만(움직이지 않는 모임 멤버 표현).
            const isDwell =
                !tl ||
                tl.length === 0 ||
                tl[tl.length - 1].arrive_tick <= tFloat;
            next.set(
                a.agent_id,
                isDwell && dwellJitterM > 0
                    ? jitterAround(
                          pos,
                          a.agent_id + ':' + Math.floor(tFloat),
                          dwellJitterM,
                      )
                    : pos,
            );
        }

        const tickInt = Math.floor(tFloat);
        if (tickInt !== lastEmittedTickRef.current) {
            lastEmittedTickRef.current = tickInt;
            setCurrentTick(tickInt);
            const lc = lifecycleByTickRef.current.get(tickInt) ?? [];
            setCurrentLifecycleEvents(lc);
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
            const clamped = Math.max(0, Math.min(tick, manifest.total_ticks));
            pausedAtTickRef.current = clamped;
            playbackStartMsRef.current =
                performance.now() - clamped * tickDurationMsRef.current;
            // 즉시 한 프레임 반영
            emitFrame(clamped);
        },
        [manifest],
    );

    return useMemo(
        () => ({
            manifest,
            isReady,
            error,
            positionsRef,
            subscribe,
            currentTick,
            currentLifecycleEvents,
            isPlaying,
            play,
            pause,
            seek,
            playbackStartMsRef,
            tickDurationMsRef,
        }),
        [
            manifest,
            isReady,
            error,
            subscribe,
            currentTick,
            currentLifecycleEvents,
            isPlaying,
            play,
            pause,
            seek,
        ],
    );
}
