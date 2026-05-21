import { clientApiFetch } from '@/lib/client-api';
import { endpoints } from '@/lib/endpoint';
import type { PostSpotCategory } from '../model/types';

export type PostType = 'OFFER' | 'REQUEST' | 'RENT';

export type PostCompletionResponse = {
    id: string;
    type: PostType;
    title: string;
    redirectUrl?: string;
};

type BasePostPayload = {
    type: PostType;
    spotName: string;
    title: string;
    content: string;
    categories: PostSpotCategory[];
    photoUrls: string[];
    pointCost: number;
    location: string;
    deadline: string;
    detailDescription: string;
    maxPartnerCount?: number;
};

type ApiPostPayload<T extends BasePostPayload> = Omit<T, 'categories'> & {
    categories: string[];
};

export type CreateOfferPostPayload = BasePostPayload & {
    type: 'OFFER';
    supporterPhotoUrl?: string;
    desiredPrice?: number;
};

export type CreateRequestPostPayload = BasePostPayload & {
    type: 'REQUEST';
    serviceStylePhotoUrl?: string;
    priceCapPerPerson?: number;
};

const CATEGORY_TO_API: Record<PostSpotCategory, string> = {
    '음식·요리': '음식_요리',
    'BBQ·조개': 'BBQ_조개',
    공동구매: '공동구매',
    교육: '교육',
    운동: '운동',
    공예: '공예',
    음악: '음악',
    기타: '기타',
};

function positiveNumber(value: number | undefined): number | undefined {
    return value !== undefined && Number.isFinite(value) && value > 0
        ? value
        : undefined;
}

function normalizeBasePayload<T extends BasePostPayload>(
    payload: T,
): ApiPostPayload<T> {
    return {
        ...payload,
        categories: payload.categories.map(
            (category) => CATEGORY_TO_API[category] ?? category,
        ),
        photoUrls: payload.photoUrls.length > 0 ? payload.photoUrls : [],
        maxPartnerCount: positiveNumber(payload.maxPartnerCount),
    };
}

export const postApi = {
    createOffer: (payload: CreateOfferPostPayload) =>
        clientApiFetch<PostCompletionResponse>(endpoints.posts.offer, {
            method: 'POST',
            body: JSON.stringify(normalizeBasePayload(payload)),
        }),

    createRequest: (payload: CreateRequestPostPayload) =>
        clientApiFetch<PostCompletionResponse>(endpoints.posts.request, {
            method: 'POST',
            body: JSON.stringify(normalizeBasePayload(payload)),
        }),

    get: (postId: string) => clientApiFetch(endpoints.posts.detail(postId)),

    match: (postId: string) =>
        clientApiFetch<void>(endpoints.posts.match(postId), {
            method: 'POST',
        }),
};
