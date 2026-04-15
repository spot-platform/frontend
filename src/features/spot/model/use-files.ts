import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spotsApi } from '../api/spot-api';
import { spotKeys } from './use-spot';

export function useSpotFiles(spotId: string) {
    return useQuery({
        queryKey: spotKeys.files(spotId),
        queryFn: () => spotsApi.getFiles(spotId),
        enabled: Boolean(spotId),
    });
}

export function useDeleteFile(spotId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (fileId: string) => spotsApi.deleteFile(spotId, fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: spotKeys.files(spotId) });
        },
    });
}
