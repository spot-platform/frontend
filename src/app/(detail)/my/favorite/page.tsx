import type { Metadata } from 'next';
import { MyFavoritePageClient } from '@/features/my';

export const metadata: Metadata = { title: '찜한 게시글' };

export default function MyFavoritePage() {
    return <MyFavoritePageClient />;
}
