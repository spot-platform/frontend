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
            className={cn(
                'absolute bottom-[102px] left-3 right-3 flex h-[34px] items-center gap-2 rounded-[17px] border border-border-soft bg-card/95 px-3 text-[11px] shadow-sm backdrop-blur-md dark:shadow-none',
                className,
            )}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={event.id}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-1 items-center gap-2"
                >
                    <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-persona-soft text-[10px]">
                        <span aria-hidden>{event.personaEmoji}</span>
                    </div>
                    <strong className="font-semibold text-foreground">
                        {event.personaName}
                    </strong>
                    <span className="text-muted-foreground">
                        님이 {event.predicate}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                        {formatRelativeTime(event.timestamp, now)}
                    </span>
                </motion.div>
            </AnimatePresence>
            {sseActive && (
                <motion.span
                    aria-label="라이브"
                    className="absolute right-3 top-[-6px] inline-flex items-center gap-[4px] rounded-full bg-destructive px-[6px] py-[1px] text-[9px] font-bold uppercase leading-none tracking-wider text-destructive-foreground"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                >
                    <span className="h-[4px] w-[4px] rounded-full bg-destructive-foreground" />
                    LIVE
                </motion.span>
            )}
        </div>
    );
}
