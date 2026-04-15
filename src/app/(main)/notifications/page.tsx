import type { Metadata } from 'next';
import { Main } from '@/shared/ui';

export const metadata: Metadata = { title: '알림' };

export default function NotificationsPage() {
    return (
        <Main px="md" gap="md">
            <h1>알림</h1>
            <section>
                <h2>필터</h2>
                <ul>
                    <li>안 읽음</li>
                    <li>전체</li>
                </ul>
            </section>
            <section>
                <h2>알림 목록</h2>
                <ul>
                    <li>댓글 / 답글</li>
                    <li>좋아요 / 반응</li>
                    <li>멘션 / 참여 요청</li>
                </ul>
            </section>
            <section>
                <h2>관리 액션</h2>
                <ul>
                    <li>읽음 처리</li>
                    <li>전체 정리</li>
                </ul>
            </section>
        </Main>
    );
}
