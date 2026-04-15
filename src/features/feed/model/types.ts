// FeedItem - 피드 목록에 표시되는 아이템 타입
export type FeedItemType = 'OFFER' | 'REQUEST' | 'RENT';
export type FeedItemStatus = 'OPEN' | 'MATCHED' | 'CLOSED';
export type FeedTabType = 'HOME' | 'EXPLORE';
export type FeedCategory = '음악' | '요리' | '운동' | '공예' | '언어' | '기타';
export type FeedAuthorRole = 'SUPPORTER' | 'PARTNER';

// 지원자 본인의 신청 생명주기 (SupporterApplicationStatus는 호스트 측 triage 라벨과 별개)
export type FeedApplicationStatus =
    | 'APPLIED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'CANCELLED';

export type FeedApplicationRole = 'SUPPORTER' | 'PARTNER';

export interface FeedApplication {
    id: string;
    feedId: string;
    userId: string;
    proposal: string;
    status: FeedApplicationStatus;
    appliedRole: FeedApplicationRole;
    deposit: number;
    createdAt: string;
}

export interface FeedAuthorProfile {
    id: string;
    nickname: string;
    avatarUrl?: string;
    role: FeedAuthorRole;
    rating?: number; // SUPPORTER만 (0~5)
    field?: string; // SUPPORTER만 (카테고리)
}

export interface FeedItem {
    id: string;
    title: string;
    description?: string; // 카드/상세 본문 요약
    location: string;
    authorNickname: string;
    authorProfile?: FeedAuthorProfile;
    price: number;
    type: FeedItemType;
    status: FeedItemStatus;
    progressPercent?: number; // OFFER 타입일 때 펀딩 진행률 (0~100)
    imageUrl?: string;
    views: number;
    likes: number;
    partnerCount?: number; // OFFER: 확정된 파트너 수
    applicantCount?: number; // REQUEST: 지원한 서포터 수
    confirmedPartnerProfiles?: FeedParticipantProfile[]; // 카드 아바타 스크롤용
    category?: FeedCategory;
    deadline?: string; // ISO 날짜. 마감까지 N일 계산용
    maxParticipants?: number; // 목표 인원
    isRentable?: boolean; // OFFER 중 물건 대여 여부
    isBookmarked?: boolean;
    myApplicationStatus?: FeedApplicationStatus;
    myApplicationRole?: FeedApplicationRole;
    myApplicationDeposit?: number;
}

export interface SupporterItem {
    id: string;
    nickname: string;
    avatarUrl?: string;
    category: FeedCategory;
    tagline: string; // 한 줄 소개
    tags: string[]; // 활동 태그 (최대 3개)
    completedCount: number; // 완료한 활동 수
    rating: number; // 0~5
    location: string;
    relatedOfferId?: string; // 현재 열려있는 Offer
}

// 호스트 측 지원자 triage 라벨 (지원자 생명주기인 FeedApplicationStatus와 별개)
export type SupporterApplicationStatus = 'LEADING' | 'REVIEWING' | 'WAITING';

export interface SupporterApplication extends SupporterItem {
    proposal: string;
    competitionScore: number;
    status: SupporterApplicationStatus;
    relatedRequestId?: string;
}

export interface FeedParticipantProfile {
    id: string;
    nickname: string;
    avatarUrl?: string;
}

export interface FeedDemandSnapshot {
    fundingGoal: number;
    fundedAmount: number;
    requiredPartners: number;
    confirmedPartners: number;
    confirmedPartnerProfiles: FeedParticipantProfile[];
    partnerSlotLabels?: string[];
    deadlineLabel: string;
    hostNote: string;
    currentAmountLabel?: string;
    targetAmountLabel?: string;
    progressLabel?: string;
}

export interface FeedCompetitionInsight {
    label: string;
    value: string;
    tone?: 'brand' | 'accent' | 'neutral';
}

export interface FeedManagementFlow {
    feedId: string;
    stageLabel: string;
    demand: FeedDemandSnapshot;
    applications: SupporterApplication[];
    insights: FeedCompetitionInsight[];
}

export interface PollOption {
    label: string;
    count: number;
}

export interface PollItem {
    id: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    relatedOfferId?: string;
}
