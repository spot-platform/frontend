'use client';

import { useEffect, useRef, useState } from 'react';
import type { GeoCoord } from '@/entities/spot/types';

type UseAnimatedCoordsOptions = {
    durationMs?: number;
};

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function coordsEqual(a: GeoCoord, b: GeoCoord): boolean {
    return a.lat === b.lat && a.lng === b.lng;
}

export function useAnimatedCoords(
    targets: Map<string, GeoCoord>,
    options?: UseAnimatedCoordsOptions,
): Map<string, GeoCoord> {
    const { durationMs = 1300 } = options ?? {};

    const [positions, setPositions] = useState<Map<string, GeoCoord>>(
        () => new Map(targets),
    );
    const currentPositions = useRef<Map<string, GeoCoord>>(new Map(targets));
    const animationFrames = useRef<Map<string, number>>(new Map());
    const pendingTargets = useRef<Map<string, GeoCoord>>(new Map());

    useEffect(() => {
        for (const [id, target] of targets) {
            const prevTarget = pendingTargets.current.get(id);
            if (prevTarget && coordsEqual(prevTarget, target)) continue;
            pendingTargets.current.set(id, target);

            const from = currentPositions.current.get(id);
            if (!from) {
                currentPositions.current.set(id, target);
                const seed = target;
                animationFrames.current.set(
                    id,
                    requestAnimationFrame(() => {
                        setPositions((prev) => {
                            const next = new Map(prev);
                            next.set(id, seed);
                            return next;
                        });
                    }),
                );
                continue;
            }
            if (coordsEqual(from, target)) continue;

            const existing = animationFrames.current.get(id);
            if (existing) cancelAnimationFrame(existing);

            const startTime = performance.now();
            const startFrom: GeoCoord = { lat: from.lat, lng: from.lng };

            const tick = (now: number) => {
                const elapsed = now - startTime;
                const rawT = Math.min(elapsed / durationMs, 1);
                const t = easeInOutCubic(rawT);
                const current: GeoCoord = {
                    lat: lerp(startFrom.lat, target.lat, t),
                    lng: lerp(startFrom.lng, target.lng, t),
                };
                currentPositions.current.set(id, current);
                setPositions((prev) => {
                    const next = new Map(prev);
                    next.set(id, current);
                    return next;
                });

                if (rawT < 1) {
                    animationFrames.current.set(
                        id,
                        requestAnimationFrame(tick),
                    );
                } else {
                    animationFrames.current.delete(id);
                }
            };

            animationFrames.current.set(id, requestAnimationFrame(tick));
        }
    }, [targets, durationMs]);

    useEffect(() => {
        const frames = animationFrames.current;
        return () => {
            for (const frameId of frames.values()) {
                cancelAnimationFrame(frameId);
            }
            frames.clear();
        };
    }, []);

    return positions;
}
