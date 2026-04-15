import type { Metadata } from 'next';
import { MyHistoryPageClient } from '@/features/my';

export const metadata: Metadata = { title: '히스토리' };

export default function MyHistoryPage() {
    return <MyHistoryPageClient />;
}
