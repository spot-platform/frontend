export function formatKrw(amount: number) {
    return `${amount.toLocaleString('ko-KR')}원`;
}

function parseWholeNumber(value: string, minimum = 0) {
    if (value.trim() === '') {
        return null;
    }

    const parsed = Number(value);

    if (
        !Number.isFinite(parsed) ||
        !Number.isInteger(parsed) ||
        parsed < minimum
    ) {
        return null;
    }

    return parsed;
}

export function parseBudgetAmount(value: string) {
    return parseWholeNumber(value, 0);
}

export function parsePartnerCount(value: string) {
    return parseWholeNumber(value, 1);
}

export function buildOfferParticipationRows(
    desiredPrice: string,
    maxPartnerCount: string,
) {
    const goalAmount = parseBudgetAmount(desiredPrice);
    const partnerCount = parsePartnerCount(maxPartnerCount);

    if (goalAmount === null || partnerCount === null) {
        return [];
    }

    return Array.from({ length: partnerCount }, (_, index) => {
        const participantCount = index + 1;
        const baseAmount = Math.floor(goalAmount / participantCount);
        const remainder = goalAmount % participantCount;

        return {
            participantCount,
            perPersonAmount: baseAmount,
            remainder,
        };
    });
}

export function buildRequestParticipationRows(
    maxPartnerCount: string,
    priceCapPerPerson: string,
) {
    const partnerCount = parsePartnerCount(maxPartnerCount);
    const priceCap = parseBudgetAmount(priceCapPerPerson);

    if (partnerCount === null || priceCap === null) {
        return [];
    }

    return Array.from({ length: partnerCount }, (_, index) => {
        const participantCount = index + 1;

        return {
            participantCount,
            currentBudget: participantCount * priceCap,
            perPersonCap: priceCap,
        };
    });
}

export function buildOfferGoalAmount(desiredPrice: string) {
    return parseBudgetAmount(desiredPrice);
}

export function buildRequestGoalAmount(
    maxPartnerCount: string,
    priceCapPerPerson: string,
) {
    const partnerCount = parsePartnerCount(maxPartnerCount);
    const priceCap = parseBudgetAmount(priceCapPerPerson);

    if (partnerCount === null || priceCap === null) {
        return null;
    }

    return partnerCount * priceCap;
}
