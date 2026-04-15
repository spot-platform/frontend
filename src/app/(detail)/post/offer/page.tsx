import type { Metadata } from 'next';
import { OfferFormClient } from '@/features/post';

export const metadata: Metadata = { title: '해볼래 - 스팟 생성' };

export default function OfferPage() {
    return <OfferFormClient />;
}
