// 시뮬레이션 기반 모임 생성 가이드 카드.
// Post 폼 상단에 렌더되어, 시뮬 분석 결과(평균 참여자/가격/기간 등)를 보여주고
// 사용자가 "적용" 버튼으로 해당 폼 필드에 즉시 반영할 수 있도록 한다.
// 단순 prefill 을 넘어 "시뮬→실제 모임" 전환을 의식적으로 이끈다.

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@frontend/design-system';
import { getCategoryMeta } from '@/entities/spot/categories';
import type { SimulationConversionContext } from '../model/simulation-conversion-context';

type SimulationInsightCardProps = {
    context: SimulationConversionContext;
    /** 가격(원) 적용. */
    onApplyPriceAction?: (priceKrw: number) => void;
    /** 최대 파트너/참여자 수 적용. */
    onApplyParticipantsAction?: (count: number) => void;
    /** 마감일 (YYYY-MM-DD) 적용. */
    onApplyDeadlineAction?: (isoDate: string) => void;
};

function formatKrw(n: number): string {
    return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

function suggestDeadlineIso(typicalLifespanMs: number): string {
    // 시뮬 평균 수명은 분 단위 — 실제 모집 기간으로 확장해서 최소 3일, 최대 14일.
    const days = Math.max(
        3,
        Math.min(14, Math.round(typicalLifespanMs / 1000 / 60 / 5)),
    );
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

function formatDeadlineDisplay(isoDate: string): string {
    const d = new Date(`${isoDate}T00:00:00`);
    const today = new Date();
    const diffDays = Math.round(
        (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return `${diffDays}일 후 마감`;
}

function Insight({
    emoji,
    label,
    value,
    hint,
    onApply,
    applied,
}: {
    emoji: string;
    label: string;
    value: string;
    hint?: string;
    onApply?: () => void;
    applied?: boolean;
}) {
    return (
        <div
            className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors',
                applied ? 'bg-primary/10' : 'bg-card',
            )}
        >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-persona-soft text-[16px]">
                <span aria-hidden>{emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-muted-foreground">
                    {label}
                </div>
                <div className="text-[13px] font-bold leading-tight text-foreground">
                    {value}
                </div>
                {hint && (
                    <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                        {hint}
                    </div>
                )}
            </div>
            {onApply && (
                <button
                    type="button"
                    onClick={applied ? undefined : onApply}
                    disabled={applied}
                    aria-pressed={applied}
                    className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none transition-transform',
                        applied
                            ? 'bg-muted text-muted-foreground cursor-default'
                            : 'bg-primary text-primary-foreground shadow-sm active:scale-[0.95]',
                    )}
                >
                    {applied ? '✓ 적용됨' : '적용'}
                </button>
            )}
        </div>
    );
}

export function SimulationInsightCard({
    context,
    onApplyPriceAction,
    onApplyParticipantsAction,
    onApplyDeadlineAction,
}: SimulationInsightCardProps) {
    const meta = getCategoryMeta(context.category);
    const deadlineIso = suggestDeadlineIso(context.typicalLifespanMs);

    // 각 인사이트 적용 여부 로컬 추적 — 시각 피드백 + 중복 클릭 방지.
    const [priceApplied, setPriceApplied] = useState(false);
    const [participantsApplied, setParticipantsApplied] = useState(false);
    const [deadlineApplied, setDeadlineApplied] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3"
        >
            <div className="flex items-start gap-2">
                <span aria-hidden className="text-[18px] leading-none">
                    ✨
                </span>
                <div className="flex-1">
                    <h3 className="text-[13px] font-bold leading-tight text-foreground">
                        시뮬레이션 인사이트로 빠르게 채우기
                    </h3>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {meta.emoji} {context.category} 카테고리 · 근처 활성
                        모임{' '}
                        <span className="font-bold text-foreground">
                            {context.similarActiveCount}건
                        </span>{' '}
                        분석. 각 항목을 한 번에 적용할 수 있어요.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Insight
                    emoji="👥"
                    label="예상 참여자"
                    value={`${context.avgParticipants}명`}
                    hint="비슷한 모임들의 평균 참여자 수"
                    applied={participantsApplied}
                    onApply={
                        onApplyParticipantsAction
                            ? () => {
                                  onApplyParticipantsAction(
                                      context.avgParticipants,
                                  );
                                  setParticipantsApplied(true);
                              }
                            : undefined
                    }
                />
                <Insight
                    emoji="💰"
                    label="제안 가격"
                    value={formatKrw(context.suggestedPriceKrw)}
                    hint={`${context.category} 카테고리 적정 가격`}
                    applied={priceApplied}
                    onApply={
                        onApplyPriceAction
                            ? () => {
                                  onApplyPriceAction(context.suggestedPriceKrw);
                                  setPriceApplied(true);
                              }
                            : undefined
                    }
                />
                <Insight
                    emoji="📅"
                    label="모집 마감일"
                    value={formatDeadlineDisplay(deadlineIso)}
                    hint="비슷한 모임의 평균 진행 기간 기반"
                    applied={deadlineApplied}
                    onApply={
                        onApplyDeadlineAction
                            ? () => {
                                  onApplyDeadlineAction(deadlineIso);
                                  setDeadlineApplied(true);
                              }
                            : undefined
                    }
                />
                <Insight
                    emoji="📍"
                    label="시뮬 스팟 위치"
                    value={`${context.spotLocation.lat.toFixed(4)}°N, ${context.spotLocation.lng.toFixed(4)}°E`}
                    hint="근처 같은 카테고리 모임이 있으니, 새 위치는 조금 떨어뜨려 경쟁을 피하세요"
                />
            </div>
        </motion.div>
    );
}
