'use client';

import { cn } from '@frontend/design-system';
import { useTheme } from '@/shared/model/use-theme';

type ThemeChoice = 'light' | 'dark';

const OPTIONS: ReadonlyArray<{ value: ThemeChoice; label: string }> = [
    { value: 'light', label: '라이트' },
    { value: 'dark', label: '다크' },
];

export function ThemeSegment({ className }: { className?: string }) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const current = theme === 'system' ? resolvedTheme : theme;
    const active: ThemeChoice | undefined =
        current === 'light' || current === 'dark' ? current : undefined;

    return (
        <div
            role="radiogroup"
            aria-label="테마 선택"
            suppressHydrationWarning
            className={cn(
                'inline-flex items-center gap-1 rounded-full border border-border-soft bg-muted p-1',
                className,
            )}
        >
            {OPTIONS.map((opt) => {
                const selected = active === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        suppressHydrationWarning
                        onClick={() => setTheme(opt.value)}
                        className={cn(
                            'min-h-7 rounded-full px-3 text-xs font-medium transition-colors',
                            selected
                                ? 'bg-card text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
