// map 페르소나 dot 프로토타입. 기본 10px, 선택/호버 시 확장되며 내부에 아바타/이모지 노출.

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { memo, useState, type KeyboardEvent, type MouseEvent } from 'react';

type DotVariant = 'ai' | 'user';

type PersonaDotMarkerBlobProps = {
    name: string;
    variant: DotVariant;
    emoji?: string;
    profileImageUrl?: string;
    moving?: boolean;
    expanded?: boolean;
    onSelectAction?: () => void;
};

const DOT_SIZE = 10;
const EXPANDED_SIZE = 32;

function PersonaDotMarkerBlobImpl({
    name,
    variant,
    emoji,
    profileImageUrl,
    moving,
    expanded,
    onSelectAction,
}: PersonaDotMarkerBlobProps) {
    const reduceMotion = useReducedMotion();
    const [hovered, setHovered] = useState(false);
    const open = expanded || hovered;
    const size = open ? EXPANDED_SIZE : DOT_SIZE;

    const isUser = variant === 'user';
    const showContent = open;

    const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        onSelectAction?.();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectAction?.();
        }
    };

    return (
        <div
            className="absolute"
            style={{
                zIndex: open ? 20 : 5,
                transform: 'translate(-50%, -50%)',
            }}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
        >
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    scale: { type: 'spring', stiffness: 380, damping: 22 },
                    opacity: { duration: 0.25, ease: 'easeOut' },
                }}
            >
                <motion.div
                    role="button"
                    tabIndex={0}
                    aria-label={`${name}${moving ? ' 이동 중' : ''}`}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-[0_0_6px_var(--color-persona-glow)] outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    animate={{
                        width: size,
                        height: size,
                        ...(moving && !open && !reduceMotion
                            ? { scale: [1, 1.12, 1] }
                            : { scale: 1 }),
                    }}
                    transition={{
                        width: { duration: 0.22, ease: 'easeOut' },
                        height: { duration: 0.22, ease: 'easeOut' },
                        scale: moving
                            ? {
                                  duration: 1.4,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                              }
                            : { duration: 0.2 },
                    }}
                    style={
                        isUser
                            ? {
                                  backgroundColor:
                                      'var(--color-persona-strong)',
                              }
                            : {
                                  border: '1.5px solid var(--color-persona)',
                                  backgroundColor: open
                                      ? 'var(--color-card)'
                                      : 'transparent',
                              }
                    }
                >
                    {showContent && isUser && profileImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={profileImageUrl}
                            alt={name}
                            className="h-full w-full object-cover"
                        />
                    )}
                    {showContent && !isUser && (
                        <span className="text-[19px] leading-none" aria-hidden>
                            {emoji ?? '🤖'}
                        </span>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}

export const PersonaDotMarkerBlob = memo(
    PersonaDotMarkerBlobImpl,
    (prev, next) =>
        prev.name === next.name &&
        prev.variant === next.variant &&
        prev.emoji === next.emoji &&
        prev.profileImageUrl === next.profileImageUrl &&
        prev.moving === next.moving &&
        prev.expanded === next.expanded,
    // onSelectAction 참조 변화는 무시 — 부모에서 매 렌더 새 함수 생성해도 스킵.
);
