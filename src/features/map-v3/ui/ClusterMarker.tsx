// map-v3 클러스터 마커. 페르소나가 뭉친 장소 = 피드. 선택 시 펄스 링 + 툴팁.

'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { KeyboardEvent } from 'react';
import { cn } from '@frontend/design-system';
import type { ActivityCluster } from '../model/types';

type ClusterMarkerProps = {
    cluster: ActivityCluster;
    selected: boolean;
    onSelectAction: (id: string) => void;
};

const SIZE_SELECTED = 82;
const SIZE_IDLE = 68;
const AVATAR_SIZE = 24;

export function ClusterMarker({
    cluster,
    selected,
    onSelectAction,
}: ClusterMarkerProps) {
    const reduceMotion = useReducedMotion();
    const size = selected ? SIZE_SELECTED : SIZE_IDLE;
    const displayed = cluster.personas.slice(0, 4);
    const overflowCount =
        cluster.personas.length > 4 ? cluster.personas.length - 3 : 0;
    const count = cluster.personas.length;

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelectAction(cluster.id);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`${cluster.category} · 페르소나 ${count}명 모임`}
            onClick={() => onSelectAction(cluster.id)}
            onKeyDown={handleKeyDown}
            className="absolute outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-full"
            style={{
                zIndex: selected ? 30 : 10,
                transform: 'translate(-50%, -50%)',
            }}
        >
            {/* pulse ring */}
            <AnimatePresence mode="wait">
                {selected && cluster.isPulse && !reduceMotion && (
                    <motion.div
                        key="pulse"
                        className="absolute rounded-full border border-primary"
                        style={{
                            top: -6,
                            left: -6,
                            width: size + 12,
                            height: size + 12,
                        }}
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.15, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: 'easeOut',
                        }}
                    />
                )}
            </AnimatePresence>

            {/* tooltip */}
            {selected && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-foreground px-3 py-[7px] text-[12px] font-bold leading-none tracking-tight text-background shadow-lg"
                    style={{ bottom: size + 8 }}
                >
                    {cluster.category}
                    <div className="mt-1 text-[10px] font-medium opacity-60">
                        {cluster.category} · {count}명 모여있음
                    </div>
                    <div
                        className="absolute left-1/2 h-0 w-0 -translate-x-1/2 border-x-[4px] border-t-[4px] border-x-transparent border-t-foreground"
                        style={{ bottom: -4 }}
                    />
                </div>
            )}

            {/* cluster circle */}
            <div
                className={cn(
                    'relative rounded-full',
                    selected
                        ? 'border-[1.5px] border-solid border-primary bg-primary/[0.12] shadow-[0_0_20px_var(--color-primary-glow)] dark:bg-primary/[0.18]'
                        : 'border-[1.5px] border-dashed border-persona bg-persona-soft',
                )}
                style={{ width: size, height: size }}
            >
                {/* avatars */}
                {displayed.map((persona, i) => {
                    const showOverflow = overflowCount > 0 && i === 3;
                    const angle =
                        (i / displayed.length) * Math.PI * 2 - Math.PI / 2;
                    const r = size * 0.26;
                    const cx = size / 2 + Math.cos(angle) * r - AVATAR_SIZE / 2;
                    const cy = size / 2 + Math.sin(angle) * r - AVATAR_SIZE / 2;

                    return (
                        <div
                            key={persona.id}
                            className="absolute flex items-center justify-center rounded-full border-[1.5px] border-persona bg-card text-[12px] shadow-sm dark:shadow-[0_0_6px_var(--color-persona-glow)]"
                            style={{
                                left: cx,
                                top: cy,
                                width: AVATAR_SIZE,
                                height: AVATAR_SIZE,
                            }}
                        >
                            {showOverflow ? (
                                <span className="text-[10px] font-bold text-foreground">
                                    +{overflowCount}
                                </span>
                            ) : (
                                <span aria-hidden>{persona.emoji}</span>
                            )}
                        </div>
                    );
                })}

                {/* count badge */}
                <div
                    className={cn(
                        'absolute flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[6px] font-mono text-[11px] font-bold shadow-md',
                        'border-2 border-map-bg',
                        selected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-foreground text-background',
                    )}
                    style={{ bottom: -4, right: -4 }}
                >
                    {count}
                </div>
            </div>

            {/* category label when not selected */}
            {!selected && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold tracking-tight text-foreground/70 drop-shadow-sm dark:text-foreground/75"
                    style={{ top: size + 2 }}
                >
                    {cluster.category}
                </div>
            )}
        </div>
    );
}
