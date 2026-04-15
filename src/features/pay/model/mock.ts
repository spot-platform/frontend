// pay-mock - 포인트 잔액, 거래 내역, 계좌, 출금 요청을 메모리에서 관리한다.
import type {
    LinkedBankAccount,
    PointBalance,
    PointTransaction,
    PointWithdrawal,
} from '@/entities/pay/types';
import type { PagedResponse } from '@/entities/spot/types';

type BankAccountPayload = {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
};

const now = () => new Date().toISOString();

function clone<T>(value: T): T {
    return structuredClone(value);
}

function paginate<T>(
    items: T[],
    params?: { page?: number; size?: number },
): PagedResponse<T> {
    const page = params?.page ?? 1;
    const size = (params?.size ?? items.length) || 1;
    const start = (page - 1) * size;
    const data = items.slice(start, start + size);

    return {
        data,
        meta: {
            page,
            size,
            total: items.length,
            hasNext: start + size < items.length,
        },
    };
}

const mockPayState: {
    balance: PointBalance;
    linkedBankAccount: LinkedBankAccount | null;
    history: PointTransaction[];
    withdrawals: PointWithdrawal[];
} = {
    balance: {
        balance: 128000,
        updatedAt: now(),
    },
    linkedBankAccount: {
        bankName: '국민은행',
        accountNumber: '123-456-789012',
        accountHolder: '나',
        updatedAt: now(),
    },
    history: [
        {
            id: 'txn-1',
            type: 'CHARGE',
            amount: 100000,
            balanceAfter: 128000,
            description: '초기 MVP mock 충전',
            createdAt: now(),
        },
        {
            id: 'txn-2',
            type: 'USE',
            amount: 22000,
            balanceAfter: 28000,
            description: '가드닝 파트너 모집 참여 보증금',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        },
    ],
    withdrawals: [
        {
            id: 'wd-1',
            amount: 15000,
            status: 'COMPLETED',
            requestedAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 2,
            ).toISOString(),
        },
    ],
};

function prependHistory(transaction: PointTransaction) {
    mockPayState.history.unshift(transaction);
}

function updateBalance(nextBalance: number) {
    mockPayState.balance = {
        balance: nextBalance,
        updatedAt: now(),
    };
}

export function getMockPointBalanceValue() {
    return mockPayState.balance.balance;
}

export function getMockPointBalance(): { data: PointBalance } {
    return { data: clone(mockPayState.balance) };
}

export function getMockLinkedBankAccount(): {
    data: LinkedBankAccount | null;
} {
    return { data: clone(mockPayState.linkedBankAccount) };
}

export function getMockPointWithdrawals(params?: {
    page?: number;
    size?: number;
}) {
    const withdrawals = paginate(mockPayState.withdrawals, params);
    return { data: withdrawals.data };
}

export function getMockPointHistory(params?: { page?: number; size?: number }) {
    return paginate(mockPayState.history, params);
}

export function chargeMockPoints(amount: number): { data: PointBalance } {
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('충전 금액을 올바르게 입력해 주세요.');
    }

    const nextBalance = mockPayState.balance.balance + amount;
    updateBalance(nextBalance);
    prependHistory({
        id: `txn-charge-${Date.now()}`,
        type: 'CHARGE',
        amount,
        balanceAfter: nextBalance,
        description: '포인트 충전',
        createdAt: mockPayState.balance.updatedAt,
    });

    return getMockPointBalance();
}

export function consumeMockPoints(
    amount: number,
    description = '스팟 참여 보증금',
): { data: PointBalance } {
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('차감 금액을 올바르게 입력해 주세요.');
    }

    if (amount > mockPayState.balance.balance) {
        throw new Error('보유 포인트보다 큰 금액은 사용할 수 없어요.');
    }

    const nextBalance = mockPayState.balance.balance - amount;
    updateBalance(nextBalance);
    prependHistory({
        id: `txn-use-${Date.now()}`,
        type: 'USE',
        amount,
        balanceAfter: nextBalance,
        description,
        createdAt: mockPayState.balance.updatedAt,
    });

    return getMockPointBalance();
}

export function refundMockPoints(
    amount: number,
    description = '보증금 환불',
): { data: PointBalance } {
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('환불 금액을 올바르게 입력해 주세요.');
    }

    const nextBalance = mockPayState.balance.balance + amount;
    updateBalance(nextBalance);
    prependHistory({
        id: `txn-refund-${Date.now()}`,
        type: 'REFUND',
        amount,
        balanceAfter: nextBalance,
        description,
        createdAt: mockPayState.balance.updatedAt,
    });

    return getMockPointBalance();
}

const platformForfeitLedger: { total: number; updatedAt: string } = {
    total: 0,
    updatedAt: now(),
};

export function addPlatformForfeit(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
        return;
    }
    platformForfeitLedger.total += amount;
    platformForfeitLedger.updatedAt = now();
}

export function getPlatformForfeitTotal(): number {
    return platformForfeitLedger.total;
}

export function linkMockBankAccount(payload: BankAccountPayload): {
    data: LinkedBankAccount;
} {
    mockPayState.linkedBankAccount = {
        ...payload,
        updatedAt: now(),
    };

    return { data: clone(mockPayState.linkedBankAccount) };
}

export function withdrawMockPoints(amount: number): { data: PointBalance } {
    if (!mockPayState.linkedBankAccount) {
        throw new Error('먼저 출금 계좌를 등록해 주세요.');
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('출금 금액을 올바르게 입력해 주세요.');
    }

    if (amount > mockPayState.balance.balance) {
        throw new Error('보유 포인트보다 큰 금액은 출금할 수 없어요.');
    }

    const nextBalance = mockPayState.balance.balance - amount;
    updateBalance(nextBalance);
    mockPayState.withdrawals.unshift({
        id: `wd-${Date.now()}`,
        amount,
        status: 'PENDING',
        requestedAt: mockPayState.balance.updatedAt,
    });
    prependHistory({
        id: `txn-withdraw-${Date.now()}`,
        type: 'WITHDRAW',
        amount,
        balanceAfter: nextBalance,
        description: '포인트 출금 신청',
        createdAt: mockPayState.balance.updatedAt,
    });

    return getMockPointBalance();
}
