'use client';

import {
    useCallback,
    useEffect,
    useRef,
    type ComponentProps,
    type ReactNode,
} from 'react';
import { Drawer as VaulDrawer } from 'vaul';
import { cn } from '../lib/cn';

function Drawer({ ...props }: ComponentProps<typeof VaulDrawer.Root>) {
    return <VaulDrawer.Root {...props} />;
}

function DrawerTrigger({
    ...props
}: ComponentProps<typeof VaulDrawer.Trigger>) {
    return <VaulDrawer.Trigger {...props} />;
}

function DrawerPortal({ ...props }: ComponentProps<typeof VaulDrawer.Portal>) {
    return <VaulDrawer.Portal {...props} />;
}

function DrawerOverlay({
    className,
    ...props
}: ComponentProps<typeof VaulDrawer.Overlay>) {
    return (
        <VaulDrawer.Overlay
            className={cn('fixed inset-0 z-50 bg-overlay', className)}
            {...props}
        />
    );
}

function DrawerContent({
    className,
    children,
    ...props
}: ComponentProps<typeof VaulDrawer.Content>) {
    return (
        <DrawerPortal>
            <DrawerOverlay />
            <VaulDrawer.Content
                className={cn(
                    'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-lg flex-col rounded-t-xl bg-background',
                    className,
                )}
                {...props}
            >
                <div className="mx-auto mt-3 mb-2 h-1 w-10 shrink-0 rounded-full bg-neutral-300" />
                {children}
            </VaulDrawer.Content>
        </DrawerPortal>
    );
}

function DrawerHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('flex flex-col gap-1 px-4 pb-2', className)}
            {...props}
        />
    );
}

function DrawerFooter({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('flex flex-col gap-2 px-4 pt-2 pb-4', className)}
            {...props}
        />
    );
}

function DrawerTitle({
    className,
    ...props
}: ComponentProps<typeof VaulDrawer.Title>) {
    return (
        <VaulDrawer.Title
            className={cn('text-base font-semibold text-foreground', className)}
            {...props}
        />
    );
}

function DrawerDescription({
    className,
    ...props
}: ComponentProps<typeof VaulDrawer.Description>) {
    return (
        <VaulDrawer.Description
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

function DrawerClose({ ...props }: ComponentProps<typeof VaulDrawer.Close>) {
    return <VaulDrawer.Close {...props} />;
}

export type BottomSheetSnapPoint = 'peek' | 'half' | 'full';

const SNAP_VALUES: Record<BottomSheetSnapPoint, number> = {
    peek: 0.2,
    half: 0.5,
    full: 0.9,
};

const SNAP_POINTS_ARRAY: number[] = [
    SNAP_VALUES.peek,
    SNAP_VALUES.half,
    SNAP_VALUES.full,
];

const SNAP_ENTRIES = Object.entries(SNAP_VALUES) as [
    BottomSheetSnapPoint,
    number,
][];

function resolveSnapKey(
    value: number | string | null,
): BottomSheetSnapPoint | null {
    if (value == null) return null;
    const entry = SNAP_ENTRIES.find(([, v]) => v === value);
    return entry ? entry[0] : null;
}

interface PersistentDrawerProps {
    open: boolean;
    children: ReactNode;
    snapPoint?: BottomSheetSnapPoint;
    onSnapChange?: (snap: BottomSheetSnapPoint) => void;
    className?: string;
}

function PersistentDrawer({
    open,
    children,
    snapPoint = 'half',
    onSnapChange,
    className,
}: PersistentDrawerProps) {
    const activeSnap = SNAP_VALUES[snapPoint];

    const snapChangeRef = useRef(onSnapChange);
    useEffect(() => {
        snapChangeRef.current = onSnapChange;
    }, [onSnapChange]);

    const handleSetActiveSnap = useCallback((snap: number | string | null) => {
        const resolved = resolveSnapKey(snap);
        if (resolved && snapChangeRef.current) {
            snapChangeRef.current(resolved);
        }
    }, []);

    return (
        <VaulDrawer.Root
            open={open}
            snapPoints={SNAP_POINTS_ARRAY}
            activeSnapPoint={activeSnap}
            setActiveSnapPoint={handleSetActiveSnap}
            modal={false}
            dismissible={false}
            handleOnly
        >
            <VaulDrawer.Portal>
                <VaulDrawer.Content
                    className={cn(
                        'fixed inset-x-0 bottom-0 z-50 mx-auto flex h-dvh max-w-lg flex-col rounded-t-xl bg-background shadow-xl',
                        className,
                    )}
                    aria-describedby={undefined}
                >
                    <VaulDrawer.Title className="sr-only">
                        Bottom sheet
                    </VaulDrawer.Title>
                    <VaulDrawer.Handle
                        preventCycle
                        style={{
                            marginTop: '0.75rem',
                            marginBottom: '0.75rem',
                        }}
                    />
                    <div
                        className={cn(
                            'min-h-0 flex-1 px-4 pb-6',
                            snapPoint === 'peek'
                                ? 'overflow-hidden'
                                : 'overflow-y-auto overscroll-contain',
                        )}
                    >
                        {children}
                    </div>
                </VaulDrawer.Content>
            </VaulDrawer.Portal>
        </VaulDrawer.Root>
    );
}

export {
    Drawer,
    DrawerTrigger,
    DrawerPortal,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
    PersistentDrawer,
};
