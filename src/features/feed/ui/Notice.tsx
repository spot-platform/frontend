import Link from 'next/link';
import { getAdminPostDetailHref } from '@/features/admin-post';

interface UpdateNoticeProps {
    id: string;
    title: string;
}

export function Notice({ id, title }: UpdateNoticeProps) {
    return (
        <div className=" bg-border-soft px-4 py-3">
            <div className="flex items-center justify-between gap-4">
                <Link
                    href={getAdminPostDetailHref(id)}
                    className="min-w-0 flex-1"
                >
                    <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                        <span>updateReport</span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-text-secondary">
                        {title}
                    </p>
                </Link>
                <Link
                    href={getAdminPostDetailHref(id)}
                    className="shrink-0 text-xs font-semibold text-brand-600 underline underline-offset-2 self-end"
                >
                    더보기
                </Link>
            </div>
        </div>
    );
}
