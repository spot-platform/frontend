import { buildQueryString, clientApiFetch } from '@/lib/client-api';
import type {
    FeedApplication,
    FeedApplicationRole,
    FeedItem,
    FeedItemStatus,
    FeedItemType,
} from '../model/types';
import type { PagedResponse } from '@/entities/spot/types';

export type FeedApplyPayload = {
    proposal: string;
    role: FeedApplicationRole;
    deposit: number;
};

export type FeedListParams = {
    tab?: string;
    type?: FeedItemType;
    status?: FeedItemStatus;
    category?: string;
    sort?: string;
    page?: number;
    size?: number;
};

type BackendFeedList = {
    data?: FeedItem[];
    meta?: PagedResponse<FeedItem>['meta'];
};

type BackendFeedApplication = Omit<
    FeedApplication,
    'appliedRole' | 'deposit'
> & {
    appliedRole?: FeedApplicationRole;
    deposit?: number;
};

function toFeedApplication(
    application: BackendFeedApplication,
    fallback: FeedApplyPayload,
): FeedApplication {
    return {
        ...application,
        appliedRole: application.appliedRole ?? fallback.role,
        deposit: application.deposit ?? fallback.deposit,
    };
}

export const feedApi = {
    list: async (params?: FeedListParams): Promise<PagedResponse<FeedItem>> =>
        clientApiFetch<BackendFeedList>(
            `/feeds${buildQueryString(params)}`,
        ).then((response) => ({
            data: response.data ?? [],
            meta: response.meta,
        })),

    get: async (feedId: string): Promise<{ data: FeedItem }> =>
        clientApiFetch<FeedItem>(`/feeds/${feedId}`).then((data) => ({
            data,
        })),

    apply: async (
        feedId: string,
        payload: FeedApplyPayload,
    ): Promise<{ data: FeedApplication }> =>
        clientApiFetch<BackendFeedApplication>(`/feeds/${feedId}/apply`, {
            method: 'POST',
            body: JSON.stringify({
                proposal: payload.proposal,
                role: payload.role,
                deposit: payload.deposit,
            }),
        }).then((data) => ({ data: toFeedApplication(data, payload) })),

    cancelApply: async (
        feedId: string,
    ): Promise<{ data: { feedId: string; status: 'CANCELLED' } }> =>
        clientApiFetch<void>(`/feeds/${feedId}/apply`, {
            method: 'DELETE',
        }).then(() => ({ data: { feedId, status: 'CANCELLED' } })),
};
