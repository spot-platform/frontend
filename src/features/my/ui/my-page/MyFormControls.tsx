import {
    useId,
    type InputHTMLAttributes,
    type ReactNode,
    type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/shared/lib/cn';

type FieldProps = {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string | null;
    children: ReactNode;
    className?: string;
};

export function MyField({
    label,
    required = false,
    hint,
    error,
    children,
    className,
}: FieldProps) {
    return (
        <label className={cn('flex flex-col gap-2', className)}>
            <span className="text-sm font-medium text-gray-900">
                {label}
                {required ? (
                    <span className="ml-0.5 text-red-500">*</span>
                ) : null}
            </span>
            {children}
            {error ? (
                <span className="text-xs text-red-600">{error}</span>
            ) : hint ? (
                <span className="text-xs text-gray-500">{hint}</span>
            ) : null}
        </label>
    );
}

export function MyInput(props: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={cn(
                'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500 disabled:bg-gray-50',
                props.className,
            )}
        />
    );
}

export function MyTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className={cn(
                'min-h-28 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500 disabled:bg-gray-50',
                props.className,
            )}
        />
    );
}

type MessageProps = {
    tone: 'success' | 'error' | 'muted';
    children: ReactNode;
};

export function MyMessage({ tone, children }: MessageProps) {
    const toneClassName =
        tone === 'success'
            ? 'border-green-200 bg-green-50 text-green-700'
            : tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-gray-200 bg-gray-50 text-gray-600';

    return (
        <div
            className={cn('rounded-xl border px-3 py-2 text-sm', toneClassName)}
        >
            {children}
        </div>
    );
}

type ActionButtonProps = {
    children: ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
};

export function MyActionButton({
    children,
    onClick,
    type = 'button',
    disabled = false,
    variant = 'primary',
    className,
}: ActionButtonProps) {
    const variantClassName =
        variant === 'primary'
            ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800'
            : variant === 'danger'
              ? 'border-red-300 bg-white text-red-600 hover:bg-red-50'
              : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                variantClassName,
                className,
            )}
        >
            {children}
        </button>
    );
}

type ToggleRowProps = {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
};

export function MyToggleRow({
    label,
    description,
    checked,
    onChange,
    disabled = false,
    className,
}: ToggleRowProps) {
    const descriptionId = useId();

    return (
        <div
            className={cn(
                'flex items-center justify-between gap-4 py-3 transition-colors hover:bg-gray-50/80 active:bg-gray-50',
                className,
            )}
        >
            <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p
                    id={descriptionId}
                    className="mt-1 text-xs leading-5 text-gray-500"
                >
                    {description}
                </p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                aria-describedby={descriptionId}
                onClick={() => onChange(!checked)}
                disabled={disabled}
                className={cn(
                    'relative h-7 w-12 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                    checked
                        ? 'border-gray-900 bg-gray-900'
                        : 'border-gray-300 bg-gray-200',
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white transition-transform',
                        checked ? 'translate-x-6' : 'translate-x-0.5',
                    )}
                />
            </button>
        </div>
    );
}
