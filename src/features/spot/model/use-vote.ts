import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spotsApi, type CreateVotePayload } from '../api/spot-api';
import { spotKeys } from './use-spot';

export function useSpotVotes(spotId: string) {
    return useQuery({
        queryKey: spotKeys.votes(spotId),
        queryFn: () => spotsApi.getVotes(spotId),
        enabled: Boolean(spotId),
    });
}

export function useCreateVote(spotId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateVotePayload) =>
            spotsApi.createVote(spotId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: spotKeys.votes(spotId) });
        },
    });
}

export function useCastVote(spotId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            voteId,
            optionIds,
        }: {
            voteId: string;
            optionIds: string[];
        }) => spotsApi.castVote(spotId, voteId, optionIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: spotKeys.votes(spotId) });
        },
    });
}
