import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spotsApi } from '../api/spot-api';
import { spotKeys } from './use-spot';

export function useSpotNotes(spotId: string) {
    return useQuery({
        queryKey: spotKeys.notes(spotId),
        queryFn: () => spotsApi.getNotes(spotId),
        enabled: Boolean(spotId),
    });
}

export function useCreateNote(spotId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (content: string) => spotsApi.createNote(spotId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: spotKeys.notes(spotId) });
        },
    });
}
