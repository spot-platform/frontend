import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

type IconButtonVariant = 'primary' | 'secondary' | 'ghost';
type IconButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<IconButtonVariant, string> = {
    primary:
        'bg-brand-800 text-white shadow-[0_12px_24px_rgba(13,148,136,0.24)] hover:bg-brand-700 focus-visible:ring-brand-100',
    secondary:
        'border border-gray-200 bg-white text-gray-700 hover:border-brand-200 hover:bg-brand-50 focus-visible:ring-brand-100',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-200',
};

const sizeStyles: Record<IconButtonSize, string> = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-12 w-12',
};

export interface IconButtonProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'children'
> {
    icon: ReactNode;
    label: string;
    variant?: IconButtonVariant;
    size?: IconButtonSize;
}

export function IconButton({
    icon,
    label,
    className,
    variant = 'secondary',
    size = 'md',
    type = 'button',
    ...props
}: IconButtonProps) {
    return (
        <button
            type={type}
            aria-label={label}
            title={label}
            className={cn(
                'inline-flex items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
                variantStyles[variant],
                sizeStyles[size],
                className,
            )}
            {...props}
        >
            {icon}
        </button>
    );
}
