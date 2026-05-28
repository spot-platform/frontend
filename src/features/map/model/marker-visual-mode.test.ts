import { describe, expect, it } from 'vitest';
import {
    decideMarkerVisualMode,
    SIMPLE_MARKER_COUNT_THRESHOLD,
    SIMPLE_MARKER_ZOOM_THRESHOLD,
    shouldRenderPersonaDots,
} from './marker-visual-mode';

describe('decideMarkerVisualMode', () => {
    it('keeps non-selected markers simple at low zoom', () => {
        expect(
            decideMarkerVisualMode({
                mapZoom: SIMPLE_MARKER_ZOOM_THRESHOLD,
                viewportMarkerCount: 1,
            }),
        ).toBe('simple');
    });

    it('forces selected markers to full mode even at low zoom', () => {
        expect(
            decideMarkerVisualMode({
                mapZoom: SIMPLE_MARKER_ZOOM_THRESHOLD,
                viewportMarkerCount: SIMPLE_MARKER_COUNT_THRESHOLD,
                selected: true,
            }),
        ).toBe('full');
    });

    it('uses full markers at high zoom when the visible viewport marker count is low', () => {
        expect(
            decideMarkerVisualMode({
                mapZoom: SIMPLE_MARKER_ZOOM_THRESHOLD + 1,
                viewportMarkerCount: SIMPLE_MARKER_COUNT_THRESHOLD - 1,
            }),
        ).toBe('full');
    });

    it('keeps non-selected markers simple when the visible viewport marker count is high', () => {
        expect(
            decideMarkerVisualMode({
                mapZoom: SIMPLE_MARKER_ZOOM_THRESHOLD + 1,
                viewportMarkerCount: SIMPLE_MARKER_COUNT_THRESHOLD,
            }),
        ).toBe('simple');
    });

    it('lets the selected marker stay full at high zoom even when the viewport is dense', () => {
        expect(
            decideMarkerVisualMode({
                mapZoom: SIMPLE_MARKER_ZOOM_THRESHOLD + 1,
                viewportMarkerCount: SIMPLE_MARKER_COUNT_THRESHOLD,
                selected: true,
            }),
        ).toBe('full');
    });
});

describe('shouldRenderPersonaDots', () => {
    it('keeps persona dots visible whenever the active layer allows personas', () => {
        expect(shouldRenderPersonaDots({ showPersonas: true })).toBe(true);
    });

    it('hides persona dots only when the active layer disables personas', () => {
        expect(shouldRenderPersonaDots({ showPersonas: false })).toBe(false);
    });
});
