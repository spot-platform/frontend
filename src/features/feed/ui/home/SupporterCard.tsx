import Link from 'next/link';
import { IconStar } from '@tabler/icons-react';
import type { SupporterItem } from '../../model/types';

const CATEGORY_COLOR: Record<string, string> = {
    음악: 'bg-violet-100 text-violet-700',
    요리: 'bg-orange-100 text-orange-700',
    운동: 'bg-emerald-100 text-emerald-700',
    공예: 'bg-pink-100 text-pink-700',
    언어: 'bg-blue-100 text-blue-700',
    기타: 'bg-gray-100 text-gray-600',
};

export function SupporterCard({ supporter }: { supporter: SupporterItem }) {
    const href = supporter.relatedOfferId
        ? `/feed/${supporter.relatedOfferId}`
        : `/users/${supporter.id}`;

    return (
        <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white px-4 py-4 gap-3">
            {/* 프로필 상단 */}
            <div className="flex items-center gap-3">
                {/* 아바타 */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-800/10 text-xl font-bold text-brand-800">
                    {supporter.nickname[0]}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900 text-sm">
                            {supporter.nickname}
                        </span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLOR[supporter.category]}`}
                        >
                            {supporter.category}
                        </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                        {supporter.location}
                    </p>
                </div>

                {/* 평점 */}
                <div className="flex items-center gap-0.5 shrink-0">
                    <IconStar
                        size={11}
                        className="fill-amber-400 text-amber-400"
                    />
                    <span className="text-xs font-bold text-gray-700">
                        {supporter.rating}
                    </span>
                </div>
            </div>

            {/* 한 줄 소개 */}
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                {supporter.tagline}
            </p>

            {/* 활동 태그 */}
            <div className="flex flex-wrap gap-1.5">
                {supporter.tags.map((tag) => (
                    <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-600"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* 활동 통계 */}
            <p className="text-[11px] text-gray-400">
                활동 완료{' '}
                <span className="font-bold text-gray-700">
                    {supporter.completedCount}회
                </span>
            </p>

            {/* CTA */}
            <Link
                href={href}
                className="mt-auto flex items-center justify-between rounded-lg bg-brand-800/5 px-3 py-2 text-xs font-semibold text-brand-800 hover:bg-brand-800/10 transition-colors"
            >
                이 서포터와 활동하러 가기
                <span>→</span>
            </Link>
        </div>
    );
}
