import type { Metadata } from 'next';
import { NotificationsClient } from '@/features/notification/client/NotificationsClient';
import { DetailHeader, DetailPageShell } from '@/shared/ui';

export const metadata: Metadata = { title: '알림' };

export default function NotificationsPage() {
    return (
        <>
            <DetailHeader title="알림" />
            <DetailPageShell topInset="sm" bottomInset="lg">
                <NotificationsClient />
            </DetailPageShell>
        </>
    );
}
