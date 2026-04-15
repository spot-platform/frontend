import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { myKeys } from '@/features/my/model/use-my';
import { payApi } from '../api/pay-api';

export const payKeys = {
    balance: ['pay', 'balance'] as const,
    linkedBankAccount: ['pay', 'linked-bank-account'] as const,
    history: (params?: object) => ['pay', 'history', params] as const,
    withdrawals: (params?: object) => ['pay', 'withdrawals', params] as const,
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

export function useLinkedBankAccount() {
    return useQuery({
        queryKey: payKeys.linkedBankAccount,
        queryFn: payApi.linkedBankAccount,
    });
}

export function usePointWithdrawals(params?: { page?: number; size?: number }) {
    return useQuery({
        queryKey: payKeys.withdrawals(params),
        queryFn: () => payApi.withdrawals(params),
    });
}

export function useChargePoints() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (amount: number) => payApi.charge(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: payKeys.balance });
            queryClient.invalidateQueries({ queryKey: ['pay', 'history'] });
            queryClient.invalidateQueries({ queryKey: myKeys.profile });
        },
    });
}

export function useLinkBankAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            bankName: string;
            accountNumber: string;
            accountHolder: string;
        }) => payApi.linkBankAccount(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: payKeys.linkedBankAccount,
            });
        },
    });
}

export function useWithdrawPoints() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (amount: number) => payApi.withdraw(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: payKeys.balance });
            queryClient.invalidateQueries({ queryKey: ['pay', 'history'] });
            queryClient.invalidateQueries({ queryKey: ['pay', 'withdrawals'] });
            queryClient.invalidateQueries({ queryKey: myKeys.profile });
        },
    });
}
