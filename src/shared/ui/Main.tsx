import type { ReactNode, ElementType } from 'react';

type PxScale = 'none' | 'sm' | 'md' | 'lg';
type GapScale = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface MainProps {
    children: ReactNode;
    as?: ElementType;
    px?: PxScale;
    gap?: GapScale;
    safeArea?: boolean;
    className?: string;
}

const PX_CLASSES: Record<PxScale, string> = {
    none: 'px-0',
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-6',
};

const GAP_CLASSES: Record<GapScale, string> = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
};

export function Main({
    children,
    as: Tag = 'main',
    px = 'none',
    gap = 'md',
    safeArea = true,
    className = '',
}: MainProps) {
    const classes = [
        'flex min-w-0 flex-col',
        PX_CLASSES[px],
        GAP_CLASSES[gap],
        safeArea
            ? 'pt-[calc(var(--spacing-header-h)+env(safe-area-inset-top)+2rem)] pb-[calc(var(--spacing-nav-h)+env(safe-area-inset-bottom))]'
            : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return <Tag className={classes}>{children}</Tag>;
}
