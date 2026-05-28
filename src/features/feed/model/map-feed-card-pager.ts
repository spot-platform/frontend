export const MAX_PROMOTED_FEED_CARDS = 7;

export function getVisiblePromotedCardRange(
    promotedCount: number,
    total: number,
    maxVisible: number = MAX_PROMOTED_FEED_CARDS,
) {
    const safePromoted = Math.min(Math.max(promotedCount, 0), total);
    const visibleStart = Math.max(0, safePromoted - maxVisible);

    return {
        safePromoted,
        visibleStart,
        visibleEnd: safePromoted,
    };
}
