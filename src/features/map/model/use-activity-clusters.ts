'use client';

import { useDeferredValue, useEffect, useRef, useState } from 'react';
import type { Persona } from '@/entities/persona/types';
import type { GeoCoord } from '@/entities/spot/types';
import { clusterPersonas } from './cluster-personas';
import type { ActivityCluster, ClusterInput } from './types';

export type UseActivityClustersOptions = {
    radiusMeters?: number;
    throttleMs?: number;
    /** 클러스터 소멸 시 exit 애니를 유지할 시간. 이후 배열에서 제거됨. */
    deathAnimMs?: number;
};

const DEFAULT_THROTTLE_MS = 500;
const DEFAULT_DEATH_ANIM_MS = 600;

function buildInputs(
    personas: Persona[],
    positions: Map<string, GeoCoord>,
): ClusterInput[] {
    const inputs: ClusterInput[] = [];
    for (const persona of personas) {
        const coord = positions.get(persona.id) ?? persona.initialCoord;
        inputs.push({
            id: persona.id,
            coord,
            category: persona.category,
            intent: persona.intent,
            emoji: persona.emoji,
            name: persona.name,
        });
    }
    return inputs;
}

export function useActivityClusters(
    personas: Persona[],
    positions: Map<string, GeoCoord>,
    options?: UseActivityClustersOptions,
): ActivityCluster[] {
    const throttleMs = options?.throttleMs ?? DEFAULT_THROTTLE_MS;
    const deathAnimMs = options?.deathAnimMs ?? DEFAULT_DEATH_ANIM_MS;
    const radiusMeters = options?.radiusMeters;

    const deferredPositions = useDeferredValue(positions);

    const [clusters, setClusters] = useState<ActivityCluster[]>(() =>
        clusterPersonas(buildInputs(personas, positions), { radiusMeters }),
    );

    const lastRunAt = useRef<number>(0);
    const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const deathTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
        new Map(),
    );

    useEffect(() => {
        const compute = () => {
            const nextClusters = clusterPersonas(
                buildInputs(personas, deferredPositions),
                { radiusMeters },
            );
            const nextIds = new Set(nextClusters.map((c) => c.id));

            // 되살아난 클러스터: 진행 중이던 death 타이머 취소.
            for (const id of nextIds) {
                const t = deathTimersRef.current.get(id);
                if (t !== undefined) {
                    clearTimeout(t);
                    deathTimersRef.current.delete(id);
                }
            }

            setClusters((prev) => {
                const prevAliveIds = new Set(
                    prev.filter((c) => !c.isDying).map((c) => c.id),
                );
                const alive: ActivityCluster[] = nextClusters.map((c) => ({
                    ...c,
                    isPulse: !prevAliveIds.has(c.id),
                }));

                const newlyDying: ActivityCluster[] = prev
                    .filter((c) => !c.isDying && !nextIds.has(c.id))
                    .map((c) => ({ ...c, isDying: true, isPulse: false }));

                const stillDying = prev.filter(
                    (c) => c.isDying && !nextIds.has(c.id),
                );

                for (const d of newlyDying) {
                    if (deathTimersRef.current.has(d.id)) continue;
                    const timerId = setTimeout(() => {
                        setClusters((cs) => cs.filter((x) => x.id !== d.id));
                        deathTimersRef.current.delete(d.id);
                    }, deathAnimMs);
                    deathTimersRef.current.set(d.id, timerId);
                }

                return [...alive, ...stillDying, ...newlyDying];
            });
            lastRunAt.current = Date.now();
        };

        const now = Date.now();
        const elapsed = now - lastRunAt.current;

        if (pendingTimerRef.current !== null) {
            clearTimeout(pendingTimerRef.current);
            pendingTimerRef.current = null;
        }

        if (elapsed >= throttleMs) {
            compute();
        } else {
            const remaining = throttleMs - elapsed;
            pendingTimerRef.current = setTimeout(() => {
                pendingTimerRef.current = null;
                compute();
            }, remaining);
        }

        return () => {
            if (pendingTimerRef.current !== null) {
                clearTimeout(pendingTimerRef.current);
                pendingTimerRef.current = null;
            }
        };
    }, [personas, deferredPositions, throttleMs, radiusMeters, deathAnimMs]);

    useEffect(() => {
        const timers = deathTimersRef.current;
        return () => {
            for (const t of timers.values()) clearTimeout(t);
            timers.clear();
        };
    }, []);

    return clusters;
}
