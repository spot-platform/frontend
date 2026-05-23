import { create } from 'zustand';

export type LayerType = 'mixed' | 'real' | 'virtual';

export const MAP_LAYER_SEQUENCE = [
    'mixed',
    'real',
] as const satisfies readonly LayerType[];

export const LAYER_LABEL: Record<LayerType, string> = {
    mixed: '혼합',
    real: '현실',
    virtual: '시뮬',
};

export function getNextMapLayer(activeLayer: LayerType): LayerType {
    const currentIndex = MAP_LAYER_SEQUENCE.indexOf(
        activeLayer as (typeof MAP_LAYER_SEQUENCE)[number],
    );

    if (currentIndex < 0) return MAP_LAYER_SEQUENCE[0];
    return MAP_LAYER_SEQUENCE[(currentIndex + 1) % MAP_LAYER_SEQUENCE.length];
}

type LayerState = {
    activeLayer: LayerType;
    setLayer: (layer: LayerType) => void;
    toggleMapLayer: () => void;
};

export const useLayerStore = create<LayerState>((set) => ({
    activeLayer: 'mixed',
    setLayer: (activeLayer) => set({ activeLayer }),
    toggleMapLayer: () =>
        set((state) => ({ activeLayer: getNextMapLayer(state.activeLayer) })),
}));
