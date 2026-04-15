'use client';

import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';
import { Button } from './Button';
import { IconButton } from './IconButton';

type ModalSize = 'sm' | 'md' | 'lg';

const sizeStyles: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
};

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: ReactNode;
    footer?: ReactNode;
    size?: ModalSize;
    closeLabel?: string;
}

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

    if (!open || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                aria-label={closeLabel}
                className="absolute inset-0 bg-overlay"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={cn(
                    'relative z-10 w-full rounded-xl border border-gray-200 bg-white p-5',
                    sizeStyles[size],
                )}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-bold tracking-[-0.03em] text-gray-950">
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-1 text-sm leading-6 text-gray-500">
                                {description}
                            </p>
                        )}
                    </div>
                    <IconButton
                        icon="×"
                        label={closeLabel}
                        size="sm"
                        onClick={onClose}
                    />
                </div>
                {children && <div className="mt-4">{children}</div>}
                <div className="mt-5 flex justify-end gap-2">
                    {footer ?? (
                        <Button variant="secondary" onClick={onClose}>
                            확인
                        </Button>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}
