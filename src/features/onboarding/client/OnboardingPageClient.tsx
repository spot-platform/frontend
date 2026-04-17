'use client';

// 3-step onboarding wizard (INTRO → SELECT → PREVIEW). Saves finalized persona to auth-store and routes to /map.

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@frontend/design-system';
import type { UserPersona } from '@/entities/persona/types';
import { useAuthStore } from '@/shared/model/auth-store';
import { ArchetypeSelector } from '../ui/ArchetypeSelector';
import { InterestTagPicker } from '../ui/InterestTagPicker';
import { PersonaPreview } from '../ui/PersonaPreview';
import { RoleSelector } from '../ui/RoleSelector';
import { WorldIntroSlide } from '../ui/WorldIntroSlide';
import { ONBOARDING_STEPS } from '../model/types';
import { useOnboardingStore } from '../model/use-onboarding-store';

const STEP_TRANSITION = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.25, ease: 'easeOut' as const },
};

export function OnboardingPageClient() {
    const router = useRouter();

    const step = useOnboardingStore((state) => state.step);
    const selection = useOnboardingStore((state) => state.selection);
    const setRole = useOnboardingStore((state) => state.setRole);
    const setArchetype = useOnboardingStore((state) => state.setArchetype);
    const toggleInterest = useOnboardingStore((state) => state.toggleInterest);
    const goNext = useOnboardingStore((state) => state.goNext);
    const goPrev = useOnboardingStore((state) => state.goPrev);
    const reset = useOnboardingStore((state) => state.reset);

    const stepIndex = ONBOARDING_STEPS.indexOf(step);
    const isFirst = stepIndex === 0;

    const canAdvance = useMemo(() => {
        if (step === 'INTRO') return true;
        if (step === 'SELECT') {
            return Boolean(
                selection.role &&
                selection.archetype &&
                (selection.interests?.length ?? 0) > 0,
            );
        }
        return true;
    }, [step, selection]);

    const handleFinish = () => {
        if (!selection.role || !selection.archetype) return;

        // Onboarding can be reached before a full login (dummy / oauth variants); fall back to 'guest' so BE can reconcile later.
        const userId = useAuthStore.getState().userId ?? 'guest';

        const persona: UserPersona = {
            userId,
            role: selection.role,
            archetype: selection.archetype,
            interests: selection.interests ?? [],
            createdAt: new Date().toISOString(),
        };

        useAuthStore.getState().setPersona(persona);
        reset();
        router.replace('/map');
    };

    return (
        <div className="flex w-full flex-col gap-6">
            <div
                className="flex items-center justify-center gap-2"
                aria-label="진행 단계"
            >
                {ONBOARDING_STEPS.map((_, index) => (
                    <span
                        key={index}
                        className={
                            index <= stepIndex
                                ? 'h-1.5 w-8 rounded-full bg-primary transition-colors'
                                : 'h-1.5 w-8 rounded-full bg-border-soft transition-colors'
                        }
                    />
                ))}
            </div>

            <div className="flex flex-col">
                <AnimatePresence mode="wait">
                    {step === 'INTRO' && (
                        <motion.div
                            key="intro"
                            {...STEP_TRANSITION}
                            className="flex flex-col justify-center"
                        >
                            <WorldIntroSlide />
                        </motion.div>
                    )}

                    {step === 'SELECT' && (
                        <motion.div
                            key="select"
                            {...STEP_TRANSITION}
                            className="flex flex-col gap-6"
                        >
                            <section className="flex flex-col gap-3">
                                <header className="flex flex-col gap-1">
                                    <h2 className="text-base font-semibold text-foreground">
                                        어떤 역할로 시작할까요?
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        서포터는 나눠주는 사람, 파트너는
                                        참여하는 사람이에요.
                                    </p>
                                </header>
                                <RoleSelector
                                    value={selection.role}
                                    onChange={setRole}
                                />
                            </section>

                            <section className="flex flex-col gap-3">
                                <header className="flex flex-col gap-1">
                                    <h2 className="text-base font-semibold text-foreground">
                                        나랑 가장 비슷한 유형은?
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        맵에 뜨는 AI 페르소나도 이 유형으로
                                        분류돼요.
                                    </p>
                                </header>
                                <ArchetypeSelector
                                    value={selection.archetype}
                                    onChange={setArchetype}
                                />
                            </section>

                            <section className="flex flex-col gap-3">
                                <header className="flex flex-col gap-1">
                                    <h2 className="text-base font-semibold text-foreground">
                                        관심 있는 카테고리
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        최소 한 개 이상 골라주세요.
                                    </p>
                                </header>
                                <InterestTagPicker
                                    value={selection.interests ?? []}
                                    onToggle={toggleInterest}
                                />
                            </section>
                        </motion.div>
                    )}

                    {step === 'PREVIEW' && (
                        <motion.div
                            key="preview"
                            {...STEP_TRANSITION}
                            className="flex flex-col gap-4"
                        >
                            <header className="flex flex-col gap-1 text-center">
                                <h2 className="text-base font-semibold text-foreground">
                                    이렇게 시작할까요?
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    언제든 프로필에서 수정할 수 있어요.
                                </p>
                            </header>
                            <PersonaPreview
                                role={selection.role}
                                archetype={selection.archetype}
                                interests={selection.interests ?? []}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex gap-3">
                {!isFirst && (
                    <Button
                        type="button"
                        variant="secondary"
                        fullWidth
                        onClick={goPrev}
                    >
                        이전
                    </Button>
                )}
                {step !== 'PREVIEW' ? (
                    <Button
                        type="button"
                        variant="primary"
                        fullWidth
                        disabled={!canAdvance}
                        onClick={goNext}
                    >
                        다음
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="primary"
                        fullWidth
                        onClick={handleFinish}
                    >
                        시작하기
                    </Button>
                )}
            </div>
        </div>
    );
}
