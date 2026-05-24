import type { ReactNode } from 'react';

interface FormCardProps {
    title: string;
    showTitle?: boolean;
    children: ReactNode;
}

export function FormCard({ title, showTitle = true, children }: FormCardProps) {
    const titleClass = showTitle
        ? 'text-base font-bold text-gray-900'
        : 'sr-only';

    return (
        <div className="flex flex-col gap-6 bg-white">
            <h3 className={titleClass}>{title}</h3>
            {children}
        </div>
    );
}
