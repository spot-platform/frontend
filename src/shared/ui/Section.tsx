import type { ReactNode, ElementType } from 'react';
import { cn } from '../lib/cn';

type GapScale = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type PxScale = 'none' | 'sm' | 'md' | 'lg';

export interface SectionProps {
    children: ReactNode;
    title?: string;
    gap?: GapScale;
    px?: PxScale;
    as?: ElementType;
    className?: string;
}

const GAP_CLASSES: Record<GapScale, string> = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
};

const PX_CLASSES: Record<PxScale, string> = {
    none: '',
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-6',
};

export function Section({
    children,
    title = '',
    gap = 'md',
    px = 'none',
    as: Tag = 'section',
    className = '',
}: SectionProps) {
    return (
        <Tag
            className={cn(
                'flex flex-col rounded-2xl',
                GAP_CLASSES[gap],
                PX_CLASSES[px],
                className,
            )}
        >
            {title && (
                <h2 className="px-4 text-sm font-bold text-gray-700">
                    {title}
                </h2>
            )}
            {children}
        </Tag>
    );
}
