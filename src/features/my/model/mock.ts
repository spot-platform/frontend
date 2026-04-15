// my-mock - 마이페이지 프로필, 설정, 활동 데이터를 메모리에서 관리한다.
import type {
    MyFavoriteItem,
    MyRecentViewItem,
    MySupportActivitySummary,
    NotificationSettings,
    Participation,
    PasswordChangePayload,
    SupporterProfile,
    SupporterRegistration,
    UserProfile,
} from '@/entities/user/types';
import type { PagedResponse } from '@/entities/spot/types';
import { getMockPointBalanceValue } from '@/features/pay/model/mock';
import { MOCK_SPOT_DETAILS } from '@/features/spot/model/mock';

function clone<T>(value: T): T {
    return structuredClone(value);
}

function now() {
    return new Date().toISOString();
}

function paginate<T>(
    items: T[],
    params?: { page?: number; size?: number },
): PagedResponse<T> {
    const page = params?.page ?? 1;
    const size = (params?.size ?? items.length) || 1;
    const start = (page - 1) * size;
    const data = items.slice(start, start + size);

    return {
        data,
        meta: {
            page,
            size,
            total: items.length,
            hasNext: start + size < items.length,
        },
    };
}

const myProfileState: Omit<UserProfile, 'pointBalance'> = {
    id: 'user-me',
    nickname: '나',
    email: 'demo@spot.local',
    phone: '010-1234-5678',
    avatarUrl: 'https://picsum.photos/seed/user-me/120/120',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
};

let notificationSettingsState: NotificationSettings = {
    serviceNoticeEnabled: true,
    activityEnabled: true,
    pushEnabled: true,
    emailEnabled: false,
    updatedAt: now(),
};

let supporterRegistrationState: SupporterRegistration = {
    field: '라이프스타일 · 커뮤니티 운영',
    mediaUrls: ['https://picsum.photos/seed/support-register/640/360'],
    career: '모임 운영 3년, 클래스 기획 및 참여 경험 다수',
    bio: '사용자 경험을 세심하게 챙기며 매끄러운 진행을 돕습니다.',
    verificationStatus: 'VERIFIED',
    verificationNotes: '서류 검토가 완료되어 프로필 공개가 가능해요.',
    extraNotes: '주말 일정 조율 가능',
    updatedAt: now(),
};

let supporterProfileState: SupporterProfile = {
    id: 'user-me',
    profileType: 'SUPPORTER',
    nickname: myProfileState.nickname,
    avatarUrl: myProfileState.avatarUrl,
    field: supporterRegistrationState.field,
    mediaUrls: clone(supporterRegistrationState.mediaUrls),
    career: supporterRegistrationState.career,
    bio: supporterRegistrationState.bio,
    avgRating: 4.9,
    reviewCount: 3,
    reviews: [
        {
            id: 'my-review-1',
            reviewerNickname: '책벌레',
            rating: 5,
            comment: '모임 진행을 차분하게 잘 이끌어줬어요.',
            spotTitle: '북클럽 독서 모임',
            createdAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 4,
            ).toISOString(),
        },
        {
            id: 'my-review-2',
            reviewerNickname: '산악인',
            rating: 5,
            comment: '일정 조율이 빠르고 준비가 꼼꼼했어요.',
            spotTitle: '주말 등산 파트너 모집',
            createdAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 7,
            ).toISOString(),
        },
        {
            id: 'my-review-3',
            reviewerNickname: '새벽런너',
            rating: 4,
            comment: '대화가 편했고 진행이 매끄러웠어요.',
            spotTitle: '한강 러닝 크루 모집',
            createdAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 12,
            ).toISOString(),
        },
    ],
    history: [
        {
            spotId: 'spot-3',
            spotTitle: '홈카페 서포터 모집',
            spotType: 'OFFER',
            completedAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 5,
            ).toISOString(),
            reviewCount: 1,
            avgRating: 5,
        },
        {
            spotId: 'spot-5',
            spotTitle: '한강 러닝 크루 모집',
            spotType: 'REQUEST',
            completedAt: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 9,
            ).toISOString(),
            reviewCount: 1,
            avgRating: 4,
        },
    ],
};

let favoritesState: MyFavoriteItem[] = [
    {
        id: 'favorite-spot-1',
        targetId: 'spot-1',
        title: '베이킹 클래스 공동구매',
        description: '홍대 베이킹 스튜디오 클래스를 함께 신청해요.',
        type: 'OFFER',
        savedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        pointCost: 84824,
        authorNickname: '나',
        status: 'OPEN',
    },
    {
        id: 'favorite-spot-2',
        targetId: 'spot-2',
        title: '가드닝 파트너 모집',
        description: '주말 텃밭 가드닝 같이 하실 분 모집합니다.',
        type: 'REQUEST',
        savedAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
        pointCost: 30000,
        authorNickname: '초록이',
        status: 'MATCHED',
    },
];

let recentViewsState: MyRecentViewItem[] = [
    {
        id: 'recent-spot-6',
        targetId: 'spot-6',
        title: '북클럽 독서 모임',
        description: '매주 한 권씩 읽고 함께 이야기를 나눠요.',
        type: 'OFFER',
        viewedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        pointCost: 20000,
        authorNickname: '나',
        status: 'OPEN',
    },
    {
        id: 'recent-spot-7',
        targetId: 'spot-7',
        title: '주말 등산 파트너 모집',
        description: '북한산 코스를 함께 오를 파트너를 찾아요.',
        type: 'REQUEST',
        viewedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        pointCost: 10000,
        authorNickname: '나',
        status: 'MATCHED',
    },
];

function buildMyProfile(): UserProfile {
    return {
        ...myProfileState,
        pointBalance: getMockPointBalanceValue(),
    };
}

function buildParticipations(): Participation[] {
    return Object.values(MOCK_SPOT_DETAILS)
        .filter(
            (spot) =>
                spot.authorId === 'user-me' ||
                spot.participants.some(
                    (participant) => participant.userId === 'user-me',
                ),
        )
        .map((spot) => ({
            spotId: spot.id,
            spotTitle: spot.title,
            spotType: spot.type,
            role:
                spot.authorId === 'user-me'
                    ? ('AUTHOR' as const)
                    : ('PARTICIPANT' as const),
            status: spot.status,
            joinedAt:
                spot.participants.find(
                    (participant) => participant.userId === 'user-me',
                )?.joinedAt ?? spot.createdAt,
        }))
        .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
}

function buildSupportActivitySummary(): MySupportActivitySummary {
    return {
        avgRating: supporterProfileState.avgRating,
        reviewCount: supporterProfileState.reviewCount,
        completedCount: supporterProfileState.history.length,
        latestReview: supporterProfileState.reviews[0],
    };
}

export function getMockMyProfile() {
    return { data: clone(buildMyProfile()) };
}

export function getMockNotificationSettings() {
    return { data: clone(notificationSettingsState) };
}

export function getMockSupporterRegistration() {
    return { data: clone(supporterRegistrationState) };
}

export function getMockSupporterProfile() {
    return { data: clone(supporterProfileState) };
}

export function getMockParticipations(params?: {
    page?: number;
    size?: number;
}) {
    return paginate(buildParticipations(), params);
}

export function getMockFavorites(params?: { page?: number; size?: number }) {
    return paginate(favoritesState, params);
}

export function getMockRecentViews(params?: { page?: number; size?: number }) {
    return paginate(recentViewsState, params);
}

export function getMockSupportActivitySummary() {
    return { data: clone(buildSupportActivitySummary()) };
}

export function updateMockProfile(payload: {
    avatarUrl?: string;
    nickname?: string;
    email?: string;
    phone?: string;
}) {
    myProfileState.avatarUrl = payload.avatarUrl ?? myProfileState.avatarUrl;
    myProfileState.nickname = payload.nickname ?? myProfileState.nickname;
    myProfileState.email = payload.email ?? myProfileState.email;
    myProfileState.phone = payload.phone ?? myProfileState.phone;
    supporterProfileState.nickname = myProfileState.nickname;
    supporterProfileState.avatarUrl = myProfileState.avatarUrl;

    return getMockMyProfile();
}

export function changeMockPassword(_payload: PasswordChangePayload) {
    void _payload;
    return undefined;
}

export function updateMockNotificationSettings(
    payload: Omit<NotificationSettings, 'updatedAt'>,
) {
    notificationSettingsState = {
        ...payload,
        updatedAt: now(),
    };

    return getMockNotificationSettings();
}

export function updateMockSupporterRegistration(
    payload: Omit<SupporterRegistration, 'updatedAt'>,
) {
    supporterRegistrationState = {
        ...payload,
        updatedAt: now(),
    };

    return getMockSupporterRegistration();
}

export function updateMockSupporterProfile(payload: {
    field: string;
    mediaUrls: string[];
    career: string;
    bio: string;
}) {
    supporterProfileState = {
        ...supporterProfileState,
        ...payload,
    };

    return getMockSupporterProfile();
}

export function removeMockFavorite(favoriteId: string) {
    favoritesState = favoritesState.filter((item) => item.id !== favoriteId);
}

export function removeMockRecentView(recentViewId: string) {
    recentViewsState = recentViewsState.filter(
        (item) => item.id !== recentViewId,
    );
}

export function clearMockRecentViews() {
    recentViewsState = [];
}
