'use client';

import { PersistentDrawer, type BottomSheetSnapPoint } from './Drawer';
import type { ReactNode } from 'react';

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
    children,
    snapPoint = 'half',
    onSnapChange,
    className,
}: BottomSheetProps) {
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
