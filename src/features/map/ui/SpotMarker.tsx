'use client';

import { motion } from 'framer-motion';
import type { SpotMapItem } from '@/entities/spot/types';

const CATEGORY_EMOJI: Record<string, string> = {
    등산: '🥾',
    코딩: '💻',
    요가: '🧘',
    볼더링: '🧗',
    미술: '🎨',
    요리: '🍳',
    운동: '💪',
    음악: '🎵',
    공예: '✂️',
};

type SpotMarkerProps = {
    spot: SpotMapItem;
    isSelected?: boolean;
    onSelect?: (spotId: string) => void;
};

export function SpotMarker({ spot, isSelected, onSelect }: SpotMarkerProps) {
    const isOffer = spot.type === 'OFFER';
    const emoji = CATEGORY_EMOJI[spot.category] ?? '📍';

    return (
        <motion.button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.(spot.id);
            }}
            className="relative flex items-center justify-center rounded-full border-2 border-white text-base shadow-md"
            style={{
                width: 38,
                height: 38,
                backgroundColor: isOffer ? '#14b8a6' : '#8b5cf6',
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
                        borderColor: isOffer ? '#14b8a6' : '#8b5cf6',
                    }}
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}
        </motion.button>
    );
}
