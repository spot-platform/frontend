import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spotsApi } from '../api/spot-api';
import { spotKeys } from './use-spot';
import type { ChecklistItem } from '@/entities/spot/types';

export function useSpotChecklist(spotId: string) {
    return useQuery({
        queryKey: spotKeys.checklist(spotId),
        queryFn: () => spotsApi.getChecklist(spotId),
        enabled: Boolean(spotId),
    });
}

export function useUpsertChecklist(spotId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (items: ChecklistItem[]) =>
            spotsApi.upsertChecklist(spotId, items),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: spotKeys.checklist(spotId),
            });
        },
    });
}
