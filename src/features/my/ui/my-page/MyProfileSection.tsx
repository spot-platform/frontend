import Link from 'next/link';
import { IconChevronRight } from '@tabler/icons-react';
import { Section } from '@/shared/ui';
import type { UserProfile } from '@/entities/user/types';
import {
    formatDate,
    formatMonth,
    formatNumber,
    getDisplayName,
    getInitials,
} from '../../model/my-page-helpers';
import { MyRetryCard } from './MyRetryCard';

type MyProfileSectionProps = {
    profile?: UserProfile;
    isLoading: boolean;
    onRetry: () => void;
    isRetrying: boolean;
};

export function MyProfileSection({
    profile,
    isLoading,
    onRetry,
    isRetrying,
}: MyProfileSectionProps) {
    return (
        <Section
            gap="lg"
            className="rounded-xl border border-border-soft bg-card p-5"
        >
            <div className="relative flex items-center justify-between gap-3">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-brand-700 uppercase">
                    My account
                </div>
                <Link
                    href="/my/settings"
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:bg-card"
                >
                    계정 설정
                    <IconChevronRight size={14} />
                </Link>
            </div>

            {isLoading && !profile ? (
                <ProfileSkeleton />
            ) : !profile ? (
                <MyRetryCard
                    title="계정 정보를 불러오지 못했어요"
                    description="잠시 후 다시 시도하거나 네트워크 상태를 확인해 주세요."
                    onRetry={onRetry}
                    isRetrying={isRetrying}
                />
            ) : (
                <ProfileSummary profile={profile} />
            )}
        </Section>
    );
}

function ProfileSummary({ profile }: { profile: UserProfile }) {
    const displayName = getDisplayName(profile.nickname);

    return (
        <div className="relative flex flex-col gap-5">
            <div className="flex items-start gap-4">
                <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-xl font-black text-white">
                    {getInitials(displayName)}
                </div>

                <div className="min-w-0 flex-1 pt-1">
                    <p className="text-xs font-semibold tracking-[0.16em] text-brand-700 uppercase">
                        {formatMonth(profile.joinedAt)}부터 함께했어요
                    </p>
                    <h1 className="mt-2 text-[1.75rem] leading-9 font-black tracking-[-0.04em] text-foreground">
                        {displayName}
                    </h1>
                    <p className="mt-1 break-all text-sm leading-6 text-muted-foreground">
                        {profile.email}
                    </p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
                <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
                    <p className="text-xs font-semibold tracking-[0.16em] text-brand-700 uppercase">
                        포인트 밸런스
                    </p>
                    <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-brand-950">
                        {formatNumber(profile.pointBalance)}P
                    </p>
                    <p className="mt-1 text-xs leading-5 text-brand-900/70">
                        최근 활동과 스팟 참여에서 쌓인 현재 보유 포인트예요.
                    </p>
                </div>

                <div className="rounded-lg border border-border-soft bg-card p-4">
                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                        가입일
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                        {formatDate(profile.joinedAt)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        차분하게 계정을 관리하고 활동 흐름을 이어가 보세요.
                    </p>
                </div>
            </div>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="flex items-start gap-4">
                <div className="h-18 w-18 rounded-lg bg-brand-100" />
                <div className="flex-1 space-y-3 pt-1">
                    <div className="h-3 w-28 rounded-full bg-brand-100" />
                    <div className="h-8 w-36 rounded-full bg-border-soft" />
                    <div className="h-4 w-48 rounded-full bg-muted" />
                </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
                <div className="h-28 rounded-lg bg-brand-50" />
                <div className="h-28 rounded-lg bg-muted" />
            </div>
        </div>
    );
}
