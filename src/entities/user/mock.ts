import type { SupporterProfile, PartnerProfile } from './types';

export const MOCK_SUPPORTER_PROFILES: Record<string, SupporterProfile> = {
    'user-yoga': {
        id: 'user-yoga',
        profileType: 'SUPPORTER',
        nickname: '요가러버',
        field: '피트니스 · 요가',
        mediaUrls: [],
        career: '요가 강사 자격증 보유 (RYT-200), 3년 개인 레슨 경험',
        bio: '몸과 마음의 균형을 함께 찾아가요. 초보자도 편하게 시작할 수 있도록 페이스에 맞춰 진행합니다.',
        avgRating: 4.8,
        reviewCount: 14,
        reviews: [
            {
                id: 'rv-1',
                reviewerNickname: '나',
                rating: 5,
                comment: '설명이 아주 친절하고 동작 교정을 꼼꼼하게 해줬어요!',
                spotTitle: '요가 클래스 파트너 모집',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 10,
                ).toISOString(),
            },
            {
                id: 'rv-2',
                reviewerNickname: '하늘빛',
                rating: 5,
                comment: '시간 약속도 잘 지키고 분위기도 좋았어요.',
                spotTitle: '새벽 스트레칭 모임',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 30,
                ).toISOString(),
            },
            {
                id: 'rv-3',
                reviewerNickname: '달콤커피',
                rating: 4,
                comment: '실력은 좋은데 가끔 설명이 빠른 편이에요.',
                spotTitle: '홈 요가 파트너',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 60,
                ).toISOString(),
            },
        ],
        history: [
            {
                spotId: 'spot-4',
                spotTitle: '요가 클래스 파트너 모집',
                spotType: 'OFFER',
                completedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 10,
                ).toISOString(),
                reviewCount: 1,
                avgRating: 5,
            },
            {
                spotId: 'spot-old-1',
                spotTitle: '새벽 스트레칭 모임',
                spotType: 'REQUEST',
                completedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 30,
                ).toISOString(),
                reviewCount: 1,
                avgRating: 5,
            },
        ],
    },
    'user-run': {
        id: 'user-run',
        profileType: 'SUPPORTER',
        nickname: '달리기왕',
        field: '러닝 · 마라톤',
        mediaUrls: [],
        career: '하프마라톤 완주 5회, 러닝 크루 운영 2년',
        bio: '함께 달리면 더 멀리 갈 수 있어요. 페이스 조절부터 폼 교정까지 도와드립니다.',
        avgRating: 4.6,
        reviewCount: 9,
        reviews: [
            {
                id: 'rv-4',
                reviewerNickname: '나',
                rating: 5,
                comment: '페이스 맞춰주면서 끝까지 같이 뛰어줬어요. 최고!',
                spotTitle: '한강 러닝 크루 모집',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 5,
                ).toISOString(),
            },
            {
                id: 'rv-5',
                reviewerNickname: '새벽런너',
                rating: 4,
                comment: '코스 설명을 잘 해줬어요.',
                spotTitle: '공원 조깅 파트너',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 20,
                ).toISOString(),
            },
        ],
        history: [
            {
                spotId: 'spot-5',
                spotTitle: '한강 러닝 크루 모집',
                spotType: 'REQUEST',
                completedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 5,
                ).toISOString(),
                reviewCount: 1,
                avgRating: 5,
            },
        ],
    },
};

export const MOCK_PARTNER_PROFILES: Record<string, PartnerProfile> = {
    'user-other': {
        id: 'user-other',
        profileType: 'PARTNER',
        nickname: '초록이',
        interestCategories: ['가드닝', '자연', '주말 활동'],
        isFriend: false,
    },
    'user-run2': {
        id: 'user-run2',
        profileType: 'PARTNER',
        nickname: '새벽런너',
        interestCategories: ['러닝', '피트니스', '아침 루틴'],
        isFriend: true,
    },
};

export function getMockUserProfile(
    userId: string,
): SupporterProfile | PartnerProfile | null {
    return (
        MOCK_SUPPORTER_PROFILES[userId] ?? MOCK_PARTNER_PROFILES[userId] ?? null
    );
}
