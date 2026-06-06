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
import type { PlanV3, Preparation } from '@/entities/spot/simulation-types';
import { resolveFeedCoordinate } from '../model/feed-location';

export type FeedApplyPayload = {
    proposal: string;
    role: FeedApplicationRole;
    deposit: number;
    plan?: PlanV3;
    preparation?: Preparation;
};

export type FeedListParams = {
    tab?: string;
    type?: FeedItemType;
    status?: FeedItemStatus;
    category?: string;
    sort?: string;
    isAi?: boolean;
    nearLat?: number;
    nearLng?: number;
    page?: number;
    size?: number;
};

type BackendFeedList = {
    data?: BackendFeedItem[];
    meta?: PagedResponse<FeedItem>['meta'];
};

export type BackendFeedItem = Omit<
    FeedItem,
    | 'id'
    | 'spotId'
    | 'coord'
    | 'lat'
    | 'lng'
    | 'confirmedPartnerProfiles'
    | 'isAi'
> & {
    id: string | number;
    spotId?: string | number;
    ai?: boolean;
    isAi?: boolean;
    coordinate?: {
        lat?: number | string | null;
        lng?: number | string | null;
    } | null;
    lat?: number | string | null;
    lng?: number | string | null;
    confirmedPartnerProfiles?: Array<{
        id: string;
        nickname: string;
        avatarUrl?: string | null;
        avatar_url?: string | null;
    }>;
};

export type BackendFeedApplication = Omit<
    FeedApplication,
    | 'id'
    | 'feedId'
    | 'appliedRole'
    | 'deposit'
    | 'applicantProfile'
    | 'nickname'
> & {
    id: string | number;
    feedId: string | number;
    userNickname?: string;
    nickname?: string;
    avatarUrl?: string | null;
    applicantProfile?: FeedApplication['applicantProfile'];
    appliedRole?: FeedApplicationRole;
    deposit?: number;
    spotConverted?: boolean;
    spotId?: string | number | null;
};

export function toFeedApplication(
    application: BackendFeedApplication,
    fallback?: Partial<FeedApplyPayload>,
): FeedApplication {
    const nickname = application.nickname ?? application.userNickname;

    return {
        ...application,
        id: String(application.id),
        feedId: String(application.feedId),
        nickname,
        applicantProfile:
            application.applicantProfile ??
            (nickname
                ? {
                      id: application.userId,
                      nickname,
                      avatarUrl: application.avatarUrl,
                  }
                : undefined),
        appliedRole: application.appliedRole ?? fallback?.role ?? 'PARTNER',
        deposit: application.deposit ?? fallback?.deposit ?? 0,
        spotConverted: application.spotConverted,
        spotId:
            application.spotId == null ? undefined : String(application.spotId),
    };
}

export function toFeedItem(item: BackendFeedItem): FeedItem {
    const coord = resolveFeedCoordinate(item);

    return {
        ...item,
        id: String(item.id),
        spotId: item.spotId == null ? undefined : String(item.spotId),
        coord: coord ?? undefined,
        lat: coord?.lat,
        lng: coord?.lng,
        confirmedPartnerProfiles: item.confirmedPartnerProfiles?.map(
            (profile) => ({
                id: profile.id,
                nickname: profile.nickname,
                avatarUrl: profile.avatarUrl ?? profile.avatar_url ?? undefined,
            }),
        ),
        isAi: item.isAi ?? item.ai,
    };
}

export const feedApi = {
    list: async (params?: FeedListParams): Promise<PagedResponse<FeedItem>> =>
        clientApiFetch<BackendFeedList>(
            `${endpoints.feeds.root}${buildQueryString(params)}`,
            {
                redirectOnUnauthorized: false,
                retryUnauthenticatedOnUnauthorized: true,
            },
        ).then((response) => ({
            data: (response.data ?? []).map(toFeedItem),
            meta: response.meta,
        })),

    get: async (feedId: string): Promise<{ data: FeedItem }> =>
        clientApiFetch<BackendFeedItem>(endpoints.feeds.detail(feedId), {
            redirectOnUnauthorized: false,
            retryUnauthenticatedOnUnauthorized: true,
        }).then((data) => ({
            data: toFeedItem(data),
        })),

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
                    ...(payload.plan ? { plan: payload.plan } : {}),
                    ...(payload.preparation
                        ? { preparation: payload.preparation }
                        : {}),
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
        clientApiFetch<
            BackendFeedApplication[] | { data?: BackendFeedApplication[] }
        >(endpoints.feeds.applications(feedId)).then((payload) => ({
            data: (Array.isArray(payload) ? payload : (payload.data ?? []))
                .filter(
                    (application): application is BackendFeedApplication =>
                        typeof application === 'object' &&
                        application !== null &&
                        'id' in application &&
                        'feedId' in application,
                )
                .map((application) => toFeedApplication(application)),
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

    delete: async (feedId: string): Promise<void> =>
        clientApiFetch<void>(endpoints.feeds.delete(feedId), {
            method: 'DELETE',
        }),
};
