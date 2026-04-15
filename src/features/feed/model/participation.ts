import type { FeedItem, FeedManagementFlow } from './types';

export type FeedParticipationRole = 'SUPPORTER' | 'PARTNER';
export const PARTICIPATION_DEPOSIT_RATE = 0.2;

export type FeedParticipationAvailability = {
    supporterDisabled: boolean;
    partnerDisabled: boolean;
    maxHeadcount: number;
    supporterSlotCount: number;
    partnerSlotCount: number;
    remainingSupporterSlots: number;
    remainingPartnerSlots: number;
    currentParticipantCount: number;
};

export type FeedParticipationPricing = {
    role: FeedParticipationRole;
    defaultTargetAmount: number;
    targetAmount: number;
    maxHeadcount: number;
    participantShare: number;
    depositRate: number;
    deposit: number;
    categoryAverageGoal: number | null;
    categoryAverageParticipantShare: number | null;
    categoryAverageDeposit: number | null;
    categoryAverageDelta: number | null;
};

type FeedParticipationPricingOptions = {
    role?: FeedParticipationRole;
    desiredFundingGoal?: number | null;
    categoryAverageGoal?: number | null;
};

function normalizePositiveAmount(value?: number | null): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return null;
    }

    const normalized = Math.round(value);

    return normalized > 0 ? normalized : null;
}

function getSlotLabels(management?: FeedManagementFlow): string[] {
    return management?.demand.partnerSlotLabels ?? [];
}

function resolveSupporterSlotCount(
    item: FeedItem,
    management?: FeedManagementFlow,
): number {
    const slotLabels = getSlotLabels(management);
    const labeledSupporterSlots = slotLabels.filter((label) =>
        label.includes('서포터'),
    ).length;

    if (labeledSupporterSlots > 0) {
        return labeledSupporterSlots;
    }

    return item.authorProfile?.role === 'PARTNER' ? 1 : 0;
}

function resolvePartnerSlotCount(
    item: FeedItem,
    management?: FeedManagementFlow,
): number {
    const slotLabels = getSlotLabels(management);

    if (slotLabels.length > 0) {
        return slotLabels.filter((label) => !label.includes('서포터')).length;
    }

    if (
        typeof management?.demand.requiredPartners === 'number' &&
        management.demand.requiredPartners > 0
    ) {
        return item.authorProfile?.role === 'PARTNER'
            ? Math.max(management.demand.requiredPartners - 1, 0)
            : management.demand.requiredPartners;
    }

    if (typeof item.maxParticipants === 'number' && item.maxParticipants > 0) {
        return item.maxParticipants;
    }

    if (typeof item.partnerCount === 'number' && item.partnerCount > 0) {
        return item.partnerCount;
    }

    return 0;
}

function resolveTargetAmount(
    item: FeedItem,
    management?: FeedManagementFlow,
): number {
    return management?.demand.fundingGoal ?? item.price;
}

export function resolveParticipationPricing(
    item: FeedItem,
    management?: FeedManagementFlow,
    options: FeedParticipationPricingOptions = {},
): FeedParticipationPricing {
    const defaultTargetAmount = resolveTargetAmount(item, management);
    const targetAmount =
        normalizePositiveAmount(options.desiredFundingGoal) ??
        defaultTargetAmount;
    const maxHeadcount = resolveParticipationMaxHeadcount(item, management);
    const participantShare = targetAmount / maxHeadcount;
    const deposit = Math.round(participantShare * PARTICIPATION_DEPOSIT_RATE);
    const categoryAverageGoal =
        normalizePositiveAmount(options.categoryAverageGoal) ?? null;
    const categoryAverageParticipantShare =
        categoryAverageGoal != null ? categoryAverageGoal / maxHeadcount : null;
    const categoryAverageDeposit =
        categoryAverageParticipantShare != null
            ? Math.round(
                  categoryAverageParticipantShare * PARTICIPATION_DEPOSIT_RATE,
              )
            : null;

    return {
        role: options.role ?? 'PARTNER',
        defaultTargetAmount,
        targetAmount,
        maxHeadcount,
        participantShare,
        depositRate: PARTICIPATION_DEPOSIT_RATE,
        deposit,
        categoryAverageGoal,
        categoryAverageParticipantShare,
        categoryAverageDeposit,
        categoryAverageDelta:
            categoryAverageGoal != null
                ? targetAmount - categoryAverageGoal
                : null,
    };
}

export function resolveParticipationMaxHeadcount(
    item: FeedItem,
    management?: FeedManagementFlow,
): number {
    const slotLabels = getSlotLabels(management);

    if (slotLabels.length > 0) {
        return slotLabels.length;
    }

    if (
        typeof management?.demand.requiredPartners === 'number' &&
        management.demand.requiredPartners > 0
    ) {
        return management.demand.requiredPartners;
    }

    if (typeof item.maxParticipants === 'number' && item.maxParticipants > 0) {
        return item.maxParticipants;
    }

    if (typeof item.partnerCount === 'number' && item.partnerCount > 0) {
        return item.partnerCount;
    }

    return 1;
}

export function resolveParticipationDeposit(
    item: FeedItem,
    management?: FeedManagementFlow,
): number {
    return resolveParticipationPricing(item, management).deposit;
}

export function resolveParticipationAvailability(
    item: FeedItem,
    management?: FeedManagementFlow,
): FeedParticipationAvailability {
    const maxHeadcount = resolveParticipationMaxHeadcount(item, management);
    const supporterSlotCount = resolveSupporterSlotCount(item, management);
    const partnerSlotCount = resolvePartnerSlotCount(item, management);
    const currentSupporterCount =
        item.authorProfile?.role === 'SUPPORTER' ? 1 : 0;
    const currentPartnerCount = Math.max(
        management?.demand.confirmedPartners ?? item.partnerCount ?? 0,
        0,
    );
    const currentParticipantCount = currentSupporterCount + currentPartnerCount;
    const remainingSupporterSlots = Math.max(
        supporterSlotCount - currentSupporterCount,
        0,
    );
    const remainingPartnerSlots = Math.max(
        partnerSlotCount - currentPartnerCount,
        0,
    );

    return {
        supporterDisabled: remainingSupporterSlots === 0,
        partnerDisabled: remainingPartnerSlots === 0,
        maxHeadcount,
        supporterSlotCount,
        partnerSlotCount,
        remainingSupporterSlots,
        remainingPartnerSlots,
        currentParticipantCount,
    };
}
