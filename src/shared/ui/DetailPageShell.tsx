import type { ElementType, ReactNode } from 'react';
import { cn } from '../lib/cn';

type PxScale = 'none' | 'sm' | 'md' | 'lg';
type GapScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type TopInsetScale = 'none' | 'sm' | 'md' | 'lg';
type BottomInsetScale =
    | 'none'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | 'sticky'
    | 'action-bar'
    | 'submit-bar'
    | 'extended-nav';

export interface DetailPageShellProps {
    children: ReactNode;
    as?: ElementType;
    px?: PxScale;
    gap?: GapScale;
    topInset?: TopInsetScale;
    bottomInset?: BottomInsetScale;
    className?: string;
}

const PX_CLASSES: Record<PxScale, string> = {
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

const TOP_INSET_CLASSES: Record<TopInsetScale, string> = {
    none: '',
    sm: 'pt-2',
    md: 'pt-4',
    lg: 'pt-6',
};

const BOTTOM_INSET_CLASSES: Record<BottomInsetScale, string> = {
    none: '',
    sm: 'pb-4',
    md: 'pb-6',
    lg: 'pb-8',
    xl: 'pb-10',
    sticky: 'pb-24',
    'action-bar': 'pb-28',
    'submit-bar': 'pb-40',
    'extended-nav': 'pb-48',
};

export function DetailPageShell({
    children,
    as: Tag = 'main',
    px = 'none',
    gap = 'none',
    topInset = 'none',
    bottomInset = 'none',
    className,
}: DetailPageShellProps) {
    return (
        <Tag
            className={cn(
                'flex min-h-[calc(100dvh-var(--spacing-header-h)-env(safe-area-inset-top))] min-w-0 flex-col',
                PX_CLASSES[px],
                GAP_CLASSES[gap],
                TOP_INSET_CLASSES[topInset],
                BOTTOM_INSET_CLASSES[bottomInset],
                className,
            )}
        >
            {children}
        </Tag>
    );
}
