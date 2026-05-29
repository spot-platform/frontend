// map 클러스터 블롭 프로토타입. SVG gooey filter로 물감방울 형태의 메타볼 + 흡수 애니.

'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
    memo,
    useEffect,
    useId,
    useInsertionEffect,
    useReducer,
    useRef,
    type CSSProperties,
    type KeyboardEvent,
    type MouseEvent,
} from 'react';
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
    visualMode?: 'full' | 'simple';
};

const VIEW = 160;
const CX = VIEW / 2;
const CY = VIEW / 2;
const CORE_SELECTED = 26;
const CORE_IDLE = 22;
const SAT_COUNT = 5;
const FEED_GROUP_PURPLE = '#8B5CF6';
const FEED_GROUP_TEAL = '#14B8A6';
const FEED_GROUP_BLUE = '#06B6D4';
const CLUSTER_BLOB_KEYFRAMES_ID = 'spot-cluster-blob-keyframes';
const CLUSTER_BLOB_KEYFRAMES = `
@keyframes spot-cluster-core-breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}
@keyframes spot-cluster-discovery-breathe {
    0%, 100% { transform: scale(0.92); }
    50% { transform: scale(1.14); }
}
@keyframes spot-feed-group-core-shift {
    0%, 100% { transform: scale(1); fill: ${FEED_GROUP_PURPLE}; }
    38% { transform: scale(1.12); fill: ${FEED_GROUP_TEAL}; }
    70% { transform: scale(1.03); fill: ${FEED_GROUP_BLUE}; }
}
@keyframes spot-cluster-satellite-drift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(var(--blob-dx), var(--blob-dy)) scale(1.2); }
}
`;

function useClusterBlobKeyframes() {
    useInsertionEffect(() => {
        if (typeof document === 'undefined') return;
        if (document.getElementById(CLUSTER_BLOB_KEYFRAMES_ID)) return;

        const style = document.createElement('style');
        style.id = CLUSTER_BLOB_KEYFRAMES_ID;
        style.textContent = CLUSTER_BLOB_KEYFRAMES;
        document.head.appendChild(style);
    }, []);
}

function getVariantTone(
    variant: ActivityCluster['variant'],
    selected: boolean,
) {
    if (variant === 'ai-feed') {
        return {
            fill: '#8B5CF6',
            opacity: 0.86,
            countClassName: 'bg-violet-500 text-white',
        };
    }
    if (variant === 'discovery') {
        return {
            fill: 'var(--color-persona)',
            opacity: 0.42,
            countClassName: 'bg-background/90 text-muted-foreground',
        };
    }
    if (variant === 'feed-group') {
        return {
            fill: FEED_GROUP_PURPLE,
            opacity: 0.9,
            countClassName: 'bg-teal-500 text-white',
        };
    }
    if (variant === 'mine' || variant === 'user-feed' || selected) {
        return {
            fill: 'var(--color-primary)',
            opacity: variant === 'user-feed' ? 0.94 : 0.88,
            countClassName: 'bg-primary text-primary-foreground',
        };
    }
    return {
        fill: 'var(--color-persona)',
        opacity: 0.72,
        countClassName: 'bg-foreground text-background',
    };
}

function ClusterBlobImpl({
    cluster,
    selected,
    onSelectAction,
    absorbing = [],
    visualMode = 'full',
}: ClusterBlobProps) {
    useClusterBlobKeyframes();

    const reduceMotion = useReducedMotion();
    const filterId = useId();
    const count = cluster.personas.length;
    const core = selected ? CORE_SELECTED : CORE_IDLE;
    const dying = !!cluster.isDying;
    const tone = getVariantTone(cluster.variant, selected);
    const isDiscovery = cluster.variant === 'discovery';
    const isFeedGroup = cluster.variant === 'feed-group';
    const isSimple = visualMode === 'simple';

    // 물리적 도착자 수 증가 감지 → join burst 트리거.
    // (assigned 수 아님 — 이동 완료 후 "딱 도착한 순간" 이 사용자에게 의미 있는 이벤트)
    const arrivedCount = cluster.arrivedCount ?? 0;
    const [joinBurstKey, bumpJoinBurst] = useReducer((n: number) => n + 1, 0);
    const prevArrivedRef = useRef(arrivedCount);
    useEffect(() => {
        if (arrivedCount > prevArrivedRef.current && !dying) {
            bumpJoinBurst();
        }
        prevArrivedRef.current = arrivedCount;
    }, [arrivedCount, dying]);

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

    const simpleSize = isDiscovery ? 18 : selected ? 30 : 24;
    const modeTransition = reduceMotion
        ? { duration: 0 }
        : { duration: 0.24, ease: [0.32, 0.72, 0, 1] as const };

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
            // framer-motion 의 scale 과 맵 줌 기반 --overlay-scale 을 함께 적용.
            // translate 로 geographic point 에 센터링 + birth scale * zoom scale.
            transformTemplate={({ scale: birthScale }) =>
                `translate(-50%, -50%) scale(${birthScale ?? 1}) scale(var(--overlay-scale, 1))`
            }
            style={{
                width: VIEW,
                height: VIEW,
                zIndex: selected ? 30 : 10,
                transformOrigin: 'center',
                pointerEvents: dying ? 'none' : undefined,
            }}
        >
            <AnimatePresence initial={false} mode="sync">
                {isSimple ? (
                    <motion.div
                        key="simple-marker"
                        className={cn(
                            'absolute',
                            isFeedGroup
                                ? 'overflow-visible rounded-[48%_52%_45%_55%/54%_46%_58%_42%]'
                                : 'rounded-full',
                        )}
                        style={{
                            top: CY - simpleSize / 2,
                            left: CX - simpleSize / 2,
                            width: simpleSize,
                            height: simpleSize,
                            background: isFeedGroup ? 'transparent' : tone.fill,
                            border: selected
                                ? '2px solid var(--color-primary)'
                                : isFeedGroup
                                  ? '0'
                                  : '1px solid var(--color-map-bg)',
                            boxShadow: selected
                                ? '0 0 0 4px color-mix(in srgb, var(--color-primary) 22%, transparent)'
                                : isFeedGroup
                                  ? 'none'
                                  : '0 2px 8px rgba(0,0,0,0.16)',
                        }}
                        initial={{
                            opacity: 0,
                            scale: 0.72,
                        }}
                        animate={{
                            opacity: Math.min(1, tone.opacity + 0.12),
                            scale: 1,
                        }}
                        exit={{ opacity: 0, scale: 1.12 }}
                        transition={modeTransition}
                    >
                        {isFeedGroup && (
                            <span
                                aria-hidden
                                className="absolute inset-0"
                                style={{
                                    transform: 'rotate(-18deg)',
                                    borderRadius:
                                        '48% 52% 45% 55% / 54% 46% 58% 42%',
                                    background: `
                                        radial-gradient(circle at 31% 27%, rgba(255,255,255,0.38) 0 9%, transparent 28%),
                                        radial-gradient(circle at 72% 24%, rgba(20,184,166,0.86) 0 14%, transparent 38%),
                                        radial-gradient(circle at 30% 76%, rgba(6,182,212,0.82) 0 16%, transparent 42%),
                                        linear-gradient(135deg, ${FEED_GROUP_TEAL} 0%, ${FEED_GROUP_BLUE} 34%, ${FEED_GROUP_PURPLE} 70%, #7C3AED 100%)
                                    `,
                                    border: '1px solid var(--color-map-bg)',
                                    boxShadow:
                                        '0 0 0 2px rgba(255,255,255,0.74), 0 0 0 5px rgba(20,184,166,0.15), 0 6px 14px rgba(91,33,182,0.24)',
                                }}
                            >
                                <span
                                    className="absolute rounded-full"
                                    style={{
                                        width: simpleSize * 0.72,
                                        height: simpleSize * 0.72,
                                        right: -simpleSize * 0.08,
                                        top: -simpleSize * 0.1,
                                        background: FEED_GROUP_TEAL,
                                        opacity: 0.82,
                                        filter: 'blur(0.2px)',
                                    }}
                                />
                                <span
                                    className="absolute rounded-full"
                                    style={{
                                        width: simpleSize * 0.62,
                                        height: simpleSize * 0.62,
                                        left: -simpleSize * 0.04,
                                        bottom: -simpleSize * 0.08,
                                        background: FEED_GROUP_BLUE,
                                        opacity: 0.72,
                                        filter: 'blur(0.25px)',
                                    }}
                                />
                            </span>
                        )}
                        {!isDiscovery && count > 1 && (
                            <span
                                className={cn(
                                    'absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none shadow-sm',
                                    tone.countClassName,
                                )}
                            >
                                {count}
                            </span>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="full-marker"
                        className="absolute inset-0"
                        initial={{
                            opacity: 0,
                            scale: 0.82,
                        }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.76 }}
                        transition={modeTransition}
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

                        {/* 참여자 join burst — 새 참여자가 도착할 때마다 ring 이 퍼져나감 + 잔향 링 */}
                        {!reduceMotion && joinBurstKey > 0 && (
                            <>
                                <motion.div
                                    key={`burst-ring-${joinBurstKey}`}
                                    className="pointer-events-none absolute rounded-full border-[2px] border-persona-strong"
                                    style={{
                                        top: CY - core,
                                        left: CX - core,
                                        width: core * 2,
                                        height: core * 2,
                                    }}
                                    initial={{ scale: 0.6, opacity: 0.9 }}
                                    animate={{ scale: 3, opacity: 0 }}
                                    transition={{
                                        duration: 0.9,
                                        ease: 'easeOut',
                                    }}
                                />
                                <motion.div
                                    key={`burst-echo-${joinBurstKey}`}
                                    className="pointer-events-none absolute rounded-full border border-persona"
                                    style={{
                                        top: CY - core,
                                        left: CX - core,
                                        width: core * 2,
                                        height: core * 2,
                                    }}
                                    initial={{ scale: 0.8, opacity: 0.6 }}
                                    animate={{ scale: 4, opacity: 0 }}
                                    transition={{
                                        duration: 1.3,
                                        ease: 'easeOut',
                                        delay: 0.12,
                                    }}
                                />
                                {/* 중앙 플래시 — 짧고 밝게 */}
                                <motion.div
                                    key={`burst-flash-${joinBurstKey}`}
                                    className="pointer-events-none absolute rounded-full bg-persona-strong"
                                    style={{
                                        top: CY - core / 2,
                                        left: CX - core / 2,
                                        width: core,
                                        height: core,
                                    }}
                                    initial={{ scale: 0.6, opacity: 0.8 }}
                                    animate={{ scale: 1.6, opacity: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: 'easeOut',
                                    }}
                                />
                            </>
                        )}

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
                                    <feGaussianBlur
                                        in="SourceGraphic"
                                        stdDeviation="6"
                                    />
                                    <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" />
                                </filter>
                            </defs>
                            <g
                                data-testid="cluster-blob-full-animation"
                                data-animated={reduceMotion ? 'false' : 'true'}
                                filter={`url(#${filterId})`}
                                style={{
                                    fill: tone.fill,
                                    opacity: tone.opacity,
                                }}
                            >
                                <motion.circle
                                    cx={CX}
                                    cy={CY}
                                    fill={tone.fill}
                                    initial={{ r: core }}
                                    animate={
                                        reduceMotion
                                            ? { r: core }
                                            : isDiscovery
                                              ? {
                                                    r: [
                                                        core - 2,
                                                        core + 3,
                                                        core - 1,
                                                    ],
                                                }
                                              : isFeedGroup
                                                ? {
                                                      r: [
                                                          core,
                                                          core + 2.5,
                                                          core + 0.5,
                                                          core,
                                                      ],
                                                      fill: [
                                                          FEED_GROUP_PURPLE,
                                                          FEED_GROUP_TEAL,
                                                          FEED_GROUP_BLUE,
                                                          FEED_GROUP_PURPLE,
                                                      ],
                                                  }
                                                : { r: [core, core + 2, core] }
                                    }
                                    transition={{
                                        duration: isDiscovery
                                            ? 2.7
                                            : isFeedGroup
                                              ? 4.1
                                              : 3.4,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    style={{
                                        transformBox: 'fill-box',
                                        transformOrigin: 'center',
                                        animation: reduceMotion
                                            ? undefined
                                            : isDiscovery
                                              ? 'spot-cluster-discovery-breathe 2.7s ease-in-out infinite'
                                              : isFeedGroup
                                                ? 'spot-feed-group-core-shift 4.1s ease-in-out infinite'
                                                : 'spot-cluster-core-breathe 3.4s ease-in-out infinite',
                                    }}
                                />
                                {!isDiscovery &&
                                    Array.from({ length: SAT_COUNT }).map(
                                        (_, i) => {
                                            const angle =
                                                (i / SAT_COUNT) * Math.PI * 2 +
                                                i * 0.35;
                                            const baseR = core * 1.05;
                                            const sx =
                                                CX + Math.cos(angle) * baseR;
                                            const sy =
                                                CY + Math.sin(angle) * baseR;
                                            const drift = 5;
                                            const feedGroupFill =
                                                i % 3 === 0
                                                    ? FEED_GROUP_TEAL
                                                    : i % 3 === 1
                                                      ? FEED_GROUP_PURPLE
                                                      : FEED_GROUP_BLUE;
                                            const satelliteAnimationDuration =
                                                (isFeedGroup ? 3.2 : 2.8) +
                                                i * 0.22;
                                            return (
                                                <motion.circle
                                                    key={`sat-${i}`}
                                                    fill={
                                                        isFeedGroup
                                                            ? feedGroupFill
                                                            : tone.fill
                                                    }
                                                    initial={{
                                                        cx: sx,
                                                        cy: sy,
                                                        r: 8,
                                                    }}
                                                    animate={
                                                        reduceMotion
                                                            ? {
                                                                  cx: sx,
                                                                  cy: sy,
                                                                  r: 8,
                                                              }
                                                            : {
                                                                  cx: [
                                                                      sx,
                                                                      sx +
                                                                          Math.cos(
                                                                              angle,
                                                                          ) *
                                                                              drift,
                                                                      sx,
                                                                  ],
                                                                  cy: [
                                                                      sy,
                                                                      sy +
                                                                          Math.sin(
                                                                              angle,
                                                                          ) *
                                                                              drift,
                                                                      sy,
                                                                  ],
                                                                  r: isFeedGroup
                                                                      ? [
                                                                            7.5,
                                                                            10.5,
                                                                            8.5,
                                                                            7.5,
                                                                        ]
                                                                      : [
                                                                            8,
                                                                            10,
                                                                            8,
                                                                        ],
                                                              }
                                                    }
                                                    transition={{
                                                        duration:
                                                            satelliteAnimationDuration,
                                                        repeat: Infinity,
                                                        ease: 'easeInOut',
                                                    }}
                                                    style={
                                                        reduceMotion
                                                            ? undefined
                                                            : ({
                                                                  transformBox:
                                                                      'fill-box',
                                                                  transformOrigin:
                                                                      'center',
                                                                  animation: `${satelliteAnimationDuration}s ease-in-out ${i * 0.08}s infinite spot-cluster-satellite-drift`,
                                                                  '--blob-dx': `${Math.cos(angle) * drift}px`,
                                                                  '--blob-dy': `${Math.sin(angle) * drift}px`,
                                                              } as CSSProperties)
                                                    }
                                                />
                                            );
                                        },
                                    )}
                                {absorbing.map((dot) => {
                                    const startX = CX + dot.fromX * 55;
                                    const startY = CY + dot.fromY * 55;
                                    const x =
                                        startX + (CX - startX) * dot.progress;
                                    const y =
                                        startY + (CY - startY) * dot.progress;
                                    const r = 5 + dot.progress * 6;
                                    return (
                                        <circle
                                            key={dot.id}
                                            cx={x}
                                            cy={y}
                                            r={r}
                                        />
                                    );
                                })}
                            </g>
                        </svg>

                        {isDiscovery && !reduceMotion && (
                            <motion.div
                                className="pointer-events-none absolute rounded-full border border-foreground/20"
                                style={{
                                    top: CY - core * 1.08,
                                    left: CX - core * 1.08,
                                    width: core * 2.16,
                                    height: core * 2.16,
                                }}
                                animate={{
                                    scale: [0.92, 1.18, 0.96],
                                    opacity: [0.22, 0.04, 0.18],
                                    borderRadius: ['48%', '43%', '52%'],
                                }}
                                transition={{
                                    duration: 2.8,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                        )}

                        {!isDiscovery && (
                            <>
                                <div
                                    className={cn(
                                        'absolute flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[6px] font-mono text-[11px] font-bold shadow-md',
                                        'border-2 border-map-bg',
                                        tone.countClassName,
                                    )}
                                    style={{
                                        top: CY - core - 8,
                                        left: CX + core - 6,
                                    }}
                                >
                                    {count}
                                </div>
                                {!isFeedGroup && (
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold tracking-tight text-foreground/75 drop-shadow-sm dark:text-foreground/80"
                                        style={{ top: CY + core + 10 }}
                                    >
                                        {cluster.category}
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export const ClusterBlob = memo(ClusterBlobImpl, (prev, next) => {
    if (prev.selected !== next.selected) return false;
    if (prev.absorbing !== next.absorbing) return false;
    if (prev.visualMode !== next.visualMode) return false;
    const a = prev.cluster;
    const b = next.cluster;
    return (
        a.id === b.id &&
        a.isPulse === b.isPulse &&
        a.isDying === b.isDying &&
        a.personas.length === b.personas.length &&
        a.centerCoord.lat === b.centerCoord.lat &&
        a.centerCoord.lng === b.centerCoord.lng &&
        a.category === b.category &&
        a.intent === b.intent &&
        (a.arrivedCount ?? 0) === (b.arrivedCount ?? 0) &&
        a.variant === b.variant
    );
});
