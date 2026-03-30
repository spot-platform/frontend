import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setTokenAccessor } from '@/shared/api/client';

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
                setTokenAccessor(() => token);
            },

            clearAuth: () => {
                set({ token: null, userId: null, isAuthenticated: false });
                setTokenAccessor(() => null);
            },
        }),
        {
            name: 'spot-auth',
            partialize: (state) => ({
                token: state.token,
                userId: state.userId,
            }),
            onRehydrateStorage: () => (state) => {
                // Re-wire token accessor after hydration from localStorage
                if (state?.token) {
                    const token = state.token;
                    setTokenAccessor(() => token);
                }
            },
        },
    ),
);
