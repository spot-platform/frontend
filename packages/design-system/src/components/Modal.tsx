'use client';

import type { ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './Dialog';
import { Button } from './Button';

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    closeLabel?: string;
}

const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
} as const;

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    closeLabel = '닫기',
}: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className={sizeMap[size]}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                {children && <div className="mt-3">{children}</div>}
                <DialogFooter>
                    {footer ?? (
                        <Button variant="secondary" onClick={onClose}>
                            {closeLabel}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
