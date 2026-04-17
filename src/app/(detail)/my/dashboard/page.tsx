import type { Metadata } from 'next';
import { SupporterDashboardClient } from '@/features/feed/client/SupporterDashboardClient';

export const metadata: Metadata = { title: '서포터 대시보드' };

export default function MyDashboardPage() {
    return <SupporterDashboardClient />;
}
