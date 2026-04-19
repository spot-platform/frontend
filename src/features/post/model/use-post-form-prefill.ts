// 시뮬레이션 Spot 카드에서 "이런 모임 열기" CTA 로 넘어올 때
// URL query → usePostBaseForm 의 prefill 형태로 변환하는 훅.

'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { SpotCategory } from '@/entities/spot/categories';
import type { PostBaseFormPrefill } from './use-post-base-form';
import type { PostSpotCategory } from './types';

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

export function usePostFormPrefill(): PostBaseFormPrefill | undefined {
    const searchParams = useSearchParams();

    return useMemo<PostBaseFormPrefill | undefined>(() => {
        const title = searchParams.get('title');
        const category = searchParams.get('category');
        const location = searchParams.get('location');
        const content = searchParams.get('content');

        if (!title && !category && !location && !content) return undefined;

        const prefill: PostBaseFormPrefill = {};
        if (title) prefill.title = title;
        if (category) prefill.categories = [mapSpotCategoryToPost(category)];
        if (location) prefill.location = location;
        if (content) prefill.content = content;
        return prefill;
    }, [searchParams]);
}
