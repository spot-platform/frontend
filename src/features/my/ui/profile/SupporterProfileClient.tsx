'use client';

import {
    IconStar,
    IconBriefcase,
    IconPhoto,
    IconHistory,
} from '@tabler/icons-react';
import { DetailHeader } from '@/shared/ui/DetailHeader';
import { Section } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type {
    SupporterProfile,
    ProfileReview,
    ProfileHistory,
} from '@/entities/user/types';

// ─── 별점 ─────────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <IconStar
                    key={i}
                    size={size}
                    className={cn(
                        'transition-colors',
                        i <= Math.round(rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-100 text-gray-200',
                    )}
                />
            ))}
        </div>
    );
}

// ─── 아바타 ───────────────────────────────────────────────────────────────────

function Avatar({
    nickname,
    avatarUrl,
}: {
    nickname: string;
    avatarUrl?: string;
}) {
    const initials = nickname.slice(0, 1);
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={nickname}
                className="h-20 w-20 rounded-lg object-cover"
            />
        );
    }
    return (
        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-brand-800 text-2xl font-black text-white">
            {initials}
        </div>
    );
}

// ─── 섹션 헤더 ────────────────────────────────────────────────────────────────

function SectionLabel({
    icon: Icon,
    label,
}: {
    icon: React.ElementType;
    label: string;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <Icon size={13} className="text-gray-400" />
            <span className="text-[11px] font-semibold tracking-[0.16em] text-gray-400 uppercase">
                {label}
            </span>
        </div>
    );
}

// ─── 미디어 갤러리 ────────────────────────────────────────────────────────────

function MediaGallery({ urls }: { urls: string[] }) {
    if (urls.length === 0) {
        return (
            <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                <div className="flex flex-col items-center gap-1.5 text-gray-300">
                    <IconPhoto size={24} />
                    <span className="text-xs">등록된 사진·동영상이 없어요</span>
                </div>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-3 gap-2">
            {urls.map((url, i) => (
                <div
                    key={i}
                    className="aspect-square overflow-hidden rounded-xl bg-gray-100"
                >
                    <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                </div>
            ))}
        </div>
    );
}

// ─── 리뷰 카드 ────────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ProfileReview }) {
    const date = new Date(review.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    return (
        <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-surface p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {review.reviewerNickname.slice(0, 1)}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                        {review.reviewerNickname}
                    </span>
                </div>
                <StarRating rating={review.rating} size={12} />
            </div>
            {review.comment && (
                <p className="text-sm leading-6 text-gray-600">
                    {review.comment}
                </p>
            )}
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    {review.spotTitle}
                </span>
                <span className="text-xs text-gray-300">{date}</span>
            </div>
        </div>
    );
}

// ─── 히스토리 행 ──────────────────────────────────────────────────────────────

function HistoryRow({ item }: { item: ProfileHistory }) {
    const date = new Date(item.completedAt).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
    });
    const typeLabel = item.spotType === 'OFFER' ? 'Offer' : 'Request';
    const typeBg =
        item.spotType === 'OFFER'
            ? 'bg-accent/10 text-accent'
            : 'bg-brand-800/10 text-brand-800';

    return (
        <div className="flex items-center gap-3 py-2.5">
            <span
                className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    typeBg,
                )}
            >
                {typeLabel}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm text-gray-800">
                {item.spotTitle}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
                {item.avgRating && (
                    <div className="flex items-center gap-0.5">
                        <IconStar
                            size={11}
                            className="fill-amber-400 text-amber-400"
                        />
                        <span className="text-xs font-semibold text-gray-600">
                            {item.avgRating.toFixed(1)}
                        </span>
                    </div>
                )}
                <span className="text-xs text-gray-300">{date}</span>
            </div>
        </div>
    );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export function SupporterProfileClient({
    profile,
}: {
    profile: SupporterProfile;
}) {
    return (
        <div className="pb-10">
            <DetailHeader title="서포터 프로필" />
            {/* 헤더 카드 */}
            <Section
                className="rounded-xl border border-gray-200 bg-white p-5"
                gap="md"
            >
                <div className="flex items-start gap-4">
                    <Avatar
                        nickname={profile.nickname}
                        avatarUrl={profile.avatarUrl}
                    />
                    <div className="flex-1 pt-1">
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-700 uppercase">
                            {profile.field}
                        </p>
                        <h1 className="mt-1.5 text-2xl font-black tracking-[-0.03em] text-gray-950">
                            {profile.nickname}
                        </h1>
                        <div className="mt-2 flex items-center gap-2">
                            <StarRating rating={profile.avgRating} />
                            <span className="text-sm font-bold text-gray-800">
                                {profile.avgRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({profile.reviewCount}개 후기)
                            </span>
                        </div>
                    </div>
                </div>
                <p className="text-sm leading-7 text-gray-600">{profile.bio}</p>
            </Section>

            {/* 분야 & 경력 */}
            <Section
                className="rounded-xl border border-gray-100 bg-white p-4"
                gap="sm"
            >
                <SectionLabel icon={IconBriefcase} label="경력" />
                <p className="text-sm leading-7 text-gray-700">
                    {profile.career}
                </p>
            </Section>

            {/* 미디어 */}
            <Section
                className="rounded-xl border border-gray-100 bg-white p-4"
                gap="sm"
            >
                <SectionLabel icon={IconPhoto} label="사진 · 동영상" />
                <MediaGallery urls={profile.mediaUrls} />
            </Section>

            {/* 별점 & 리뷰 */}
            <Section
                className="rounded-xl border border-gray-100 bg-white p-4"
                gap="md"
            >
                <div className="flex items-center justify-between">
                    <SectionLabel icon={IconStar} label="리뷰" />
                    <div className="flex items-center gap-1.5">
                        <StarRating rating={profile.avgRating} size={16} />
                        <span className="text-base font-black text-gray-900">
                            {profile.avgRating.toFixed(1)}
                        </span>
                    </div>
                </div>
                {profile.reviews.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-400">
                        아직 리뷰가 없어요
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {profile.reviews.map((r) => (
                            <ReviewCard key={r.id} review={r} />
                        ))}
                    </div>
                )}
            </Section>

            {/* 히스토리 */}
            <Section
                className="rounded-xl border border-gray-100 bg-white p-4"
                gap="sm"
            >
                <SectionLabel icon={IconHistory} label="IconHistory" />
                {profile.history.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-400">
                        완료된 스팟이 없어요
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {profile.history.map((item) => (
                            <li key={item.spotId}>
                                <HistoryRow item={item} />
                            </li>
                        ))}
                    </ul>
                )}
            </Section>
        </div>
    );
}
