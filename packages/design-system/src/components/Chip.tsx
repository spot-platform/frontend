import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

type ChipTone = 'neutral' | 'brand';
type ChipSize = 'sm' | 'md';

const toneStyles: Record<ChipTone, { idle: string; selected: string }> = {
    neutral: {
        idle: 'border border-gray-200 bg-gray-100 text-gray-600',
        selected: 'border-brand-200 bg-brand-50 text-brand-900',
    },
    brand: {
        idle: 'border border-brand-200 bg-white text-brand-800',
        selected: 'border-brand-800 bg-brand-800 text-white',
    },
};

const sizeStyles: Record<ChipSize, string> = {
    sm: 'min-h-7 px-2.5 text-xs',
    md: 'min-h-9 px-3 text-sm',
};

type ChipBaseProps = {
    children: ReactNode;
    selected?: boolean;
    tone?: ChipTone;
    size?: ChipSize;
    className?: string;
};

type ClickableChipProps = ChipBaseProps &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
        onClick: NonNullable<
            ButtonHTMLAttributes<HTMLButtonElement>['onClick']
        >;
    };

type StaticChipProps = ChipBaseProps &
    Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick'> & {
        onClick?: undefined;
    };

export type ChipProps = ClickableChipProps | StaticChipProps;

export function Chip({
    children,
    selected = false,
    tone = 'neutral',
    size = 'md',
    className,
    ...props
}: ChipProps) {
    const classes = cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-colors',
        sizeStyles[size],
        selected ? toneStyles[tone].selected : toneStyles[tone].idle,
        className,
    );

    if ('onClick' in props && typeof props.onClick === 'function') {
        const { onClick, type = 'button', ...buttonProps } = props;

        return (
            <button
                type={type}
                onClick={onClick}
                className={classes}
                {...buttonProps}
            >
                {children}
            </button>
        );
    }

    return (
        <span className={classes} {...props}>
            {children}
        </span>
    );
}
