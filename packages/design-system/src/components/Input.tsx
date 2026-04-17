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
                <span className="text-sm font-medium text-foreground">
                    {label}
                </span>
            )}
            <span className="relative block">
                {startAdornment && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {startAdornment}
                    </span>
                )}
                <input
                    id={id}
                    ref={ref}
                    className={cn(
                        'flex h-9 w-full rounded-lg border bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                        startAdornment && 'pl-10',
                        endAdornment && 'pr-10',
                        error
                            ? 'border-destructive focus:border-destructive focus:ring-red-200'
                            : 'border-input',
                        className,
                    )}
                    {...props}
                />
                {endAdornment && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {endAdornment}
                    </span>
                )}
            </span>
            {error ? (
                <span className="text-xs font-medium text-destructive">
                    {error}
                </span>
            ) : (
                hint && (
                    <span className="text-xs text-muted-foreground">
                        {hint}
                    </span>
                )
            )}
        </label>
    );
});
