'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { LayerType } from '@/features/layer/model/use-layer-store';

const LAYER_OVERLAY: Record<LayerType, string> = {
    mixed: 'bg-transparent',
    real: 'bg-amber-900/5',
    virtual: 'bg-violet-900/10',
};

type LayerTransitionProps = {
    activeLayer: LayerType;
};

export function LayerTransition({ activeLayer }: LayerTransitionProps) {
    if (activeLayer === 'mixed') return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeLayer}
                className={`pointer-events-none fixed inset-0 z-10 ${LAYER_OVERLAY[activeLayer]}`}
                initial={{ opacity: 0, filter: 'blur(8px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(8px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
        </AnimatePresence>
    );
}
