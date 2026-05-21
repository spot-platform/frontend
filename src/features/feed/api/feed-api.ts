import { buildQueryString, clientApiFetch } from '@/lib/client-api';
import { endpoints } from '@/lib/endpoint';
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
            `${endpoints.feeds.root}${buildQueryString(params)}`,
        ).then((response) => ({
            data: response.data ?? [],
            meta: response.meta,
        })),

    get: async (feedId: string): Promise<{ data: FeedItem }> =>
        clientApiFetch<FeedItem>(endpoints.feeds.detail(feedId)).then(
            (data) => ({
                data,
            }),
        ),

    apply: async (
        feedId: string,
        payload: FeedApplyPayload,
    ): Promise<{ data: FeedApplication }> =>
        clientApiFetch<BackendFeedApplication>(
            endpoints.feeds.applications(feedId),
            {
                method: 'POST',
                body: JSON.stringify({
                    proposal: payload.proposal,
                    role: payload.role,
                    deposit: payload.deposit,
                }),
            },
        ).then((data) => ({ data: toFeedApplication(data, payload) })),

    cancelApply: async (
        feedId: string,
    ): Promise<{ data: { feedId: string; status: 'CANCELLED' } }> =>
        clientApiFetch<void>(endpoints.feeds.myApplication(feedId), {
            method: 'DELETE',
        }).then(() => ({ data: { feedId, status: 'CANCELLED' } })),

    applications: async (
        feedId: string,
    ): Promise<{ data: FeedApplication[] }> =>
        clientApiFetch<FeedApplication[] | { data?: FeedApplication[] }>(
            endpoints.feeds.applications(feedId),
        ).then((payload) => ({
            data: Array.isArray(payload) ? payload : (payload.data ?? []),
        })),

    addBookmark: async (feedId: string): Promise<void> =>
        clientApiFetch<void>(endpoints.feeds.bookmark(feedId), {
            method: 'POST',
        }),

    removeBookmark: async (feedId: string): Promise<void> =>
        clientApiFetch<void>(endpoints.feeds.bookmark(feedId), {
            method: 'DELETE',
        }),

    acceptApplication: async (
        feedId: string,
        applicationId: string,
    ): Promise<{ data: FeedApplication }> =>
        clientApiFetch<BackendFeedApplication>(
            endpoints.feeds.acceptApplication(feedId, applicationId),
            { method: 'PATCH' },
        ).then((data) => ({
            data: toFeedApplication(data, {
                proposal: data.proposal,
                role: data.appliedRole ?? 'PARTNER',
                deposit: data.deposit ?? 0,
            }),
        })),

    rejectApplication: async (
        feedId: string,
        applicationId: string,
    ): Promise<{ data: FeedApplication }> =>
        clientApiFetch<BackendFeedApplication>(
            endpoints.feeds.rejectApplication(feedId, applicationId),
            { method: 'PATCH' },
        ).then((data) => ({
            data: toFeedApplication(data, {
                proposal: data.proposal,
                role: data.appliedRole ?? 'PARTNER',
                deposit: data.deposit ?? 0,
            }),
        })),
};
