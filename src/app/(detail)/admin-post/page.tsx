import type { Metadata } from 'next';
import {
    AdminPostCard,
    AdminPostFaqSection,
    AdminPostPagination,
    MOCK_ADMIN_POST_FAQ,
    getAdminPostPage,
} from '@/features/admin-post';
import { DetailHeader, DetailPageShell } from '@/shared/ui';

export const metadata: Metadata = {
    title: 'Admin Post',
};

export default async function AdminPostListPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page } = await searchParams;
    const parsedPage = Number.parseInt(page ?? '1', 10);
    const { items, currentPage, totalPages } = getAdminPostPage(
        Number.isNaN(parsedPage) ? 1 : parsedPage,
    );

    return (
        <>
            <DetailHeader title="Admin Post" />
            <DetailPageShell
                className="bg-surface"
                px="md"
                gap="lg"
                topInset="md"
                bottomInset="xl"
            >
                <section>
                    <div className="border-b border-border-soft px-1 pb-6 pt-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                            Editorial Notice
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold leading-tight text-text-primary">
                            어드민이 작성한 글입니다
                        </h1>
                        <p className="mt-3 max-w-[34rem] text-sm leading-6 text-text-secondary">
                            지금 반응이 이어지는 Hot Spot과 아직 참여할 수 있는
                            피드를 연결해서 소개합니다. Spot 상세로 바로 뛰기
                            전, 먼저 흐름을 읽고 들어가고 싶은 분을 위한
                            큐레이션입니다.
                        </p>
                    </div>
                </section>

                <section>
                    {items.map((post) => (
                        <AdminPostCard
                            key={post.id}
                            post={post}
                            page={currentPage}
                        />
                    ))}
                </section>

                <section>
                    <AdminPostPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                </section>

                <section>
                    <div className="border-t border-border-soft px-1 pt-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                            Why this exists
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-text-primary">
                            Hot Spot을 읽는 새로운 진입점
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-text-secondary">
                            인기 흐름을 발견했을 때 바로 상세 화면으로 이동하면
                            맥락이 부족할 수 있습니다. adminPost는 어드민
                            시선으로 지금 왜 이 주제가 뜨는지, 그리고 어떤
                            피드부터 참여하면 좋은지 함께 보여주는 안내
                            레이어입니다.
                        </p>
                    </div>
                </section>

                <AdminPostFaqSection items={MOCK_ADMIN_POST_FAQ} />
            </DetailPageShell>
        </>
    );
}
