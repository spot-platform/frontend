// 맵 하단 스택 발판. 바텀시트 peek + 위로 쌓이는 정보 카드들을 한 컨테이너에서 관리.
// 내부에서 gap으로 간격 유지 → 카드끼리 z-index 경쟁 없음.

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@frontend/design-system';

type MapBottomStackProps = {
    /** 상단으로 쌓이는 카드들. key를 꼭 부여해서 AnimatePresence가 추적 가능하게. */
    children?: ReactNode;
    /** 가장 하단 peek 영역(바텀시트 핸들). 이 높이가 스택의 베이스. */
    peek?: ReactNode;
    /** peek을 클릭했을 때 (예: 바텀시트 half로 올리기). */
    onPeekClickAction?: () => void;
    className?: string;
};

export function MapBottomStack({
    children,
    peek,
    onPeekClickAction,
    className,
}: MapBottomStackProps) {
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
                'fixed inset-x-3 bottom-0 z-40 mx-auto flex max-w-lg flex-col gap-2 pb-2',
                className,
            )}
        >
            <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>{children}</AnimatePresence>
            </div>

            {peek !== undefined && (
                <button
                    type="button"
                    onClick={onPeekClickAction}
                    className="mt-1 rounded-t-2xl border-t border-x border-border-soft bg-background shadow-[0_-6px_20px_rgba(0,0,0,0.08)]"
                >
                    {peek}
                </button>
            )}
        </div>
    );
}

type DefaultPeekProps = {
    label?: string;
    count?: number;
};

export function MapBottomStackPeek({
    label = '주변 모임',
    count,
}: DefaultPeekProps) {
    return (
        <motion.div
            layout
            className="flex flex-col items-center gap-1 px-4 py-2.5"
        >
            <div className="h-1 w-10 rounded-full bg-border" aria-hidden />
            <p className="text-xs font-medium text-muted-foreground">
                {label}
                {typeof count === 'number' ? ` ${count}개` : ''} · 위로 올려서
                보기
            </p>
        </motion.div>
    );
}
