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
                    <span className="text-sm font-semibold text-gray-700">
                        {label}
                    </span>
                )}
                <textarea
                    id={id}
                    ref={ref}
                    rows={rows}
                    className={cn(
                        'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-gray-100 placeholder:text-gray-400',
                        error
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                            : 'border-gray-200',
                        className,
                    )}
                    {...props}
                />
                {error ? (
                    <span className="text-xs font-medium text-red-500">
                        {error}
                    </span>
                ) : (
                    hint && (
                        <span className="text-xs text-gray-500">{hint}</span>
                    )
                )}
            </label>
        );
    },
);
