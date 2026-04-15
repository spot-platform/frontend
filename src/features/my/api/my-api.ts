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
import {
    changeMockPassword,
    clearMockRecentViews,
    getMockFavorites,
    getMockMyProfile,
    getMockNotificationSettings,
    getMockParticipations,
    getMockRecentViews,
    getMockSupportActivitySummary,
    getMockSupporterProfile,
    getMockSupporterRegistration,
    removeMockFavorite,
    removeMockRecentView,
    updateMockNotificationSettings,
    updateMockProfile,
    updateMockSupporterProfile,
    updateMockSupporterRegistration,
} from '../model/mock';

export const myApi = {
    profile: async (): Promise<{ data: UserProfile }> => getMockMyProfile(),

    notificationSettings: async (): Promise<{ data: NotificationSettings }> =>
        getMockNotificationSettings(),

    supporterRegistration: async (): Promise<{ data: SupporterRegistration }> =>
        getMockSupporterRegistration(),

    supporterProfile: async (): Promise<{ data: SupporterProfile }> =>
        getMockSupporterProfile(),

    participations: async (params?: {
        page?: number;
        size?: number;
    }): Promise<PagedResponse<Participation>> => getMockParticipations(params),

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
    }): Promise<{ data: UserProfile }> => updateMockProfile(payload),

    changePassword: async (payload: PasswordChangePayload): Promise<void> =>
        changeMockPassword(payload),

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
