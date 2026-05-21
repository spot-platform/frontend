import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payKeys } from '@/features/pay';
import {
    feedApi,
    type FeedApplyPayload,
    type FeedListParams,
} from '../api/feed-api';

export const feedKeys = {
    all: ['feed'] as const,
    lists: () => [...feedKeys.all, 'list'] as const,
    list: (params?: FeedListParams) =>
        [...feedKeys.lists(), params ?? {}] as const,
    details: () => [...feedKeys.all, 'detail'] as const,
    detail: (id: string) => [...feedKeys.details(), id] as const,
    applications: (feedId: string) =>
        [...feedKeys.detail(feedId), 'applications'] as const,
};

export function useFeedList(params?: FeedListParams) {
    return useQuery({
        queryKey: feedKeys.list(params),
        queryFn: () => feedApi.list(params),
    });
}

export function useFeedApplications(feedId: string, enabled: boolean) {
    return useQuery({
        queryKey: feedKeys.applications(feedId),
        queryFn: () => feedApi.applications(feedId),
        enabled,
    });
}

export function useApplyFeed() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            feedId,
            payload,
        }: {
            feedId: string;
            payload: FeedApplyPayload;
        }) => feedApi.apply(feedId, payload),
        onSuccess: (_, { feedId }) => {
            queryClient.invalidateQueries({
                queryKey: feedKeys.detail(feedId),
            });
            queryClient.invalidateQueries({ queryKey: payKeys.balance });
            queryClient.invalidateQueries({ queryKey: ['pay', 'history'] });
        },
    });
}

export function useCancelFeedApplication() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (feedId: string) => feedApi.cancelApply(feedId),
        onSuccess: (_, feedId) => {
            queryClient.invalidateQueries({
                queryKey: feedKeys.detail(feedId),
            });
            queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
            queryClient.invalidateQueries({ queryKey: payKeys.balance });
            queryClient.invalidateQueries({ queryKey: ['pay', 'history'] });
        },
    });
}

export function useToggleFeedBookmark() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            feedId,
            bookmarked,
        }: {
            feedId: string;
            bookmarked: boolean;
        }) =>
            bookmarked
                ? feedApi.removeBookmark(feedId)
                : feedApi.addBookmark(feedId),
        onSuccess: (_, { feedId }) => {
            queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: feedKeys.detail(feedId),
            });
        },
    });
}

export function useAcceptFeedApplication() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            feedId,
            applicationId,
        }: {
            feedId: string;
            applicationId: string;
        }) => feedApi.acceptApplication(feedId, applicationId),
        onSuccess: (_, { feedId }) => {
            queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: feedKeys.detail(feedId),
            });
        },
    });
}

export function useRejectFeedApplication() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            feedId,
            applicationId,
        }: {
            feedId: string;
            applicationId: string;
        }) => feedApi.rejectApplication(feedId, applicationId),
        onSuccess: (_, { feedId }) => {
            queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: feedKeys.detail(feedId),
            });
        },
    });
}
