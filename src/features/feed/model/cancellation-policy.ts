export const SUPPORTER_FEED_CANCEL_REFUND_RATE = 0.3;
export const PLATFORM_FEE_RATE_ON_FORFEIT = 0.2;

export type CancellationStage = 'FEED' | 'SPOT';
export type CancellationRole = 'PARTNER' | 'SUPPORTER';
export type CancellationCause = 'SELF' | 'HOST_REJECTED' | 'HOST_CANCELLED';

export type CancellationForfeit = {
    toPool: number;
    toPlatformFee: number;
};

export type CancellationOutcome = {
    refund: number;
    forfeit: CancellationForfeit;
};

export type ResolveCancellationInput = {
    stage: CancellationStage;
    role: CancellationRole;
    cause: CancellationCause;
    deposit: number;
};

function splitForfeit(forfeitTotal: number): CancellationForfeit {
    if (forfeitTotal <= 0) {
        return { toPool: 0, toPlatformFee: 0 };
    }

    const toPlatformFee = Math.round(
        forfeitTotal * PLATFORM_FEE_RATE_ON_FORFEIT,
    );
    // 잔여로 계산해 refund + toPool + toPlatformFee === deposit 불변식 유지
    const toPool = forfeitTotal - toPlatformFee;

    return { toPool, toPlatformFee };
}

export function resolveCancellationOutcome(
    input: ResolveCancellationInput,
): CancellationOutcome {
    const { stage, role, cause, deposit } = input;
    const safeDeposit = Math.max(0, Math.round(deposit));

    if (cause !== 'SELF') {
        return {
            refund: safeDeposit,
            forfeit: { toPool: 0, toPlatformFee: 0 },
        };
    }

    if (stage === 'FEED' && role === 'PARTNER') {
        return {
            refund: safeDeposit,
            forfeit: { toPool: 0, toPlatformFee: 0 },
        };
    }

    if (stage === 'FEED' && role === 'SUPPORTER') {
        const refund = Math.round(
            safeDeposit * SUPPORTER_FEED_CANCEL_REFUND_RATE,
        );
        const forfeitTotal = safeDeposit - refund;

        return { refund, forfeit: splitForfeit(forfeitTotal) };
    }

    // stage === 'SPOT' && cause === 'SELF'
    return { refund: 0, forfeit: splitForfeit(safeDeposit) };
}
