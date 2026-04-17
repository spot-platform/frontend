import type { ReactNode, ElementType } from 'react';
import { cn } from '../lib/cn';

type ShellVariant = 'main' | 'detail' | 'immersive' | 'auth';
type PaddingScale = 'none' | 'sm' | 'md' | 'lg';
type GapScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ShellProps {
    children: ReactNode;
    variant?: ShellVariant;
    as?: ElementType;
    padding?: PaddingScale;
    gap?: GapScale;
    className?: string;
}

const PADDING_CLASSES: Record<PaddingScale, string> = {
    none: '',
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-6',
};

const GAP_CLASSES: Record<GapScale, string> = {
    none: '',
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
};

const VARIANT_CLASSES: Record<ShellVariant, string> = {
    main: [
        'flex min-w-0 flex-col',
        'pt-[calc(var(--spacing-header-h)+env(safe-area-inset-top)+1.5rem)]',
        'pb-[calc(var(--spacing-nav-h)+env(safe-area-inset-bottom))]',
        'lg:pl-[var(--spacing-sidebar-w)] lg:pt-0 lg:pb-0',
    ].join(' '),
    detail: [
        'flex min-w-0 flex-col',
        'min-h-[calc(100dvh-var(--spacing-header-h)-env(safe-area-inset-top))]',
        'lg:mx-auto lg:max-w-3xl',
    ].join(' '),
    immersive: 'relative h-dvh w-full',
    auth: [
        'flex min-h-dvh flex-col items-center justify-center',
        'px-4 py-8',
        'sm:px-6',
    ].join(' '),
};

export function Shell({
    children,
    variant = 'main',
    as: Tag = variant === 'auth' ? 'div' : 'main',
    padding = 'none',
    gap = 'md',
    className,
}: ShellProps) {
    return (
        <Tag
            className={cn(
                VARIANT_CLASSES[variant],
                PADDING_CLASSES[padding],
                GAP_CLASSES[gap],
                className,
            )}
        >
            {children}
        </Tag>
    );
}
