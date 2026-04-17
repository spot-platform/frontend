'use client';

// SSE 기반 TimelineFrame 구독 훅. mockFrames 주입 시 EventSource 생성 없이 setInterval로 순차 방출.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TimelineFrame } from '@/entities/spot/simulation-types';

export type UseTimelineStreamOptions = {
    runId: string;
    enabled?: boolean;
    mockFrames?: TimelineFrame[];
    mockIntervalMs?: number;
    onFrame?: (frame: TimelineFrame) => void;
};

export type UseTimelineStreamResult = {
    currentFrame: TimelineFrame | null;
    isConnected: boolean;
    error: Error | null;
    disconnect: () => void;
};

const DEFAULT_MOCK_INTERVAL_MS = 1500;

export function useTimelineStream(
    options: UseTimelineStreamOptions,
): UseTimelineStreamResult {
    const {
        runId,
        enabled = true,
        mockFrames,
        mockIntervalMs = DEFAULT_MOCK_INTERVAL_MS,
        onFrame,
    } = options;

    const [currentFrame, setCurrentFrame] = useState<TimelineFrame | null>(
        null,
    );
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const onFrameRef = useRef(onFrame);
    useEffect(() => {
        onFrameRef.current = onFrame;
    }, [onFrame]);

    const sourceRef = useRef<EventSource | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const disconnect = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.close();
            sourceRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsConnected(false);
    }, []);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        if (mockFrames && mockFrames.length > 0) {
            let idx = 0;
            let mounted = true;

            const emit = () => {
                if (!mounted) return;
                const frame = mockFrames[idx % mockFrames.length];
                setCurrentFrame(frame);
                onFrameRef.current?.(frame);
                idx += 1;
            };

            const openTimer = setTimeout(() => {
                if (!mounted) return;
                setIsConnected(true);
                setError(null);
                emit();
            }, 0);
            const id = setInterval(emit, mockIntervalMs);
            intervalRef.current = id;

            return () => {
                mounted = false;
                clearTimeout(openTimer);
                clearInterval(id);
                if (intervalRef.current === id) {
                    intervalRef.current = null;
                }
                setIsConnected(false);
            };
        }

        if (
            typeof window === 'undefined' ||
            typeof EventSource === 'undefined'
        ) {
            return;
        }

        const url = `/api/v1/simulation/runs/${runId}/timeline/stream`;
        const source = new EventSource(url);
        sourceRef.current = source;
        const resetErrorTimer = setTimeout(() => setError(null), 0);

        const handleOpen = () => {
            setIsConnected(true);
        };

        const handleMessage = (event: MessageEvent<string>) => {
            try {
                const frame = JSON.parse(event.data) as TimelineFrame;
                setCurrentFrame(frame);
                onFrameRef.current?.(frame);
            } catch (parseErr) {
                setError(
                    parseErr instanceof Error
                        ? parseErr
                        : new Error('Failed to parse TimelineFrame'),
                );
            }
        };

        const handleError = () => {
            setIsConnected(false);
            setError(new Error(`SSE connection error on ${url}`));
        };

        source.addEventListener('open', handleOpen);
        source.addEventListener('message', handleMessage);
        source.addEventListener('error', handleError);

        return () => {
            clearTimeout(resetErrorTimer);
            source.removeEventListener('open', handleOpen);
            source.removeEventListener('message', handleMessage);
            source.removeEventListener('error', handleError);
            source.close();
            if (sourceRef.current === source) {
                sourceRef.current = null;
            }
            setIsConnected(false);
        };
    }, [runId, enabled, mockFrames, mockIntervalMs]);

    return { currentFrame, isConnected, error, disconnect };
}
