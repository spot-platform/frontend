'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';
import type { ToasterProps } from 'sonner';

export type AppToasterProps = ToasterProps;

const defaultToastOptions: NonNullable<ToasterProps['toastOptions']> = {
    classNames: {
        toast: 'rounded-2xl border border-border-soft bg-card text-foreground shadow-lg',
        title: 'text-sm font-semibold text-foreground',
        description: 'text-xs text-muted-foreground',
        actionButton: 'rounded-full bg-foreground text-background',
        cancelButton: 'rounded-full bg-muted text-foreground',
        closeButton: 'border-border-soft bg-card text-muted-foreground',
    },
};

export function AppToaster(props: AppToasterProps) {
    const { toastOptions, ...toasterProps } = props;
    const mergedToastOptions: ToasterProps['toastOptions'] = {
        ...defaultToastOptions,
        ...toastOptions,
        classNames: {
            ...defaultToastOptions.classNames,
            ...toastOptions?.classNames,
        },
    };

    return (
        <SonnerToaster
            position="bottom-center"
            richColors
            closeButton
            {...toasterProps}
            toastOptions={mergedToastOptions}
        />
    );
}

export { toast };
