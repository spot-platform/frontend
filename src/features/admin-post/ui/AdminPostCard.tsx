import Link from 'next/link';
import { getAdminPostDetailHref } from '../model/selectors';
import type { AdminPost } from '../model/types';

function formatDate(value: string) {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(value));
}

export function AdminPostCard({
    post,
    page,
}: {
    post: AdminPost;
    page?: number;
}) {
    return (
        <Link
            href={getAdminPostDetailHref(post.id, page)}
            className="block border-b border-border-soft px-1 py-5 transition-colors duration-200 hover:bg-panel-muted/60"
        >
            <article className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 text-xs text-text-muted">
                    <span className="font-semibold uppercase tracking-[0.14em] text-text-secondary">
                        어드민 큐레이션
                    </span>
                    <span>{formatDate(post.publishedAt)}</span>
                </div>

                <div className="space-y-2">
                    <h2 className="text-lg font-semibold leading-snug text-text-primary">
                        {post.title}
                    </h2>
                    <p className="line-clamp-2 text-sm leading-6 text-text-secondary">
                        {post.summary}
                    </p>
                </div>

                <div className="border-l border-border-strong pl-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                        {post.hotSpot.category}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                        {post.hotSpot.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">
                        {post.hotSpot.subtitle}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-text-muted">{post.authorName}</span>
                    <span className="font-semibold text-text-secondary">
                        자세히 보기
                    </span>
                </div>
            </article>
        </Link>
    );
}
