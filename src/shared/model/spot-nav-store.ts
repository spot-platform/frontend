import { create } from 'zustand';

type SpotNavState = {
    expandedSpotId: string | null;
    setExpandedSpotId: (id: string | null) => void;
    toggleSpot: (id: string) => void;
};

export const useSpotNavStore = create<SpotNavState>()((set, get) => ({
    expandedSpotId: null,
    setExpandedSpotId: (id) => set({ expandedSpotId: id }),
    toggleSpot: (id) =>
        set({ expandedSpotId: get().expandedSpotId === id ? null : id }),
}));
