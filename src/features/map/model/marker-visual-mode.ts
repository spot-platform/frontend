export type MarkerVisualMode = 'full' | 'simple';

export const SIMPLE_MARKER_ZOOM_THRESHOLD = 14;
export const SIMPLE_MARKER_COUNT_THRESHOLD = 28;
export const COARSE_POINTER_PERSONA_PULSE_COUNT_THRESHOLD = 12;

const PERSONA_DOT_PULSE_ZOOM_THRESHOLD = SIMPLE_MARKER_ZOOM_THRESHOLD;

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

type PersonaDotPulseInput = {
    showPersonas: boolean;
    mapZoom: number;
    viewportMarkerCount: number;
    viewportReady?: boolean;
    isCoarsePointer?: boolean;
};

export function shouldAnimatePersonaDots({
    showPersonas,
    mapZoom,
    viewportMarkerCount,
    viewportReady = true,
    isCoarsePointer = false,
}: PersonaDotPulseInput): boolean {
    if (!showPersonas) return false;
    if (!viewportReady) return true;
    if (mapZoom <= PERSONA_DOT_PULSE_ZOOM_THRESHOLD) return false;
    if (viewportMarkerCount >= SIMPLE_MARKER_COUNT_THRESHOLD) return false;
    if (
        isCoarsePointer &&
        viewportMarkerCount >= COARSE_POINTER_PERSONA_PULSE_COUNT_THRESHOLD
    ) {
        return false;
    }
    return true;
}
