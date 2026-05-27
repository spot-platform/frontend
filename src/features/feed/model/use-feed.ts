import { useMemo } from 'react';
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { payKeys } from '@/features/pay';
import {
    feedApi,
    type FeedApplyPayload,
    type FeedListParams,
} from '../api/feed-api';
import { useLayerStore } from '@/features/layer/model/use-layer-store';
import { getFeedListIsAiParamByLayer } from './feed-layer-filter';

export const feedKeys = {
    all: ['feed'] as const,
    lists: () => [...feedKeys.all, 'list'] as const,
    list: (params?: FeedListParams) =>
        [...feedKeys.lists(), params ?? {}] as const,
    infiniteList: (params?: FeedListParams) =>
        [...feedKeys.lists(), 'infinite', params ?? {}] as const,
    details: () => [...feedKeys.all, 'detail'] as const,
    detail: (id: string) => [...feedKeys.details(), id] as const,
    applications: (feedId: string) =>
        [...feedKeys.detail(feedId), 'applications'] as const,
};

const DEFAULT_FEED_PAGE_SIZE = 10;

function getNextFeedPageParam(
    lastPage: Awaited<ReturnType<typeof feedApi.list>>,
): number | undefined {
    const currentPage = lastPage.meta?.page ?? 0;
    const pageSize = lastPage.meta?.size ?? DEFAULT_FEED_PAGE_SIZE;
    const total = lastPage.meta?.total;

    if (lastPage.meta?.hasNext === true) {
        return currentPage + 1;
    }

    if (lastPage.meta?.hasNext === false) {
        return undefined;
    }

    if (typeof total === 'number') {
        const loadedCount = (currentPage + 1) * pageSize;
        return loadedCount < total ? currentPage + 1 : undefined;
    }

    return lastPage.data.length >= pageSize ? currentPage + 1 : undefined;
}

export function useFeedList(
    params?: FeedListParams,
    options: { enabled?: boolean } = {},
) {
    return useQuery({
        queryKey: feedKeys.list(params),
        queryFn: () => feedApi.list(params),
        enabled: options.enabled,
    });
}

export function useInfiniteFeedList(params?: FeedListParams) {
    return useInfiniteQuery({
        queryKey: feedKeys.infiniteList(params),
        initialPageParam: params?.page ?? 0,
        queryFn: ({ pageParam }) =>
            feedApi.list({
                ...params,
                page: pageParam,
                size: params?.size ?? DEFAULT_FEED_PAGE_SIZE,
            }),
        getNextPageParam: getNextFeedPageParam,
    });
}

function useLayerAwareFeedParams(params?: FeedListParams) {
    const activeLayer = useLayerStore((state) => state.activeLayer);
    const isAi = getFeedListIsAiParamByLayer(activeLayer);
    return useMemo<FeedListParams | undefined>(() => {
        if (isAi === undefined) return params;
        return { ...params, isAi };
    }, [params, isAi]);
}

export function useLayerAwareFeedList(
    params?: FeedListParams,
    options?: { enabled?: boolean },
) {
    return useFeedList(useLayerAwareFeedParams(params), options);
}

export function useLayerAwareInfiniteFeedList(params?: FeedListParams) {
    return useInfiniteFeedList(useLayerAwareFeedParams(params));
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
            queryClient.invalidateQueries({
                queryKey: feedKeys.applications(feedId),
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
            queryClient.invalidateQueries({
                queryKey: feedKeys.applications(feedId),
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
            queryClient.invalidateQueries({
                queryKey: feedKeys.applications(feedId),
            });
        },
    });
}
