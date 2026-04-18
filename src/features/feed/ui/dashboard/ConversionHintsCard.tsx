'use client';

// 가상 스팟 → 실제 피드 전환 가이드. placeholder + pricing + plan_help + expected_demand 블록을 순차 렌더.

import { useState } from 'react';
import type { ConversionHints } from '@/entities/spot/simulation-types';
import { cn } from '@/shared/lib/cn';

type ConversionHintsCardProps = {
    hints: ConversionHints;
    defaultExpanded?: boolean;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {children}
        </span>
    );
}

function FeeBreakdown({ breakdown }: { breakdown: unknown }) {
    if (
        breakdown === null ||
        breakdown === undefined ||
        typeof breakdown !== 'object'
    ) {
        return null;
    }

    const entries = Object.entries(breakdown as Record<string, unknown>);
    if (entries.length === 0) return null;

    return (
        <dl className="mt-3 grid grid-cols-1 gap-1 rounded-lg bg-muted p-3 text-sm">
            {entries.map(([key, value]) => (
                <div
                    key={key}
                    className="flex items-center justify-between gap-2"
                >
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-semibold tabular-nums text-text-secondary">
                        {typeof value === 'number'
                            ? `${value.toLocaleString('ko-KR')}원`
                            : String(value)}
                    </dd>
                </div>
            ))}
        </dl>
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
                        <FeeBreakdown
                            breakdown={hints.pricing_suggestion.fee_breakdown}
                        />
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
