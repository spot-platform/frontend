import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPersona } from '@/entities/persona/types';

type AuthState = {
    token: string | null;
    userId: string | null;
    isAuthenticated: boolean;

    hasCompletedOnboarding: boolean;
    userPersona: UserPersona | null;

    setSession: (userId: string) => void;
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

            setSession: (userId) => {
                set((state) => {
                    const userChanged =
                        state.userId !== null && state.userId !== userId;
                    return {
                        token: null,
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
                userId: state.userId,
                userPersona: state.userPersona,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.token = null;
                    state.isAuthenticated = false;
                    state.hasCompletedOnboarding = Boolean(
                        state.hasCompletedOnboarding && state.userPersona,
                    );
                }
            },
        },
    ),
);
