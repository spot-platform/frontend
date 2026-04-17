'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { HighlightClip } from '@/entities/spot/simulation-types';
import type { Persona } from '@/entities/persona/types';
import { HighlightCard } from './HighlightCard';

export type HighlightFeedProps = {
    clips: HighlightClip[];
    personas?: Record<string, Persona>;
    onClipTap?: (clip: HighlightClip) => void;
    emptyMessage?: string;
};

export function HighlightFeed({
    clips,
    personas,
    onClipTap,
    emptyMessage = '아직 기록된 하이라이트가 없어요.',
}: HighlightFeedProps) {
    if (clips.length === 0) {
        return (
            <div className="rounded-xl bg-panel-muted p-6 text-center text-sm text-muted-foreground ring-1 ring-border-soft">
                {emptyMessage}
            </div>
        );
    }

    return (
        <ul className="space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
                {clips.map((clip, index) => (
                    <motion.li
                        key={clip.clip_id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{
                            type: 'spring',
                            stiffness: 320,
                            damping: 28,
                            delay: index * 0.04,
                        }}
                    >
                        <HighlightCard
                            clip={clip}
                            personas={personas}
                            onTap={() => onClipTap?.(clip)}
                        />
                    </motion.li>
                ))}
            </AnimatePresence>
        </ul>
    );
}
