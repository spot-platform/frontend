import type {
    UserProfile,
    Participation,
    NotificationSettings,
    PasswordChangePayload,
    SupporterRegistration,
    SupporterProfile,
    MyFavoriteItem,
    MyRecentViewItem,
    MySupportActivitySummary,
} from '@/entities/user/types';
import type { PagedResponse } from '@/entities/spot/types';
import type { FeedItem } from '@/features/feed/model/types';
import type { FeedApplicationRole } from '@/features/feed/model/types';
import { clientApiFetch } from '@/lib/client-api';
import { endpoints } from '@/lib/endpoint';
import {
    clearMockRecentViews,
    getMockFavorites,
    getMockNotificationSettings,
    getMockRecentViews,
    getMockSupportActivitySummary,
    getMockSupporterProfile,
    getMockSupporterRegistration,
    removeMockFavorite,
    removeMockRecentView,
    updateMockNotificationSettings,
    updateMockSupporterProfile,
    updateMockSupporterRegistration,
} from '../model/mock';

type BackendParticipation = {
    spotId: number | string;
    title: string;
    type: Participation['spotType'] | 'RENT';
    status: Participation['status'];
    role: Participation['role'];
    joinedAt: string;
};

export type MyFeedApplicationStatus =
    | 'APPLIED'
    | 'PENDING'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'CANCELLED';

export type MyFeedApplication = {
    applicationId: string;
    feedItemId: string;
    feedTitle: string;
    status: MyFeedApplicationStatus;
    appliedRole: FeedApplicationRole;
    deposit: number;
    createdAt: string;
};

type BackendMyFeedApplication = Omit<
    MyFeedApplication,
    'applicationId' | 'feedItemId' | 'deposit'
> & {
    applicationId: string | number;
    feedItemId: string | number;
    deposit?: number | null;
};

type BackendInvolvedFeedItem = Omit<FeedItem, 'id' | 'spotId' | 'isAi'> & {
    id: string | number;
    spotId?: string | number;
    ai?: boolean;
    isAi?: boolean;
};

function toInvolvedFeedItem(item: BackendInvolvedFeedItem): FeedItem {
    return {
        ...item,
        id: String(item.id),
        spotId: item.spotId == null ? undefined : String(item.spotId),
        isAi: item.isAi ?? item.ai,
    };
}

function toParticipation(item: BackendParticipation): Participation {
    return {
        spotId: String(item.spotId),
        spotTitle: item.title,
        spotType: item.type === 'RENT' ? 'OFFER' : item.type,
        status: item.status,
        role: item.role,
        joinedAt: item.joinedAt,
    };
}

function toMyFeedApplication(
    item: BackendMyFeedApplication,
): MyFeedApplication {
    return {
        ...item,
        applicationId: String(item.applicationId),
        feedItemId: String(item.feedItemId),
        deposit: item.deposit ?? 0,
    };
}

export const myApi = {
    profile: async (): Promise<{ data: UserProfile }> =>
        clientApiFetch<UserProfile>(endpoints.me.profile).then((data) => ({
            data,
        })),

    notificationSettings: async (): Promise<{ data: NotificationSettings }> =>
        getMockNotificationSettings(),

    supporterRegistration: async (): Promise<{ data: SupporterRegistration }> =>
        getMockSupporterRegistration(),

    supporterProfile: async (): Promise<{ data: SupporterProfile }> =>
        getMockSupporterProfile(),

    participations: async (params?: {
        page?: number;
        size?: number;
    }): Promise<PagedResponse<Participation>> =>
        clientApiFetch<
            BackendParticipation[] | { data?: BackendParticipation[] }
        >(endpoints.me.participations).then((payload) => {
            const items = Array.isArray(payload)
                ? payload
                : Array.isArray(payload.data)
                  ? payload.data
                  : [];
            const page = params?.page ?? 0;
            const size = params?.size ?? items.length;
            const start = page * size;
            const data = items.slice(start, start + size).map(toParticipation);

            return {
                data,
                meta: {
                    page,
                    size,
                    total: items.length,
                    hasNext: start + size < items.length,
                },
            };
        }),

    involvedFeeds: async (): Promise<{ data: FeedItem[] }> =>
        clientApiFetch<BackendInvolvedFeedItem[]>(
            endpoints.me.involvedFeeds,
        ).then((items) => ({ data: (items ?? []).map(toInvolvedFeedItem) })),

    feedApplications: async (): Promise<{ data: MyFeedApplication[] }> =>
        clientApiFetch<
            BackendMyFeedApplication[] | { data?: BackendMyFeedApplication[] }
        >(endpoints.me.feedApplications).then((payload) => ({
            data: (Array.isArray(payload) ? payload : (payload.data ?? [])).map(
                toMyFeedApplication,
            ),
        })),

    cancelFeedApplication: async (feedItemId: string): Promise<void> =>
        clientApiFetch<void>(endpoints.feeds.myApplication(feedItemId), {
            method: 'DELETE',
        }),

    deleteUser: async (payload?: { password?: string }): Promise<void> =>
        clientApiFetch<void>(endpoints.me.profile, {
            method: 'DELETE',
            body: payload ? JSON.stringify(payload) : undefined,
        }),

    favorites: async (params?: {
        page?: number;
        size?: number;
    }): Promise<PagedResponse<MyFavoriteItem>> => getMockFavorites(params),

    recentViews: async (params?: {
        page?: number;
        size?: number;
    }): Promise<PagedResponse<MyRecentViewItem>> => getMockRecentViews(params),

    supportActivitySummary: async (): Promise<{
        data: MySupportActivitySummary;
    }> => getMockSupportActivitySummary(),

    updateProfile: async (payload: {
        avatarUrl?: string;
        nickname?: string;
        email?: string;
        phone?: string;
    }): Promise<{ data: UserProfile }> =>
        clientApiFetch<UserProfile>(endpoints.me.profile, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }).then((data) => ({ data })),

    changePassword: async (payload: PasswordChangePayload): Promise<void> =>
        clientApiFetch<void>(endpoints.me.password, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }),

    updateNotificationSettings: async (
        payload: Omit<NotificationSettings, 'updatedAt'>,
    ): Promise<{ data: NotificationSettings }> =>
        updateMockNotificationSettings(payload),

    updateSupporterRegistration: async (
        payload: Omit<SupporterRegistration, 'updatedAt'>,
    ): Promise<{ data: SupporterRegistration }> =>
        updateMockSupporterRegistration(payload),

    updateSupporterProfile: async (payload: {
        field: string;
        mediaUrls: string[];
        career: string;
        bio: string;
    }): Promise<{ data: SupporterProfile }> =>
        updateMockSupporterProfile(payload),

    removeFavorite: async (favoriteId: string): Promise<void> =>
        removeMockFavorite(favoriteId),

    removeRecentView: async (recentViewId: string): Promise<void> =>
        removeMockRecentView(recentViewId),

    clearRecentViews: async (): Promise<void> => clearMockRecentViews(),
};
