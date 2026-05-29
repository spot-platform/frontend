export type MarkerVisualMode = 'full' | 'simple';

export const SIMPLE_MARKER_ZOOM_THRESHOLD = 14;
export const SIMPLE_MARKER_COUNT_THRESHOLD = 28;

type MarkerVisualModeInput = {
    mapZoom: number;
    viewportMarkerCount: number;
    viewportReady?: boolean;
    selected?: boolean;
};

export function decideMarkerVisualMode({
    mapZoom,
    viewportMarkerCount,
    viewportReady = true,
    selected = false,
}: MarkerVisualModeInput): MarkerVisualMode {
    if (selected) return 'full';
    if (mapZoom <= SIMPLE_MARKER_ZOOM_THRESHOLD) return 'simple';
    if (!viewportReady) return 'full';
    if (viewportMarkerCount >= SIMPLE_MARKER_COUNT_THRESHOLD) return 'simple';
    return 'full';
}

type PersonaDotVisibilityInput = {
    showPersonas: boolean;
};

export function shouldRenderPersonaDots({
    showPersonas,
}: PersonaDotVisibilityInput): boolean {
    return showPersonas;
}
