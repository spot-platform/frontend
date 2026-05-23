import { clientApiFetch } from '@/lib/client-api';
import { chatApi } from '@/features/chat/api/chat-api';
import { endpoints } from '@/lib/endpoint';
import type { PostSpotCategory } from '../model/types';
import type {
    PlanV3,
    Preparation,
    PriceBreakdown,
} from '@/entities/spot/simulation-types';

export type PostType = 'OFFER' | 'REQUEST' | 'RENT';

export type PostCompletionResponse = {
    id: string;
    type: PostType;
    title: string;
    spotId?: string;
    feedId?: string;
    chatRoomId?: string;
    redirectUrl?: string;
};

type BackendPostCompletionResponse = Omit<
    PostCompletionResponse,
    'id' | 'spotId' | 'feedId' | 'chatRoomId'
> & {
    id: string | number;
    spotId?: string | number;
    feedId?: string | number;
    chatRoomId?: string | number;
    spot?: { id?: string | number } | null;
    feed?: { id?: string | number; spotId?: string | number | null } | null;
    chatRoom?: { id?: string | number } | null;
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
    lat: number;
    lng: number;
    plan?: PlanV3;
    preparation?: Preparation;
    priceBreakdown?: PriceBreakdown;
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

function resolveCreatedSpotId(created: BackendPostCompletionResponse): string {
    return String(
        created.spotId ??
            created.spot?.id ??
            created.feed?.spotId ??
            created.id,
    );
}

async function createRoomForCreatedPost(
    created: BackendPostCompletionResponse,
): Promise<PostCompletionResponse> {
    const normalizedCreated: PostCompletionResponse = {
        id: String(created.id),
        type: created.type,
        title: created.title,
        spotId: created.spotId ? String(created.spotId) : undefined,
        feedId: created.feedId ? String(created.feedId) : String(created.id),
        chatRoomId: created.chatRoomId ? String(created.chatRoomId) : undefined,
        redirectUrl: created.redirectUrl,
    };

    if (created.chatRoomId || created.chatRoom?.id) {
        return {
            ...normalizedCreated,
            chatRoomId: String(created.chatRoomId ?? created.chatRoom?.id),
            spotId: resolveCreatedSpotId(created),
        };
    }

    const spotId = resolveCreatedSpotId(created);

    try {
        const room = await chatApi.createRoom({ category: 'spot', spotId });

        return {
            ...normalizedCreated,
            spotId,
            chatRoomId: room.data.id,
        };
    } catch {
        return {
            ...normalizedCreated,
            spotId,
        };
    }
}

export const postApi = {
    createOffer: (payload: CreateOfferPostPayload) =>
        clientApiFetch<BackendPostCompletionResponse>(endpoints.feeds.offer, {
            method: 'POST',
            body: JSON.stringify(normalizeBasePayload(payload)),
        }).then(createRoomForCreatedPost),

    createRequest: (payload: CreateRequestPostPayload) =>
        clientApiFetch<BackendPostCompletionResponse>(endpoints.feeds.request, {
            method: 'POST',
            body: JSON.stringify(normalizeBasePayload(payload)),
        }).then(createRoomForCreatedPost),

    get: (feedId: string) => clientApiFetch(endpoints.feeds.detail(feedId)),
};
