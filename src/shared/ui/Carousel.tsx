'use client';

import type { ReactNode } from 'react';

interface CarouselProps {
    children: ReactNode[];
    className?: string;
    /** 카드 너비 (기본: 화면 너비 - 좌우 패딩) */
    cardWidth?: 'full' | 'peek';
}

/**
 * 스냅 스크롤 캐러셀
 * - 드래그/스와이프 시 카드 1개 단위로 스냅
 * - full: 카드가 화면 꽉 참 (페이지 전환 느낌)
 * - peek: 옆 카드가 살짝 보임 (더 있다는 힌트)
 */
export function Carousel({
    children,
    className = '',
    cardWidth = 'peek',
}: CarouselProps) {
    const cardClass =
        cardWidth === 'full'
            ? 'w-full shrink-0 snap-center'
            : 'w-[calc(100%-2rem)] shrink-0 snap-center';

    return (
        <div
            className={`flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-3 px-4 pb-2 [&::-webkit-scrollbar]:hidden ${className}`}
        >
            {children.map((child, i) => (
                <div key={i} className={cardClass}>
                    {child}
                </div>
            ))}
        </div>
    );
}
