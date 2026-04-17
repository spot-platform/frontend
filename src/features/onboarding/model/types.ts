// Onboarding wizard step + draft selection shape.

import type {
    PersonaArchetype,
    UserPersonaRole,
} from '@/entities/persona/types';

export type OnboardingStep = 'INTRO' | 'SELECT' | 'PREVIEW';

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
    'INTRO',
    'SELECT',
    'PREVIEW',
] as const;

export type OnboardingSelection = {
    role: UserPersonaRole;
    archetype: PersonaArchetype;
    interests: string[];
};
