import type { BottomSheetSnapPoint } from '@frontend/design-system';

export const SHEET_VALUES: readonly BottomSheetSnapPoint[] = [
    'peek',
    'half',
    'full',
];
export const DEFAULT_SHEET: BottomSheetSnapPoint = 'peek';

export type MapUrlState = {
    spot: string | null;
    persona: string | null;
    cluster: string | null;
    sheet: BottomSheetSnapPoint;
    chat: boolean;
};

export function pickEnum<T extends string>(
    value: string | null,
    allowed: readonly T[],
): T | null {
    return value && (allowed as readonly string[]).includes(value)
        ? (value as T)
        : null;
}

export function parseMapUrlState(searchParams: URLSearchParams): MapUrlState {
    return {
        spot: searchParams.get('spot'),
        persona: searchParams.get('persona'),
        cluster: searchParams.get('cluster'),
        sheet:
            pickEnum(searchParams.get('sheet'), SHEET_VALUES) ?? DEFAULT_SHEET,
        chat: searchParams.get('chat') === 'open',
    };
}

export function serializeMapUrlState(state: MapUrlState): string {
    const params = new URLSearchParams();
    if (state.spot) params.set('spot', state.spot);
    if (state.persona) params.set('persona', state.persona);
    if (state.cluster) params.set('cluster', state.cluster);
    if (state.sheet !== DEFAULT_SHEET) params.set('sheet', state.sheet);
    if (state.chat) params.set('chat', 'open');
    return params.toString();
}

export type MapRedirectParams = Partial<MapUrlState>;

export function buildMapHref(params?: MapRedirectParams): string {
    const query = serializeMapUrlState({
        spot: params?.spot ?? null,
        persona: params?.persona ?? null,
        cluster: params?.cluster ?? null,
        sheet: params?.sheet ?? DEFAULT_SHEET,
        chat: params?.chat ?? false,
    });
    return query ? `/map?${query}` : '/map';
}
