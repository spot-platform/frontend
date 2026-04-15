import type { Metadata } from 'next';
import { MyPointPageClient } from '@/features/my';

export const metadata: Metadata = { title: '포인트' };

export default function MyPointPage() {
    return <MyPointPageClient />;
}
