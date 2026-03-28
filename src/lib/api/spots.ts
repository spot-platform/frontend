import { apiClient } from './client';
import type { Spot, SpotDetail, PagedResponse } from '@/types/api';

export type SpotListParams = {
    type?: 'OFFER' | 'REQUEST';
    status?: 'OPEN';
    page?: number;
    size?: number;
};

export type CreateSpotPayload = {
    type: 'OFFER' | 'REQUEST';
    title: string;
    description: string;
    pointCost: number;
};

export const spotsApi = {
    list: (params?: SpotListParams) =>
        apiClient
            .get('spots', {
                searchParams: params as Record<string, string | number>,
            })
            .json<PagedResponse<Spot>>(),

    get: (id: string) =>
        apiClient.get(`spots/${id}`).json<{ data: SpotDetail }>(),

    create: (payload: CreateSpotPayload) =>
        apiClient.post('spots', { json: payload }).json<{ data: Spot }>(),

    match: (id: string) =>
        apiClient.post(`spots/${id}/match`).json<{ data: Spot }>(),

    cancel: (id: string) =>
        apiClient.post(`spots/${id}/cancel`).json<{ data: Spot }>(),
};
