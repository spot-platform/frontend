'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeoCoord } from '@/entities/spot/types';
import type { Persona } from '@/entities/persona/types';

type UsePersonaMovementOptions = {
    intervalMs?: number;
    durationMs?: number;
};

type UsePersonaMovementReturn = {
    positions: Map<string, GeoCoord>;
};

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function usePersonaMovement(
    personas: Persona[],
    waypoints: Map<string, GeoCoord[]>,
    options?: UsePersonaMovementOptions,
): UsePersonaMovementReturn {
    const { intervalMs = 4000, durationMs = 2000 } = options ?? {};

    const [positions, setPositions] = useState<Map<string, GeoCoord>>(() => {
        const initial = new Map<string, GeoCoord>();
        for (const p of personas) {
            initial.set(p.id, p.initialCoord);
        }
        return initial;
    });

    const waypointIndices = useRef<Map<string, number>>(new Map());
    const animationFrames = useRef<Map<string, number>>(new Map());

    const animateMove = useCallback(
        (personaId: string, from: GeoCoord, to: GeoCoord) => {
            const existing = animationFrames.current.get(personaId);
            if (existing) cancelAnimationFrame(existing);

            const startTime = performance.now();

            const tick = (now: number) => {
                const elapsed = now - startTime;
                const rawT = Math.min(elapsed / durationMs, 1);
                const t = easeInOutCubic(rawT);

                const current: GeoCoord = {
                    lat: lerp(from.lat, to.lat, t),
                    lng: lerp(from.lng, to.lng, t),
                };

                setPositions((prev) => {
                    const next = new Map(prev);
                    next.set(personaId, current);
                    return next;
                });

                if (rawT < 1) {
                    animationFrames.current.set(
                        personaId,
                        requestAnimationFrame(tick),
                    );
                } else {
                    animationFrames.current.delete(personaId);
                }
            };

            animationFrames.current.set(personaId, requestAnimationFrame(tick));
        },
        [durationMs],
    );

    useEffect(() => {
        const timer = setInterval(() => {
            for (const persona of personas) {
                const wps = waypoints.get(persona.id);
                if (!wps || wps.length < 2) continue;

                const currentIdx = waypointIndices.current.get(persona.id) ?? 0;
                const nextIdx = (currentIdx + 1) % wps.length;
                waypointIndices.current.set(persona.id, nextIdx);

                const from = wps[currentIdx];
                const to = wps[nextIdx];
                animateMove(persona.id, from, to);
            }
        }, intervalMs);

        const frames = animationFrames.current;
        return () => {
            clearInterval(timer);
            for (const frameId of frames.values()) {
                cancelAnimationFrame(frameId);
            }
            frames.clear();
        };
    }, [personas, waypoints, intervalMs, animateMove]);

    return { positions };
}
