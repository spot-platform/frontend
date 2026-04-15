'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';

type BottomSheetSnapPoint = 'half' | 'full';

const spring = { type: 'spring', stiffness: 320, damping: 30 } as const;

const snapPointHeights: Record<BottomSheetSnapPoint, string> = {
    half: '55vh',
    full: '92vh',
};

export interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    snapPoint?: BottomSheetSnapPoint;
    className?: string;
}

export function BottomSheet({
    open,
    onClose,
    title,
    children,
    snapPoint = 'half',
    className,
}: BottomSheetProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    if (typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {open ? (
                <>
                    <motion.button
                        key="bottom-sheet-backdrop"
                        type="button"
                        aria-label="바텀시트 닫기"
                        className="fixed inset-0 z-50 bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    <motion.div
                        key="bottom-sheet-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        className={cn(
                            'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-107.5 flex-col rounded-t-2xl bg-white',
                            className,
                        )}
                        style={{ height: snapPointHeights[snapPoint] }}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={spring}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={{ top: 0.05, bottom: 0.3 }}
                        dragSnapToOrigin={false}
                        onDragEnd={(_event, info) => {
                            if (info.offset.y > 80 || info.velocity.y > 400) {
                                onClose();
                            }
                        }}
                    >
                        <div className="flex shrink-0 flex-col items-center px-5 pt-3 pb-2">
                            <div className="h-1 w-10 rounded-full bg-gray-200" />
                        </div>

                        {title ? (
                            <div className="shrink-0 px-5 pb-3">
                                <h2 className="text-base font-bold text-gray-900">
                                    {title}
                                </h2>
                            </div>
                        ) : null}

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8">
                            {children}
                        </div>
                    </motion.div>
                </>
            ) : null}
        </AnimatePresence>,
        document.body,
    );
}
