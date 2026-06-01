import { describe, expect, it } from 'vitest';
import {
    COARSE_POINTER_PERSONA_PULSE_COUNT_THRESHOLD,
    decideMarkerVisualMode,
    SIMPLE_MARKER_COUNT_THRESHOLD,
    SIMPLE_MARKER_ZOOM_THRESHOLD,
    shouldAnimatePersonaDots,
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

    it('does not degrade the first render before the viewport bbox is ready', () => {
        expect(
            decideMarkerVisualMode({
                mapZoom: SIMPLE_MARKER_ZOOM_THRESHOLD + 1,
                viewportMarkerCount: SIMPLE_MARKER_COUNT_THRESHOLD + 50,
                viewportReady: false,
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

describe('shouldAnimatePersonaDots', () => {
    it('keeps persona pulse enabled at high zoom with a sparse viewport', () => {
        expect(
            shouldAnimatePersonaDots({
                showPersonas: true,
                mapZoom: SIMPLE_MARKER_ZOOM_THRESHOLD + 1,
                viewportMarkerCount: SIMPLE_MARKER_COUNT_THRESHOLD - 1,
            }),
        ).toBe(true);
    });

    it('disables persona pulse when map zoom already simplifies markers', () => {
        expect(
            shouldAnimatePersonaDots({
                showPersonas: true,
                mapZoom: SIMPLE_MARKER_ZOOM_THRESHOLD,
                viewportMarkerCount: 1,
            }),
        ).toBe(false);
    });

    it('disables persona pulse in dense viewports while keeping dots visible', () => {
        expect(
            shouldAnimatePersonaDots({
                showPersonas: true,
                mapZoom: SIMPLE_MARKER_ZOOM_THRESHOLD + 1,
                viewportMarkerCount: SIMPLE_MARKER_COUNT_THRESHOLD,
            }),
        ).toBe(false);
    });

    it('uses a lower pulse budget on coarse pointer devices', () => {
        expect(
            shouldAnimatePersonaDots({
                showPersonas: true,
                mapZoom: SIMPLE_MARKER_ZOOM_THRESHOLD + 1,
                viewportMarkerCount:
                    COARSE_POINTER_PERSONA_PULSE_COUNT_THRESHOLD,
                isCoarsePointer: true,
            }),
        ).toBe(false);
    });

    it('does not disable pulse before viewport readiness is known', () => {
        expect(
            shouldAnimatePersonaDots({
                showPersonas: true,
                mapZoom: SIMPLE_MARKER_ZOOM_THRESHOLD + 1,
                viewportMarkerCount: SIMPLE_MARKER_COUNT_THRESHOLD + 50,
                viewportReady: false,
                isCoarsePointer: true,
            }),
        ).toBe(true);
    });
});
