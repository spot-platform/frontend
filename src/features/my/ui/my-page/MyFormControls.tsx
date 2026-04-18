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
            <span className="text-sm font-medium text-foreground">
                {label}
                {required ? (
                    <span className="ml-0.5 text-destructive">*</span>
                ) : null}
            </span>
            {children}
            {error ? (
                <span className="text-xs text-destructive">{error}</span>
            ) : hint ? (
                <span className="text-xs text-muted-foreground">{hint}</span>
            ) : null}
        </label>
    );
}

export function MyInput(props: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={cn(
                'w-full rounded-xl border border-border-strong px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-text-secondary disabled:bg-muted',
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
                'min-h-28 w-full rounded-xl border border-border-strong px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-text-secondary disabled:bg-muted',
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
              : 'border-border-soft bg-muted text-text-secondary';

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
            ? 'border-foreground bg-foreground text-background hover:bg-foreground/90'
            : variant === 'danger'
              ? 'border-red-300 bg-card text-red-600 hover:bg-red-50'
              : 'border-border-strong bg-card text-foreground hover:bg-muted';

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
                'flex items-center justify-between gap-4 py-3 transition-colors hover:bg-muted/80 active:bg-muted',
                className,
            )}
        >
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p
                    id={descriptionId}
                    className="mt-1 text-xs leading-5 text-muted-foreground"
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
                        ? 'border-foreground bg-foreground'
                        : 'border-border-strong bg-border-soft',
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 h-5.5 w-5.5 rounded-full bg-card transition-transform',
                        checked ? 'translate-x-6' : 'translate-x-0.5',
                    )}
                />
            </button>
        </div>
    );
}
