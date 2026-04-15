import type { Metadata } from 'next';
import { Main } from '@/shared/ui';

export const metadata: Metadata = { title: '저장됨' };

export default function BookmarksPage() {
    return (
        <Main px="md" gap="md">
            <h1>저장됨</h1>
            <section>
                <h2>저장 목록 분류</h2>
                <ul>
                    <li>저장한 게시물</li>
                    <li>저장한 스팟</li>
                </ul>
            </section>
            <section>
                <h2>정렬</h2>
                <ul>
                    <li>최신순</li>
                    <li>인기순</li>
                    <li>마감 임박순</li>
                </ul>
            </section>
            <section>
                <h2>빈 상태</h2>
                <p>첫 저장 콘텐츠가 없을 때 보여줄 안내 영역</p>
            </section>
        </Main>
    );
}
