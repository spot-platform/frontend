import { Chip } from '@frontend/design-system';
import type { SpotStatus, SpotType } from '@/entities/spot/types';

type Size = 'sm' | 'md';

const CHIP_SIZE: Record<Size, 'sm' | 'md'> = {
    sm: 'sm',
    md: 'md',
};

const SIZE_CLASSES: Record<Size, string> = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
};

const STATUS_STYLES: Record<SpotStatus, string> = {
    OPEN: 'border-transparent bg-emerald-100 text-emerald-700',
    MATCHED: 'border-transparent bg-blue-100 text-blue-700',
    CLOSED: 'border-transparent bg-gray-100 text-gray-500',
    CANCELLED: 'border-transparent bg-red-100 text-red-500',
};

const STATUS_LABELS: Record<SpotStatus, string> = {
    OPEN: '모집 중',
    MATCHED: '매칭됨',
    CLOSED: '완료',
    CANCELLED: '취소됨',
};

const TYPE_STYLES: Record<SpotType, string> = {
    OFFER: 'border-transparent bg-accent/10 text-accent',
    REQUEST: 'border-transparent bg-brand-800/10 text-brand-800',
};

const TYPE_LABELS: Record<SpotType, string> = {
    OFFER: 'Offer',
    REQUEST: 'Request',
};

interface StatusBadgeProps {
    status: SpotStatus;
    size?: Size;
}

interface TypeBadgeProps {
    type: SpotType;
    size?: Size;
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    return (
        <Chip
            size={CHIP_SIZE[size]}
            className={`font-semibold ${SIZE_CLASSES[size]} ${STATUS_STYLES[status]}`}
        >
            {STATUS_LABELS[status]}
        </Chip>
    );
}

export function TypeBadge({ type, size = 'sm' }: TypeBadgeProps) {
    return (
        <Chip
            size={CHIP_SIZE[size]}
            className={`font-semibold ${SIZE_CLASSES[size]} ${TYPE_STYLES[type]}`}
        >
            {TYPE_LABELS[type]}
        </Chip>
    );
}
