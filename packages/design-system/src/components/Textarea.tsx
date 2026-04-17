import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    hint?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    function Textarea(
        { className, label, hint, error, id, rows = 4, ...props },
        ref,
    ) {
        return (
            <label className="flex w-full flex-col gap-1.5">
                {label && (
                    <span className="text-sm font-medium text-foreground">
                        {label}
                    </span>
                )}
                <textarea
                    id={id}
                    ref={ref}
                    rows={rows}
                    className={cn(
                        'w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                        error
                            ? 'border-destructive focus:border-destructive focus:ring-red-200'
                            : 'border-input',
                        className,
                    )}
                    {...props}
                />
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
    },
);
