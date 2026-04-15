export const SPOT_VIEWS = ['PARTNER', 'SUPPORTER'] as const;

export type SpotView = (typeof SPOT_VIEWS)[number];
type SpotViewQueryParam = string | string[] | undefined;

export function isSpotView(value: string): value is SpotView {
    return SPOT_VIEWS.some((view) => view === value);
}

function pickSingleView(value: SpotViewQueryParam) {
    return Array.isArray(value) ? value[0] : value;
}

export function getSpotView(value?: SpotViewQueryParam) {
    const normalized = pickSingleView(value)?.trim().toUpperCase();

    return normalized && isSpotView(normalized) ? normalized : 'PARTNER';
}
