import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { cva, type VariantProps } from '../lib/cva';

const iconButtonVariants = cva(
    'inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary:
                    'bg-primary text-primary-foreground shadow-sm hover:bg-accent-dark',
                secondary:
                    'border border-border-soft bg-background text-foreground hover:bg-neutral-50',
                ghost: 'text-text-secondary hover:bg-neutral-100',
            },
            size: {
                sm: 'h-8 w-8',
                md: 'h-9 w-9',
                lg: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'secondary',
            size: 'md',
        },
    },
);

export interface IconButtonProps
    extends
        Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
        VariantProps<typeof iconButtonVariants> {
    icon: ReactNode;
    label: string;
    asChild?: boolean;
}

export function IconButton({
    icon,
    label,
    className,
    variant,
    size,
    asChild = false,
    type = 'button',
    ...props
}: IconButtonProps) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            type={asChild ? undefined : type}
            aria-label={label}
            title={label}
            className={cn(iconButtonVariants({ variant, size }), className)}
            {...props}
        >
            {icon}
        </Comp>
    );
}

export { iconButtonVariants };
