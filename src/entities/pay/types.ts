export type PointTransaction = {
    id: string;
    type: 'CHARGE' | 'USE' | 'REFUND';
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
};

export type PointBalance = {
    balance: number;
    updatedAt: string;
};
