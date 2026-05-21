import { endpoints } from '@/lib/endpoint';
import { serverApiFetch } from '@/lib/server-api';
import type { FeedItem } from '../model/types';

type ServerFeedOptions = {
    accessToken?: string | null;
};

type ApiEnvelope<T> = {
    data?: T;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function unwrapFeedItem(payload: unknown): FeedItem | null {
    const candidate =
        isRecord(payload) && 'data' in payload
            ? (payload as ApiEnvelope<unknown>).data
            : payload;

    if (!isRecord(candidate)) return null;
    if (typeof candidate.id !== 'string') return null;
    if (typeof candidate.title !== 'string') return null;

    return candidate as unknown as FeedItem;
}

export async function getServerFeedDetail(
    feedId: string,
    options: ServerFeedOptions = {},
): Promise<FeedItem | null> {
    const response = await serverApiFetch(endpoints.feeds.detail(feedId), {
        accessToken: options.accessToken,
    }).catch(() => null);

    if (!response?.ok) {
        return null;
    }

    const payload: unknown = await response.json().catch(() => null);
    return unwrapFeedItem(payload);
}
