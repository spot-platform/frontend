import { describe, expect, it } from 'vitest';
import { MOCK_FEED } from '@/features/feed/model/mock';
import { useMainChatStore } from './use-main-chat-store';
import { resolveReverseOfferFinancialSummary } from './reverse-offer-finance';

describe('reverse offer financial summary', () => {
    it('uses feed participation goal data when the room comes from feed flow', () => {
        useMainChatStore.getState().reset();

        const item = MOCK_FEED.find((feed) => feed.id === '1');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 1 to exist.');
        }

        const room = useMainChatStore
            .getState()
            .createOrSelectFeedParticipationRoom({
                item,
                role: 'PARTNER',
                deposit: 12000,
            });
        const summary = resolveReverseOfferFinancialSummary(room);

        expect(summary).toMatchObject({
            sourceKind: 'management',
            targetAmount: 300000,
            agreedHeadcount: 5,
            currentHeadcount: 4,
            agreedPerPersonAmount: 60000,
            currentPerPersonAmount: 75000,
            comparisonNeeded: true,
        });
    });

    it('falls back to the current spot data when feed goal data is unavailable', () => {
        useMainChatStore.getState().reset();

        const room = useMainChatStore
            .getState()
            .rooms.find(
                (
                    candidate,
                ): candidate is Parameters<
                    typeof resolveReverseOfferFinancialSummary
                >[0] =>
                    candidate.id === 'spot-room-spot-2' &&
                    candidate.category === 'spot',
            );

        expect(room).toBeDefined();

        if (!room) {
            throw new Error('Expected spot-room-spot-2 to exist.');
        }

        const summary = resolveReverseOfferFinancialSummary(room);

        expect(summary).toMatchObject({
            sourceKind: 'estimated',
            targetAmount: 30000,
            agreedHeadcount: 2,
            currentHeadcount: 2,
            agreedPerPersonAmount: 15000,
            currentPerPersonAmount: 15000,
            comparisonNeeded: false,
        });
    });
});
