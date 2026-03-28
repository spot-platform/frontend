import type { Metadata } from 'next';

export const metadata: Metadata = { title: '내 정보' };

export default function MyPage() {
    return (
        <main>
            <h1>내 정보</h1>
            {/* TODO: Profile + ParticipationHistory components */}
        </main>
    );
}
