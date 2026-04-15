import { Button } from '@frontend/design-system';
import type { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            {icon && <div className="text-gray-300">{icon}</div>}
            <p className="text-sm font-semibold text-gray-500">{title}</p>
            {description && (
                <p className="text-xs text-gray-400">{description}</p>
            )}
            {action && (
                <Button onClick={action.onClick} className="mt-2">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
