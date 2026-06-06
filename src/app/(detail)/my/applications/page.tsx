import type { Metadata } from 'next';
import { MyApplicationsPageClient } from '@/features/my';

export const metadata: Metadata = { title: '신청한 피드' };

export default function MyApplicationsPage() {
    return <MyApplicationsPageClient />;
}
