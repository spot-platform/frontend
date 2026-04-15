import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        'bg-brand-800 text-white hover:bg-brand-700 focus-visible:ring-brand-100',
    secondary:
        'border border-brand-200 bg-brand-50 text-brand-900 hover:border-brand-300 hover:bg-brand-100 focus-visible:ring-brand-100',
    ghost: 'bg-white text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-100',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-9 rounded-xl px-4 text-sm',
    md: 'h-10 rounded-2xl px-4 text-sm',
    lg: 'h-11 rounded-2xl px-5 text-sm',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    fullWidth?: boolean;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    startIcon,
    endIcon,
    fullWidth = false,
    type = 'button',
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                'inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
                fullWidth && 'w-full',
                variantStyles[variant],
                sizeStyles[size],
                className,
            )}
            {...props}
        >
            {startIcon}
            {children}
            {endIcon}
        </button>
    );
}
