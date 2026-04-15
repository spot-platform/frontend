import type { ReactNode } from 'react';

interface FormFieldProps {
    label: string;
    required?: boolean;
    children: ReactNode;
}

export function FormField({ label, required, children }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
                {label}
                {required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}
