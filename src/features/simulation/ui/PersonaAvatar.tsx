'use client';

import { motion } from 'framer-motion';
import type { GeoCoord } from '@/entities/spot/types';
import type { Persona } from '@/entities/persona/types';

type PersonaAvatarProps = {
    persona: Persona;
    coord: GeoCoord;
    onClick?: (personaId: string) => void;
    isFollowing?: boolean;
};

export function PersonaAvatar({
    persona,
    onClick,
    isFollowing,
}: PersonaAvatarProps) {
    return (
        <motion.button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(persona.id);
            }}
            className="relative flex items-center justify-center rounded-full border-2 border-background bg-background text-xl shadow-lg"
            style={{ width: 42, height: 42 }}
            animate={{ y: [0, -3, 0] }}
            transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {persona.emoji}
            {isFollowing && (
                <motion.span
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                />
            )}
        </motion.button>
    );
}
