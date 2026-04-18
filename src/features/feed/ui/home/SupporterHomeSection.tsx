'use client';

import Link from 'next/link';
import { Carousel } from '@/shared/ui/Carousel';
import { FeedCard } from '../FeedCard';
import { MOCK_FEED, MOCK_FEED_MANAGEMENT } from '../../model/mock';

const STATUS_LABEL: Record<'LEADING' | 'REVIEWING' | 'WAITING', string> = {
    LEADING: '선두',
    REVIEWING: '검토 중',
    WAITING: '대기',
};

const STATUS_COLOR: Record<'LEADING' | 'REVIEWING' | 'WAITING', string> = {
    LEADING: 'bg-accent text-white',
    REVIEWING: 'bg-brand-800 text-white',
    WAITING: 'bg-muted text-muted-foreground',
};

// 내 분야(요리, 음악) 신규 REQUEST 목록 — TODO: API 연동 시 서포터 분야 기반으로 교체
const MY_FIELDS = ['요리', '음악'];

export function SupporterHomeSection() {
    const newRequests = MOCK_FEED.filter(
        (item) =>
            item.type === 'REQUEST' &&
            item.status === 'OPEN' &&
            item.category != null &&
            MY_FIELDS.includes(item.category),
    );

    // 내 지원 현황 — 첫 번째 피드의 지원 현황을 "내 것"으로 가정
    const myApplications = Object.values(MOCK_FEED_MANAGEMENT)
        .flatMap((flow) =>
            flow.applications.slice(0, 1).map((app) => ({
                ...app,
                feedTitle:
                    MOCK_FEED.find((f) => f.id === flow.feedId)?.title ?? '',
                feedId: flow.feedId,
            })),
        )
        .slice(0, 3);

    return (
        <div className="flex flex-col gap-6">
            {/* 지원 현황 */}
            {myApplications.length > 0 && (
                <section className="flex flex-col gap-2">
                    <h2 className="px-4 text-sm font-bold text-text-secondary">
                        내 지원 현황
                    </h2>
                    <div className="flex flex-col gap-2 px-4">
                        {myApplications.map((app) => (
                            <Link
                                key={app.id + app.feedId}
                                href={`/feed/${app.feedId}`}
                                className="flex items-center justify-between rounded-xl border border-border-soft bg-card px-4 py-3"
                            >
                                <div className="flex min-w-0 flex-col gap-0.5">
                                    <p className="line-clamp-1 text-sm font-semibold text-foreground">
                                        {app.feedTitle}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {app.category} · {app.location}
                                    </p>
                                </div>
                                <span
                                    className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_COLOR[app.status]}`}
                                >
                                    {STATUS_LABEL[app.status]}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* 내 분야 신규 REQUEST */}
            <section className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-4">
                    <h2 className="text-sm font-bold text-text-secondary">
                        내 분야 새 요청
                    </h2>
                    <div className="flex gap-1">
                        {MY_FIELDS.map((field) => (
                            <span
                                key={field}
                                className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-800"
                            >
                                {field}
                            </span>
                        ))}
                    </div>
                </div>
                <Carousel>
                    {newRequests.map((item) => (
                        <FeedCard key={item.id} item={item} />
                    ))}
                </Carousel>
            </section>

            {/* 인기 카테고리 트렌드 */}
            <section className="px-4">
                <h2 className="mb-2 text-sm font-bold text-text-secondary">
                    이번 주 인기 카테고리
                </h2>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: '요리', count: 24 },
                        { label: '음악', count: 18 },
                        { label: '운동', count: 15 },
                        { label: '언어', count: 11 },
                        { label: '공예', count: 9 },
                    ].map((cat) => (
                        <span
                            key={cat.label}
                            className="flex items-center gap-1 rounded-full border border-border-soft px-3 py-1.5 text-xs font-medium text-text-secondary"
                        >
                            {cat.label}
                            <span className="text-[10px] font-bold text-accent">
                                {cat.count}건
                            </span>
                        </span>
                    ))}
                </div>
            </section>
        </div>
    );
}
