'use client';

import { motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn';

type StackedPaperCardTone = 'brand' | 'accent' | 'neutral';
type StackedPaperCardAction = 'promote' | 'collapse';

export interface StackedPaperCardItem {
    id: string;
    eyebrow?: string;
    title: string;
    subtitle?: string;
    meta?: string;
    tone?: StackedPaperCardTone;
}

export interface StackedPaperCardsProps {
    cards: readonly StackedPaperCardItem[];
    className?: string;
    cardClassName?: string;
    overlap?: number;
    rotation?: number;
    dropDistance?: number;
    ariaLabel?: string;
    defaultFocused?: boolean;
}

const PROMOTE_SWIPE_THRESHOLD = 64;
const COLLAPSE_SWIPE_THRESHOLD = 52;
const COLLAPSED_STACK_TOP = 388;
const FOCUSED_CARD_TOP = 144;
const FOCUSED_STACK_SHIFT = 24;
const FOCUSED_SCALE_BOOST = 0.1;
const PROMOTED_STACK_STEP = 18;

const toneStyles: Record<
    StackedPaperCardTone,
    {
        badge: string;
        spine: string;
        marker: string;
    }
> = {
    brand: {
        badge: 'bg-brand-50 text-brand-700',
        spine: 'bg-brand-400/80',
        marker: 'bg-brand-100 text-brand-700',
    },
    accent: {
        badge: 'bg-accent-muted text-accent-dark',
        spine: 'bg-accent/80',
        marker: 'bg-accent-muted text-accent-dark',
    },
    neutral: {
        badge: 'bg-muted text-text-secondary',
        spine: 'bg-neutral-300',
        marker: 'bg-neutral-100 text-neutral-600',
    },
};

function getCardShadow(depth: number) {
    if (depth > 0.7) return 'var(--shadow-xl)';
    if (depth > 0.35) return 'var(--shadow-lg)';
    return 'var(--shadow-md)';
}

function getPromotedShadow(order: number) {
    if (order === 0) return 'var(--shadow-xl)';
    if (order === 1) return 'var(--shadow-lg)';
    return 'var(--shadow-md)';
}

export function StackedPaperCards({
    cards,
    className,
    cardClassName,
    overlap = 18,
    rotation = 2.8,
    dropDistance = 132,
    ariaLabel = 'Stacked paper cards',
    defaultFocused = false,
}: StackedPaperCardsProps) {
    const prefersReducedMotion = useReducedMotion();
    const [internalPromotedCount, setPromotedCount] = useState(
        defaultFocused && cards.length > 0 ? 1 : 0,
    );
    const isDragging = useRef(false);
    const cardRefs = useRef<Record<string, HTMLElement | null>>({});
    const pendingFocusCardId = useRef<string | null>(null);

    const promotedCount = Math.min(internalPromotedCount, cards.length);
    const hasPromotedCards = promotedCount > 0;
    const canPromote = promotedCount < cards.length;
    const frontierIndex = cards.length - promotedCount - 1;
    const topPromotedIndex = hasPromotedCards
        ? Math.max(frontierIndex + 1, 0)
        : -1;
    const promotionTargetIndex = canPromote ? frontierIndex : -1;
    const collapseTargetIndex = hasPromotedCards ? topPromotedIndex : -1;
    const focusIndex = canPromote ? promotionTargetIndex : collapseTargetIndex;

    function getFocusableCardId(nextPromotedCount: number) {
        const boundedPromotedCount = Math.min(
            Math.max(nextPromotedCount, 0),
            cards.length,
        );

        if (boundedPromotedCount === 0) {
            return cards.at(-1)?.id ?? null;
        }

        if (boundedPromotedCount < cards.length) {
            return cards[cards.length - boundedPromotedCount - 1]?.id ?? null;
        }

        return cards[0]?.id ?? null;
    }

    useEffect(() => {
        const activeCard = cards[focusIndex];

        if (!activeCard || pendingFocusCardId.current !== activeCard.id) return;

        cardRefs.current[activeCard.id]?.focus();
        pendingFocusCardId.current = null;
    }, [focusIndex, cards]);

    function promoteNextCard() {
        const nextPromotedCount = Math.min(promotedCount + 1, cards.length);

        pendingFocusCardId.current = getFocusableCardId(nextPromotedCount);
        setPromotedCount(nextPromotedCount);
    }

    function collapsePromotedCards() {
        pendingFocusCardId.current = getFocusableCardId(0);
        setPromotedCount(0);
    }

    function handleCardAction(action: StackedPaperCardAction) {
        if (action === 'promote' && canPromote) {
            promoteNextCard();
            return;
        }

        if (action === 'collapse' && hasPromotedCards) {
            collapsePromotedCards();
        }
    }

    const layouts = useMemo(
        () =>
            cards.map((card, index) => {
                const total = Math.max(cards.length - 1, 1);
                const depth = index / total;
                const direction = index % 2 === 0 ? -1 : 1;
                const action: StackedPaperCardAction | null =
                    index === promotionTargetIndex
                        ? 'promote'
                        : index === collapseTargetIndex
                          ? 'collapse'
                          : null;
                const isActive = index === focusIndex;
                const isPromoted = index > frontierIndex;
                const promotedOrder = isPromoted
                    ? index - frontierIndex - 1
                    : -1;
                const collapsedX = direction * (5 + depth * 4);
                const collapsedY = COLLAPSED_STACK_TOP + index * overlap;
                const collapsedRotate =
                    direction * rotation * (0.72 + depth * 0.22);
                const collapsedScale = 0.94 + depth * 0.05;

                const target = isPromoted
                    ? {
                          x: direction * Math.min(promotedOrder * 2.5, 7),
                          y:
                              FOCUSED_CARD_TOP +
                              promotedOrder * PROMOTED_STACK_STEP,
                          rotate:
                              direction *
                              rotation *
                              (0.12 + Math.min(promotedOrder, 3) * 0.05),
                          scale: Math.max(
                              collapsedScale + 0.04,
                              collapsedScale +
                                  FOCUSED_SCALE_BOOST -
                                  promotedOrder * 0.02,
                          ),
                          shadow: getPromotedShadow(promotedOrder),
                      }
                    : hasPromotedCards
                      ? {
                            x: collapsedX * 0.74,
                            y:
                                collapsedY +
                                FOCUSED_STACK_SHIFT +
                                Math.max(frontierIndex - index, 0) * 2,
                            rotate: collapsedRotate * 0.58,
                            scale: Math.max(0.9, collapsedScale - 0.02),
                            shadow: getCardShadow(Math.min(depth + 0.12, 1)),
                        }
                      : {
                            x: collapsedX,
                            y: collapsedY,
                            rotate: collapsedRotate,
                            scale: collapsedScale,
                            shadow: getCardShadow(depth),
                        };

                return {
                    card,
                    action,
                    depth,
                    isActive,
                    isPromoted,
                    isTopPromoted: isPromoted && promotedOrder === 0,
                    zIndex: isPromoted
                        ? cards.length + (cards.length - promotedOrder)
                        : index + 1,
                    collapsedX,
                    collapsedRotate,
                    collapsedScale,
                    target,
                };
            }),
        [
            cards,
            collapseTargetIndex,
            focusIndex,
            frontierIndex,
            hasPromotedCards,
            overlap,
            promotionTargetIndex,
            rotation,
        ],
    );

    if (cards.length === 0) return null;

    function handleDragEnd(action: StackedPaperCardAction, info: PanInfo) {
        if (action === 'promote' && info.offset.y <= -PROMOTE_SWIPE_THRESHOLD) {
            promoteNextCard();
        } else if (
            action === 'collapse' &&
            info.offset.y >= COLLAPSE_SWIPE_THRESHOLD
        ) {
            collapsePromotedCards();
        }

        setTimeout(() => {
            isDragging.current = false;
        }, 0);
    }

    return (
        <div
            className={cn(
                'relative mx-auto h-[35rem] w-[80%] min-w-48 max-w-64 overflow-hidden rounded-[1.9rem] border border-border-soft/70 bg-[linear-gradient(180deg,var(--color-surface)_0%,var(--color-canvas)_100%)] px-4 pb-4 pt-6',
                className,
            )}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-4 bottom-3 h-16 rounded-[1.5rem] border border-border-soft/60 bg-panel/70 shadow-sm"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-7 bottom-4 h-20 rounded-full bg-foreground/10 blur-3xl"
            />

            <ul aria-label={ariaLabel} className="relative h-full w-full">
                {layouts.map(
                    (
                        {
                            action,
                            card,
                            depth,
                            isActive,
                            isPromoted,
                            isTopPromoted,
                            zIndex,
                            collapsedX,
                            collapsedRotate,
                            collapsedScale,
                            target,
                        },
                        index,
                    ) => {
                        const tone = toneStyles[card.tone ?? 'neutral'];

                        return (
                            <motion.li
                                key={card.id}
                                className="absolute left-1/2 top-0 w-full -translate-x-1/2 list-none will-change-transform"
                                style={{
                                    zIndex,
                                    transformOrigin: '50% 100%',
                                }}
                                drag={action ? 'y' : false}
                                dragDirectionLock={Boolean(action)}
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={0.18}
                                dragMomentum={false}
                                onDragStart={
                                    action
                                        ? () => {
                                              isDragging.current = true;
                                          }
                                        : undefined
                                }
                                onDragEnd={
                                    action
                                        ? (
                                              _event:
                                                  | MouseEvent
                                                  | TouchEvent
                                                  | PointerEvent,
                                              info: PanInfo,
                                          ) => {
                                              handleDragEnd(action, info);
                                          }
                                        : undefined
                                }
                                initial={
                                    prefersReducedMotion
                                        ? false
                                        : {
                                              x: collapsedX * 0.5,
                                              y: -dropDistance - index * 18,
                                              rotate: collapsedRotate * 1.6,
                                              scale: collapsedScale - 0.04,
                                              opacity: 0,
                                          }
                                }
                                animate={{
                                    x: target.x,
                                    y: target.y,
                                    rotate: target.rotate,
                                    scale: target.scale,
                                    opacity: 1,
                                }}
                                transition={
                                    prefersReducedMotion
                                        ? { duration: 0 }
                                        : {
                                              delay: index * 0.1,
                                              type: 'spring',
                                              stiffness: isTopPromoted
                                                  ? 260
                                                  : 190,
                                              damping: isTopPromoted ? 24 : 20,
                                              mass: 0.8,
                                          }
                                }
                            >
                                <article
                                    ref={(node) => {
                                        cardRefs.current[card.id] = node;
                                    }}
                                    className={cn(
                                        'relative aspect-[210/297] overflow-hidden rounded-[1.4rem] border bg-panel p-5 transition-[border-color,box-shadow]',
                                        action
                                            ? 'cursor-grab active:cursor-grabbing touch-none'
                                            : '',
                                        isPromoted
                                            ? 'border-border-strong/80'
                                            : 'border-border-soft/80',
                                        cardClassName,
                                    )}
                                    style={{
                                        boxShadow: target.shadow,
                                    }}
                                    tabIndex={isActive ? 0 : -1}
                                    role={action ? 'button' : undefined}
                                    aria-label={
                                        action
                                            ? action === 'promote'
                                                ? `${card.title}: promote next card`
                                                : `${card.title}: collapse raised cards`
                                            : undefined
                                    }
                                    onClick={
                                        action
                                            ? () => {
                                                  if (isDragging.current)
                                                      return;

                                                  handleCardAction(action);
                                              }
                                            : undefined
                                    }
                                    onKeyDown={
                                        isActive
                                            ? (event) => {
                                                  if (
                                                      event.key === 'Enter' ||
                                                      event.key === ' '
                                                  ) {
                                                      event.preventDefault();
                                                      handleCardAction(
                                                          action ?? 'promote',
                                                      );
                                                  }

                                                  if (
                                                      event.key === 'ArrowUp' &&
                                                      canPromote
                                                  ) {
                                                      event.preventDefault();
                                                      promoteNextCard();
                                                  }

                                                  if (
                                                      event.key ===
                                                          'ArrowDown' &&
                                                      hasPromotedCards
                                                  ) {
                                                      event.preventDefault();
                                                      collapsePromotedCards();
                                                  }
                                              }
                                            : undefined
                                    }
                                >
                                    <div
                                        aria-hidden
                                        className="absolute inset-x-0 top-3 flex justify-center"
                                    >
                                        <span className="h-1 w-10 rounded-full bg-border-strong/80" />
                                    </div>

                                    <div
                                        aria-hidden
                                        className={cn(
                                            'absolute inset-y-5 left-4 w-1 rounded-full',
                                            tone.spine,
                                        )}
                                    />

                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute inset-x-6 bottom-4 h-10 rounded-full bg-foreground/6 blur-2xl"
                                    />

                                    <div className="relative flex h-full flex-col justify-between pl-4 pt-6">
                                        <div className="space-y-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <span
                                                    className={cn(
                                                        'inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase',
                                                        tone.badge,
                                                    )}
                                                >
                                                    {card.eyebrow ?? 'Preview'}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'inline-flex min-h-8 min-w-8 items-center justify-center rounded-full text-[11px] font-medium shadow-xs',
                                                        tone.marker,
                                                    )}
                                                >
                                                    {index + 1}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-lg font-semibold tracking-tight text-foreground">
                                                    {card.title}
                                                </p>
                                                {card.subtitle && (
                                                    <p className="text-sm leading-6 text-text-secondary">
                                                        {card.subtitle}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2.5">
                                                <div className="h-2.5 w-full rounded-full bg-muted" />
                                                <div className="h-2.5 w-[88%] rounded-full bg-muted" />
                                                <div className="h-2.5 w-[68%] rounded-full bg-muted" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="h-10 w-10 rounded-2xl border border-border-soft bg-background shadow-xs" />
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <div className="h-2 w-3/4 rounded-full bg-muted" />
                                                    <div className="h-2 w-1/2 rounded-full bg-muted" />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                                <span className="truncate">
                                                    {card.meta ??
                                                        'Mobile motion study'}
                                                </span>
                                                <span>
                                                    {Math.round(
                                                        84 + depth * 12,
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isActive && (
                                        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-6">
                                            <span className="rounded-full border border-border-soft/80 bg-background/90 px-3 py-1 text-[10px] font-medium tracking-[0.14em] text-text-secondary uppercase shadow-xs">
                                                {canPromote && hasPromotedCards
                                                    ? 'Swipe up / down reset'
                                                    : canPromote
                                                      ? 'Swipe up'
                                                      : 'Swipe down'}
                                            </span>
                                        </div>
                                    )}
                                </article>
                            </motion.li>
                        );
                    },
                )}
            </ul>
        </div>
    );
}
