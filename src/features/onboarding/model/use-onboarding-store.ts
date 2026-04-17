// Onboarding wizard state (step + draft selection). Non-persisted: finalized result lives in auth-store (Phase 2).

import { create } from 'zustand';
import type {
    PersonaArchetype,
    UserPersonaRole,
} from '@/entities/persona/types';
import {
    ONBOARDING_STEPS,
    type OnboardingSelection,
    type OnboardingStep,
} from './types';

type OnboardingState = {
    step: OnboardingStep;
    selection: Partial<OnboardingSelection>;
    hasCompleted: boolean;

    setRole: (role: UserPersonaRole) => void;
    setArchetype: (archetype: PersonaArchetype) => void;
    toggleInterest: (interest: string) => void;
    goNext: () => void;
    goPrev: () => void;
    markCompleted: () => void;
    reset: () => void;
};

const INITIAL_STATE: Pick<
    OnboardingState,
    'step' | 'selection' | 'hasCompleted'
> = {
    step: 'INTRO',
    selection: { interests: [] },
    hasCompleted: false,
};

function shiftStep(current: OnboardingStep, delta: 1 | -1): OnboardingStep {
    const index = ONBOARDING_STEPS.indexOf(current);
    const nextIndex = Math.min(
        Math.max(index + delta, 0),
        ONBOARDING_STEPS.length - 1,
    );
    return ONBOARDING_STEPS[nextIndex] ?? current;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
    ...INITIAL_STATE,

    setRole: (role) =>
        set((state) => ({
            selection: { ...state.selection, role },
        })),

    setArchetype: (archetype) =>
        set((state) => ({
            selection: { ...state.selection, archetype },
        })),

    toggleInterest: (interest) =>
        set((state) => {
            const current = state.selection.interests ?? [];
            const next = current.includes(interest)
                ? current.filter((item) => item !== interest)
                : [...current, interest];
            return { selection: { ...state.selection, interests: next } };
        }),

    goNext: () => set((state) => ({ step: shiftStep(state.step, 1) })),
    goPrev: () => set((state) => ({ step: shiftStep(state.step, -1) })),

    markCompleted: () => set({ hasCompleted: true }),

    reset: () => set({ ...INITIAL_STATE, selection: { interests: [] } }),
}));
