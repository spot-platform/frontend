import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SubmitSettlementPayload } from '@/entities/spot/types';
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
    participants: (id: string) =>
        [...spotKeys.detail(id), 'participants'] as const,
    schedule: (id: string) => [...spotKeys.detail(id), 'schedule'] as const,
    votes: (id: string) => [...spotKeys.detail(id), 'votes'] as const,
    checklist: (id: string) => [...spotKeys.detail(id), 'checklist'] as const,
    files: (id: string) => [...spotKeys.detail(id), 'files'] as const,
    notes: (id: string) => [...spotKeys.detail(id), 'notes'] as const,
    reviews: (id: string) => [...spotKeys.detail(id), 'reviews'] as const,
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

export function useSpotParticipants(id: string) {
    return useQuery({
        queryKey: spotKeys.participants(id),
        queryFn: () => spotsApi.getParticipants(id),
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

export function useCompleteSpot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => spotsApi.complete(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: spotKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: spotKeys.lists() });
        },
    });
}

export function useSubmitSpotSettlement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: SubmitSettlementPayload;
        }) => spotsApi.submitSettlement(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: spotKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: spotKeys.lists() });
        },
    });
}

export function useApproveSpotSettlement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => spotsApi.approveSettlement(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: spotKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: spotKeys.lists() });
        },
    });
}
