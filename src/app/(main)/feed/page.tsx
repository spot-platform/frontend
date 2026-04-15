import type { Metadata } from 'next';
import { FeedPageClient } from '@/features/feed';

export const metadata: Metadata = { title: 'Feed' };

export default async function FeedPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const { tab } = await searchParams;
    const activeTab = (tab ?? 'HOME').toUpperCase();

    return <FeedPageClient activeTab={activeTab} />;
}
