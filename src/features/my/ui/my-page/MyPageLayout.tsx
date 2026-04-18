import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { DetailHeader, DetailPageShell } from '@/shared/ui';

type MyPageLayoutProps = {
    title: string;
    description: string;
    children: ReactNode;
    actions?: ReactNode;
};

export function MyPageLayout({
    title,
    description,
    children,
    actions,
}: MyPageLayoutProps) {
    return (
        <>
            <DetailHeader title={title} />
            <DetailPageShell
                as="main"
                px="md"
                gap="md"
                topInset="md"
                bottomInset="lg"
                className="bg-surface"
            >
                <section className="mx-[-1rem] border-b border-border-soft bg-card px-4 pb-4">
                    <h1 className="text-lg font-semibold text-foreground">
                        {title}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                        {description}
                    </p>
                    {actions ? <div className="mt-3">{actions}</div> : null}
                </section>
                {children}
            </DetailPageShell>
        </>
    );
}

type MyPageSectionProps = {
    title: string;
    description?: string;
    children: ReactNode;
    actions?: ReactNode;
    className?: string;
    contentClassName?: string;
};

export function MyPageSection({
    title,
    description,
    children,
    actions,
    className,
    contentClassName,
}: MyPageSectionProps) {
    return (
        <section className={cn('mx-[-1rem] bg-card', className)}>
            <div className="flex items-start justify-between gap-3 border-b border-border-soft px-4 py-3">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        {title}
                    </h2>
                    {description ? (
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {description}
                        </p>
                    ) : null}
                </div>
                {actions}
            </div>
            <div className={cn('px-4 py-4', contentClassName)}>{children}</div>
        </section>
    );
}

type MyPageSummaryListProps = {
    children: ReactNode;
    className?: string;
};

export function MyPageSummaryList({
    children,
    className,
}: MyPageSummaryListProps) {
    return (
        <dl className={cn('divide-y divide-border-soft', className)}>
            {children}
        </dl>
    );
}

type MyPageSummaryRowProps = {
    label: string;
    value?: ReactNode;
    detail?: ReactNode;
    className?: string;
    valueClassName?: string;
};

export function MyPageSummaryRow({
    label,
    value,
    detail,
    className,
    valueClassName,
}: MyPageSummaryRowProps) {
    return (
        <div
            className={cn(
                'flex items-start justify-between gap-4 py-3',
                className,
            )}
        >
            <div className="min-w-0 flex-1">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                {detail ? (
                    <dd className="mt-1 text-sm leading-5 text-text-secondary">
                        {detail}
                    </dd>
                ) : null}
            </div>
            {typeof value !== 'undefined' ? (
                <dd
                    className={cn(
                        'shrink-0 text-right text-sm font-medium text-foreground',
                        valueClassName,
                    )}
                >
                    {value}
                </dd>
            ) : null}
        </div>
    );
}
