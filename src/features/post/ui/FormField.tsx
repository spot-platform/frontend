import type { ReactNode } from 'react';

interface FormFieldProps {
    label: string;
    required?: boolean;
    labelSize?: 'display' | 'compact';
    children: ReactNode;
}

export function FormField({
    label,
    required,
    labelSize = 'display',
    children,
}: FormFieldProps) {
    const labelClass =
        labelSize === 'display'
            ? 'text-[1.375rem] leading-snug font-bold tracking-[-0.02em] text-gray-950'
            : 'text-sm font-semibold text-gray-700';

    return (
        <div className="flex flex-col gap-3">
            <label className={labelClass}>
                {label}
                {required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}
