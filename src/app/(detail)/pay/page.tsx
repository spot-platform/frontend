import type { Metadata } from 'next';
import { DetailHeader, DetailPageShell } from '@/shared/ui';

export const metadata: Metadata = { title: '포인트' };

export default function PayPage() {
    return (
        <>
            <DetailHeader title="포인트" />
            <DetailPageShell topInset="sm" bottomInset="lg">
                <div className="px-4">
                    <h1 className="text-lg font-semibold">포인트</h1>
                    {/* TODO: PointCharge + PointHistory components */}
                </div>
            </DetailPageShell>
        </>
    );
}
