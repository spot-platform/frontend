import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPersona } from '@/entities/persona/types';

type AuthState = {
    token: string | null;
    userId: string | null;
    isAuthenticated: boolean;

    hasCompletedOnboarding: boolean;
    userPersona: UserPersona | null;

    setToken: (token: string, userId: string) => void;
    clearAuth: () => void;

    setPersona: (persona: UserPersona) => void;
    resetPersona: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            userId: null,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            userPersona: null,

            setToken: (token, userId) => {
                set((state) => {
                    const userChanged =
                        state.userId !== null && state.userId !== userId;
                    return {
                        token,
                        userId,
                        isAuthenticated: true,
                        ...(userChanged
                            ? {
                                  userPersona: null,
                                  hasCompletedOnboarding: false,
                              }
                            : {}),
                    };
                });
            },

            clearAuth: () => {
                set({
                    token: null,
                    userId: null,
                    isAuthenticated: false,
                    hasCompletedOnboarding: false,
                    userPersona: null,
                });
            },

            setPersona: (persona) => {
                set({ userPersona: persona, hasCompletedOnboarding: true });
            },

            resetPersona: () => {
                set({ userPersona: null, hasCompletedOnboarding: false });
            },
        }),
        {
            name: 'spot-auth',
            partialize: (state) => ({
                token: state.token,
                userId: state.userId,
                userPersona: state.userPersona,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
            }),
            onRehydrateStorage: () => (state) => {
                const token = state?.token ?? null;

                if (state) {
                    state.isAuthenticated = Boolean(
                        state.token && state.userId,
                    );
                    state.hasCompletedOnboarding = Boolean(
                        state.hasCompletedOnboarding && state.userPersona,
                    );
                }

                void token;
            },
        },
    ),
);
