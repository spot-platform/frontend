import type {
    PointBalance,
    PointTransaction,
    LinkedBankAccount,
    PointWithdrawal,
} from '@/entities/pay/types';
import type { PagedResponse } from '@/entities/spot/types';
import {
    chargeMockPoints,
    getMockLinkedBankAccount,
    getMockPointBalance,
    getMockPointHistory,
    getMockPointWithdrawals,
    linkMockBankAccount,
    withdrawMockPoints,
} from '../model/mock';

export const payApi = {
    balance: async (): Promise<{ data: PointBalance }> => getMockPointBalance(),

    linkedBankAccount: async (): Promise<{ data: LinkedBankAccount | null }> =>
        getMockLinkedBankAccount(),

    withdrawals: async (params?: {
        page?: number;
        size?: number;
    }): Promise<{ data: PointWithdrawal[] }> => getMockPointWithdrawals(params),

    history: async (params?: {
        page?: number;
        size?: number;
    }): Promise<PagedResponse<PointTransaction>> => getMockPointHistory(params),

    charge: async (amount: number): Promise<{ data: PointBalance }> =>
        chargeMockPoints(amount),

    linkBankAccount: async (payload: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
    }): Promise<{ data: LinkedBankAccount }> => linkMockBankAccount(payload),

    withdraw: async (amount: number): Promise<{ data: PointBalance }> =>
        withdrawMockPoints(amount),
};
