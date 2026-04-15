import type { Metadata } from 'next';
import { MyRecentPageClient } from '@/features/my';

export const metadata: Metadata = { title: '최근 본 게시글' };

export default function MyRecentPage() {
    return <MyRecentPageClient />;
}
