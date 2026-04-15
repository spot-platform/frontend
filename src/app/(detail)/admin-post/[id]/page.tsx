import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    getAdminPostById,
    getAdminPostListHref,
    getRelatedOpenFeedItems,
} from '@/features/admin-post';
import { FeedCard } from '@/features/feed';
import { Carousel, DetailHeader, DetailPageShell } from '@/shared/ui';

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string }>;
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(value));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const post = getAdminPostById(id);

    return {
        title: post?.title ?? 'Admin Post',
    };
}

export default async function AdminPostDetailPage({
    params,
    searchParams,
}: Props) {
    const { id } = await params;
    const { page } = await searchParams;
    const post = getAdminPostById(id);

    if (!post) {
        notFound();
    }

    const parsedPage = Number.parseInt(page ?? '1', 10);
    const sourcePage = Number.isNaN(parsedPage) ? 1 : parsedPage;
    const relatedFeeds = getRelatedOpenFeedItems(post);

    return (
        <>
            <DetailHeader title="Admin Post" showShare />
            <DetailPageShell className="bg-surface" bottomInset="xl">
                <section className="border-b border-border-soft bg-brand-800 px-4 py-6 text-white">
                    <div className="mx-auto max-w-107.5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                            {post.hotSpot.category}
                        </p>
                        <h1 className="mt-2 text-2xl font-bold leading-tight">
                            {post.title}
                        </h1>
                        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-white/75">
                            <span>{post.authorName}</span>
                            <span>{formatDate(post.publishedAt)}</span>
                        </div>
                    </div>
                </section>

                <article className="mx-auto max-w-107.5 px-5 pt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark/80">
                        Curated Intro
                    </p>
                    <h2 className="mt-3 text-xl font-bold leading-snug text-text-primary">
                        {post.introTitle}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-text-secondary">
                        {post.introBody}
                    </p>

                    <div className="my-8 border-l-2 border-accent-dark/30 pl-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-dark/70">
                            Featured Hot Spot
                        </p>
                        <p className="mt-1 text-base font-bold text-text-primary">
                            {post.hotSpot.title}
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                            {post.hotSpot.subtitle}
                        </p>
                    </div>

                    <p className="text-base leading-8 text-text-secondary">
                        {post.summary}
                    </p>
                    <div className="mt-5 space-y-5 text-base leading-8 text-text-secondary">
                        {post.body.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>
                </article>

                {post.type === 'curation' && relatedFeeds.length > 0 && (
                    <section className="pt-8">
                        <div className="px-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark/80">
                                Still Open
                            </p>
                            <h2 className="mt-1 text-lg font-bold text-text-primary">
                                아직 참여 가능한 관련 피드
                            </h2>
                        </div>

                        <p className="px-4 pt-2 text-sm leading-6 text-text-secondary">
                            지금도 열려 있는 모집만 골랐습니다. 큐레이션을 읽고
                            마음이 간 흐름이 있다면 바로 참여를 검토해보세요.
                        </p>

                        <div className="pt-3">
                            <Carousel>
                                {relatedFeeds.map((item) => (
                                    <FeedCard key={item.id} item={item} />
                                ))}
                            </Carousel>
                        </div>
                    </section>
                )}

                <div className="px-5 pt-8">
                    <Link
                        href={getAdminPostListHref(sourcePage)}
                        className="flex w-full items-center justify-center rounded-full border border-border-soft py-3 text-sm font-semibold text-text-secondary"
                    >
                        공지 목록
                    </Link>
                </div>
            </DetailPageShell>
        </>
    );
}
