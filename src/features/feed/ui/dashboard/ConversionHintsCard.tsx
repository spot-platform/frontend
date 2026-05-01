'use client';

// 가상 스팟 → 실제 피드 전환 가이드. placeholder + pricing + plan_help + expected_demand 블록을 순차 렌더.

import { useState } from 'react';
import type {
    ConversionHints,
    ConversionSessionContext,
    FeeBreakdown,
} from '@/entities/spot/simulation-types';
import { cn } from '@/shared/lib/cn';

type ConversionHintsCardProps = {
    hints: ConversionHints;
    defaultExpanded?: boolean;
};

const FEE_LABEL: Record<
    'peer_labor_fee' | 'material_cost' | 'venue_rental' | 'equipment_rental',
    string
> = {
    peer_labor_fee: '또래 진행비',
    material_cost: '재료비',
    venue_rental: '장소 대여',
    equipment_rental: '장비 대여',
};

const SCOPE_LABEL: Record<ConversionSessionContext['scope'], string> = {
    run: '이번 시뮬',
    region: '지역',
    global: '전체',
};

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {children}
        </span>
    );
}

function FeeBreakdownTable({ breakdown }: { breakdown: FeeBreakdown }) {
    const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
    return (
        <dl className="mt-3 flex flex-col gap-1 rounded-lg bg-muted p-3 text-sm">
            {(Object.keys(FEE_LABEL) as Array<keyof typeof FEE_LABEL>).map(
                (key) => (
                    <div
                        key={key}
                        className="flex items-center justify-between gap-2"
                    >
                        <dt className="text-muted-foreground">
                            {FEE_LABEL[key]}
                        </dt>
                        <dd className="font-semibold tabular-nums text-text-secondary">
                            {won(breakdown[key])}
                        </dd>
                    </div>
                ),
            )}
            <div className="mt-1 flex items-center justify-between gap-2 border-t border-border-soft pt-2">
                <dt className="font-semibold text-foreground">합계</dt>
                <dd className="font-bold tabular-nums text-foreground">
                    {won(breakdown.total)}
                </dd>
            </div>
            <div className="flex items-center justify-between gap-2 text-[12px]">
                <dt className="text-muted-foreground">실비 합계</dt>
                <dd className="font-semibold tabular-nums text-text-secondary">
                    {won(breakdown.passthrough_total)}
                </dd>
            </div>
        </dl>
    );
}

function SessionContextRow({ ctx }: { ctx: ConversionSessionContext }) {
    return (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-border-soft bg-muted px-3 py-2">
            <p className="text-[12px] leading-5 text-text-secondary">
                유사 모임 {ctx.similar_active_count}개 진행 중 · 평균{' '}
                {ctx.avg_participants.toFixed(1)}명 · 평균{' '}
                {ctx.typical_lifespan_minutes}분
                <span className="ml-1 text-muted-foreground">
                    (표본 {ctx.sample_size})
                </span>
            </p>
            <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                {SCOPE_LABEL[ctx.scope]}
            </span>
        </div>
    );
}

export function ConversionHintsCard({
    hints,
    defaultExpanded = false,
}: ConversionHintsCardProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <section className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-card p-5">
            <header className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <SectionLabel>실제 피드로 전환 가이드</SectionLabel>
                    <h2 className="text-base font-bold text-foreground">
                        {hints.placeholder.title}
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className={cn(
                        'shrink-0 rounded-full border border-border-soft px-3 py-1 text-xs font-semibold text-text-secondary',
                        'transition-colors hover:bg-muted',
                    )}
                    aria-expanded={expanded}
                >
                    {expanded ? '접기' : '자세히'}
                </button>
            </header>

            <p className="text-sm leading-6 text-text-secondary">
                {hints.placeholder.intro}
            </p>
            <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                    {hints.placeholder.skill_topic}
                </span>
            </div>

            {expanded && (
                <div className="flex flex-col gap-4 border-t border-border-soft pt-4">
                    <div>
                        <SectionLabel>가격 제안</SectionLabel>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                            {hints.pricing_suggestion.rationale}
                        </p>
                        <FeeBreakdownTable
                            breakdown={hints.pricing_suggestion.fee_breakdown}
                        />
                    </div>

                    <div>
                        <SectionLabel>유사 모임 컨텍스트</SectionLabel>
                        <div className="mt-2">
                            <SessionContextRow ctx={hints.session_context} />
                        </div>
                    </div>

                    <div>
                        <SectionLabel>플랜 제안</SectionLabel>
                        <ul className="mt-2 flex flex-col gap-2">
                            <li className="rounded-lg border border-border-soft bg-muted px-3 py-2">
                                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    warmup
                                </p>
                                <p className="mt-1 text-sm leading-6 text-text-secondary">
                                    {hints.plan_help.warmup_block}
                                </p>
                            </li>
                            <li className="rounded-lg border border-border-soft bg-muted px-3 py-2">
                                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    main
                                </p>
                                <p className="mt-1 text-sm leading-6 text-text-secondary">
                                    {hints.plan_help.main_block}
                                </p>
                            </li>
                            <li className="rounded-lg border border-border-soft bg-muted px-3 py-2">
                                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    closing
                                </p>
                                <p className="mt-1 text-sm leading-6 text-text-secondary">
                                    {hints.plan_help.closing_block}
                                </p>
                            </li>
                        </ul>
                    </div>

                    {hints.plan_help.host_tips.length > 0 && (
                        <div>
                            <SectionLabel>호스트 팁</SectionLabel>
                            <ul className="mt-2 flex flex-col gap-1.5">
                                {hints.plan_help.host_tips.map((tip, index) => (
                                    <li
                                        key={index}
                                        className="flex gap-2 text-sm leading-6 text-text-secondary"
                                    >
                                        <span
                                            aria-hidden
                                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                                        />
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <SectionLabel>예상 수요</SectionLabel>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-brand-50 px-3 py-2">
                                <p className="text-[10px] font-semibold text-brand-700">
                                    p50
                                </p>
                                <p className="mt-1 text-sm font-bold text-brand-800">
                                    파트너{' '}
                                    {
                                        hints.expected_demand
                                            .forecast_join_count_p50
                                    }
                                    명 예상
                                </p>
                            </div>
                            <div className="rounded-lg bg-accent-muted px-3 py-2">
                                <p className="text-[10px] font-semibold text-accent-dark">
                                    p90
                                </p>
                                <p className="mt-1 text-sm font-bold text-accent-dark">
                                    최대{' '}
                                    {
                                        hints.expected_demand
                                            .forecast_join_count_p90
                                    }
                                    명까지
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
