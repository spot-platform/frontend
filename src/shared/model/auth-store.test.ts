import { beforeEach, describe, expect, it } from 'vitest';
import type { UserPersona } from '@/entities/persona/types';
import { useAuthStore } from './auth-store';

const ONBOARDING_PERSONA_STORAGE_KEY = 'spot-onboarding-personas';

const persona: UserPersona = {
    userId: 'user-1',
    role: 'PARTNER',
    archetype: 'explorer',
    interests: ['운동'],
    createdAt: '2026-05-25T00:00:00.000Z',
};

function resetAuthStore() {
    useAuthStore.setState({
        token: null,
        userId: null,
        isAuthenticated: false,
        hasCompletedOnboarding: false,
        userPersona: null,
    });
}

describe('useAuthStore onboarding persistence', () => {
    beforeEach(() => {
        window.localStorage.clear();
        resetAuthStore();
    });

    it('persists completed onboarding persona outside the auth session cache', () => {
        useAuthStore.getState().setPersona(persona);

        const stored = JSON.parse(
            window.localStorage.getItem(ONBOARDING_PERSONA_STORAGE_KEY) ?? '{}',
        );

        expect(stored[persona.userId]).toEqual(persona);
    });

    it('restores onboarding completion for the same user after auth state is cleared', () => {
        useAuthStore.getState().setPersona(persona);
        useAuthStore.getState().clearAuth();

        expect(useAuthStore.getState().hasCompletedOnboarding).toBe(false);

        useAuthStore.getState().setSession(persona.userId);

        expect(useAuthStore.getState().hasCompletedOnboarding).toBe(true);
        expect(useAuthStore.getState().userPersona).toEqual(persona);
    });

    it('does not reuse another user onboarding persona', () => {
        useAuthStore.getState().setPersona(persona);
        useAuthStore.getState().clearAuth();

        useAuthStore.getState().setSession('user-2');

        expect(useAuthStore.getState().hasCompletedOnboarding).toBe(false);
        expect(useAuthStore.getState().userPersona).toBeNull();
    });
});
