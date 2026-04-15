import Link from 'next/link';
import { getAdminPostListHref } from '../model/selectors';

export function AdminPostPagination({
    currentPage,
    totalPages,
}: {
    currentPage: number;
    totalPages: number;
}) {
    return (
        <nav
            className="flex items-center justify-center gap-2"
            aria-label="admin post pagination"
        >
            <Link
                href={getAdminPostListHref(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                    currentPage === 1
                        ? 'pointer-events-none border-border-soft bg-panel-muted text-text-muted'
                        : 'border-border-soft bg-panel text-text-secondary hover:bg-panel-muted'
                }`}
            >
                이전
            </Link>

            <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;

                    return (
                        <Link
                            key={page}
                            href={getAdminPostListHref(page)}
                            aria-current={
                                page === currentPage ? 'page' : undefined
                            }
                            className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-semibold transition-colors ${
                                page === currentPage
                                    ? 'border-text-primary text-text-primary'
                                    : 'border-transparent text-text-muted hover:border-border-soft hover:text-text-secondary'
                            }`}
                        >
                            {page}
                        </Link>
                    );
                })}
            </div>

            <Link
                href={getAdminPostListHref(
                    Math.min(totalPages, currentPage + 1),
                )}
                aria-disabled={currentPage === totalPages}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                    currentPage === totalPages
                        ? 'pointer-events-none border-border-soft bg-panel-muted text-text-muted'
                        : 'border-border-soft bg-panel text-text-secondary hover:bg-panel-muted'
                }`}
            >
                다음
            </Link>
        </nav>
    );
}
