import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { myApi } from '../api/my-api';

export const myKeys = {
    profile: ['my', 'profile'] as const,
    participations: (params?: object) =>
        ['my', 'participations', params] as const,
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

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { nickname?: string }) =>
            myApi.updateProfile(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: myKeys.profile });
        },
    });
}
