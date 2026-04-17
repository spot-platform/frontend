'use client';

// 5-archetype emoji grid + short description.

import { motion } from 'framer-motion';
import { cn } from '@frontend/design-system';
import {
    ARCHETYPES,
    ARCHETYPE_DESCRIPTION,
    ARCHETYPE_EMOJI,
    ARCHETYPE_LABEL,
} from '@/entities/persona/labels';
import type { PersonaArchetype } from '@/entities/persona/types';

type ArchetypeSelectorProps = {
    value?: PersonaArchetype;
    onChange: (archetype: PersonaArchetype) => void;
    className?: string;
};

export function ArchetypeSelector({
    value,
    onChange,
    className,
}: ArchetypeSelectorProps) {
    return (
        <div
            className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3', className)}
            role="radiogroup"
            aria-label="페르소나 유형 선택"
        >
            {ARCHETYPES.map((archetype) => {
                const isSelected = value === archetype;
                return (
                    <motion.button
                        key={archetype}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onChange(archetype)}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                            'flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition-colors',
                            isSelected
                                ? 'border-primary bg-brand-50'
                                : 'border-border-soft bg-background hover:bg-neutral-50',
                        )}
                    >
                        <span className="text-3xl">
                            {ARCHETYPE_EMOJI[archetype]}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                            {ARCHETYPE_LABEL[archetype]}
                        </span>
                        <span className="text-[11px] leading-snug text-muted-foreground">
                            {ARCHETYPE_DESCRIPTION[archetype]}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
