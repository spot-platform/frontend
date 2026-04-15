import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spotsApi, type SubmitReviewPayload } from '../api/spot-api';
import { spotKeys } from './use-spot';

export function useSpotReviews(spotId: string) {
    return useQuery({
        queryKey: spotKeys.reviews(spotId),
        queryFn: () => spotsApi.getReviews(spotId),
        enabled: Boolean(spotId),
    });
}

export function useSubmitReview(spotId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: SubmitReviewPayload) =>
            spotsApi.submitReview(spotId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: spotKeys.reviews(spotId),
            });
        },
    });
}
