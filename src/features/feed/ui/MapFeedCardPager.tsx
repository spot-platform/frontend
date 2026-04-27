'use client';

import { useMemo, useRef, useState } from 'react';
import {
    motion,
    AnimatePresence,
    useReducedMotion,
    type PanInfo,
} from 'framer-motion';
import { IconHeart } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useFilterStore } from '@/features/map/model/use-filter-store';
import type { SpotCategory } from '@/entities/spot/categories';
import { MOCK_FEED } from '@/features/feed/model/mock';
import type { FeedItem } from '@/features/feed/model/types';
import { FeedCard } from '@/features/feed/ui/FeedCard';

export type FeedCardPagerSnap = 'peek' | 'expanded';

const SWIPE_THRESHOLD = 50;
const STACK_WIDTH_PEEK = 120;
const STACK_WIDTH_EXPANDED = 160;
const STACK_BOTTOM_PEEK_DVH = -8;
const STACK_BOTTOM_EXPANDED_DVH = -10;
const PROMOTED_CARD_WIDTH = 'min(92vw, 420px)';
const PROMOTED_CARD_TOP_DVH = 22;
const PROMOTED_STACK_STEP_DVH = 1.4;

type MapFeedCardPagerProps = {
    snap: FeedCardPagerSnap;
    onSnapChange: (snap: FeedCardPagerSnap) => void;
    promotedCount: number;
    onPromotedCountChange: (count: number) => void;
    onBookmark?: (item: FeedItem) => void;
};

type ExitDirection = 'down' | 'left' | 'right';

export function MapFeedCardPager({
    snap,
    onSnapChange,
    promotedCount,
    onPromotedCountChange,
    onBookmark,
}: MapFeedCardPagerProps) {
    const router = useRouter();
    const prefersReducedMotion = useReducedMotion();
    const feedType = useFilterStore((s) => s.feedType);
    const categoriesSelected = useFilterStore((s) => s.categories);
    const searchQuery = useFilterStore((s) => s.searchQuery);
    const setPromotedCount = onPromotedCountChange;
    const isStackDragging = useRef(false);
    // 좌/우 swipe 가 시작된 단일 카드만 override — 그 외는 기본 'down' exit.
    // ref + forceRerender 안티패턴 대신 단일 state 로 정리 (한 시점에 override 대상은 1장).
    const [exitOverride, setExitOverride] = useState<{
        id: string;
        dir: ExitDirection;
    } | null>(null);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return MOCK_FEED.filter((item) => {
            if (feedType === 'offer' && item.type !== 'OFFER') return false;
            if (feedType === 'request' && item.type !== 'REQUEST') return false;
            if (
                categoriesSelected.length > 0 &&
                (!item.category ||
                    !categoriesSelected.includes(item.category as SpotCategory))
            ) {
                return false;
            }
            if (q.length > 0) {
                const haystack = [
                    item.title,
                    item.description ?? '',
                    item.category ?? '',
                    item.location,
                    item.authorNickname,
                ]
                    .join(' ')
                    .toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });
    }, [feedType, categoriesSelected, searchQuery]);

    const total = filtered.length;
    const safePromoted = Math.min(promotedCount, total);
    const nextStackIndex = safePromoted;
    const promotedItems = filtered.slice(0, safePromoted);
    const stackItems = filtered.slice(safePromoted, safePromoted + 4);

    const isExpanded = snap === 'expanded';
    const stackWidth = isExpanded ? STACK_WIDTH_EXPANDED : STACK_WIDTH_PEEK;
    const stackBottom = isExpanded
        ? STACK_BOTTOM_EXPANDED_DVH
        : STACK_BOTTOM_PEEK_DVH;

    function promoteOne() {
        if (safePromoted < total) setPromotedCount(safePromoted + 1);
    }
    function bookmarkTopPromoted() {
        const top = promotedItems[promotedItems.length - 1];
        if (!top) return;
        // exit 방향을 state 로 먼저 커밋해 다음 렌더에 반영,
        // 다음 frame 에서 promote 카운트를 줄여 AnimatePresence 가 'left' exit 로 빠지게.
        setExitOverride({ id: top.id, dir: 'left' });
        onBookmark?.(top);
        requestAnimationFrame(() => {
            if (safePromoted > 0) setPromotedCount(safePromoted - 1);
        });
    }
    function openDetailTopPromoted() {
        const top = promotedItems[promotedItems.length - 1];
        if (!top) return;
        setExitOverride({ id: top.id, dir: 'right' });
        requestAnimationFrame(() => {
            if (safePromoted > 0) setPromotedCount(safePromoted - 1);
            router.push(`/feed/${top.id}`);
        });
    }
    function resetToPeek() {
        // 모든 promoted 카드를 한 번에 제거. 시각적 stagger 는 각 카드의
        // exit transition.delay (order * 0.09s) 로 표현 — N 회 setTimeout 호출과
        // setPromotedCount state 변경을 1 회로 압축해 리렌더 비용 절감.
        const start = safePromoted;
        if (start === 0) {
            onSnapChange('peek');
            return;
        }
        setPromotedCount(0);
        // 가장 깊은 카드의 exit 가 끝난 시점 직후에 snap 전환.
        setTimeout(() => onSnapChange('peek'), start * 90);
    }

    function handleStackDragEnd(_e: unknown, info: PanInfo) {
        const dy = info.offset.y;
        setTimeout(() => {
            isStackDragging.current = false;
        }, 0);
        if (dy <= -SWIPE_THRESHOLD) {
            // up: peek → expanded → promote 한 장씩
            if (snap === 'peek') onSnapChange('expanded');
            else promoteOne();
        } else if (dy >= SWIPE_THRESHOLD) {
            // down: 어디서든 peek 으로 한 번에 복귀
            resetToPeek();
        }
    }

    function handleStackClick() {
        if (isStackDragging.current) return;
        if (snap === 'peek') onSnapChange('expanded');
        else promoteOne();
    }

    function handleTopPromotedDragEnd(_e: unknown, info: PanInfo) {
        const dx = info.offset.x;
        const dy = info.offset.y;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        // 가로 스와이프가 우세하면 좌/우 분기 — 좌: 북마크, 우: 디테일.
        if (absX > absY) {
            if (dx <= -SWIPE_THRESHOLD) {
                bookmarkTopPromoted();
                return;
            }
            if (dx >= SWIPE_THRESHOLD) {
                openDetailTopPromoted();
                return;
            }
            return;
        }
        // 세로 스와이프: 아래로만 동작 — 카드 모두 흡수.
        if (dy >= SWIPE_THRESHOLD) {
            resetToPeek();
        }
    }

    return (
        <>
            {/* promote 된 카드 더미 — 화면 위쪽으로 쌓임 */}
            <div
                className="pointer-events-none fixed inset-x-0 z-30"
                style={{ top: `${PROMOTED_CARD_TOP_DVH}dvh` }}
            >
                <div
                    className="relative mx-auto"
                    style={{ width: PROMOTED_CARD_WIDTH }}
                >
                    <AnimatePresence
                        initial={false}
                        onExitComplete={() => setExitOverride(null)}
                    >
                        {promotedItems.map((item, i) => {
                            const order = promotedItems.length - 1 - i;
                            const isTop = order === 0;
                            const direction = i % 2 === 0 ? -1 : 1;
                            const rotate = isTop
                                ? 0
                                : direction * (1.2 + order * 0.4);
                            const yDvh = order * PROMOTED_STACK_STEP_DVH;
                            const scale = 1 - order * 0.025;

                            const exitDir: ExitDirection =
                                exitOverride?.id === item.id
                                    ? exitOverride.dir
                                    : 'down';
                            const horizontalExitTransition = {
                                duration: 0.32,
                                ease: [0.32, 0.72, 0, 1] as [
                                    number,
                                    number,
                                    number,
                                    number,
                                ],
                            };
                            const exitProps =
                                exitDir === 'left'
                                    ? {
                                          x: '-130%',
                                          y: `${yDvh}dvh`,
                                          rotate: -12,
                                          opacity: 0,
                                          transition: horizontalExitTransition,
                                      }
                                    : exitDir === 'right'
                                      ? {
                                            x: '130%',
                                            y: `${yDvh}dvh`,
                                            rotate: 12,
                                            opacity: 0,
                                            transition:
                                                horizontalExitTransition,
                                        }
                                      : {
                                            y: '60dvh',
                                            opacity: 0,
                                            transition: prefersReducedMotion
                                                ? { duration: 0 }
                                                : {
                                                      type: 'spring' as const,
                                                      stiffness: 240,
                                                      damping: 28,
                                                      mass: 0.7,
                                                      delay: order * 0.09,
                                                  },
                                        };

                            return (
                                <motion.div
                                    key={item.id}
                                    className={`absolute left-0 right-0 ${
                                        isTop ? 'pointer-events-auto' : ''
                                    }`}
                                    style={{
                                        zIndex: 100 - order,
                                        transformOrigin: '50% 0%',
                                    }}
                                    drag={isTop ? true : false}
                                    dragConstraints={{
                                        top: -200,
                                        bottom: 200,
                                        left: -300,
                                        right: 80,
                                    }}
                                    dragElastic={0.2}
                                    dragMomentum={false}
                                    onDragEnd={
                                        isTop
                                            ? handleTopPromotedDragEnd
                                            : undefined
                                    }
                                    initial={{ y: '60dvh', opacity: 0 }}
                                    animate={{
                                        x: 0,
                                        y: `${yDvh}dvh`,
                                        rotate,
                                        scale,
                                        opacity: 1,
                                    }}
                                    exit={exitProps}
                                    transition={
                                        prefersReducedMotion
                                            ? { duration: 0 }
                                            : {
                                                  type: 'spring',
                                                  stiffness: 240,
                                                  damping: 28,
                                                  mass: 0.7,
                                              }
                                    }
                                >
                                    <div
                                        className="relative overflow-hidden rounded-2xl border border-border-soft/70 bg-card shadow-[0_-12px_36px_-16px_rgba(0,0,0,0.25)]"
                                        onClickCapture={(e) => {
                                            // 카드 내부 click(디테일 진입)은 swipe right 로만 허용.
                                            const target =
                                                e.target as HTMLElement;
                                            if (
                                                target.closest(
                                                    '[data-pager-action]',
                                                )
                                            ) {
                                                return;
                                            }
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
                                        {isTop ? (
                                            <>
                                                <FeedCard item={item} />
                                                <button
                                                    type="button"
                                                    data-pager-action="bookmark"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        bookmarkTopPromoted();
                                                    }}
                                                    onPointerDown={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    aria-label="찜에 추가"
                                                    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border-soft/70 bg-card/90 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-destructive hover:text-destructive-foreground"
                                                >
                                                    <IconHeart
                                                        size={16}
                                                        stroke={2}
                                                    />
                                                </button>
                                            </>
                                        ) : (
                                            <div
                                                aria-hidden
                                                className="h-[200px]"
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {promotedItems.length > 0 && (
                        <div
                            aria-hidden
                            className="pointer-events-none bottom-1 absolute inset-x-0 flex items-center justify-between px-2 text-[11px] font-medium text-muted-foreground"
                        >
                            <span>← 북마크</span>
                            <span>디테일 →</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 하단 뭉치 — 카드 자체가 drag 영역 */}
            <motion.div
                className="pointer-events-auto fixed left-1/2 z-30 -translate-x-1/2 cursor-grab touch-none active:cursor-grabbing"
                initial={false}
                animate={{
                    width: stackWidth,
                    bottom: `${stackBottom}dvh`,
                }}
                transition={
                    prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 240, damping: 28 }
                }
                style={{
                    width: stackWidth,
                    aspectRatio: '5 / 7',
                }}
                drag={stackItems.length > 0 ? 'y' : false}
                dragDirectionLock
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.18}
                dragMomentum={false}
                onDragStart={() => {
                    isStackDragging.current = true;
                }}
                onDragEnd={handleStackDragEnd}
                onClick={handleStackClick}
                role="button"
                aria-label="피드 카드 뭉치"
            >
                {stackItems.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-border-soft/70 bg-card/80 backdrop-blur-md">
                        <p className="px-2 text-center text-[11px] text-muted-foreground">
                            {total === 0 ? '결과 없음' : '모두 봤어요'}
                        </p>
                    </div>
                ) : (
                    stackItems.map((item, i) => {
                        const direction = i % 2 === 0 ? -1 : 1;
                        const rotate = direction * (2 + i * 0.6);
                        const x = direction * (3 + i * 2);
                        const y = i * 4;
                        const isTopOfStack = i === 0;
                        return (
                            <div
                                key={item.id}
                                className="absolute inset-0 origin-bottom"
                                style={{
                                    transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
                                    zIndex: stackItems.length - i,
                                }}
                            >
                                <FeedPagerCard
                                    item={item}
                                    index={nextStackIndex + i}
                                    total={total}
                                    interactive={false}
                                    compact
                                    showFullContent={isTopOfStack && isExpanded}
                                />
                            </div>
                        );
                    })
                )}
            </motion.div>
        </>
    );
}

function FeedPagerCard({
    item,
    index,
    total,
    interactive,
    compact = false,
    showFullContent = true,
}: {
    item: FeedItem;
    index: number;
    total: number;
    interactive: boolean;
    compact?: boolean;
    showFullContent?: boolean;
}) {
    const intentLabel =
        item.type === 'OFFER'
            ? '해볼래'
            : item.type === 'REQUEST'
              ? '알려줘'
              : '대여';
    const intentTone =
        item.type === 'OFFER'
            ? 'bg-brand-50 text-brand-700'
            : item.type === 'REQUEST'
              ? 'bg-accent-muted text-accent-dark'
              : 'bg-muted text-text-secondary';

    const metaParts: string[] = [item.location];
    if (item.category) metaParts.push(item.category);

    return (
        <article
            className={`relative flex h-full select-none flex-col gap-2 overflow-hidden rounded-2xl border border-border-soft/70 bg-card shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.2)] ${
                compact ? 'p-3' : 'p-4'
            } ${interactive ? 'cursor-grab touch-none active:cursor-grabbing' : ''}`}
        >
            <header className="flex items-center justify-between gap-2">
                <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-[0.16em] uppercase ${intentTone}`}
                >
                    {intentLabel}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                    {index + 1} / {total}
                </span>
            </header>

            {showFullContent ? (
                <>
                    <div className="flex-1 space-y-1.5 overflow-hidden">
                        <h3
                            className={`font-semibold leading-tight tracking-tight text-foreground line-clamp-2 ${
                                compact ? 'text-sm' : 'text-base'
                            }`}
                        >
                            {item.title}
                        </h3>
                        {item.description && !compact && (
                            <p className="text-xs leading-5 text-text-secondary line-clamp-3">
                                {item.description}
                            </p>
                        )}
                    </div>

                    <footer className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span className="truncate">
                            {metaParts.join(' · ')}
                        </span>
                        <span className="shrink-0 font-medium text-foreground">
                            {item.price > 0
                                ? `${item.price.toLocaleString()}원`
                                : '무료'}
                        </span>
                    </footer>
                </>
            ) : (
                <div className="flex-1" />
            )}
        </article>
    );
}
