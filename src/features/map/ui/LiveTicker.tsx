// map 라이브 티커. 단일 이벤트 카드를 fade+slide 로 교체 렌더.

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@frontend/design-system';
import type { TickerEvent } from '../model/ticker-adapter';

type LiveTickerProps = {
    event: TickerEvent | null;
    sseActive?: boolean;
    className?: string;
};

function formatRelativeTime(timestamp: number, now: number): string {
    const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
    if (diffSec < 10) return '방금';
    if (diffSec < 60) return `${diffSec}초 전`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    return `${diffHour}시간 전`;
}

export function LiveTicker({ event, sseActive, className }: LiveTickerProps) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!event) return;
        const interval = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(interval);
    }, [event]);

    if (!event) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            onClick={(e) => e.stopPropagation()}
            className={cn(
                'flex h-7 w-full items-center gap-2 border-b border-border-soft bg-card/95 px-4 text-[11px] backdrop-blur-md',
                className,
            )}
        >
            {sseActive && (
                <motion.span
                    aria-label="라이브"
                    className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-destructive px-1.25 py-px text-[9px] font-bold uppercase leading-none tracking-wider text-destructive-foreground"
                    animate={{ opacity: [1, 0.55, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                >
                    <span className="h-1 w-1 rounded-full bg-destructive-foreground" />
                    LIVE
                </motion.span>
            )}
            <AnimatePresence mode="wait">
                <motion.div
                    key={event.id}
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -6, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex min-w-0 flex-1 items-center gap-1.5"
                >
                    <span aria-hidden className="text-[12px] leading-none">
                        {event.personaEmoji}
                    </span>
                    <strong className="font-semibold text-foreground">
                        {event.personaName}
                    </strong>
                    <span className="truncate text-muted-foreground">
                        님이 {event.predicate}
                    </span>
                </motion.div>
            </AnimatePresence>
            <span className="shrink-0 text-[10px] text-muted-foreground">
                {formatRelativeTime(event.timestamp, now)}
            </span>
        </div>
    );
}
