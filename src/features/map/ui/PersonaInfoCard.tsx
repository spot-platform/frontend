// MapBottomStack 위에 쌓이는 페르소나 정보 카드. 선택된 점의 프로필을 표현.

'use client';

import { motion } from 'framer-motion';

type PersonaInfoCardProps = {
    name: string;
    variant: 'ai' | 'user';
    emoji?: string;
    profileImageUrl?: string;
    role?: string;
    tags?: string[];
    onCloseAction?: () => void;
    onFollowAction?: () => void;
};

export function PersonaInfoCard({
    name,
    variant,
    emoji,
    profileImageUrl,
    role,
    tags = [],
    onCloseAction,
    onFollowAction,
}: PersonaInfoCardProps) {
    const isUser = variant === 'user';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-3 rounded-2xl border border-border-soft bg-card p-3 shadow-md"
        >
            <div
                className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full"
                style={{
                    backgroundColor: isUser
                        ? 'var(--color-persona-strong)'
                        : 'var(--color-card)',
                    border: isUser
                        ? 'none'
                        : '1.5px solid var(--color-persona)',
                }}
            >
                {isUser && profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={profileImageUrl}
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-[24px] leading-none" aria-hidden>
                        {emoji ?? '🤖'}
                    </span>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <span className="truncate text-[14px] font-bold leading-tight text-foreground">
                        {name}
                    </span>
                    {role && (
                        <span className="rounded-full bg-persona-soft px-1.5 py-px text-[10px] font-medium leading-none text-persona-strong">
                            {role}
                        </span>
                    )}
                </div>
                {tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((t) => (
                            <span
                                key={t}
                                className="rounded-full bg-muted px-1.5 py-px text-[10px] font-medium leading-none text-muted-foreground"
                            >
                                #{t}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
                {onFollowAction && (
                    <button
                        type="button"
                        onClick={onFollowAction}
                        className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-sm"
                    >
                        따라가기
                    </button>
                )}
                {onCloseAction && (
                    <button
                        type="button"
                        aria-label="닫기"
                        onClick={onCloseAction}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                    >
                        ×
                    </button>
                )}
            </div>
        </motion.div>
    );
}
