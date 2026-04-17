'use client';

import Link from 'next/link';
import {
    IconMessageCircle,
    IconCircleCheck,
    IconCircle,
} from '@tabler/icons-react';
import { UserAvatar, UserAvatarStatic } from '@/shared/ui';
import { getMockUserProfile } from '@/entities/user/mock';
import type { SpotDetailFull } from '@/entities/spot/types';

// ─── 공통 ─────────────────────────────────────────────────────────────────────

function ChatButton({ spotId }: { spotId: string }) {
    return (
        <Link
            href={`/chat?spotId=${spotId}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white transition-colors active:bg-white/20"
        >
            <IconMessageCircle size={15} />
            채팅방 이동
        </Link>
    );
}

// ─── OFFER 확장 패널 ──────────────────────────────────────────────────────────

function FundingBar({ current, target }: { current: number; target: number }) {
    const pct = Math.min(100, Math.round((current / target) * 100));
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">펀딩 진행도</span>
                <span className="text-xs font-bold text-white">{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="flex justify-between text-[11px] text-white/40">
                <span>{current.toLocaleString('ko-KR')}P 모임</span>
                <span>목표 {target.toLocaleString('ko-KR')}P</span>
            </div>
        </div>
    );
}

export function OfferExpandedPanel({ detail }: { detail: SpotDetailFull }) {
    const participantCount = detail.participants.length;
    const fundedAmount = detail.pointCost * participantCount;

    return (
        <div className="flex flex-col gap-3 pb-3">
            {/* 제목 */}
            <div>
                <p className="text-[11px] font-medium text-white/40">Offer</p>
                <p className="mt-0.5 text-sm font-semibold text-white line-clamp-1">
                    {detail.title}
                </p>
            </div>

            {/* 펀딩 금액 */}
            <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-white">
                    {fundedAmount.toLocaleString('ko-KR')}P
                </span>
                <span className="text-xs text-white/40">모임</span>
            </div>

            {/* 펀딩 진행도 */}
            <FundingBar current={fundedAmount} target={detail.pointCost * 3} />

            <ChatButton spotId={detail.id} />
        </div>
    );
}

// ─── REQUEST 확장 패널 ────────────────────────────────────────────────────────

function ProgressRow({ label, done }: { label: string; done: boolean }) {
    return (
        <div className="flex items-center gap-2">
            {done ? (
                <IconCircleCheck
                    size={13}
                    className="shrink-0 text-emerald-400"
                />
            ) : (
                <IconCircle size={13} className="shrink-0 text-white/30" />
            )}
            <span
                className={`text-xs ${done ? 'text-white/70' : 'text-white/40'}`}
            >
                {label}
            </span>
        </div>
    );
}

export function RequestExpandedPanel({ detail }: { detail: SpotDetailFull }) {
    const checklistItems = detail.checklist?.items ?? [];

    return (
        <div className="flex flex-col gap-3 pb-3">
            {/* 제목 */}
            <div>
                <p className="text-[11px] font-medium text-white/40">Request</p>
                <p className="mt-0.5 text-sm font-semibold text-white line-clamp-1">
                    {detail.title}
                </p>
            </div>

            {/* 진행 현황 */}
            {checklistItems.length > 0 && (
                <div className="flex flex-col gap-1.5 rounded-xl bg-white/5 px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-white/40">
                        진행 현황
                    </p>
                    <div className="flex flex-col gap-1">
                        {checklistItems.map((item) => (
                            <ProgressRow
                                key={item.id}
                                label={item.text}
                                done={item.completed}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 참여자 목록 */}
            <div className="flex flex-col gap-1.5">
                <p className="text-[11px] font-semibold text-white/40">
                    참여자 {detail.participants.length}명
                </p>
                <div className="flex flex-wrap gap-3">
                    {detail.participants.map((p) => {
                        const profileType = getMockUserProfile(
                            p.userId,
                        )?.profileType;
                        const sublabel =
                            p.role === 'AUTHOR' ? '호스트' : undefined;
                        return p.userId === 'user-me' ? (
                            <UserAvatarStatic
                                key={p.userId}
                                userId={p.userId}
                                nickname={p.nickname}
                                profileType={profileType}
                                size="sm"
                                showLabel
                                sublabel={sublabel}
                                dark
                            />
                        ) : (
                            <UserAvatar
                                key={p.userId}
                                userId={p.userId}
                                nickname={p.nickname}
                                profileType={profileType}
                                size="sm"
                                showLabel
                                sublabel={sublabel}
                                dark
                            />
                        );
                    })}
                </div>
            </div>

            <ChatButton spotId={detail.id} />
        </div>
    );
}
