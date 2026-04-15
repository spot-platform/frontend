import type { ReactNode } from 'react';

interface FormCardProps {
    title: string;
    children: ReactNode;
}

export function FormCard({ title, children }: FormCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-700">{title}</h3>
            {children}
        </div>
    );
}
