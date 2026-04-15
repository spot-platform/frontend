import type { Metadata } from 'next';
import { MyNotificationSettingsPageClient } from '@/features/my';

export const metadata: Metadata = { title: '알림 설정' };

export default function MyNotificationSettingsPage() {
    return <MyNotificationSettingsPageClient />;
}
