import type { Metadata } from 'next';
import { DetailHeader, DetailPageShell } from '@/shared/ui';

export const metadata: Metadata = { title: '알림' };

export default function NotificationsPage() {
    return (
        <>
            <DetailHeader title="알림" />
            <DetailPageShell topInset="sm" bottomInset="lg">
                <div className="flex flex-col gap-4 px-4">
                    <section>
                        <h2 className="text-sm font-semibold text-gray-700">
                            필터
                        </h2>
                        <ul className="mt-1 text-sm text-gray-500">
                            <li>안 읽음</li>
                            <li>전체</li>
                        </ul>
                    </section>
                    <section>
                        <h2 className="text-sm font-semibold text-gray-700">
                            알림 목록
                        </h2>
                        <ul className="mt-1 text-sm text-gray-500">
                            <li>댓글 / 답글</li>
                            <li>좋아요 / 반응</li>
                            <li>멘션 / 참여 요청</li>
                        </ul>
                    </section>
                </div>
            </DetailPageShell>
        </>
    );
}
