'use client';

// 서포터 대시보드 항목: composite_score + 8시그널 레이더 차트 + 개선 힌트 + 가격 벤치마크.

import { motion } from 'framer-motion';
import type {
    AttractivenessReport,
    AttractivenessSignal,
} from '@/entities/spot/simulation-types';
import { cn } from '@/shared/lib/cn';

type AttractivenessCardProps = {
    report: AttractivenessReport;
    title?: string;
};

const SIGNAL_ORDER: AttractivenessSignal[] = [
    'title_hookiness',
    'price_reasonableness',
    'venue_accessibility',
    'host_reputation_fit',
    'time_slot_demand',
    'skill_rarity_bonus',
    'narrative_authenticity',
    'bonded_repeat_potential',
];

const SIGNAL_LABEL: Record<AttractivenessSignal, string> = {
    title_hookiness: '제목 후킹도',
    price_reasonableness: '가격 적정성',
    venue_accessibility: '장소 접근성',
    host_reputation_fit: '호스트 평판 적합도',
    time_slot_demand: '시간대 수요',
    skill_rarity_bonus: '희소성 보너스',
    narrative_authenticity: '내러티브 진정성',
    bonded_repeat_potential: '재방문 잠재력',
};

function scoreTone(score: number): {
    ring: string;
    text: string;
    label: string;
} {
    if (score >= 0.7) {
        return {
            ring: 'stroke-accent',
            text: 'text-accent-dark',
            label: '매력적',
        };
    }
    if (score >= 0.4) {
        return {
            ring: 'stroke-brand-600',
            text: 'text-brand-700',
            label: '보통',
        };
    }
    return {
        ring: 'stroke-neutral-300',
        text: 'text-neutral-500',
        label: '보강 필요',
    };
}

function CompositeGauge({ score }: { score: number }) {
    const clamped = Math.max(0, Math.min(1, score));
    const tone = scoreTone(clamped);
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const dash = circumference * clamped;

    return (
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
            <svg
                viewBox="0 0 120 120"
                className="h-full w-full -rotate-90"
                aria-hidden
            >
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className="fill-none stroke-neutral-200"
                    strokeWidth={10}
                />
                <motion.circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className={cn('fill-none', tone.ring)}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - dash }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span
                    className={cn(
                        'text-2xl font-black tabular-nums',
                        tone.text,
                    )}
                >
                    {clamped.toFixed(2)}
                </span>
                <span className="text-[10px] font-semibold tracking-wide text-neutral-500">
                    {tone.label}
                </span>
            </div>
        </div>
    );
}

type RadarPoint = { x: number; y: number; labelX: number; labelY: number };

function buildRadarPoints(
    signals: Record<AttractivenessSignal, number>,
    size: number,
): {
    center: number;
    axes: RadarPoint[];
    valuePoints: { x: number; y: number }[];
    grid: { x: number; y: number }[][];
} {
    const center = size / 2;
    const radius = center - 36;
    const axisCount = SIGNAL_ORDER.length;
    const labelRadius = radius + 18;

    const axes: RadarPoint[] = SIGNAL_ORDER.map((_, index) => {
        const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
            labelX: center + labelRadius * Math.cos(angle),
            labelY: center + labelRadius * Math.sin(angle),
        };
    });

    const valuePoints = SIGNAL_ORDER.map((signal, index) => {
        const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
        const value = Math.max(0, Math.min(1, signals[signal] ?? 0));
        return {
            x: center + radius * value * Math.cos(angle),
            y: center + radius * value * Math.sin(angle),
        };
    });

    const gridLevels = [0.25, 0.5, 0.75, 1];
    const grid = gridLevels.map((level) =>
        SIGNAL_ORDER.map((_, index) => {
            const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
            return {
                x: center + radius * level * Math.cos(angle),
                y: center + radius * level * Math.sin(angle),
            };
        }),
    );

    return { center, axes, valuePoints, grid };
}

function RadarChart({
    signals,
}: {
    signals: Record<AttractivenessSignal, number>;
}) {
    const size = 260;
    const { axes, valuePoints, grid } = buildRadarPoints(signals, size);
    const polygonPath = valuePoints
        .map(
            (p, i) =>
                `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
        )
        .join(' ')
        .concat(' Z');

    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            className="mx-auto h-full w-full max-w-[320px]"
            role="img"
            aria-label="8개 시그널 레이더 차트"
        >
            {grid.map((ring, level) => {
                const path = ring
                    .map(
                        (p, i) =>
                            `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
                    )
                    .join(' ')
                    .concat(' Z');
                return (
                    <path
                        key={level}
                        d={path}
                        className="fill-none stroke-neutral-200"
                        strokeWidth={1}
                    />
                );
            })}

            {axes.map((axis, index) => (
                <line
                    key={`axis-${index}`}
                    x1={size / 2}
                    y1={size / 2}
                    x2={axis.x}
                    y2={axis.y}
                    className="stroke-neutral-200"
                    strokeWidth={1}
                />
            ))}

            <motion.path
                d={polygonPath}
                className="fill-accent/20 stroke-accent"
                strokeWidth={2}
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
            />

            {valuePoints.map((p, index) => (
                <circle
                    key={`point-${index}`}
                    cx={p.x}
                    cy={p.y}
                    r={3}
                    className="fill-accent"
                />
            ))}

            {axes.map((axis, index) => {
                const signal = SIGNAL_ORDER[index];
                const label = SIGNAL_LABEL[signal];
                const anchor =
                    Math.abs(axis.labelX - size / 2) < 4
                        ? 'middle'
                        : axis.labelX > size / 2
                          ? 'start'
                          : 'end';
                return (
                    <text
                        key={`label-${index}`}
                        x={axis.labelX}
                        y={axis.labelY}
                        textAnchor={anchor}
                        dominantBaseline="middle"
                        className="fill-neutral-600 text-[10px] font-semibold"
                    >
                        {label}
                    </text>
                );
            })}
        </svg>
    );
}

function PriceBenchmark({
    benchmark,
}: {
    benchmark: AttractivenessReport['price_benchmark'];
}) {
    const format = (n: number) => `${n.toLocaleString('ko-KR')}원`;
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.16em] text-neutral-400 uppercase">
                    가격 벤치마크
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                    {benchmark.verdict}
                </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                    { label: 'p25', value: benchmark.p25 },
                    { label: 'p50', value: benchmark.p50 },
                    { label: 'p75', value: benchmark.p75 },
                    { label: 'p90', value: benchmark.p90 },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="rounded-lg bg-neutral-50 px-2 py-2"
                    >
                        <p className="text-[10px] font-semibold text-neutral-400">
                            {item.label}
                        </p>
                        <p className="mt-1 text-xs font-bold tabular-nums text-neutral-800">
                            {format(item.value)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AttractivenessCard({ report, title }: AttractivenessCardProps) {
    return (
        <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
            {title && (
                <header className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-neutral-900">
                        {title}
                    </h2>
                </header>
            )}

            <div className="flex items-center gap-4">
                <CompositeGauge score={report.composite_score} />
                <div className="flex-1">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-neutral-400 uppercase">
                        composite score
                    </p>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                        8개 시그널을 종합한 피드 매력도입니다. 0.7 이상이면 매칭
                        성사 확률이 높아요.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-neutral-100 bg-surface p-3">
                <RadarChart signals={report.signals} />
            </div>

            {report.improvement_hints.length > 0 && (
                <div className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                    <span className="text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                        개선 힌트
                    </span>
                    <ul className="flex flex-col gap-1.5">
                        {report.improvement_hints.map((hint, index) => (
                            <li
                                key={index}
                                className="flex gap-2 text-sm leading-6 text-neutral-700"
                            >
                                <span
                                    aria-hidden
                                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                                />
                                <span>{hint}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <PriceBenchmark benchmark={report.price_benchmark} />
        </section>
    );
}
