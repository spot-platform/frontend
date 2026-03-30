import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    spotsApi,
    type SpotListParams,
    type CreateSpotPayload,
} from '../api/spot-api';

export const spotKeys = {
    all: ['spots'] as const,
    lists: () => [...spotKeys.all, 'list'] as const,
    list: (params: SpotListParams) => [...spotKeys.lists(), params] as const,
    details: () => [...spotKeys.all, 'detail'] as const,
    detail: (id: string) => [...spotKeys.details(), id] as const,
};

export function useSpotList(params?: SpotListParams) {
    return useQuery({
        queryKey: spotKeys.list(params ?? {}),
        queryFn: () => spotsApi.list(params),
    });
}

export function useSpotDetail(id: string) {
    return useQuery({
        queryKey: spotKeys.detail(id),
        queryFn: () => spotsApi.get(id),
        enabled: Boolean(id),
    });
}

export function useCreateSpot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateSpotPayload) => spotsApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: spotKeys.lists() });
        },
    });
}

export function useMatchSpot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => spotsApi.match(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: spotKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: spotKeys.lists() });
        },
    });
}

export function useCancelSpot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => spotsApi.cancel(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: spotKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: spotKeys.lists() });
        },
    });
}
