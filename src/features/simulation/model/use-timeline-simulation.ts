'use client';

// TimelineFrame SSE 스트림을 맵 상태(spots / personaTargets / spotStatuses)로 리듀스.
// useEventPlayer와 동일한 출력 shape을 제공해 MapPageClient에서 교체 가능하게 한다.

import { useCallback, useState } from 'react';
import type { GeoCoord, SpotMapItem, SpotStatus } from '@/entities/spot/types';
import type { TimelineFrame } from '@/entities/spot/simulation-types';
import { useTimelineStream } from './use-timeline-stream';
import { timelineFrameToMapEvents } from './timeline-frame-adapter';
import type { MapEvent } from './types';

export type UseTimelineSimulationOptions = {
    runId: string;
    enabled?: boolean;
    mockFrames?: TimelineFrame[];
    mockIntervalMs?: number;
};

export type UseTimelineSimulationResult = {
    spots: SpotMapItem[];
    personaTargets: Map<string, GeoCoord>;
    spotStatuses: Map<string, SpotStatus>;
    currentFrame: TimelineFrame | null;
    isConnected: boolean;
    error: Error | null;
};

export function useTimelineSimulation(
    options: UseTimelineSimulationOptions,
): UseTimelineSimulationResult {
    const [spots, setSpots] = useState<SpotMapItem[]>([]);
    const [personaTargets, setPersonaTargets] = useState<Map<string, GeoCoord>>(
        () => new Map(),
    );
    const [spotStatuses, setSpotStatuses] = useState<Map<string, SpotStatus>>(
        () => new Map(),
    );

    const applyMapEvent = useCallback((event: MapEvent) => {
        switch (event.type) {
            case 'SPOT_CREATED': {
                const incoming = event.spot;
                setSpots((prev) => {
                    if (prev.some((s) => s.id === incoming.id)) return prev;
                    return [...prev, incoming];
                });
                setSpotStatuses((prev) => {
                    const next = new Map(prev);
                    next.set(incoming.id, incoming.status);
                    return next;
                });
                break;
            }

            case 'PERSONA_MOVE':
                setPersonaTargets((prev) => {
                    const next = new Map(prev);
                    next.set(event.personaId, event.targetCoord);
                    return next;
                });
                break;

            case 'PERSONA_JOIN': {
                // 최신 spots snapshot은 setSpots updater 안에서만 접근.
                // 여기서 spot을 조회해 setPersonaTargets를 동시 갱신.
                setSpots((prev) => {
                    const target = prev.find((s) => s.id === event.spotId);
                    if (target) {
                        setPersonaTargets((pt) => {
                            const next = new Map(pt);
                            next.set(event.personaId, target.coord);
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

    const handleFrame = useCallback(
        (frame: TimelineFrame) => {
            const events = timelineFrameToMapEvents(frame);
            for (const ev of events) applyMapEvent(ev);

            setPersonaTargets((prev) => {
                const next = new Map(prev);
                for (const agent of frame.active_agents) {
                    next.set(agent.agent_id, agent.location);
                }
                return next;
            });

            setSpotStatuses((prev) => {
                const next = new Map(prev);
                for (const spot of frame.active_spots) {
                    next.set(spot.spot_id, spot.status);
                }
                return next;
            });
        },
        [applyMapEvent],
    );

    const { currentFrame, isConnected, error } = useTimelineStream({
        runId: options.runId,
        enabled: options.enabled,
        mockFrames: options.mockFrames,
        mockIntervalMs: options.mockIntervalMs,
        onFrame: handleFrame,
    });

    return {
        spots,
        personaTargets,
        spotStatuses,
        currentFrame,
        isConnected,
        error,
    };
}
