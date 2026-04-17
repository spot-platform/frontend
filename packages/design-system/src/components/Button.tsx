import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { cva, type VariantProps } from '../lib/cva';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary:
                    'bg-primary text-primary-foreground shadow-sm hover:bg-accent-dark',
                secondary:
                    'border border-border-soft bg-background text-foreground shadow-xs hover:bg-neutral-50',
                ghost: 'text-foreground hover:bg-neutral-100',
                outline:
                    'border border-brand-200 bg-brand-50 text-brand-900 hover:border-brand-300 hover:bg-brand-100',
                danger: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-red-700',
            },
            size: {
                sm: 'h-8 rounded-lg px-3 text-sm',
                md: 'h-9 rounded-lg px-4 text-sm',
                lg: 'h-10 rounded-lg px-5 text-sm',
                icon: 'h-9 w-9 rounded-lg',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    },
);

export interface ButtonProps
    extends
        ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    fullWidth?: boolean;
}

export function Button({
    className,
    variant,
    size,
    asChild = false,
    startIcon,
    endIcon,
    fullWidth = false,
    type = 'button',
    children,
    ...props
}: ButtonProps) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            type={asChild ? undefined : type}
            className={cn(
                buttonVariants({ variant, size }),
                fullWidth && 'w-full',
                className,
            )}
            {...props}
        >
            {startIcon}
            {children}
            {endIcon}
        </Comp>
    );
}

export { buttonVariants };
