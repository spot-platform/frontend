import { endpoints } from '@/lib/endpoint';
import { serverApiFetch } from '@/lib/server-api';
import type { FeedApplication, FeedItem } from '../model/types';
import {
    toFeedApplication,
    toFeedItem,
    type BackendFeedApplication,
    type BackendFeedItem,
} from './feed-api';

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
    if (typeof candidate.id !== 'string' && typeof candidate.id !== 'number')
        return null;
    if (typeof candidate.title !== 'string') return null;

    return toFeedItem(candidate as unknown as BackendFeedItem);
}

function unwrapFeedApplications(payload: unknown): FeedApplication[] {
    const candidate =
        isRecord(payload) && 'data' in payload
            ? (payload as ApiEnvelope<unknown>).data
            : payload;

    if (!Array.isArray(candidate)) return [];

    return candidate
        .filter(isRecord)
        .map((application) =>
            toFeedApplication(application as unknown as BackendFeedApplication),
        );
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

export async function getServerFeedApplications(
    feedId: string,
    options: ServerFeedOptions = {},
): Promise<FeedApplication[] | null> {
    const response = await serverApiFetch(
        endpoints.feeds.applications(feedId),
        {
            accessToken: options.accessToken,
        },
    ).catch(() => null);

    if (!response?.ok) {
        return null;
    }

    const payload: unknown = await response.json().catch(() => null);
    return unwrapFeedApplications(payload);
}
