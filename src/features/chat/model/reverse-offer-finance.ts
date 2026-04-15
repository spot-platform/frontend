import { MOCK_FEED, MOCK_FEED_MANAGEMENT } from '@/features/feed/model/mock';
import {
    resolveParticipationAvailability,
    resolveParticipationMaxHeadcount,
} from '@/features/feed/model/participation';
import type {
    ChatReverseOfferFinancialSnapshot,
    ChatReverseOfferFinancialSource,
    SpotChatRoom,
} from './types';

export type ReverseOfferFinancialSummary = {
    sourceKind: ChatReverseOfferFinancialSource;
    targetAmount: number;
    agreedHeadcount: number;
    currentHeadcount: number;
    agreedPerPersonAmount: number;
    agreedRemainder: number;
    currentPerPersonAmount: number;
    currentRemainder: number;
    comparisonNeeded: boolean;
};

function buildSnapshot(payload: {
    sourceKind: ChatReverseOfferFinancialSource;
    targetAmount: number;
    agreedHeadcount: number;
    currentHeadcount: number;
}): ReverseOfferFinancialSummary | null {
    const { sourceKind, targetAmount, agreedHeadcount, currentHeadcount } =
        payload;

    if (targetAmount <= 0 || agreedHeadcount <= 0 || currentHeadcount <= 0) {
        return null;
    }

    const agreedPerPersonAmount = Math.floor(targetAmount / agreedHeadcount);
    const agreedRemainder = targetAmount % agreedHeadcount;
    const currentPerPersonAmount = Math.floor(targetAmount / currentHeadcount);
    const currentRemainder = targetAmount % currentHeadcount;

    return {
        sourceKind,
        targetAmount,
        agreedHeadcount,
        currentHeadcount,
        agreedPerPersonAmount,
        agreedRemainder,
        currentPerPersonAmount,
        currentRemainder,
        comparisonNeeded:
            agreedHeadcount !== currentHeadcount ||
            agreedPerPersonAmount !== currentPerPersonAmount ||
            agreedRemainder !== currentRemainder,
    };
}

export function toReverseOfferFinancialSnapshot(
    summary: ReverseOfferFinancialSummary,
): ChatReverseOfferFinancialSnapshot {
    return { ...summary };
}

export function resolveReverseOfferFinancialSummary(
    room: SpotChatRoom,
): ReverseOfferFinancialSummary | null {
    const feedItem = room.sourceFeedId
        ? (MOCK_FEED.find((item) => item.id === room.sourceFeedId) ?? null)
        : null;
    const management = room.sourceFeedId
        ? MOCK_FEED_MANAGEMENT[room.sourceFeedId]
        : undefined;

    if (feedItem && management) {
        const availability = resolveParticipationAvailability(
            feedItem,
            management,
        );

        return buildSnapshot({
            sourceKind: 'management',
            targetAmount: management.demand.fundingGoal,
            agreedHeadcount: resolveParticipationMaxHeadcount(
                feedItem,
                management,
            ),
            currentHeadcount: availability.currentParticipantCount,
        });
    }

    return buildSnapshot({
        sourceKind: 'estimated',
        targetAmount: room.spot.pointCost,
        agreedHeadcount: room.spot.participants.length,
        currentHeadcount: room.spot.participants.length,
    });
}
