import type { SpotType, SpotStatus } from '@/entities/spot/types';

export type UserProfile = {
    id: string;
    nickname: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    pointBalance: number;
    joinedAt: string;
};

export type PasswordChangePayload = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export type NotificationSettings = {
    serviceNoticeEnabled: boolean;
    activityEnabled: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
    updatedAt: string;
};

export type SupporterRegistrationStatus =
    | 'NOT_SUBMITTED'
    | 'PENDING'
    | 'VERIFIED'
    | 'REJECTED';

export type SupporterRegistration = {
    field: string;
    mediaUrls: string[];
    career: string;
    bio: string;
    verificationStatus: SupporterRegistrationStatus;
    verificationNotes: string;
    extraNotes: string;
    updatedAt?: string;
};

export type Participation = {
    spotId: string;
    spotTitle: string;
    spotType: SpotType;
    role: 'AUTHOR' | 'PARTICIPANT';
    status: SpotStatus;
    joinedAt: string;
};

// ─── 프로필 타입 ──────────────────────────────────────────────────────────────

export type ProfileType = 'SUPPORTER' | 'PARTNER';

export type ProfileReview = {
    id: string;
    reviewerNickname: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment?: string;
    spotTitle: string;
    createdAt: string;
};

export type ProfileHistory = {
    spotId: string;
    spotTitle: string;
    spotType: SpotType;
    completedAt: string;
    reviewCount: number;
    avgRating?: number;
};

export type SupporterProfile = {
    id: string;
    profileType: 'SUPPORTER';
    nickname: string;
    avatarUrl?: string;
    field: string; // 분야 (예: 요리, 운동, 언어)
    mediaUrls: string[]; // 사진 or 동영상
    career: string; // 경력 텍스트
    bio: string; // 소개 글
    avgRating: number;
    reviewCount: number;
    reviews: ProfileReview[];
    history: ProfileHistory[];
};

export type MyFavoriteItem = {
    id: string;
    targetId: string;
    title: string;
    description?: string;
    type: SpotType;
    savedAt: string;
    pointCost?: number;
    authorNickname?: string;
    status?: SpotStatus;
};

export type MyRecentViewItem = {
    id: string;
    targetId: string;
    title: string;
    description?: string;
    type: SpotType;
    viewedAt: string;
    pointCost?: number;
    authorNickname?: string;
    status?: SpotStatus;
};

export type MySupportActivitySummary = {
    avgRating: number;
    reviewCount: number;
    completedCount: number;
    latestReview?: ProfileReview;
};

export type PartnerProfile = {
    id: string;
    profileType: 'PARTNER';
    nickname: string;
    avatarUrl?: string;
    interestCategories: string[];
    isFriend: boolean;
};
