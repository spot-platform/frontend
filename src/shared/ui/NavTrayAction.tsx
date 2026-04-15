'use client';

import type { ReactNode } from 'react';

interface NavTrayActionProps {
    icon: ReactNode;
    title: string;
    description?: string;
    selected?: boolean;
    tonal?: 'accent' | 'neutral';
    onClick: () => void;
    className?: string;
}

export function NavTrayAction({
    icon,
    title,
    description,
    selected = false,
    tonal = 'neutral',
    onClick,
    className = '',
}: NavTrayActionProps) {
    const toneClass =
        tonal === 'accent'
            ? selected
                ? 'border-brand-300/70 bg-brand-50 text-brand-950'
                : 'border-brand-400/15 bg-brand-400/10 text-white'
            : selected
              ? 'border-white/25 bg-white/16 text-white'
              : 'border-white/10 bg-white/6 text-white';

    const iconClass =
        tonal === 'accent'
            ? selected
                ? 'bg-brand-800 text-white'
                : 'bg-brand-400/18 text-brand-100'
            : selected
              ? 'bg-white text-brand-900'
              : 'bg-white/10 text-white';

    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition active:scale-[0.99] active:bg-white/15',
                toneClass,
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div
                className={[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                    iconClass,
                ].join(' ')}
            >
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-5">{title}</p>
                {description ? (
                    <p
                        className={`mt-0.5 text-[11px] leading-4 ${selected ? 'text-current/75' : 'text-white/55'}`}
                    >
                        {description}
                    </p>
                ) : null}
            </div>
        </button>
    );
}
