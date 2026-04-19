// map 클러스터 블롭 프로토타입. SVG gooey filter로 물감방울 형태의 메타볼 + 흡수 애니.

'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useId, type KeyboardEvent, type MouseEvent } from 'react';
import { cn } from '@frontend/design-system';
import type { ActivityCluster } from '../model/types';

export type AbsorbingDot = {
    id: string;
    /** -1..1 범위. 클러스터 중심 기준 시작 위치 오프셋. */
    fromX: number;
    fromY: number;
    /** 0 = 시작, 1 = 완전 흡수. */
    progress: number;
};

type ClusterBlobProps = {
    cluster: ActivityCluster;
    selected: boolean;
    onSelectAction: (id: string) => void;
    absorbing?: AbsorbingDot[];
};

const VIEW = 160;
const CX = VIEW / 2;
const CY = VIEW / 2;
const CORE_SELECTED = 26;
const CORE_IDLE = 22;
const SAT_COUNT = 5;

export function ClusterBlob({
    cluster,
    selected,
    onSelectAction,
    absorbing = [],
}: ClusterBlobProps) {
    const reduceMotion = useReducedMotion();
    const filterId = useId();
    const count = cluster.personas.length;
    const core = selected ? CORE_SELECTED : CORE_IDLE;
    const dying = !!cluster.isDying;

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (dying) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelectAction(cluster.id);
        }
    };

    const handleClick = dying
        ? undefined
        : (event: MouseEvent) => {
              event.stopPropagation();
              onSelectAction(cluster.id);
          };

    return (
        <motion.div
            role={dying ? undefined : 'button'}
            tabIndex={dying ? -1 : 0}
            aria-label={`${cluster.category} · 페르소나 ${count}명 모임`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className="absolute outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-full"
            initial={{ opacity: 0, scale: 0.25 }}
            animate={{
                opacity: dying ? 0 : 1,
                scale: dying ? 0.35 : 1,
            }}
            transition={
                dying
                    ? { duration: 0.5, ease: 'easeOut' }
                    : {
                          scale: {
                              type: 'spring',
                              stiffness: 260,
                              damping: 20,
                          },
                          opacity: { duration: 0.35, ease: 'easeOut' },
                      }
            }
            style={{
                width: VIEW,
                height: VIEW,
                zIndex: selected ? 30 : 10,
                transform: 'translate(-50%, -50%)',
                pointerEvents: dying ? 'none' : undefined,
            }}
        >
            <AnimatePresence mode="wait">
                {selected && cluster.isPulse && !reduceMotion && (
                    <motion.div
                        key="pulse"
                        className="absolute rounded-full border border-primary"
                        style={{
                            top: CY - core * 1.5,
                            left: CX - core * 1.5,
                            width: core * 3,
                            height: core * 3,
                        }}
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.3, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: 'easeOut',
                        }}
                    />
                )}
            </AnimatePresence>

            <svg
                width={VIEW}
                height={VIEW}
                className="pointer-events-none absolute inset-0"
                aria-hidden
            >
                <defs>
                    <filter
                        id={filterId}
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                    >
                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
                        <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" />
                    </filter>
                </defs>
                <g
                    filter={`url(#${filterId})`}
                    style={{
                        fill: selected
                            ? 'var(--color-primary)'
                            : 'var(--color-persona)',
                        opacity: selected ? 0.85 : 0.72,
                    }}
                >
                    <motion.circle
                        cx={CX}
                        cy={CY}
                        initial={{ r: core }}
                        animate={
                            reduceMotion
                                ? { r: core }
                                : { r: [core, core + 2, core] }
                        }
                        transition={{
                            duration: 3.4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    {Array.from({ length: SAT_COUNT }).map((_, i) => {
                        const angle = (i / SAT_COUNT) * Math.PI * 2 + i * 0.35;
                        const baseR = core * 1.05;
                        const sx = CX + Math.cos(angle) * baseR;
                        const sy = CY + Math.sin(angle) * baseR;
                        const drift = 5;
                        return (
                            <motion.circle
                                key={`sat-${i}`}
                                initial={{ cx: sx, cy: sy, r: 8 }}
                                animate={
                                    reduceMotion
                                        ? { cx: sx, cy: sy, r: 8 }
                                        : {
                                              cx: [
                                                  sx,
                                                  sx + Math.cos(angle) * drift,
                                                  sx,
                                              ],
                                              cy: [
                                                  sy,
                                                  sy + Math.sin(angle) * drift,
                                                  sy,
                                              ],
                                              r: [8, 10, 8],
                                          }
                                }
                                transition={{
                                    duration: 2.8 + i * 0.22,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                        );
                    })}
                    {absorbing.map((dot) => {
                        const startX = CX + dot.fromX * 55;
                        const startY = CY + dot.fromY * 55;
                        const x = startX + (CX - startX) * dot.progress;
                        const y = startY + (CY - startY) * dot.progress;
                        const r = 5 + dot.progress * 6;
                        return <circle key={dot.id} cx={x} cy={y} r={r} />;
                    })}
                </g>
            </svg>

            <div
                className={cn(
                    'absolute flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[6px] font-mono text-[11px] font-bold shadow-md',
                    'border-2 border-map-bg',
                    selected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-foreground text-background',
                )}
                style={{ top: CY - core - 8, left: CX + core - 6 }}
            >
                {count}
            </div>

            <div
                className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold tracking-tight text-foreground/75 drop-shadow-sm dark:text-foreground/80"
                style={{ top: CY + core + 10 }}
            >
                {cluster.category}
            </div>

            {selected && !dying && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-foreground px-3 py-[7px] text-[12px] font-bold leading-none tracking-tight text-background shadow-lg"
                    style={{ top: CY - core - 46 }}
                >
                    {cluster.category}
                    <div className="mt-1 text-[10px] font-medium opacity-60">
                        {count}명 모여있음
                    </div>
                    <div
                        className="absolute left-1/2 h-0 w-0 -translate-x-1/2 border-x-[4px] border-t-[4px] border-x-transparent border-t-foreground"
                        style={{ bottom: -4 }}
                    />
                </div>
            )}
        </motion.div>
    );
}
