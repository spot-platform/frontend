import type { Metadata } from 'next';
import { Main } from '@/shared/ui';

export const metadata: Metadata = { title: '포인트' };

export default function PayPage() {
    return (
        <Main px="md" gap="md">
            <h1>포인트</h1>
            {/* TODO: PointCharge + PointHistory components */}
        </Main>
    );
}
