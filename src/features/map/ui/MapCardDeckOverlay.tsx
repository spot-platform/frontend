'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type PanInfo,
} from 'framer-motion';
import { cn } from '@frontend/design-system';
import {
    MAP_FEED_CARD_DECK_ANIMATION,
    type CardDeckExitDirection,
} from '@/features/feed/model/card-deck-animation';
import { resolveFeedStackGesture } from '@/features/map/model/feed-stack-gesture';

const VISIBLE_STACK_SIZE = 3;
const DECK_ANIMATION = MAP_FEED_CARD_DECK_ANIMATION;

type ExitDirection = CardDeckExitDirection;
type DismissBehavior = 'close' | 'next';

export type MapCardDeckOverlayItem = {
    id: string;
    content: ReactNode;
    onDetailAction?: () => void;
};

type MapCardDeckOverlayProps = {
    deckId: string;
    ariaLabel: string;
    items: MapCardDeckOverlayItem[];
    onCloseAction: () => void;
    dismissBehavior?: DismissBehavior;
    chrome?: ReactNode;
    hint?: ReactNode;
    className?: string;
    disableContentClick?: boolean;
};

export function MapCardDeckOverlay({
    deckId,
    ariaLabel,
    items,
    onCloseAction,
    dismissBehavior = 'close',
    chrome,
    hint,
    className,
    disableContentClick = false,
}: MapCardDeckOverlayProps) {
    const prefersReducedMotion = useReducedMotion();
    const [dismissedCount, setDismissedCount] = useState(0);
    const [isClosingDeck, setIsClosingDeck] = useState(false);
    const [exitOverride, setExitOverride] = useState<{
        id: string;
        dir: ExitDirection;
    } | null>(null);

    const visibleItems = useMemo(
        () =>
            isClosingDeck
                ? []
                : items.slice(
                      dismissedCount,
                      dismissedCount + VISIBLE_STACK_SIZE,
                  ),
        [items, dismissedCount, isClosingDeck],
    );
    const topItem = visibleItems[0];
    const hasNextItem = dismissedCount < items.length - 1;

    function closeDeck() {
        if (isClosingDeck) return;
        setExitOverride(null);
        if (prefersReducedMotion) {
            onCloseAction();
            return;
        }
        setIsClosingDeck(true);
    }

    function dismissTop(dir: ExitDirection = 'down') {
        if (!topItem) return;
        setExitOverride({ id: topItem.id, dir });

        if (dismissBehavior === 'next' && hasNextItem) {
            requestAnimationFrame(() => {
                setDismissedCount((count) => Math.min(items.length, count + 1));
            });
            return;
        }

        setIsClosingDeck(true);
        if (prefersReducedMotion) onCloseAction();
    }

    function handleTopDragEnd(_event: unknown, info: PanInfo) {
        if (!topItem) return;

        const gesture = resolveFeedStackGesture({
            dx: info.offset.x,
            dy: info.offset.y,
        });

        if (gesture === 'next') dismissTop('down');
    }

    if (!topItem && !isClosingDeck) return null;

    return (
        <div className="pointer-events-auto fixed inset-0 z-[44]">
            <button
                type="button"
                aria-label={ariaLabel}
                className="absolute inset-0 cursor-default bg-transparent"
                onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    closeDeck();
                }}
            />

            <div
                className="pointer-events-none absolute inset-x-0"
                style={{ top: `${DECK_ANIMATION.cardTopDvh}dvh` }}
            >
                <div
                    className="relative mx-auto"
                    style={{ width: DECK_ANIMATION.cardWidth }}
                >
                    <AnimatePresence
                        initial={!prefersReducedMotion}
                        mode="popLayout"
                        onExitComplete={() => {
                            setExitOverride(null);
                            if (!isClosingDeck) return;
                            onCloseAction();
                        }}
                    >
                        {visibleItems
                            .slice()
                            .reverse()
                            .map((item, reverseIndex) => {
                                const order =
                                    visibleItems.length - 1 - reverseIndex;
                                const isTop = order === 0;
                                const rotate = isTop
                                    ? 0
                                    : (order % 2 === 0 ? -1 : 1) *
                                      (DECK_ANIMATION.rotateBase +
                                          order * DECK_ANIMATION.rotateStep);
                                const yDvh =
                                    order * DECK_ANIMATION.stackStepDvh;
                                const y = `${yDvh}dvh`;
                                const scale =
                                    1 - order * DECK_ANIMATION.scaleStep;
                                const exitDir: ExitDirection =
                                    exitOverride?.id === item.id
                                        ? exitOverride.dir
                                        : 'down';
                                const horizontalExitTransition = {
                                    duration: prefersReducedMotion
                                        ? 0
                                        : DECK_ANIMATION.horizontalExitDuration,
                                    ease: DECK_ANIMATION.horizontalEase,
                                };
                                const exitProps =
                                    exitDir === 'left'
                                        ? {
                                              x: `-${DECK_ANIMATION.horizontalExitOffset}`,
                                              y,
                                              rotate: -DECK_ANIMATION.horizontalExitRotate,
                                              opacity: 0,
                                              transition:
                                                  horizontalExitTransition,
                                          }
                                        : exitDir === 'right'
                                          ? {
                                                x: DECK_ANIMATION.horizontalExitOffset,
                                                y,
                                                rotate: DECK_ANIMATION.horizontalExitRotate,
                                                opacity: 0,
                                                transition:
                                                    horizontalExitTransition,
                                            }
                                          : {
                                                y: DECK_ANIMATION.downExitY,
                                                opacity: 0,
                                                rotate: 0,
                                                transition: prefersReducedMotion
                                                    ? { duration: 0 }
                                                    : {
                                                          ...DECK_ANIMATION.spring,
                                                          delay:
                                                              order *
                                                              DECK_ANIMATION.staggerDelay,
                                                      },
                                            };

                                return (
                                    <motion.div
                                        key={`${deckId}-${item.id}`}
                                        layout
                                        className={cn(
                                            'absolute inset-x-0 rounded-2xl border border-border-soft/70 bg-card shadow-[0_18px_50px_-22px_rgba(0,0,0,0.38)]',
                                            isTop
                                                ? 'pointer-events-auto touch-none overflow-hidden cursor-grab active:cursor-grabbing'
                                                : 'pointer-events-none overflow-hidden',
                                            className,
                                        )}
                                        style={{
                                            zIndex: 40 - order,
                                            transformOrigin: '50% 0%',
                                        }}
                                        initial={{
                                            y: DECK_ANIMATION.enterY,
                                            opacity: 0,
                                        }}
                                        animate={{
                                            x: 0,
                                            y,
                                            opacity: 1,
                                            scale,
                                            rotate,
                                        }}
                                        exit={exitProps}
                                        transition={
                                            prefersReducedMotion
                                                ? { duration: 0 }
                                                : {
                                                      ...DECK_ANIMATION.spring,
                                                  }
                                        }
                                        drag={isTop ? true : false}
                                        dragDirectionLock
                                        dragConstraints={{
                                            top: -120,
                                            bottom: 240,
                                            left: -300,
                                            right: 300,
                                        }}
                                        dragElastic={0.2}
                                        dragMomentum={false}
                                        dragSnapToOrigin
                                        onDragEnd={
                                            isTop ? handleTopDragEnd : undefined
                                        }
                                        onClickCapture={(event) => {
                                            if (!disableContentClick) return;
                                            const target =
                                                event.target as HTMLElement;
                                            if (
                                                target.closest(
                                                    '[data-map-card-action]',
                                                )
                                            ) {
                                                return;
                                            }
                                            event.preventDefault();
                                            event.stopPropagation();
                                        }}
                                        onPointerDown={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        {isTop ? (
                                            <>{item.content}</>
                                        ) : (
                                            <div className="h-[260px] bg-card" />
                                        )}
                                        {isTop && chrome}
                                    </motion.div>
                                );
                            })}
                    </AnimatePresence>

                    {hint && (
                        <div className="pointer-events-none absolute -bottom-10 inset-x-0 flex items-center justify-between px-2 text-[11px] font-medium text-muted-foreground drop-shadow-sm">
                            {hint}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
