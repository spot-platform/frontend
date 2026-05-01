import type {
    PlanV3,
    Preparation,
    PriceBreakdown,
} from '@/entities/spot/simulation-types';

export type PostSpotCategory =
    | '음식·요리'
    | 'BBQ·조개'
    | '공동구매'
    | '교육'
    | '운동'
    | '공예'
    | '음악'
    | '기타';

export interface PostBaseFormData {
    spotName: string;
    title: string;
    content: string;
    categories: PostSpotCategory[];
    photos: File[];
    photoPreviews: string[];
    pointCost: number;
    location: string;
    deadline: string; // ISO date YYYY-MM-DD
}

export interface OfferFormData extends PostBaseFormData {
    type: 'OFFER';
    detailDescription: string;
    supporterPhoto: File | null;
    supporterPhotoPreview: string | null;
    qualifications: string; // 원하는 서포터 자격/조건
    autoClose: boolean; // 정원 마감 시 자동 종료 여부
    // 2026-04-30 contextBuilder 통합: OFFER 는 작성 시 plan/price/preparation 필수 입력.
    plan?: PlanV3;
    priceBreakdown?: PriceBreakdown;
    preparation?: Preparation;
}

export interface RequestFormData extends PostBaseFormData {
    type: 'REQUEST';
    detailDescription: string;
    serviceStylePhoto: File | null;
    serviceStylePhotoPreview: string | null;
    preferredSchedule: string; // 선호 일정 힌트
    // 2026-04-30 contextBuilder 통합: REQUEST 는 선택. 비우면 매칭된 서포터가 채울 수 있음.
    plan?: PlanV3;
    priceBreakdown?: PriceBreakdown;
    preparation?: Preparation;
}
