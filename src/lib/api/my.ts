import { apiClient } from './client';
import type { UserProfile, Participation, PagedResponse } from '@/types/api';

export const myApi = {
    profile: () => apiClient.get('users/me').json<{ data: UserProfile }>(),

    participations: (params?: { page?: number; size?: number }) =>
        apiClient
            .get('users/me/participations', {
                searchParams: params as Record<string, number>,
            })
            .json<PagedResponse<Participation>>(),

    updateProfile: (payload: { nickname?: string }) =>
        apiClient
            .patch('users/me', { json: payload })
            .json<{ data: UserProfile }>(),
};
