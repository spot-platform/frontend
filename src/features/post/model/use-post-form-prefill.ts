// 시뮬레이션/AI 피드 카드에서 "이런 모임 열기" CTA 로 넘어올 때
// URL query + sessionStorage → post form prefill 형태로 변환하는 훅.

'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { SpotCategory } from '@/entities/spot/categories';
import type { PostBaseFormPrefill } from './use-post-base-form';
import type { PostSpotCategory } from './types';
import type {
    PlanV3,
    Preparation,
    PriceBreakdown,
} from '@/entities/spot/simulation-types';

const POST_FORM_PREFILL_STORAGE_KEY = 'spot.postFormPrefill.v1';

export type PostFormPrefill = PostBaseFormPrefill & {
    detailDescription?: string;
    preferredSchedule?: string;
    qualifications?: string;
    maxPartnerCount?: number;
    desiredPrice?: number;
    priceCapPerPerson?: number;
    plan?: PlanV3;
    preparation?: Preparation;
    priceBreakdown?: PriceBreakdown;
};

/** 시뮬 SpotCategory → Post 폼의 PostSpotCategory 매핑. */
function mapSpotCategoryToPost(
    category: SpotCategory | string,
): PostSpotCategory {
    switch (category) {
        case '요리':
            return '음식·요리';
        case '운동':
        case '등산':
        case '요가':
        case '볼더링':
            return '운동';
        case '음악':
            return '음악';
        case '공예':
        case '미술':
            return '공예';
        case '코딩':
            return '교육';
        default:
            return '기타';
    }
}

export function savePostFormPrefillContext(
    key: string,
    prefill: PostFormPrefill,
): void {
    try {
        sessionStorage.setItem(
            `${POST_FORM_PREFILL_STORAGE_KEY}:${key}`,
            JSON.stringify(prefill),
        );
    } catch {
        // sessionStorage 접근 실패는 URL 기반 기본 prefill 로만 진행한다.
    }
}

function readPostFormPrefillContext(
    key: string | null,
): PostFormPrefill | null {
    if (!key) return null;

    try {
        const raw = sessionStorage.getItem(
            `${POST_FORM_PREFILL_STORAGE_KEY}:${key}`,
        );
        if (!raw) return null;
        return JSON.parse(raw) as PostFormPrefill;
    } catch {
        return null;
    }
}

export function usePostFormPrefill(): PostFormPrefill | undefined {
    const searchParams = useSearchParams();

    return useMemo<PostFormPrefill | undefined>(() => {
        const title = searchParams.get('title');
        const category = searchParams.get('category');
        const location = searchParams.get('location');
        const content = searchParams.get('content');
        const prefillKey = searchParams.get('prefillKey');
        const storedPrefill = readPostFormPrefillContext(prefillKey);
        const latRaw = searchParams.get('lat');
        const lngRaw = searchParams.get('lng');
        const parsedLat = latRaw == null ? undefined : Number(latRaw);
        const parsedLng = lngRaw == null ? undefined : Number(lngRaw);
        const lat =
            parsedLat != null && Number.isFinite(parsedLat)
                ? parsedLat
                : undefined;
        const lng =
            parsedLng != null && Number.isFinite(parsedLng)
                ? parsedLng
                : undefined;

        if (
            !storedPrefill &&
            !title &&
            !category &&
            !location &&
            !content &&
            lat == null &&
            lng == null
        ) {
            return undefined;
        }

        const prefill: PostFormPrefill = { ...(storedPrefill ?? {}) };
        if (title) {
            prefill.title = title;
            prefill.spotName = prefill.spotName ?? title;
        }
        if (category) prefill.categories = [mapSpotCategoryToPost(category)];
        if (location) prefill.location = location;
        if (lat != null) prefill.locationLat = lat;
        if (lng != null) prefill.locationLng = lng;
        if (content) {
            prefill.content = content;
            prefill.detailDescription = prefill.detailDescription ?? content;
        }
        return prefill;
    }, [searchParams]);
}
