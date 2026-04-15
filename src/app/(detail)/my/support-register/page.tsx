import type { Metadata } from 'next';
import { MySupportRegisterPageClient } from '@/features/my';

export const metadata: Metadata = { title: '서포터 등록 정보' };

export default function MySupportRegisterPage() {
    return <MySupportRegisterPageClient />;
}
