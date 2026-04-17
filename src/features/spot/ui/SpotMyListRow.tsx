import Link from 'next/link';
import { IconChevronDown } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { Spot } from '@/entities/spot/types';

const STATUS_TEXT: Record<Spot['status'], string> = {
    OPEN: '파트너 모집 중',
    MATCHED: '활동 진행 중',
    CLOSED: '활동 완료',
    CANCELLED: '취소됨',
};

const STATUS_TEXT_COLOR: Record<Spot['status'], string> = {
    OPEN: 'text-emerald-600',
    MATCHED: 'text-blue-600',
    CLOSED: 'text-gray-400',
    CANCELLED: 'text-red-400',
};

interface RecruitingRowProps {
    spot: Spot;
    expanded: boolean;
    onToggle: () => void;
}

export function RecruitingSpotRow({
    spot,
    expanded,
    onToggle,
}: RecruitingRowProps) {
    return (
        <div className="flex items-center gap-3 py-2.5">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100" />

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                    {spot.title}
                </p>
                <p
                    className={`mt-0.5 text-xs ${STATUS_TEXT_COLOR[spot.status]}`}
                >
                    {STATUS_TEXT[spot.status]}
                </p>
            </div>

            <button
                onClick={onToggle}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 active:bg-gray-100"
                aria-label={expanded ? '닫기' : '상세 보기'}
            >
                <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                >
                    <IconChevronDown size={16} className="text-gray-500" />
                </motion.div>
            </button>
        </div>
    );
}

interface InProgressRowProps {
    spot: Spot;
}

export function InProgressSpotRow({ spot }: InProgressRowProps) {
    return (
        <Link href={`/spot/${spot.id}`} className="block active:opacity-70">
            <div className="flex items-center gap-3 py-2.5">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100" />

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                        {spot.title}
                    </p>
                    <p
                        className={`mt-0.5 text-xs ${STATUS_TEXT_COLOR[spot.status]}`}
                    >
                        {STATUS_TEXT[spot.status]}
                    </p>
                </div>
            </div>
        </Link>
    );
}
