// 시뮬레이션 SpotLifecycle → Post 폼으로 넘어갈 때 전달되는 "인사이트 컨텍스트".
// URL 파라미터로는 부피가 커서 sessionStorage 에 JSON 직렬화해서 전달.
// Post 폼이 마운트 시 읽고 SimulationInsightCard 로 렌더.

import type { SpotCategory } from '@/entities/spot/categories';

export type SimulationConversionContext = {
    sourceSpotId: string;
    category: SpotCategory;
    intent: 'offer' | 'request';
    title: string;
    /** 시뮬 상에서 같은 카테고리로 활성 중인 모임 수. */
    similarActiveCount: number;
    /** 같은 카테고리 모임들의 평균 참여자 수. */
    avgParticipants: number;
    /** 카테고리별 가격 제안 (원). */
    suggestedPriceKrw: number;
    /** 이 스팟의 실제 수명(ms) → "평균 N일 모집" 환산 기준. */
    typicalLifespanMs: number;
    /** 스팟 좌표 — 주소로 변환은 못 하지만 '근처' 표현에 사용. */
    spotLocation: { lat: number; lng: number };
};

const STORAGE_KEY = 'simulation-conversion-context';

export function saveSimulationConversionContext(
    ctx: SimulationConversionContext,
): void {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
    } catch {
        // sessionStorage 접근 실패는 무시 (private 모드 등).
    }
}

export function readSimulationConversionContext(
    spotId: string | null,
): SimulationConversionContext | null {
    if (!spotId) return null;
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const ctx = JSON.parse(raw) as SimulationConversionContext;
        if (ctx.sourceSpotId !== spotId) return null;
        return ctx;
    } catch {
        return null;
    }
}

/** 카테고리별 기본 제안 가격 — BE 가 실제 벤치마크 제공 전까지 임시 상수. */
const SUGGESTED_PRICE_BY_CATEGORY: Record<SpotCategory, number> = {
    요리: 30_000,
    운동: 15_000,
    음악: 20_000,
    공예: 25_000,
    코딩: 35_000,
    등산: 10_000,
    요가: 20_000,
    미술: 25_000,
    볼더링: 15_000,
};

export function getSuggestedPriceKrw(category: SpotCategory): number {
    return SUGGESTED_PRICE_BY_CATEGORY[category] ?? 20_000;
}
