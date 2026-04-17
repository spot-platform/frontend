'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@frontend/design-system';
import { ARCHETYPE_LABEL } from '@/entities/persona/labels';
import type { Persona } from '@/entities/persona/types';

type PersonaProfileCardProps = {
    persona: Persona | null;
    onClose: () => void;
    onFollow?: (personaId: string) => void;
};

export function PersonaProfileCard({
    persona,
    onClose,
    onFollow,
}: PersonaProfileCardProps) {
    return (
        <AnimatePresence>
            {persona && (
                <motion.div
                    key={persona.id}
                    className="pointer-events-auto fixed left-4 right-4 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-40 mx-auto max-w-lg"
                    initial={{ y: 24, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: 24, opacity: 0, filter: 'blur(4px)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                    <div className="flex items-center gap-3 rounded-xl bg-background p-4 shadow-lg ring-1 ring-border-soft/50">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-50 text-2xl">
                            {persona.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground">
                                {persona.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {ARCHETYPE_LABEL[persona.archetype] ??
                                    persona.archetype}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onFollow?.(persona.id)}
                        >
                            따라가기
                        </Button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-xs text-muted-foreground"
                        >
                            닫기
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
