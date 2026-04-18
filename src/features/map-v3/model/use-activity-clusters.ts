'use client';

import { useDeferredValue, useEffect, useRef, useState } from 'react';
import type { Persona } from '@/entities/persona/types';
import type { GeoCoord } from '@/entities/spot/types';
import { clusterPersonas } from './cluster-personas';
import type { ActivityCluster, ClusterInput } from './types';

export type UseActivityClustersOptions = {
    radiusMeters?: number;
    throttleMs?: number;
};

const DEFAULT_THROTTLE_MS = 500;

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
    const radiusMeters = options?.radiusMeters;

    const deferredPositions = useDeferredValue(positions);

    const [clusters, setClusters] = useState<ActivityCluster[]>(() => {
        const initial = clusterPersonas(buildInputs(personas, positions), {
            radiusMeters,
        });
        return initial;
    });

    const lastRunAt = useRef<number>(0);
    const prevIdsRef = useRef<Set<string>>(new Set(clusters.map((c) => c.id)));
    const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const compute = () => {
            const nextClusters = clusterPersonas(
                buildInputs(personas, deferredPositions),
                { radiusMeters },
            );
            const prevIds = prevIdsRef.current;
            const withPulse = nextClusters.map((c) => ({
                ...c,
                isPulse: !prevIds.has(c.id),
            }));
            prevIdsRef.current = new Set(nextClusters.map((c) => c.id));
            lastRunAt.current = Date.now();
            setClusters(withPulse);
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
    }, [personas, deferredPositions, throttleMs, radiusMeters]);

    return clusters;
}
