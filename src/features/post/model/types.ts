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
}

export interface RequestFormData extends PostBaseFormData {
    type: 'REQUEST';
    detailDescription: string;
    serviceStylePhoto: File | null;
    serviceStylePhotoPreview: string | null;
    preferredSchedule: string; // 선호 일정 힌트
}
