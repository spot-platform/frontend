import type { FeedItem } from '@/features/feed/model/types';

export interface AdminPostFaqItem {
    question: string;
    answer: string;
}

export interface AdminPostHotSpot {
    category: string;
    title: string;
    subtitle: string;
    imageUrl?: string;
}

export type AdminPostType = 'curation' | 'notice' | 'report';

export interface AdminPost {
    id: string;
    type: AdminPostType;
    isNotice: boolean;
    title: string;
    summary: string;
    teaser: string;
    authorName: string;
    publishedAt: string;
    introTitle: string;
    introBody: string;
    body: string[];
    hotSpot: AdminPostHotSpot;
    relatedFeedIds: FeedItem['id'][];
}
