import type {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';
import { cn } from '@frontend/design-system';

export function PostTextInput({
    className,
    variant = 'underline',
    align = 'left',
    ...props
}: InputHTMLAttributes<HTMLInputElement> & {
    variant?: 'underline' | 'box' | 'compact';
    align?: 'left' | 'right';
}) {
    return (
        <input
            className={cn(
                'w-full bg-transparent text-gray-950 outline-none transition-colors placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
                variant === 'underline' &&
                    'h-14 rounded-none border-x-0 border-t-0 border-b border-gray-200 px-0 text-lg shadow-none focus:border-primary focus:ring-0',
                variant === 'box' &&
                    'min-h-12 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-base focus:border-primary/40 focus:ring-2 focus:ring-primary/10',
                variant === 'compact' &&
                    'h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-primary/40 focus:ring-2 focus:ring-primary/10',
                align === 'right' && 'text-right tabular-nums',
                className,
            )}
            {...props}
        />
    );
}

export function PostTextarea({
    className,
    variant = 'box',
    ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
    variant?: 'box' | 'compact';
}) {
    return (
        <textarea
            className={cn(
                'w-full resize-none bg-transparent text-gray-950 outline-none transition-colors placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
                variant === 'box' &&
                    'min-h-44 rounded-2xl border border-gray-100 bg-gray-50/70 px-5 py-5 text-base leading-relaxed focus:border-primary/40 focus:ring-2 focus:ring-primary/10',
                variant === 'compact' &&
                    'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed focus:border-primary/40 focus:ring-2 focus:ring-primary/10',
                className,
            )}
            {...props}
        />
    );
}

export function PostAddButton({
    className,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            className={cn(
                'rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/10',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export function PostRemoveButton({
    className,
    children = '삭제',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            className={cn(
                'shrink-0 text-xs font-medium text-gray-400 transition-colors hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/10',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export function PostErrorMessage({ message }: { message: string }) {
    return (
        <p
            className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
            role="alert"
        >
            {message}
        </p>
    );
}
