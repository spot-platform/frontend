import type { Metadata } from 'next';
import { CompletePageClient } from '@/features/post';

export const metadata: Metadata = { title: '스팟 생성 완료' };

export default async function CompletePage({
    searchParams,
}: {
    searchParams: Promise<{ spotId?: string }>;
}) {
    const { spotId } = await searchParams;

    return <CompletePageClient spotId={spotId} />;
}
