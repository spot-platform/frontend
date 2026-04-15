import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    NotificationSettings,
    PasswordChangePayload,
    SupporterRegistration,
} from '@/entities/user/types';
import { myApi } from '../api/my-api';

export const myKeys = {
    profile: ['my', 'profile'] as const,
    notificationSettings: ['my', 'notification-settings'] as const,
    supporterRegistration: ['my', 'supporter-registration'] as const,
    supporterProfile: ['my', 'supporter-profile'] as const,
    participations: (params?: object) =>
        ['my', 'participations', params] as const,
    favorites: (params?: object) => ['my', 'favorites', params] as const,
    recentViews: (params?: object) => ['my', 'recent-views', params] as const,
    supportActivitySummary: ['my', 'support-activity-summary'] as const,
};

export function useMyProfile() {
    return useQuery({
        queryKey: myKeys.profile,
        queryFn: myApi.profile,
    });
}

export function useMyParticipations(params?: { page?: number; size?: number }) {
    return useQuery({
        queryKey: myKeys.participations(params),
        queryFn: () => myApi.participations(params),
    });
}

export function useNotificationSettings() {
    return useQuery({
        queryKey: myKeys.notificationSettings,
        queryFn: myApi.notificationSettings,
    });
}

export function useSupporterRegistration() {
    return useQuery({
        queryKey: myKeys.supporterRegistration,
        queryFn: myApi.supporterRegistration,
    });
}

export function useSupporterProfile() {
    return useQuery({
        queryKey: myKeys.supporterProfile,
        queryFn: myApi.supporterProfile,
    });
}

export function useMyFavorites(params?: { page?: number; size?: number }) {
    return useQuery({
        queryKey: myKeys.favorites(params),
        queryFn: () => myApi.favorites(params),
    });
}

export function useMyRecentViews(params?: { page?: number; size?: number }) {
    return useQuery({
        queryKey: myKeys.recentViews(params),
        queryFn: () => myApi.recentViews(params),
    });
}

export function useMySupportActivitySummary() {
    return useQuery({
        queryKey: myKeys.supportActivitySummary,
        queryFn: myApi.supportActivitySummary,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            avatarUrl?: string;
            nickname?: string;
            email?: string;
            phone?: string;
        }) => myApi.updateProfile(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: myKeys.profile });
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (payload: PasswordChangePayload) =>
            myApi.changePassword(payload),
    });
}

export function useUpdateNotificationSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Omit<NotificationSettings, 'updatedAt'>) =>
            myApi.updateNotificationSettings(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: myKeys.notificationSettings,
            });
        },
    });
}

export function useUpdateSupporterRegistration() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Omit<SupporterRegistration, 'updatedAt'>) =>
            myApi.updateSupporterRegistration(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: myKeys.supporterRegistration,
            });
        },
    });
}

export function useUpdateSupporterProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            field: string;
            mediaUrls: string[];
            career: string;
            bio: string;
        }) => myApi.updateSupporterProfile(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: myKeys.supporterProfile,
            });
            queryClient.invalidateQueries({
                queryKey: myKeys.supportActivitySummary,
            });
        },
    });
}

export function useRemoveFavorite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (favoriteId: string) => myApi.removeFavorite(favoriteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my', 'favorites'] });
        },
    });
}

export function useRemoveRecentView() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (recentViewId: string) =>
            myApi.removeRecentView(recentViewId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my', 'recent-views'] });
        },
    });
}

export function useClearRecentViews() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => myApi.clearRecentViews(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my', 'recent-views'] });
        },
    });
}
