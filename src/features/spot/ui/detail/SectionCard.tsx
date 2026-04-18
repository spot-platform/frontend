'use client';

import type { ReactNode } from 'react';
import {
    useSpotDetailStore,
    type ActiveModal,
} from '../../model/spot-detail-store';

interface SectionCardProps {
    title: string;
    children: ReactNode;
    manageModal?: ActiveModal;
    manageLabel?: string;
}

export function SectionCard({
    title,
    children,
    manageModal,
    manageLabel = '관리',
}: SectionCardProps) {
    const openModal = useSpotDetailStore((s) => s.openModal);

    return (
        <div className="mx-4 rounded-xl border border-border-soft bg-card px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-text-secondary">
                    {title}
                </h2>
                {manageModal && (
                    <button
                        type="button"
                        onClick={() => openModal(manageModal)}
                        className="rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-text-secondary transition-colors active:bg-border-soft"
                    >
                        {manageLabel}
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}
