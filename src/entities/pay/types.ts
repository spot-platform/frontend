export type PointTransaction = {
    id: string;
    type: 'CHARGE' | 'USE' | 'REFUND' | 'WITHDRAW';
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
};

export type PointBalance = {
    balance: number;
    updatedAt: string;
};

export type LinkedBankAccount = {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    updatedAt: string;
};

export type PointWithdrawal = {
    id: string;
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'REJECTED';
    requestedAt: string;
};
