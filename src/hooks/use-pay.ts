import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payApi } from '@/lib/api/pay';

export const payKeys = {
    balance: ['pay', 'balance'] as const,
    history: (params?: object) => ['pay', 'history', params] as const,
};

export function usePointBalance() {
    return useQuery({
        queryKey: payKeys.balance,
        queryFn: payApi.balance,
    });
}

export function usePointHistory(params?: { page?: number; size?: number }) {
    return useQuery({
        queryKey: payKeys.history(params),
        queryFn: () => payApi.history(params),
    });
}

export function useChargePoints() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (amount: number) => payApi.charge(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: payKeys.balance });
            queryClient.invalidateQueries({ queryKey: ['pay', 'history'] });
        },
    });
}
