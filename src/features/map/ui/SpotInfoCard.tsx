// MapBottomStack 에 쌓이는 Spot 상세 카드. 선택된 클러스터의 SpotLifecycle 을 표현.
// 내부 interval 로 500ms 마다 now 를 갱신해 진행률/남은 시간을 업데이트.

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@frontend/design-system';
import { getCategoryMeta } from '@/entities/spot/categories';
import type { Persona } from '@/entities/persona/types';
import type { SpotLifecycle } from '@/features/simulation/model/use-mock-spot-lifecycles';

type SpotInfoCardProps = {
    lifecycle: SpotLifecycle;
    personaLookup: Map<string, Persona>;
    onCloseAction?: () => void;
};

function formatRemaining(ms: number): string {
    if (ms <= 0) return '종료됨';
    const sec = Math.ceil(ms / 1000);
    if (sec < 60) return `${sec}초 남음`;
    const min = Math.ceil(sec / 60);
    return `${min}분 남음`;
}

function deriveStatus(
    lifecycle: SpotLifecycle,
    now: number,
): 'OPEN' | 'MATCHED' | 'CLOSED' {
    if (now >= lifecycle.closedAtMs) return 'CLOSED';
    if (lifecycle.matchedAtMs !== null && now >= lifecycle.matchedAtMs) {
        return 'MATCHED';
    }
    return 'OPEN';
}

const STATUS_META: Record<
    'OPEN' | 'MATCHED' | 'CLOSED',
    { label: string; className: string }
> = {
    OPEN: {
        label: '모집 중',
        className: 'bg-persona-soft text-persona-strong',
    },
    MATCHED: {
        label: '매칭 완료',
        className: 'bg-primary/15 text-primary',
    },
    CLOSED: {
        label: '종료',
        className: 'bg-muted text-muted-foreground',
    },
};

export function SpotInfoCard({
    lifecycle,
    personaLookup,
    onCloseAction,
}: SpotInfoCardProps) {
    const [now, setNow] = useState(() => performance.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(performance.now()), 500);
        return () => clearInterval(interval);
    }, []);

    const categoryMeta = getCategoryMeta(lifecycle.category);
    const status = deriveStatus(lifecycle, now);
    const statusMeta = STATUS_META[status];
    const totalLifespan = Math.max(
        1,
        lifecycle.closedAtMs - lifecycle.createdAtMs,
    );
    const elapsed = Math.max(0, now - lifecycle.createdAtMs);
    const progress = Math.max(0, Math.min(1, elapsed / totalLifespan));
    const remainingMs = lifecycle.closedAtMs - now;

    const currentParticipants = lifecycle.participants.filter(
        (p) =>
            p.joinedAtMs <= now &&
            (p.leftAtMs === null || p.leftAtMs > now) &&
            now < lifecycle.closedAtMs,
    );

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl border border-border-soft bg-card p-3 shadow-md"
        >
            <div className="mb-2 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-persona-soft text-[20px]">
                    <span aria-hidden>{categoryMeta.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="truncate text-[14px] font-bold leading-tight text-foreground">
                            {lifecycle.title}
                        </span>
                        <span
                            className={cn(
                                'shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold leading-none',
                                statusMeta.className,
                            )}
                        >
                            {statusMeta.label}
                        </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {lifecycle.category} ·{' '}
                        {lifecycle.intent === 'offer'
                            ? '호스트 모집'
                            : '참여 모집'}{' '}
                        · {formatRemaining(remainingMs)}
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

            <div className="mb-2.5 h-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                    className="h-full bg-primary"
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                />
            </div>

            <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">
                    참여자 {currentParticipants.length}명
                </span>
            </div>

            {currentParticipants.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                    {currentParticipants.slice(0, 8).map((p) => {
                        const persona = personaLookup.get(p.personaId);
                        return (
                            <span
                                key={p.personaId}
                                className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium leading-none text-foreground"
                            >
                                <span aria-hidden>
                                    {persona?.emoji ?? '❔'}
                                </span>
                                <span>{persona?.name ?? '익명'}</span>
                            </span>
                        );
                    })}
                    {currentParticipants.length > 8 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
                            +{currentParticipants.length - 8}
                        </span>
                    )}
                </div>
            )}
        </motion.div>
    );
}
