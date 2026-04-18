'use client';

import { cn } from '@/shared/lib/cn';

export interface HeaderTabOption {
    value: string;
    label: string;
}

interface HeaderTabsProps {
    options: readonly HeaderTabOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function HeaderTabs({
    options,
    value,
    onChange,
    className,
}: HeaderTabsProps) {
    return (
        <div
            role="tablist"
            className={cn('flex items-center gap-5', className)}
        >
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => {
                            if (!active) onChange(option.value);
                        }}
                        className={cn(
                            'relative cursor-pointer select-none text-lg font-black leading-none tracking-[-0.03em] text-foreground focus:outline-none',
                            'transition-[transform,color,opacity] duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left will-change-transform',
                            active
                                ? 'scale-100 opacity-100'
                                : 'scale-[0.88] text-muted-foreground opacity-90',
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
