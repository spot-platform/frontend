import type { Metadata } from 'next';
import { MySupportProfilePageClient } from '@/features/my';

export const metadata: Metadata = { title: '서포터 프로필' };

export default function MySupportProfilePage() {
    return <MySupportProfilePageClient />;
}
