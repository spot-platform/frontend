import type { Metadata } from 'next';
import { MySettingsPageClient } from '@/features/my';

export const metadata: Metadata = { title: '기본 정보' };

export default function MySettingsPage() {
    return <MySettingsPageClient />;
}
