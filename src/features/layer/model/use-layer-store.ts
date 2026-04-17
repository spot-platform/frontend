import { create } from 'zustand';

export type LayerType = 'mixed' | 'real' | 'virtual';

type LayerState = {
    activeLayer: LayerType;
    setLayer: (layer: LayerType) => void;
};

export const useLayerStore = create<LayerState>((set) => ({
    activeLayer: 'mixed',
    setLayer: (activeLayer) => set({ activeLayer }),
}));
