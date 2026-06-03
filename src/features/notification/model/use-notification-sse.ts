'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { backendProxyEndpoint, endpoints } from '@/lib/endpoint';
import { notificationKeys } from './use-notifications';

type UseNotificationSSEOptions = {
    enabled?: boolean;
};

const BASE_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

export function useNotificationSSE({
    enabled = true,
}: UseNotificationSSEOptions = {}) {
    const queryClient = useQueryClient();
    const queryClientRef = useRef(queryClient);

    useEffect(() => {
        queryClientRef.current = queryClient;
    }, [queryClient]);

    useEffect(() => {
        if (!enabled || typeof EventSource === 'undefined') return;

        let es: EventSource | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let reconnectAttempts = 0;
        let closed = false;

        const clearReconnectTimer = () => {
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
        };

        const connect = () => {
            clearReconnectTimer();
            es?.close();

            es = new EventSource(
                backendProxyEndpoint(endpoints.notifications.subscribe),
            );

            es.addEventListener('open', () => {
                reconnectAttempts = 0;
            });

            es.addEventListener('notification', () => {
                queryClientRef.current.invalidateQueries({
                    queryKey: notificationKeys.all,
                });
            });

            es.addEventListener('ping', () => {
                // keep-alive 이벤트는 연결 유지용이므로 별도 처리하지 않는다.
            });

            es.addEventListener('error', () => {
                if (
                    closed ||
                    reconnectTimer ||
                    !es ||
                    es.readyState !== EventSource.CLOSED
                ) {
                    return;
                }

                const delay = Math.min(
                    BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempts,
                    MAX_RECONNECT_DELAY_MS,
                );
                reconnectAttempts += 1;
                reconnectTimer = setTimeout(connect, delay);
            });
        };

        connect();

        return () => {
            closed = true;
            clearReconnectTimer();
            es?.close();
        };
    }, [enabled]);
}
