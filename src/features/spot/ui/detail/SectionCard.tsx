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
        <div className="mx-4 rounded-xl border border-gray-200 bg-white px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-700">{title}</h2>
                {manageModal && (
                    <button
                        type="button"
                        onClick={() => openModal(manageModal)}
                        className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 transition-colors active:bg-gray-200"
                    >
                        {manageLabel}
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}
