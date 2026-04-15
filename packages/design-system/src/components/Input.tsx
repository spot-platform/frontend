import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    error?: string;
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    {
        className,
        label,
        hint,
        error,
        startAdornment,
        endAdornment,
        id,
        ...props
    },
    ref,
) {
    return (
        <label className="flex w-full flex-col gap-1.5">
            {label && (
                <span className="text-sm font-semibold text-gray-700">
                    {label}
                </span>
            )}
            <span className="relative block">
                {startAdornment && (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {startAdornment}
                    </span>
                )}
                <input
                    id={id}
                    ref={ref}
                    className={cn(
                        'h-11 w-full rounded-xl border bg-white text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-gray-100 placeholder:text-gray-400',
                        startAdornment ? 'pl-11 pr-4' : 'px-4',
                        endAdornment && 'pr-11',
                        error
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                            : 'border-gray-200',
                        className,
                    )}
                    {...props}
                />
                {endAdornment && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {endAdornment}
                    </span>
                )}
            </span>
            {error ? (
                <span className="text-xs font-medium text-red-500">
                    {error}
                </span>
            ) : (
                hint && <span className="text-xs text-gray-500">{hint}</span>
            )}
        </label>
    );
});
