import type { Metadata } from 'next';
import { RequestFormClient } from '@/features/post';

export const metadata: Metadata = { title: '알려줘 - 스팟 생성' };

export default function RequestPage() {
    return <RequestFormClient />;
}
