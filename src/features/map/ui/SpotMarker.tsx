'use client';

import { motion } from 'framer-motion';
import type { SpotMapItem } from '@/entities/spot/types';
import { getCategoryEmoji } from '@/entities/spot/categories';

type Provenance = 'virtual' | 'real' | 'mixed';

type ProvenanceStyle = {
    background: string;
    borderStyle: 'solid' | 'dashed';
    borderColor: string;
    opacity: number;
    pingColor: string;
};

// TODO(design-system): provenance 색상을 디자인 토큰(--color-virtual-500, --color-mixed-500)으로 승격.
const PROVENANCE_STYLE_OFFER: Record<Provenance, ProvenanceStyle> = {
    real: {
        background: '#14b8a6',
        borderStyle: 'solid',
        borderColor: '#ffffff',
        opacity: 1,
        pingColor: '#14b8a6',
    },
    virtual: {
        background: '#a78bfa',
        borderStyle: 'dashed',
        borderColor: '#7c3aed',
        opacity: 0.6,
        pingColor: '#a78bfa',
    },
    mixed: {
        background:
            'linear-gradient(135deg, #14b8a6 0%, #14b8a6 50%, #a78bfa 50%, #a78bfa 100%)',
        borderStyle: 'solid',
        borderColor: '#ffffff',
        opacity: 1,
        pingColor: '#14b8a6',
    },
};

const PROVENANCE_STYLE_REQUEST: Record<Provenance, ProvenanceStyle> = {
    real: {
        background: '#8b5cf6',
        borderStyle: 'solid',
        borderColor: '#ffffff',
        opacity: 1,
        pingColor: '#8b5cf6',
    },
    virtual: {
        background: '#c4b5fd',
        borderStyle: 'dashed',
        borderColor: '#7c3aed',
        opacity: 0.6,
        pingColor: '#c4b5fd',
    },
    mixed: {
        background:
            'linear-gradient(135deg, #8b5cf6 0%, #8b5cf6 50%, #a78bfa 50%, #a78bfa 100%)',
        borderStyle: 'solid',
        borderColor: '#ffffff',
        opacity: 1,
        pingColor: '#8b5cf6',
    },
};

type SpotMarkerProps = {
    spot: SpotMapItem;
    isSelected?: boolean;
    onSelect?: (spotId: string) => void;
    provenance?: Provenance;
};

export function SpotMarker({
    spot,
    isSelected,
    onSelect,
    provenance,
}: SpotMarkerProps) {
    const isOffer = spot.type === 'OFFER';
    const emoji = getCategoryEmoji(spot.category);
    const resolvedProvenance: Provenance =
        provenance ?? spot.provenance ?? 'real';
    const table = isOffer ? PROVENANCE_STYLE_OFFER : PROVENANCE_STYLE_REQUEST;
    const style = table[resolvedProvenance];

    return (
        <motion.button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.(spot.id);
            }}
            className="relative flex items-center justify-center rounded-full text-base shadow-md"
            style={{
                width: 38,
                height: 38,
                background: style.background,
                borderWidth: 2,
                borderStyle: style.borderStyle,
                borderColor: style.borderColor,
                opacity: style.opacity,
            }}
            animate={{
                scale: isSelected ? 1.3 : 1,
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {emoji}
            {isSelected && (
                <motion.span
                    className="absolute inset-0 rounded-full border-2"
                    style={{
                        borderColor: style.pingColor,
                    }}
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}
        </motion.button>
    );
}
