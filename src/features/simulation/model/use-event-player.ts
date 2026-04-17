'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeoCoord, SpotMapItem, SpotStatus } from '@/entities/spot/types';
import type { TimedMapEvent } from './types';

type UseEventPlayerReturn = {
    isPlaying: boolean;
    currentIndex: number;
    totalEvents: number;
    speed: number;
    spots: SpotMapItem[];
    personaTargets: Map<string, GeoCoord>;
    spotStatuses: Map<string, SpotStatus>;
    togglePlayPause: () => void;
    setSpeed: (speed: number) => void;
    reset: () => void;
};

export function useEventPlayer(events: TimedMapEvent[]): UseEventPlayerReturn {
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [spots, setSpots] = useState<SpotMapItem[]>([]);
    const [personaTargets, setPersonaTargets] = useState<Map<string, GeoCoord>>(
        () => new Map(),
    );
    const [spotStatuses, setSpotStatuses] = useState<Map<string, SpotStatus>>(
        () => new Map(),
    );
    const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
    const playingRef = useRef(isPlaying);
    const speedRef = useRef(speed);

    useEffect(() => {
        playingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        speedRef.current = speed;
    }, [speed]);

    const clearTimeouts = useCallback(() => {
        for (const t of timeouts.current) clearTimeout(t);
        timeouts.current = [];
    }, []);

    const processEvent = useCallback((event: TimedMapEvent['event']) => {
        switch (event.type) {
            case 'SPOT_CREATED':
                setSpots((prev) => [...prev, event.spot]);
                setSpotStatuses((prev) => {
                    const next = new Map(prev);
                    next.set(event.spot.id, event.spot.status);
                    return next;
                });
                break;

            case 'PERSONA_MOVE':
                setPersonaTargets((prev) => {
                    const next = new Map(prev);
                    next.set(event.personaId, event.targetCoord);
                    return next;
                });
                break;

            case 'PERSONA_JOIN': {
                const spotId = event.spotId;
                setSpots((prev) => {
                    const spot = prev.find((s) => s.id === spotId);
                    if (spot) {
                        setPersonaTargets((pt) => {
                            const next = new Map(pt);
                            next.set(event.personaId, spot.coord);
                            return next;
                        });
                    }
                    return prev;
                });
                break;
            }

            case 'SPOT_MATCHED':
                setSpotStatuses((prev) => {
                    const next = new Map(prev);
                    next.set(event.spotId, 'MATCHED');
                    return next;
                });
                break;
        }
    }, []);

    const scheduleEvents = useCallback(() => {
        if (events.length === 0) return;

        clearTimeouts();
        const baseTime = events[0].timestampMs;

        for (let i = 0; i < events.length; i++) {
            const delay = (events[i].timestampMs - baseTime) / speedRef.current;
            const idx = i;
            const timeout = setTimeout(() => {
                if (!playingRef.current) return;
                processEvent(events[idx].event);
                setCurrentIndex(idx);
                if (idx === events.length - 1) {
                    setIsPlaying(false);
                }
            }, delay);
            timeouts.current.push(timeout);
        }
    }, [events, clearTimeouts, processEvent]);

    useEffect(() => {
        if (isPlaying) {
            scheduleEvents();
        } else {
            clearTimeouts();
        }
        return clearTimeouts;
    }, [isPlaying, speed, scheduleEvents, clearTimeouts]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying((p) => !p);
    }, []);

    const reset = useCallback(() => {
        clearTimeouts();
        setCurrentIndex(0);
        setSpots([]);
        setPersonaTargets(new Map());
        setSpotStatuses(new Map());
        setIsPlaying(true);
    }, [clearTimeouts]);

    return {
        isPlaying,
        currentIndex,
        totalEvents: events.length,
        speed,
        spots,
        personaTargets,
        spotStatuses,
        togglePlayPause,
        setSpeed,
        reset,
    };
}
