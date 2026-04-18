'use client';

import type { ReactNode } from 'react';
import { Drawer as VaulDrawer } from 'vaul';
import { cn } from '../lib/cn';
import { PersistentDrawer, type BottomSheetSnapPoint } from './Drawer';

export type { BottomSheetSnapPoint };

export interface BottomSheetProps {
    open: boolean;
    onClose?: () => void;
    title?: string;
    children: ReactNode;
    snapPoint?: BottomSheetSnapPoint;
    onSnapChange?: (snap: BottomSheetSnapPoint) => void;
    persistent?: boolean;
    className?: string;
}

export function BottomSheet({
    open,
    onClose,
    title,
    children,
    snapPoint = 'half',
    onSnapChange,
    persistent = false,
    className,
}: BottomSheetProps) {
    if (persistent) {
        return (
            <PersistentDrawer
                open={open}
                snapPoint={snapPoint}
                onSnapChange={onSnapChange}
                className={className}
            >
                {children}
            </PersistentDrawer>
        );
    }

    return (
        <VaulDrawer.Root
            open={open}
            onOpenChange={(next) => {
                if (!next) onClose?.();
            }}
        >
            <VaulDrawer.Portal>
                <VaulDrawer.Overlay className="fixed inset-0 z-50 bg-overlay" />
                <VaulDrawer.Content
                    aria-describedby={undefined}
                    className={cn(
                        'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] max-w-lg flex-col rounded-t-xl bg-background shadow-xl',
                        className,
                    )}
                >
                    <div className="mx-auto mt-3 mb-2 h-1 w-10 shrink-0 rounded-full bg-border-strong" />
                    {title ? (
                        <VaulDrawer.Title className="px-4 pb-2 text-base font-semibold text-foreground">
                            {title}
                        </VaulDrawer.Title>
                    ) : (
                        <VaulDrawer.Title className="sr-only">
                            Bottom sheet
                        </VaulDrawer.Title>
                    )}
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
                        {children}
                    </div>
                </VaulDrawer.Content>
            </VaulDrawer.Portal>
        </VaulDrawer.Root>
    );
}
