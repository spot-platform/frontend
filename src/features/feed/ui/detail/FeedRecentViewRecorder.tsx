'use client';

import { useEffect } from 'react';
import type { FeedItem } from '@/features/feed/model/types';
import { recordRecentFeedView } from '@/features/my/model/recent-feed-views-store';

type FeedRecentViewRecorderProps = {
    item: Pick<
        FeedItem,
        | 'id'
        | 'title'
        | 'description'
        | 'type'
        | 'price'
        | 'authorNickname'
        | 'status'
    >;
};

export function FeedRecentViewRecorder({ item }: FeedRecentViewRecorderProps) {
    useEffect(() => {
        recordRecentFeedView(item);
        // CodeRabbit QA: record only once per feed navigation, not on parent object re-renders.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id]);

    return null;
}
