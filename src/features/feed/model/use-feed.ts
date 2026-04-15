import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payKeys } from '@/features/pay';
import { feedApi, type FeedApplyPayload } from '../api/feed-api';

export const feedKeys = {
    all: ['feed'] as const,
    details: () => [...feedKeys.all, 'detail'] as const,
    detail: (id: string) => [...feedKeys.details(), id] as const,
};

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
            queryClient.invalidateQueries({ queryKey: payKeys.balance });
            queryClient.invalidateQueries({ queryKey: ['pay', 'history'] });
        },
    });
}
