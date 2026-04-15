import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spotsApi } from '../api/spot-api';
import { spotKeys } from './use-spot';
import type { ScheduleSlot } from '@/entities/spot/types';

export function useSpotSchedule(spotId: string) {
    return useQuery({
        queryKey: spotKeys.schedule(spotId),
        queryFn: () => spotsApi.getSchedule(spotId),
        enabled: Boolean(spotId),
    });
}

export function useUpsertSchedule(spotId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (slots: ScheduleSlot[]) =>
            spotsApi.upsertSchedule(spotId, slots),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: spotKeys.schedule(spotId),
            });
        },
    });
}
