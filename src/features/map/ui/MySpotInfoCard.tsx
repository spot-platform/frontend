// 유저 본인이 생성한 모임의 상세 카드. MapBottomStack 에 쌓임.
// SpotInfoCard 와 달리 시뮬레이션 lifecycle 이 아니므로 카운트다운/진행률 없이
// 내 모임임을 강조하는 primary 톤 + 참여자 목록 + 관리 CTA 로 구성.

'use client';

import { motion } from 'framer-motion';
import { useEffect, useReducer } from 'react';
import { getCategoryMeta } from '@/entities/spot/categories';
import type { Persona } from '@/entities/persona/types';
import type { MySpot } from '@/features/spot/model/my-spots-store';

type MySpotInfoCardProps = {
    spot: MySpot;
    personaLookup: Map<string, Persona>;
    onCloseAction?: () => void;
    onDeleteAction?: () => void;
};

function formatAge(ageMs: number): string {
    const sec = Math.floor(ageMs / 1000);
    if (sec < 60) return `${sec}초 전`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}분 전`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}시간 전`;
    const day = Math.floor(hr / 24);
    return `${day}일 전`;
}

export function MySpotInfoCard({
    spot,
    personaLookup,
    onCloseAction,
    onDeleteAction,
}: MySpotInfoCardProps) {
    const meta = getCategoryMeta(spot.category);
    // 렌더 중 Date.now() 는 순수 규칙 위반. reducer dispatch 로 clock tick.
    const [nowMs, tickNow] = useReducer(() => Date.now(), spot.createdAtMs);
    useEffect(() => {
        tickNow();
        const id = setInterval(tickNow, 30_000);
        return () => clearInterval(id);
    }, []);
    const ageMs = nowMs - spot.createdAtMs;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl border-2 border-primary bg-card p-3 shadow-md"
        >
            <div className="mb-2 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[20px]">
                    <span aria-hidden>{meta.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="truncate text-[14px] font-bold leading-tight text-foreground">
                            {spot.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-primary px-1.5 py-px text-[10px] font-bold leading-none text-primary-foreground">
                            내 모임
                        </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {spot.category} ·{' '}
                        {spot.intent === 'offer' ? '호스트 모집' : '참여 모집'}{' '}
                        · {formatAge(ageMs)} 생성
                    </div>
                </div>
                {onCloseAction && (
                    <button
                        type="button"
                        aria-label="닫기"
                        onClick={onCloseAction}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                    >
                        ×
                    </button>
                )}
            </div>

            {spot.participants.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {spot.participants.map((p) => {
                        const persona = personaLookup.get(p.id);
                        const emoji = persona?.emoji ?? p.emoji;
                        const name = persona?.name ?? p.name;
                        const isMe = p.id === 'me';
                        return (
                            <span
                                key={p.id}
                                className={
                                    isMe
                                        ? 'flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold leading-none text-primary'
                                        : 'flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium leading-none text-foreground'
                                }
                            >
                                <span aria-hidden>{emoji}</span>
                                <span>{name}</span>
                            </span>
                        );
                    })}
                </div>
            )}

            {onDeleteAction && (
                <button
                    type="button"
                    onClick={onDeleteAction}
                    className="mt-3 flex w-full items-center justify-center rounded-xl border border-border-soft bg-card px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                >
                    모임 삭제
                </button>
            )}
        </motion.div>
    );
}
