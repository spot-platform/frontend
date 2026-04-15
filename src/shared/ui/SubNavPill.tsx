'use client';

import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface SubNavPillProps {
    open: boolean;
    children: ReactNode;
    /** nav pill 바닥으로부터의 오프셋 (기본 72px — nav 높이) */
    bottomOffset?: number | string;
}

export function SubNavPill({
    open,
    children,
    bottomOffset = 'calc(var(--spacing-nav-h) - 1rem + env(safe-area-inset-bottom))',
}: SubNavPillProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="sub-nav-pill"
                    initial={{ opacity: 0, y: 10, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    style={{ bottom: bottomOffset }}
                    className="fixed left-1/2 z-60 -translate-x-1/2"
                >
                    <div className="flex items-center gap-1 rounded-full border-2 border-[#3b4954] bg-[#1e2938] px-3 py-1 shadow-2xl">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/** SubNavPill 안에 들어가는 아이콘 버튼 단위 */
export function SubNavPillItem({
    icon,
    label,
    onClickAction,
}: {
    icon: ReactNode;
    label: string;
    onClickAction: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClickAction}
            className="flex flex-col items-center gap-1 rounded-full px-3 py-1.5 text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95 truncate"
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}
