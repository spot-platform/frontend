import type { Metadata } from 'next';
import { MyPageClient } from '@/features/my';
import { DetailHeader } from '@/shared/ui';

export const metadata: Metadata = { title: '내 정보' };

export default function MyPage() {
    return (
        <>
            <DetailHeader title="내 정보" />
            <MyPageClient />
        </>
    );
}
