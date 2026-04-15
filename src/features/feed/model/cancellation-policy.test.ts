import { describe, expect, it } from 'vitest';
import {
    PLATFORM_FEE_RATE_ON_FORFEIT,
    SUPPORTER_FEED_CANCEL_REFUND_RATE,
    resolveCancellationOutcome,
} from './cancellation-policy';

function totalForfeit(outcome: {
    forfeit: { toPool: number; toPlatformFee: number };
}) {
    return outcome.forfeit.toPool + outcome.forfeit.toPlatformFee;
}

describe('resolveCancellationOutcome', () => {
    it('PARTNER feed self-cancel returns full refund', () => {
        const outcome = resolveCancellationOutcome({
            stage: 'FEED',
            role: 'PARTNER',
            cause: 'SELF',
            deposit: 10000,
        });

        expect(outcome.refund).toBe(10000);
        expect(totalForfeit(outcome)).toBe(0);
    });

    it('SUPPORTER feed self-cancel splits 30/70 with 80/20 forfeit split', () => {
        const outcome = resolveCancellationOutcome({
            stage: 'FEED',
            role: 'SUPPORTER',
            cause: 'SELF',
            deposit: 10000,
        });

        expect(outcome.refund).toBe(
            Math.round(10000 * SUPPORTER_FEED_CANCEL_REFUND_RATE),
        );
        expect(outcome.forfeit.toPlatformFee).toBe(
            Math.round(7000 * PLATFORM_FEE_RATE_ON_FORFEIT),
        );
        expect(outcome.refund + totalForfeit(outcome)).toBe(10000);
    });

    it('preserves deposit invariant under rounding edge deposit 11111', () => {
        const outcome = resolveCancellationOutcome({
            stage: 'FEED',
            role: 'SUPPORTER',
            cause: 'SELF',
            deposit: 11111,
        });

        expect(outcome.refund + totalForfeit(outcome)).toBe(11111);
    });

    it('SPOT self-withdraw forfeits everything regardless of role', () => {
        const partnerOutcome = resolveCancellationOutcome({
            stage: 'SPOT',
            role: 'PARTNER',
            cause: 'SELF',
            deposit: 10000,
        });
        const supporterOutcome = resolveCancellationOutcome({
            stage: 'SPOT',
            role: 'SUPPORTER',
            cause: 'SELF',
            deposit: 10000,
        });

        expect(partnerOutcome.refund).toBe(0);
        expect(totalForfeit(partnerOutcome)).toBe(10000);
        expect(partnerOutcome.forfeit.toPlatformFee).toBe(2000);
        expect(partnerOutcome.forfeit.toPool).toBe(8000);

        expect(supporterOutcome).toEqual(partnerOutcome);
    });

    it('HOST_REJECTED refunds fully on FEED', () => {
        const outcome = resolveCancellationOutcome({
            stage: 'FEED',
            role: 'SUPPORTER',
            cause: 'HOST_REJECTED',
            deposit: 10000,
        });

        expect(outcome.refund).toBe(10000);
        expect(totalForfeit(outcome)).toBe(0);
    });

    it('HOST_CANCELLED refunds fully on SPOT', () => {
        const outcome = resolveCancellationOutcome({
            stage: 'SPOT',
            role: 'PARTNER',
            cause: 'HOST_CANCELLED',
            deposit: 10000,
        });

        expect(outcome.refund).toBe(10000);
        expect(totalForfeit(outcome)).toBe(0);
    });
});
