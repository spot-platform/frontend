import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
    token: string | null;
    userId: string | null;
    isAuthenticated: boolean;

    setToken: (token: string, userId: string) => void;
    clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            userId: null,
            isAuthenticated: false,

            setToken: (token, userId) => {
                set({ token, userId, isAuthenticated: true });
            },

            clearAuth: () => {
                set({ token: null, userId: null, isAuthenticated: false });
            },
        }),
        {
            name: 'spot-auth',
            partialize: (state) => ({
                token: state.token,
                userId: state.userId,
            }),
            onRehydrateStorage: () => (state) => {
                const token = state?.token ?? null;

                if (state) {
                    state.isAuthenticated = Boolean(
                        state.token && state.userId,
                    );
                }

                void token;
            },
        },
    ),
);
