'use client';

import {
    BottomSheet as DSBottomSheet,
    type BottomSheetProps as DSBottomSheetProps,
} from '@frontend/design-system';

export type BottomSheetProps = Pick<
    DSBottomSheetProps,
    'open' | 'onClose' | 'title' | 'children' | 'snapPoint' | 'className'
>;

export function BottomSheet({
    open,
    onClose,
    title,
    children,
    snapPoint = 'half',
    className,
}: BottomSheetProps) {
    return (
        <DSBottomSheet
            open={open}
            onClose={onClose}
            title={title}
            snapPoint={snapPoint}
            className={className}
        >
            {children}
        </DSBottomSheet>
    );
}
