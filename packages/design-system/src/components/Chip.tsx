import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { cva, type VariantProps } from '../lib/cva';

const chipVariants = cva(
    'inline-flex items-center justify-center rounded-full font-medium transition-colors',
    {
        variants: {
            tone: {
                neutral: '',
                brand: '',
            },
            size: {
                sm: 'min-h-7 px-2.5 text-xs',
                md: 'min-h-8 px-3 text-sm',
            },
            selected: {
                true: '',
                false: '',
            },
        },
        compoundVariants: [
            {
                tone: 'neutral',
                selected: false,
                className:
                    'border border-neutral-200 bg-neutral-100 text-neutral-600',
            },
            {
                tone: 'neutral',
                selected: true,
                className: 'border border-brand-200 bg-brand-50 text-brand-900',
            },
            {
                tone: 'brand',
                selected: false,
                className:
                    'border border-neutral-200 bg-background text-neutral-700',
            },
            {
                tone: 'brand',
                selected: true,
                className: 'border-primary bg-primary text-primary-foreground',
            },
        ],
        defaultVariants: {
            tone: 'neutral',
            size: 'md',
            selected: false,
        },
    },
);

type ChipBaseProps = {
    children: ReactNode;
    selected?: boolean;
    tone?: 'neutral' | 'brand';
    size?: 'sm' | 'md';
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
    const classes = cn(chipVariants({ tone, size, selected }), className);

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

export { chipVariants };
