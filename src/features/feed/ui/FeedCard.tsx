'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IconEye, IconHeart, IconPhoto, IconUsers } from '@tabler/icons-react';
import { MOCK_FEED_MANAGEMENT } from '../model/mock';
import type { FeedItem, FeedParticipantProfile } from '../model/types';
import { UserAvatarStatic } from '@/shared/ui';
import { Chip } from '@frontend/design-system';
import { useAuthStore } from '@/shared/model/auth-store';
import { FitnessScoreBadge } from './preference/FitnessScoreBadge';

type FeedCardProps = {
    item: FeedItem;
    // 파트너 전용 선호도 점수(0~1). 비파트너/비로그인/null이면 배지 숨김.
    fitnessScore?: number;
};

function usePartnerFitnessScore(fitnessScore?: number): number | null {
    const role = useAuthStore((state) => state.userPersona?.role ?? null);
    if (role !== 'PARTNER') return null;
    if (fitnessScore == null) return null;
    return fitnessScore;
}

function formatPrice(price: number): string {
    return price.toLocaleString('ko-KR') + '원';
}

function StatBadge({ icon, count }: { icon: React.ReactNode; count: number }) {
    return (
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            {icon}
            <span>{count.toLocaleString()}</span>
        </span>
    );
}

function FeedRow({
    item,
    children,
}: {
    item: FeedItem;
    children: React.ReactNode;
}) {
    const router = useRouter();

    return (
        <button
            type="button"
            onClick={() => router.push(`/feed/${item.id}`)}
            className="w-full bg-card text-left transition-[background-color,transform] duration-150 active:bg-muted active:scale-[0.997]"
        >
            <article className="px-4 py-3.5">{children}</article>
        </button>
    );
}

function createAuthorProfile(item: FeedItem): FeedParticipantProfile {
    return {
        id: `author-${item.id}`,
        nickname: item.authorNickname,
    };
}

function getPartnerSlotCount(item: FeedItem): number {
    const management = MOCK_FEED_MANAGEMENT[item.id];
    const count = item.partnerCount ?? item.applicantCount ?? 0;

    if (item.type === 'REQUEST') {
        return Math.max(management?.demand.requiredPartners ?? count, 1);
    }

    return Math.max(item.maxParticipants ?? count, 1);
}

type ExploreSlot =
    | {
          key: string;
          label: string;
          state: 'profile';
          profile: FeedParticipantProfile;
      }
    | {
          key: string;
          label: string;
          state: 'filled' | 'empty';
      };

function getExploreSlots(item: FeedItem): {
    supporterSlot: ExploreSlot;
    partnerSlots: ExploreSlot[];
} {
    const management = MOCK_FEED_MANAGEMENT[item.id];
    const partnerSlotCount = getPartnerSlotCount(item);

    if (item.type === 'REQUEST') {
        const matchedProfiles =
            management?.demand.confirmedPartnerProfiles.slice(
                0,
                Math.max(partnerSlotCount - 1, 0),
            ) ?? [];

        return {
            supporterSlot: {
                key: `supporter-${item.id}`,
                label: '서포터',
                state: 'empty',
            },
            partnerSlots: Array.from(
                { length: partnerSlotCount },
                (_, index) => {
                    if (index === 0) {
                        return {
                            key: `partner-author-${item.id}`,
                            label: `파트너 ${index + 1}`,
                            state: 'profile',
                            profile: createAuthorProfile(item),
                        } satisfies ExploreSlot;
                    }

                    const profile = matchedProfiles[index - 1];

                    if (profile) {
                        return {
                            key: `partner-profile-${profile.id}`,
                            label: `파트너 ${index + 1}`,
                            state: 'profile',
                            profile,
                        } satisfies ExploreSlot;
                    }

                    return {
                        key: `partner-empty-${item.id}-${index}`,
                        label: `파트너 ${index + 1}`,
                        state: 'empty',
                    } satisfies ExploreSlot;
                },
            ),
        };
    }

    const count = item.partnerCount ?? item.applicantCount ?? 0;
    const filledPartnerCount = Math.min(count, partnerSlotCount);
    const matchedProfiles = (
        item.confirmedPartnerProfiles ??
        management?.demand.confirmedPartnerProfiles ??
        []
    ).slice(0, filledPartnerCount);

    return {
        supporterSlot: {
            key: `supporter-author-${item.id}`,
            label: '서포터',
            state: 'profile',
            profile: createAuthorProfile(item),
        },
        partnerSlots: Array.from({ length: partnerSlotCount }, (_, index) => {
            const profile = matchedProfiles[index];

            if (profile) {
                return {
                    key: `partner-profile-${profile.id}`,
                    label: `파트너 ${index + 1}`,
                    state: 'profile',
                    profile,
                } satisfies ExploreSlot;
            }

            if (index < filledPartnerCount) {
                return {
                    key: `partner-filled-${item.id}-${index}`,
                    label: `파트너 ${index + 1}`,
                    state: 'filled',
                } satisfies ExploreSlot;
            }

            return {
                key: `partner-empty-${item.id}-${index}`,
                label: `파트너 ${index + 1}`,
                state: 'empty',
            } satisfies ExploreSlot;
        }),
    };
}

function ExploreSlotToken({ slot }: { slot: ExploreSlot }) {
    if (slot.state === 'profile') {
        return (
            <div className="flex min-w-12 flex-col items-center gap-1">
                <UserAvatarStatic
                    userId={slot.profile.id}
                    nickname={slot.profile.nickname}
                    avatarUrl={slot.profile.avatarUrl}
                    size="sm"
                />
                <span className="text-[10px] font-medium text-muted-foreground">
                    {slot.label}
                </span>
            </div>
        );
    }

    return (
        <div className="flex min-w-12 flex-col items-center gap-1">
            <div
                className={
                    slot.state === 'filled'
                        ? 'h-8 w-8 rounded-full bg-brand-50'
                        : 'h-8 w-8 rounded-full border border-dashed border-border-strong bg-muted'
                }
            />
            <span className="text-[10px] text-muted-foreground">
                {slot.label}
            </span>
        </div>
    );
}

function AutoScrollList({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);
    const pausedRef = useRef(false);
    const posRef = useRef(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const SPEED = 0.4;

        function tick() {
            if (!el) return;

            if (!pausedRef.current) {
                posRef.current += SPEED;

                const halfWidth = el.scrollWidth / 2;
                if (posRef.current >= halfWidth) {
                    posRef.current -= halfWidth;
                }

                el.scrollLeft = posRef.current;
            }

            rafRef.current = requestAnimationFrame(tick);
        }

        rafRef.current = requestAnimationFrame(tick);

        const pause = () => {
            pausedRef.current = true;
        };
        const resume = () => {
            pausedRef.current = false;
        };

        el.addEventListener('mouseenter', pause);
        el.addEventListener('mouseleave', resume);
        el.addEventListener('touchstart', pause, { passive: true });
        el.addEventListener('touchend', resume);

        return () => {
            cancelAnimationFrame(rafRef.current);
            el.removeEventListener('mouseenter', pause);
            el.removeEventListener('mouseleave', resume);
            el.removeEventListener('touchstart', pause);
            el.removeEventListener('touchend', resume);
        };
    }, []);

    const childArray = React.Children.toArray(children);

    return (
        <div ref={ref} className="flex gap-2 overflow-x-hidden pb-1">
            {childArray}
            {childArray}
        </div>
    );
}

function ExploreSlotStrip({ item }: { item: FeedItem }) {
    const { supporterSlot, partnerSlots } = getExploreSlots(item);

    return (
        <div className="mt-2.5 flex items-start gap-3">
            <ExploreSlotToken slot={supporterSlot} />
            <div
                className="relative min-w-0 flex-1 overflow-hidden"
                style={{
                    maskImage:
                        'linear-gradient(to right, transparent 0, #000 12px, #000 calc(100% - 16px), transparent 100%)',
                    WebkitMaskImage:
                        'linear-gradient(to right, transparent 0, #000 12px, #000 calc(100% - 16px), transparent 100%)',
                }}
            >
                <AutoScrollList>
                    {partnerSlots.map((slot) => (
                        <ExploreSlotToken key={slot.key} slot={slot} />
                    ))}
                </AutoScrollList>
            </div>
        </div>
    );
}

function ExploreCard({
    item,
    fitnessScore,
}: {
    item: FeedItem;
    fitnessScore?: number;
}) {
    const partnerScore = usePartnerFitnessScore(fitnessScore);
    const isRequest = item.type === 'REQUEST';
    const participantCount = item.partnerCount ?? item.applicantCount ?? 0;
    const displayProgressPercent = !isRequest
        ? (item.progressPercent ?? (participantCount === 0 ? 0 : null))
        : null;
    const remaining =
        !isRequest && item.maxParticipants != null
            ? item.maxParticipants - participantCount
            : null;

    return (
        <FeedRow item={item}>
            <div className="flex gap-3">
                <div>
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="96px"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <IconPhoto
                                    size={24}
                                    className="text-border-strong"
                                />
                            </div>
                        )}
                    </div>

                    {item.category && (
                        <span className="text-[10px] font-medium text-muted-foreground">
                            #{item.category}
                        </span>
                    )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <Chip size="sm" selected>
                                {isRequest ? '알려줘!' : '해볼래?'}
                            </Chip>
                            <span className="text-[10px] text-muted-foreground">
                                {isRequest
                                    ? '서포터 기다리는 중'
                                    : '파트너 모집 중'}
                            </span>
                        </div>
                        {partnerScore != null && (
                            <FitnessScoreBadge score={partnerScore} size="sm" />
                        )}
                    </div>

                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                        {item.title}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.location} · {item.authorNickname}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                        {isRequest ? (
                            <span className="text-xs font-medium text-muted-foreground">
                                요청 금액 미정
                            </span>
                        ) : (
                            <span className="text-sm font-bold text-foreground">
                                {formatPrice(item.price)}
                            </span>
                        )}
                        {displayProgressPercent != null && (
                            <span className="text-xs font-bold text-accent">
                                {displayProgressPercent}%
                            </span>
                        )}
                    </div>

                    {displayProgressPercent != null && (
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-accent"
                                style={{
                                    width: `${Math.min(displayProgressPercent, 100)}%`,
                                }}
                            />
                        </div>
                    )}

                    {remaining != null && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            {remaining > 0
                                ? `${remaining}명만 더 모이면 시작`
                                : '정원이 꽉 찼어요'}
                        </p>
                    )}

                    <ExploreSlotStrip item={item} />

                    <div className="mt-2 flex items-center gap-3">
                        <StatBadge
                            icon={<IconEye size={11} />}
                            count={item.views}
                        />
                        <StatBadge
                            icon={<IconHeart size={11} />}
                            count={item.likes}
                        />
                        <StatBadge
                            icon={<IconUsers size={11} />}
                            count={
                                item.partnerCount ?? item.applicantCount ?? 0
                            }
                        />
                    </div>
                </div>
            </div>
        </FeedRow>
    );
}

export function FeedCard({ item, fitnessScore }: FeedCardProps) {
    return <ExploreCard item={item} fitnessScore={fitnessScore} />;
}

function getHomePartnerProfiles(item: FeedItem): FeedParticipantProfile[] {
    const management = MOCK_FEED_MANAGEMENT[item.id];
    return (
        item.confirmedPartnerProfiles ??
        management?.demand.confirmedPartnerProfiles ??
        []
    );
}

const MAX_VISIBLE_PARTNER_SLOTS = 5;

function FilledAvatar({
    profile,
    overlap,
    zIndex,
}: {
    profile: FeedParticipantProfile;
    overlap: boolean;
    zIndex: number;
}) {
    return (
        <div className={overlap ? '-ml-2' : ''} style={{ zIndex }}>
            <div className="rounded-full ring-2 ring-card">
                <UserAvatarStatic
                    userId={profile.id}
                    nickname={profile.nickname}
                    avatarUrl={profile.avatarUrl}
                    size="sm"
                />
            </div>
        </div>
    );
}

function GhostAvatar({ overlap }: { overlap: boolean }) {
    return (
        <div
            className={
                overlap
                    ? '-ml-2 h-8 w-8 rounded-full bg-brand-100 ring-2 ring-card'
                    : 'h-8 w-8 rounded-full bg-brand-100 ring-2 ring-card'
            }
        />
    );
}

function EmptySlot({ overlap }: { overlap: boolean }) {
    return (
        <div
            className={
                overlap
                    ? '-ml-2 h-8 w-8 rounded-full border-2 border-dashed border-border-strong bg-card/70'
                    : 'h-8 w-8 rounded-full border-2 border-dashed border-border-strong bg-card/70'
            }
        />
    );
}

function HomeSlotRow({ item }: { item: FeedItem }) {
    const isRequest = item.type === 'REQUEST';
    const partnerTotal = getPartnerSlotCount(item);
    const partnerProfiles = getHomePartnerProfiles(item);

    const supporterProfile: FeedParticipantProfile | null = isRequest
        ? null
        : createAuthorProfile(item);
    const supporterFilled = supporterProfile != null;

    const partnerFilled = Math.min(
        item.partnerCount ?? item.applicantCount ?? partnerProfiles.length,
        partnerTotal,
    );
    const partnerEmpty = Math.max(partnerTotal - partnerFilled, 0);

    const visibleFilled = Math.min(partnerFilled, MAX_VISIBLE_PARTNER_SLOTS);
    const visibleEmpty = Math.min(
        partnerEmpty,
        MAX_VISIBLE_PARTNER_SLOTS - visibleFilled,
    );
    const visiblePartnerProfiles = partnerProfiles.slice(0, visibleFilled);
    const ghostCount = visibleFilled - visiblePartnerProfiles.length;

    return (
        <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
                {supporterFilled && supporterProfile ? (
                    <div className="rounded-full ring-2 ring-card">
                        <UserAvatarStatic
                            userId={supporterProfile.id}
                            nickname={supporterProfile.nickname}
                            avatarUrl={supporterProfile.avatarUrl}
                            size="sm"
                        />
                    </div>
                ) : (
                    <EmptySlot overlap={false} />
                )}
                <span className="text-[10px] font-medium text-muted-foreground">
                    서포터
                </span>
            </div>

            <div className="h-8 w-px bg-border-soft/80" />

            <div className="flex flex-col items-start gap-1">
                <div className="flex items-center">
                    {visiblePartnerProfiles.map((profile, index) => (
                        <FilledAvatar
                            key={profile.id}
                            profile={profile}
                            overlap={index > 0}
                            zIndex={MAX_VISIBLE_PARTNER_SLOTS - index}
                        />
                    ))}
                    {Array.from({ length: ghostCount }).map((_, index) => {
                        const position = visiblePartnerProfiles.length + index;
                        return (
                            <GhostAvatar
                                key={`ghost-${index}`}
                                overlap={position > 0}
                            />
                        );
                    })}
                    {Array.from({ length: visibleEmpty }).map((_, index) => {
                        const position = visibleFilled + index;
                        return (
                            <EmptySlot
                                key={`empty-${index}`}
                                overlap={position > 0}
                            />
                        );
                    })}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                    파트너 {partnerFilled}/{partnerTotal}
                </span>
            </div>
        </div>
    );
}

export function HomeFeedCard({ item, fitnessScore }: FeedCardProps) {
    const router = useRouter();
    const partnerScore = usePartnerFitnessScore(fitnessScore);
    const isRequest = item.type === 'REQUEST';
    const participantCount = item.partnerCount ?? item.applicantCount ?? 0;
    const displayProgressPercent = !isRequest
        ? (item.progressPercent ?? (participantCount === 0 ? 0 : null))
        : null;

    return (
        <button
            type="button"
            onClick={() => router.push(`/feed/${item.id}`)}
            className="group relative flex h-64 w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-border-soft bg-card text-left transition-[transform,box-shadow] duration-200 active:scale-[0.99]"
        >
            <div className="absolute inset-0">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="256px"
                        className="scale-110 object-cover blur-xl"
                    />
                ) : (
                    <div className="h-full w-full bg-linear-to-br from-brand-50 via-card to-accent/10" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-card via-card/92 to-card/55" />
            </div>

            <div className="relative flex flex-1 flex-col p-5">
                <div className="flex items-center gap-1.5">
                    <Chip size="sm" selected>
                        {isRequest ? '알려줘!' : '해볼래?'}
                    </Chip>
                    {item.category && (
                        <span className="text-[11px] font-medium text-muted-foreground">
                            #{item.category}
                        </span>
                    )}
                    {partnerScore != null && (
                        <div className="ml-auto">
                            <FitnessScoreBadge score={partnerScore} size="sm" />
                        </div>
                    )}
                </div>

                <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground">
                    {item.title}
                </h3>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                    {item.location} · {item.authorNickname}
                </p>

                <div className="mt-auto flex flex-col gap-3 pt-4">
                    <HomeSlotRow item={item} />

                    <div className="flex items-end justify-between gap-3">
                        {isRequest ? (
                            <span className="text-[13px] font-medium text-muted-foreground">
                                요청 금액 미정
                            </span>
                        ) : (
                            <span className="text-[17px] font-bold text-foreground">
                                {formatPrice(item.price)}
                            </span>
                        )}
                        <div className="flex items-center gap-3">
                            <StatBadge
                                icon={<IconEye size={12} />}
                                count={item.views}
                            />
                            <StatBadge
                                icon={<IconHeart size={12} />}
                                count={item.likes}
                            />
                        </div>
                    </div>

                    {displayProgressPercent != null && (
                        <div className="h-0.5 w-full overflow-hidden rounded-full bg-border-soft/60">
                            <div
                                className="h-full rounded-full bg-accent transition-[width] duration-300"
                                style={{
                                    width: `${Math.min(displayProgressPercent, 100)}%`,
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}
