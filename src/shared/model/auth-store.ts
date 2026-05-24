import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPersona } from '@/entities/persona/types';

const ONBOARDING_PERSONA_STORAGE_KEY = 'spot-onboarding-personas';

type StoredOnboardingPersonas = Record<string, UserPersona>;

function canUseLocalStorage() {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readStoredOnboardingPersonas(): StoredOnboardingPersonas {
    if (!canUseLocalStorage()) return {};

    try {
        const raw = window.localStorage.getItem(ONBOARDING_PERSONA_STORAGE_KEY);
        if (!raw) return {};

        const parsed = JSON.parse(raw) as unknown;
        return parsed && typeof parsed === 'object'
            ? (parsed as StoredOnboardingPersonas)
            : {};
    } catch {
        return {};
    }
}

function getStoredOnboardingPersona(userId: string): UserPersona | null {
    return readStoredOnboardingPersonas()[userId] ?? null;
}

function persistOnboardingPersona(persona: UserPersona) {
    if (!canUseLocalStorage()) return;

    try {
        const personas = readStoredOnboardingPersonas();
        window.localStorage.setItem(
            ONBOARDING_PERSONA_STORAGE_KEY,
            JSON.stringify({ ...personas, [persona.userId]: persona }),
        );
    } catch {
        // localStorage 접근 실패(private mode 등)는 온보딩 흐름을 막지 않는다.
    }
}

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
                    const storedPersona = getStoredOnboardingPersona(userId);
                    const userChanged =
                        state.userId !== null && state.userId !== userId;
                    const shouldRestoreOnboarding =
                        Boolean(storedPersona) ||
                        (state.userId === userId &&
                            state.hasCompletedOnboarding);

                    return {
                        token: null,
                        userId,
                        isAuthenticated: true,
                        ...(shouldRestoreOnboarding
                            ? {
                                  userPersona:
                                      storedPersona ?? state.userPersona,
                                  hasCompletedOnboarding: true,
                              }
                            : userChanged
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
                persistOnboardingPersona(persona);
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

                    if (state.userPersona) {
                        persistOnboardingPersona(state.userPersona);
                    }

                    const storedPersona = state.userId
                        ? getStoredOnboardingPersona(state.userId)
                        : null;
                    state.userPersona = storedPersona ?? state.userPersona;
                    state.hasCompletedOnboarding = Boolean(
                        state.hasCompletedOnboarding && state.userPersona,
                    );
                }
            },
        },
    ),
);
