'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import type { PollItem } from '../../model/types';

export function PollCard({ poll }: { poll: PollItem }) {
    const [selected, setSelected] = useState<number | null>(null);

    const voted = selected !== null;
    const total = voted ? poll.totalVotes + 1 : poll.totalVotes;

    return (
        <div className="rounded-xl border border-border-soft bg-card px-4 py-4 h-full">
            <p className="text-sm font-semibold text-foreground">
                {poll.question}
            </p>

            <div className="mt-3 flex flex-col gap-2">
                {poll.options.map((opt, i) => {
                    const count = i === selected ? opt.count + 1 : opt.count;
                    const pct = Math.round((count / total) * 100);

                    return voted ? (
                        <div key={i} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span
                                    className={cn(
                                        'text-xs font-medium',
                                        i === selected
                                            ? 'text-brand-800 font-bold'
                                            : 'text-text-secondary',
                                    )}
                                >
                                    {opt.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {pct}%
                                </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all duration-500',
                                        i === selected
                                            ? 'bg-brand-800'
                                            : 'bg-border-strong',
                                    )}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setSelected(i)}
                            className="rounded-lg border border-border-soft py-2 text-sm text-text-secondary transition-colors hover:border-brand-800 hover:text-brand-800"
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>

            <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                    총 {total.toLocaleString()}명 참여
                </span>
                {poll.relatedOfferId && (
                    <Link
                        href={`/feed/${poll.relatedOfferId}`}
                        className="text-[11px] font-medium text-brand-800 underline-offset-2 hover:underline"
                    >
                        관련 모임 보기 →
                    </Link>
                )}
            </div>
        </div>
    );
}
