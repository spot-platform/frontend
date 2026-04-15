import type { Metadata } from 'next';
import { MyPageClient } from '@/features/my';

export const metadata: Metadata = { title: '내 정보' };

export default function MyPage() {
    return <MyPageClient />;
}
