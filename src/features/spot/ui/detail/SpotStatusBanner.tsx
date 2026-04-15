'use client';

import { motion } from 'framer-motion';
import type { SpotStatus } from '@/entities/spot/types';

interface SpotStatusBannerProps {
    status: SpotStatus;
}

const STEPS: { status: SpotStatus | SpotStatus[]; label: string }[] = [
    { status: 'OPEN', label: '모집 중' },
    { status: 'MATCHED', label: '활동 중' },
    { status: 'CLOSED', label: '완료' },
];

function getStepIndex(status: SpotStatus): number {
    if (status === 'OPEN') return 0;
    if (status === 'MATCHED') return 1;
    if (status === 'CLOSED') return 2;
    return -1; // CANCELLED
}

const PROGRESS_WIDTH: Record<SpotStatus, string> = {
    OPEN: '16%',
    MATCHED: '50%',
    CLOSED: '100%',
    CANCELLED: '0%',
};

const STATUS_DESCRIPTION: Record<SpotStatus, string> = {
    OPEN: '참여자를 모집하고 있어요',
    MATCHED: '파트너와 활동 중이에요',
    CLOSED: '활동이 완료됐어요',
    CANCELLED: '스팟이 취소됐어요',
};

export function SpotStatusBanner({ status }: SpotStatusBannerProps) {
    const activeIndex = getStepIndex(status);
    const isCancelled = status === 'CANCELLED';

    return (
        <div className="mx-4 rounded-2xl bg-gray-50 px-5 py-4">
            {/* 설명 텍스트 */}
            <p
                className={`mb-3 text-sm font-semibold ${isCancelled ? 'text-red-400' : 'text-gray-700'}`}
            >
                {STATUS_DESCRIPTION[status]}
            </p>

            {/* 스텝 라벨 */}
            {!isCancelled && (
                <div className="mb-2 flex justify-between">
                    {STEPS.map((step, idx) => (
                        <span
                            key={idx}
                            className={`text-xs font-semibold ${
                                idx <= activeIndex
                                    ? 'text-brand-800'
                                    : 'text-gray-300'
                            }`}
                        >
                            {step.label}
                        </span>
                    ))}
                </div>
            )}

            {/* 진행 바 */}
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                    className={`h-full rounded-full ${isCancelled ? 'bg-red-300' : 'bg-brand-800'}`}
                    initial={{ width: 0 }}
                    animate={{ width: PROGRESS_WIDTH[status] }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}
