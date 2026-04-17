'use client';

import {
    type BottomSheetSnapPoint,
    PersistentDrawer,
} from '@frontend/design-system';
import { FeedCard } from './FeedCard';
import { MOCK_FEED } from '../model/mock';
import type { FeedItem } from '../model/types';

type FeedBottomSheetProps = {
    open: boolean;
    snapPoint: BottomSheetSnapPoint;
    onSnapChange: (snap: BottomSheetSnapPoint) => void;
    feedType?: 'all' | 'offer' | 'request';
    categories?: string[];
    onSelectItem?: (item: FeedItem) => void;
};

export function FeedBottomSheet({
    open,
    snapPoint,
    onSnapChange,
    feedType = 'all',
    categories = [],
    onSelectItem,
}: FeedBottomSheetProps) {
    const filtered = MOCK_FEED.filter((item) => {
        if (feedType === 'offer' && item.type !== 'OFFER') return false;
        if (feedType === 'request' && item.type !== 'REQUEST') return false;
        if (categories.length > 0 && !categories.includes(item.category ?? ''))
            return false;
        return true;
    });

    return (
        <PersistentDrawer
            open={open}
            snapPoint={snapPoint}
            onSnapChange={onSnapChange}
        >
            {snapPoint !== 'peek' && (
                <>
                    <p className="mb-3 text-xs font-medium text-muted-foreground">
                        주변 모임 {filtered.length}개
                    </p>
                    <div className="flex flex-col divide-y divide-neutral-100">
                        {filtered.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onSelectItem?.(item)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onSelectItem?.(item);
                                }}
                            >
                                <FeedCard item={item} />
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="flex h-40 items-center justify-center">
                                <p className="text-sm text-muted-foreground">
                                    조건에 맞는 모임이 없어요
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {snapPoint === 'peek' && (
                <div className="flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">
                        위로 올려서 모임 목록 보기
                    </p>
                </div>
            )}
        </PersistentDrawer>
    );
}
