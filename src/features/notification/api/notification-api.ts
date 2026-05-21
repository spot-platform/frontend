import { buildQueryString, clientApiFetch } from '@/lib/client-api';
import { endpoints } from '@/lib/endpoint';
import type { PagedResponse } from '@/entities/spot/types';

export type NotificationItem = {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
};

type NotificationPageResponse = {
    content?: NotificationItem[];
    number?: number;
    size?: number;
    totalElements?: number;
    last?: boolean;
};

export const notificationApi = {
    list: async (params: { page?: number; size?: number } = {}) => {
        const page = await clientApiFetch<NotificationPageResponse>(
            `${endpoints.notifications.root}${buildQueryString({
                page: params.page ?? 0,
                size: params.size ?? 20,
            })}`,
        );

        return {
            data: page.content ?? [],
            meta: {
                page: page.number ?? params.page ?? 0,
                size: page.size ?? params.size ?? 20,
                total: page.totalElements ?? page.content?.length ?? 0,
                hasNext: page.last === false,
            },
        } satisfies PagedResponse<NotificationItem>;
    },

    markAsRead: (notificationId: string) =>
        clientApiFetch<void>(endpoints.notifications.read(notificationId), {
            method: 'POST',
        }),

    markAllAsRead: () =>
        clientApiFetch<void>(endpoints.notifications.readAll, {
            method: 'POST',
        }),
};
