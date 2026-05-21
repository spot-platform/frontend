'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification-api';

export const notificationKeys = {
    all: ['notifications'] as const,
    list: (page = 0, size = 20) =>
        [...notificationKeys.all, 'list', page, size] as const,
};

export function useNotifications(page = 0, size = 20) {
    return useQuery({
        queryKey: notificationKeys.list(page, size),
        queryFn: () => notificationApi.list({ page, size }),
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notificationId: string) =>
            notificationApi.markAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => notificationApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}
