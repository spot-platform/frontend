'use client';

// Supporter / Partner role picker. Two large toggle cards.

import { motion } from 'framer-motion';
import { cn } from '@frontend/design-system';
import type { UserPersonaRole } from '@/entities/persona/types';

type RoleOption = {
    value: UserPersonaRole;
    emoji: string;
    title: string;
    description: string;
};

const ROLE_OPTIONS: readonly RoleOption[] = [
    {
        value: 'SUPPORTER',
        emoji: '🛠️',
        title: '서포터',
        description: '내가 잘하는 걸 동네에 나눠요',
    },
    {
        value: 'PARTNER',
        emoji: '🎒',
        title: '파트너',
        description: '관심 있는 모임에 참여해요',
    },
];

type RoleSelectorProps = {
    value?: UserPersonaRole;
    onChange: (role: UserPersonaRole) => void;
    className?: string;
};

export function RoleSelector({
    value,
    onChange,
    className,
}: RoleSelectorProps) {
    return (
        <div
            className={cn('grid grid-cols-2 gap-3', className)}
            role="radiogroup"
            aria-label="역할 선택"
        >
            {ROLE_OPTIONS.map((option) => {
                const isSelected = value === option.value;
                return (
                    <motion.button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onChange(option.value)}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                            'flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors',
                            isSelected
                                ? 'border-primary bg-accent-muted'
                                : 'border-border-soft bg-background hover:bg-muted',
                        )}
                    >
                        <span className="text-3xl">{option.emoji}</span>
                        <span className="text-base font-semibold text-foreground">
                            {option.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {option.description}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
