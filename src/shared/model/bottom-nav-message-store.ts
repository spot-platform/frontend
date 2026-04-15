'use client';

import { create } from 'zustand';

type BottomNavMessageState = {
    message: string | null;
    routePrefix: string | null;
    showMessage: (message: string, routePrefix: string) => void;
    clearMessage: () => void;
};

export const useBottomNavMessageStore = create<BottomNavMessageState>()(
    (set) => ({
        message: null,
        routePrefix: null,
        showMessage: (message, routePrefix) => set({ message, routePrefix }),
        clearMessage: () => set({ message: null, routePrefix: null }),
    }),
);
