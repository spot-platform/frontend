import { describe, expect, it } from 'vitest';
import { MOCK_FEED, MOCK_FEED_MANAGEMENT } from './mock';
import {
    resolveParticipationPricing,
    resolveParticipationAvailability,
    resolveParticipationDeposit,
    resolveParticipationMaxHeadcount,
} from './participation';

describe('feed participation helpers', () => {
    it('prefers management demand data when calculating deposit', () => {
        const item = MOCK_FEED.find((feed) => feed.id === '1');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 1 to exist.');
        }

        expect(
            resolveParticipationMaxHeadcount(item, MOCK_FEED_MANAGEMENT['1']),
        ).toBe(5);
        expect(
            resolveParticipationDeposit(item, MOCK_FEED_MANAGEMENT['1']),
        ).toBe(12000);
    });

    it('falls back to feed item fields when management data is missing', () => {
        const item = MOCK_FEED.find((feed) => feed.id === '4');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 4 to exist.');
        }

        expect(resolveParticipationMaxHeadcount(item)).toBe(6);
        expect(resolveParticipationDeposit(item)).toBe(667);
    });

    it('uses supporter desired funding goal when resolving richer pricing', () => {
        const item = MOCK_FEED.find((feed) => feed.id === '2');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 2 to exist.');
        }

        const pricing = resolveParticipationPricing(
            item,
            MOCK_FEED_MANAGEMENT['2'],
            {
                role: 'SUPPORTER',
                desiredFundingGoal: 210000,
                categoryAverageGoal: 160000,
            },
        );

        expect(pricing.targetAmount).toBe(210000);
        expect(pricing.maxHeadcount).toBe(4);
        expect(pricing.participantShare).toBe(52500);
        expect(pricing.deposit).toBe(10500);
        expect(pricing.categoryAverageDeposit).toBe(8000);
        expect(pricing.categoryAverageDelta).toBe(50000);
    });

    it('ignores invalid custom desired funding goal and falls back to default target', () => {
        const item = MOCK_FEED.find((feed) => feed.id === '1');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 1 to exist.');
        }

        const pricing = resolveParticipationPricing(
            item,
            MOCK_FEED_MANAGEMENT['1'],
            {
                role: 'SUPPORTER',
                desiredFundingGoal: 0,
            },
        );

        expect(pricing.targetAmount).toBe(300000);
        expect(pricing.deposit).toBe(
            resolveParticipationDeposit(item, MOCK_FEED_MANAGEMENT['1']),
        );
    });

    it('disables supporter join when the author already is a supporter', () => {
        const item = MOCK_FEED.find((feed) => feed.id === '1');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 1 to exist.');
        }

        expect(
            resolveParticipationAvailability(item, MOCK_FEED_MANAGEMENT['1'])
                .supporterDisabled,
        ).toBe(true);
    });

    it('disables partner join when no partner slot remains', () => {
        const item = MOCK_FEED.find((feed) => feed.id === '3');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 3 to exist.');
        }

        const availability = resolveParticipationAvailability(item, {
            ...MOCK_FEED_MANAGEMENT['3'],
            demand: {
                ...MOCK_FEED_MANAGEMENT['3'].demand,
                confirmedPartners:
                    MOCK_FEED_MANAGEMENT['3'].demand.partnerSlotLabels
                        ?.length ?? 0,
            },
        });

        expect(availability.partnerDisabled).toBe(true);
        expect(availability.remainingPartnerSlots).toBe(0);
    });

    it('keeps request slot math role-aware when supporter and partner labels coexist', () => {
        const item = MOCK_FEED.find((feed) => feed.id === '2');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 2 to exist.');
        }

        const availability = resolveParticipationAvailability(
            item,
            MOCK_FEED_MANAGEMENT['2'],
        );

        expect(
            resolveParticipationMaxHeadcount(item, MOCK_FEED_MANAGEMENT['2']),
        ).toBe(4);
        expect(
            resolveParticipationDeposit(item, MOCK_FEED_MANAGEMENT['2']),
        ).toBe(9000);
        expect(availability.supporterDisabled).toBe(false);
        expect(availability.partnerDisabled).toBe(false);
        expect(availability.partnerSlotCount).toBe(3);
        expect(availability.remainingPartnerSlots).toBe(1);
    });
});
