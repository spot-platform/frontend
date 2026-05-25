'use client';

import { cn } from '@frontend/design-system';
import type { FeedItem } from '@/features/feed/model/types';

const TYPE_LABEL: Record<FeedItem['type'], string> = {
    OFFER: '해볼래',
    REQUEST: '알려줘',
    RENT: '빌려줘',
};

type MapFeedInfoCardProps = {
    item: FeedItem;
    onCloseAction: () => void;
    onDetailAction: () => void;
};

function formatPrice(price: number) {
    if (price <= 0) return '무료';
    return `${price.toLocaleString('ko-KR')}원`;
}

export function MapFeedInfoCard({
    item,
    onCloseAction,
    onDetailAction,
}: MapFeedInfoCardProps) {
    const isAi = item.isAi === true;

    return (
        <div
            onClick={(event) => event.stopPropagation()}
            className="rounded-2xl border border-border-soft bg-card p-3 shadow-md"
        >
            <div className="mb-2 flex items-start gap-3">
                <div
                    className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px] shadow-sm',
                        isAi
                            ? 'bg-violet-500/15 text-violet-500'
                            : 'bg-primary/15 text-primary',
                    )}
                >
                    <span aria-hidden>{isAi ? '✦' : '●'}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="truncate text-[14px] font-bold leading-tight text-foreground">
                            {item.title}
                        </span>
                        <span
                            className={cn(
                                'shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold leading-none',
                                isAi
                                    ? 'bg-violet-500/15 text-violet-500'
                                    : 'bg-primary/15 text-primary',
                            )}
                        >
                            {isAi ? '추천' : '사용자'}
                        </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {TYPE_LABEL[item.type]} · {item.category ?? '피드'} ·{' '}
                        {item.location}
                    </div>
                </div>
                <button
                    type="button"
                    aria-label="닫기"
                    onClick={onCloseAction}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                    ×
                </button>
            </div>

            {item.description && (
                <p className="line-clamp-2 text-[12px] leading-relaxed text-text-secondary">
                    {item.description}
                </p>
            )}

            <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                <span>{item.authorNickname}</span>
                <span>{formatPrice(item.price)}</span>
            </div>

            <button
                type="button"
                onClick={onDetailAction}
                className="mt-3 w-full rounded-xl border border-border-soft bg-card px-3 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-muted"
            >
                자세히 보기
            </button>
        </div>
    );
}
