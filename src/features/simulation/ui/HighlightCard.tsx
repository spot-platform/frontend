'use client';

import { motion } from 'framer-motion';
import type { HighlightClip } from '@/entities/spot/simulation-types';
import type { Persona } from '@/entities/persona/types';

type CategoryTone = 'accent' | 'brand' | 'warning' | 'neutral';

type CategoryMeta = {
    emoji: string;
    label: string;
    tone: CategoryTone;
};

const CATEGORY_META: Record<HighlightClip['category'], CategoryMeta> = {
    first_success: { emoji: '🌱', label: '첫 매칭', tone: 'accent' },
    bond_upgrade: { emoji: '🔗', label: '관계 심화', tone: 'brand' },
    counter_offer: { emoji: '🔁', label: '역제안', tone: 'warning' },
    referral: { emoji: '📣', label: '추천', tone: 'neutral' },
    unexpected_match: { emoji: '✨', label: '예상 밖 만남', tone: 'accent' },
};

const TONE_CLASS: Record<
    CategoryTone,
    { badge: string; ring: string; accentBar: string }
> = {
    accent: {
        badge: 'bg-accent-muted text-accent-dark',
        ring: 'ring-accent-border',
        accentBar: 'bg-accent',
    },
    brand: {
        badge: 'bg-brand-50 text-brand-700',
        ring: 'ring-brand-200',
        accentBar: 'bg-brand-500',
    },
    warning: {
        // design-system tokens.css only exposes a single --color-warning.
        // Fallback to neutral surface for tinted fills, paired with the warning fg.
        badge: 'bg-neutral-100 text-warning',
        ring: 'ring-neutral-200',
        accentBar: 'bg-warning',
    },
    neutral: {
        badge: 'bg-neutral-100 text-neutral-700',
        ring: 'ring-neutral-200',
        accentBar: 'bg-neutral-400',
    },
};

export type HighlightCardProps = {
    clip: HighlightClip;
    onTap?: (clipId: string) => void;
    personas?: Record<string, Persona>;
};

export function HighlightCard({ clip, onTap, personas }: HighlightCardProps) {
    const meta = CATEGORY_META[clip.category];
    const toneClass = TONE_CLASS[meta.tone];

    const agents = clip.involved_agents;
    const visibleAgents = agents.slice(0, 3);
    const overflow = Math.max(0, agents.length - visibleAgents.length);

    return (
        <motion.button
            type="button"
            onClick={() => onTap?.(clip.clip_id)}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`group relative flex w-full gap-3 rounded-xl bg-background p-4 text-left shadow-sm ring-1 ${toneClass.ring} transition-colors`}
        >
            <span
                aria-hidden
                className={`absolute left-0 top-4 bottom-4 w-1 rounded-r ${toneClass.accentBar}`}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2 pl-2">
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${toneClass.badge}`}
                    >
                        <span aria-hidden>{meta.emoji}</span>
                        {meta.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        tick {clip.start_tick}–{clip.end_tick}
                    </span>
                </div>
                <p className="truncate text-sm font-semibold text-foreground">
                    {clip.title}
                </p>
                <p className="line-clamp-3 text-xs leading-relaxed text-text-secondary">
                    {clip.narrative}
                </p>
                {agents.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                        <div className="flex -space-x-2">
                            {visibleAgents.map((agentId) => {
                                const persona = personas?.[agentId];
                                return (
                                    <span
                                        key={agentId}
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-neutral-100 text-sm"
                                        title={persona?.name ?? agentId}
                                    >
                                        {persona?.emoji ?? '🙂'}
                                    </span>
                                );
                            })}
                            {overflow > 0 && (
                                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-background bg-neutral-200 px-1.5 text-[10px] font-semibold text-neutral-700">
                                    +{overflow}
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                            {agents.length}명 참여
                        </span>
                    </div>
                )}
            </div>
        </motion.button>
    );
}
