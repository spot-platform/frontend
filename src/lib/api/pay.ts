import { apiClient } from './client';
import type {
    PointBalance,
    PointTransaction,
    PagedResponse,
} from '@/types/api';

export const payApi = {
    balance: () =>
        apiClient.get('points/balance').json<{ data: PointBalance }>(),

    history: (params?: { page?: number; size?: number }) =>
        apiClient
            .get('points/history', {
                searchParams: params as Record<string, number>,
            })
            .json<PagedResponse<PointTransaction>>(),

    charge: (amount: number) =>
        apiClient
            .post('points/charge', { json: { amount } })
            .json<{ data: PointBalance }>(),
};
