// 피드 목 데이터 — TODO: API 연동 후 제거
import type {
    FeedApplication,
    FeedApplicationRole,
    FeedApplicationStatus,
    FeedCategory,
    FeedItem,
    FeedManagementFlow,
    FeedParticipantProfile,
    PollItem,
    SupporterApplication,
    SupporterItem,
} from './types';

export type MockFeedCategoryAveragePricingGuide = {
    category: FeedCategory;
    averageFundingGoal: number;
    benchmarkLabel: string;
    note: string;
};

export const MOCK_FEED_CATEGORY_AVERAGE_PRICING_GUIDE: Record<
    FeedCategory,
    MockFeedCategoryAveragePricingGuide
> = {
    음악: {
        category: '음악',
        averageFundingGoal: 52000,
        benchmarkLabel: '최근 12건 기준',
        note: '입문 모임은 첫 일정 확정 전 4만~6만원대에서 조율되는 편이에요.',
    },
    요리: {
        category: '요리',
        averageFundingGoal: 210000,
        benchmarkLabel: '최근 14건 기준',
        note: '재료비와 소분 비용이 함께 잡혀 20만원 안팎에서 맞춰지는 경우가 많아요.',
    },
    운동: {
        category: '운동',
        averageFundingGoal: 72000,
        benchmarkLabel: '최근 9건 기준',
        note: '소규모 정기 모임은 회차당 준비비를 포함해 7만원 전후가 가장 많았어요.',
    },
    공예: {
        category: '공예',
        averageFundingGoal: 260000,
        benchmarkLabel: '최근 11건 기준',
        note: '재료 단가 편차가 커도 첫 모집 목표는 20만원대 중반으로 수렴하는 편이에요.',
    },
    언어: {
        category: '언어',
        averageFundingGoal: 68000,
        benchmarkLabel: '최근 8건 기준',
        note: '스터디형 모임은 교재비와 공간비를 포함해 6만~7만원대가 가장 안정적이었어요.',
    },
    기타: {
        category: '기타',
        averageFundingGoal: 160000,
        benchmarkLabel: '최근 10건 기준',
        note: '운영비가 섞이는 요청형 모집은 평균적으로 10만원대 후반에서 출발해요.',
    },
};

export function getMockFeedCategoryAveragePricingGuide(
    category?: FeedCategory,
) {
    if (!category) {
        return null;
    }

    return MOCK_FEED_CATEGORY_AVERAGE_PRICING_GUIDE[category] ?? null;
}

type MyFeedApplicationRecord = {
    status: FeedApplicationStatus;
    role: FeedApplicationRole;
    deposit: number;
    proposal: string;
    createdAt: string;
};

const MOCK_MY_FEED_APPLICATIONS = new Map<string, MyFeedApplicationRecord>();

export function getMyFeedApplication(
    feedId: string,
): MyFeedApplicationRecord | undefined {
    const record = MOCK_MY_FEED_APPLICATIONS.get(feedId);
    return record ? { ...record } : undefined;
}

export function applyMockFeedApplication(
    feedId: string,
    payload: {
        proposal: string;
        role: FeedApplicationRole;
        deposit: number;
    },
): { data: FeedApplication } {
    const createdAt = new Date().toISOString();
    MOCK_MY_FEED_APPLICATIONS.set(feedId, {
        status: 'APPLIED',
        role: payload.role,
        deposit: payload.deposit,
        proposal: payload.proposal,
        createdAt,
    });

    return {
        data: {
            id: `feed-app-${feedId}`,
            feedId,
            userId: 'user-me',
            proposal: payload.proposal,
            status: 'APPLIED',
            appliedRole: payload.role,
            deposit: payload.deposit,
            createdAt,
        },
    };
}

export function cancelMockFeedApplication(feedId: string): {
    data: { feedId: string; status: 'CANCELLED' };
} {
    const current = MOCK_MY_FEED_APPLICATIONS.get(feedId);
    if (!current) {
        throw new Error('취소할 신청 내역이 없습니다.');
    }
    MOCK_MY_FEED_APPLICATIONS.set(feedId, { ...current, status: 'CANCELLED' });
    return { data: { feedId, status: 'CANCELLED' } };
}

export const MOCK_FEED: FeedItem[] = [
    {
        id: '1',
        title: '이케아 라탄 2인 소파 공동구매 같이 하실 분 모집합니다',
        description:
            '주문 수량 맞추면 정가 대비 30% 할인. 수령 장소는 강남구 역삼동 기준.',
        location: '강남구 역삼동',
        authorNickname: '초록잎사귀',
        authorProfile: {
            id: 'user-chorok',
            nickname: '초록잎사귀',
            avatarUrl: 'https://picsum.photos/seed/chorok-ip/80/80',
            role: 'SUPPORTER',
            rating: 4.7,
            field: '공예',
        },
        price: 150000,
        progressPercent: 56,
        type: 'OFFER',
        status: 'OPEN',
        views: 142,
        likes: 38,
        partnerCount: 3,
        maxParticipants: 5,
        confirmedPartnerProfiles: [
            {
                id: 'p-a1',
                nickname: '햇살가득',
                avatarUrl: 'https://picsum.photos/seed/p-a1/80/80',
            },
            {
                id: 'p-a2',
                nickname: '달빛산책',
                avatarUrl: 'https://picsum.photos/seed/p-a2/80/80',
            },
            {
                id: 'p-a3',
                nickname: '봄바람',
                avatarUrl: 'https://picsum.photos/seed/p-a3/80/80',
            },
        ],
        category: '공예',
        deadline: '2026-04-10',
        isBookmarked: true,
    },
    {
        id: '2',
        title: '다이슨 공기청정기 공동구매 참여자를 모집합니다',
        description:
            '정품 인증 채널 통해 구매. 4명 이상 모이면 개당 15만원대 가능.',
        location: '서초구 방배동',
        authorNickname: '맑은하늘123',
        authorProfile: {
            id: 'user-malgeun',
            nickname: '맑은하늘123',
            avatarUrl: 'https://picsum.photos/seed/malgeun-haneul/80/80',
            role: 'PARTNER',
        },
        price: 70000,
        type: 'REQUEST',
        status: 'OPEN',
        views: 89,
        likes: 24,
        applicantCount: 9,
        category: '기타',
        deadline: '2026-04-12',
        isBookmarked: true,
    },
    {
        id: '3',
        title: '홈카페 클래스 열려요 — 원두 선택부터 라떼 아트까지',
        description:
            '핸드드립, 에스프레소, 라떼아트 순서로 진행. 원두 샘플 증정.',
        location: '마포구 합정동',
        authorNickname: '건강한삶',
        authorProfile: {
            id: 'user-healthy',
            nickname: '건강한삶',
            avatarUrl: 'https://picsum.photos/seed/geonanghan-salm/80/80',
            role: 'SUPPORTER',
            rating: 4.8,
            field: '요리',
        },
        price: 25000,
        progressPercent: 91,
        type: 'OFFER',
        status: 'OPEN',
        views: 203,
        likes: 67,
        partnerCount: 9,
        maxParticipants: 10,
        confirmedPartnerProfiles: [
            {
                id: 'p-b1',
                nickname: '라떼아트',
                avatarUrl: 'https://picsum.photos/seed/p-b1/80/80',
            },
            {
                id: 'p-b2',
                nickname: '커피향기',
                avatarUrl: 'https://picsum.photos/seed/p-b2/80/80',
            },
            {
                id: 'p-b3',
                nickname: '모닝커피',
                avatarUrl: 'https://picsum.photos/seed/p-b3/80/80',
            },
        ],
        category: '요리',
        deadline: '2026-04-07',
        spotId: 'spot-v-001',
    },
    {
        id: '4',
        title: '기초 우쿨렐레 배워요 — 악보 못 봐도 괜찮아요',
        description:
            'C, F, G, Am 4코드만으로 인기곡 3곡 연주 목표. 악기 없어도 참여 가능.',
        location: '송파구 잠실동',
        authorNickname: '차한잔',
        authorProfile: {
            id: 'user-tea',
            nickname: '차한잔',
            avatarUrl: 'https://picsum.photos/seed/chahanjan/80/80',
            role: 'SUPPORTER',
            rating: 4.6,
            field: '음악',
        },
        price: 20000,
        progressPercent: 28,
        type: 'OFFER',
        status: 'OPEN',
        views: 56,
        likes: 12,
        partnerCount: 2,
        maxParticipants: 6,
        confirmedPartnerProfiles: [
            {
                id: 'p-c1',
                nickname: '우쿨렐레왕',
                avatarUrl: 'https://picsum.photos/seed/p-c1/80/80',
            },
            {
                id: 'p-c2',
                nickname: '음악좋아',
                avatarUrl: 'https://picsum.photos/seed/p-c2/80/80',
            },
        ],
        category: '음악',
        deadline: '2026-04-15',
        spotId: 'spot-m-003',
    },
    {
        id: '5',
        title: '스페셜티 커피 원두 1kg 분류 같이 구입하실 분',
        description:
            '에티오피아·콜롬비아·케냐 중 선택 주문. 1kg 소분 후 각자 픽업.',
        location: '용산구 이태원동',
        authorNickname: '커피홀릭',
        authorProfile: {
            id: 'user-coffeeholic',
            nickname: '커피홀릭',
            avatarUrl: 'https://picsum.photos/seed/coffeeholic/80/80',
            role: 'PARTNER',
        },
        price: 30000,
        type: 'REQUEST',
        status: 'OPEN',
        views: 178,
        likes: 55,
        applicantCount: 22,
        category: '요리',
        isBookmarked: true,
    },
    {
        id: '6',
        title: '필라테스 소모임 모집 — 매주 토요일 오전',
        description:
            '초보 환영. 코어·자세교정 위주. 강서구 센터 이용 (월정액 불필요).',
        location: '강서구 방화동',
        authorNickname: '위스키러버',
        authorProfile: {
            id: 'user-whiskey',
            nickname: '위스키러버',
            avatarUrl: 'https://picsum.photos/seed/whiskey-lover/80/80',
            role: 'SUPPORTER',
            rating: 4.9,
            field: '운동',
        },
        price: 15000,
        progressPercent: 73,
        type: 'OFFER',
        status: 'OPEN',
        views: 321,
        likes: 88,
        partnerCount: 4,
        maxParticipants: 6,
        confirmedPartnerProfiles: [
            {
                id: 'p-d1',
                nickname: '필라테스킹',
                avatarUrl: 'https://picsum.photos/seed/p-d1/80/80',
            },
            {
                id: 'p-d2',
                nickname: '코어근육',
                avatarUrl: 'https://picsum.photos/seed/p-d2/80/80',
            },
            {
                id: 'p-d3',
                nickname: '자세교정',
                avatarUrl: 'https://picsum.photos/seed/p-d3/80/80',
            },
            {
                id: 'p-d4',
                nickname: '토요운동',
                avatarUrl: 'https://picsum.photos/seed/p-d4/80/80',
            },
        ],
        category: '운동',
        deadline: '2026-04-08',
        isBookmarked: true,
        spotId: 'spot-r-002',
    },
    {
        id: '7',
        title: '기타 Fender 입문용 단기 대여합니다 (주말 2박3일)',
        description:
            'Fender Squier Strat. 케이스·튜너 포함. 은평구 직거래 기준.',
        location: '은평구 녹번동',
        authorNickname: '캠핑러버',
        authorProfile: {
            id: 'user-camping',
            nickname: '캠핑러버',
            avatarUrl: 'https://picsum.photos/seed/camping-lover/80/80',
            role: 'SUPPORTER',
            rating: 4.5,
            field: '음악',
        },
        price: 25000,
        type: 'RENT',
        status: 'OPEN',
        views: 95,
        likes: 31,
        partnerCount: 5,
        category: '음악',
        isRentable: true,
    },
    {
        id: '8',
        title: '우쿨렐레 가르쳐줄 분 구해요 — 완전 초보예요',
        description:
            '악보도 모르고 음감도 없지만 도전해보고 싶어요. 주 1~2회 희망.',
        location: '중구 을지로',
        authorNickname: '그린모빌리티',
        authorProfile: {
            id: 'user-green',
            nickname: '그린모빌리티',
            avatarUrl: 'https://picsum.photos/seed/green-mobility/80/80',
            role: 'PARTNER',
        },
        price: 15000,
        type: 'REQUEST',
        status: 'OPEN',
        views: 64,
        likes: 18,
        applicantCount: 8,
        category: '음악',
        deadline: '2026-04-20',
    },
];

export const MOCK_SUPPORTERS: SupporterItem[] = [
    {
        id: 's1',
        nickname: '건강한삶',
        avatarUrl: 'https://picsum.photos/seed/geonanghan-salm/80/80',
        category: '요리',
        tagline: '홈카페 3년차, 원두부터 라떼아트까지 알려드려요',
        tags: ['입문 환영', '소규모', '주말 가능'],
        completedCount: 12,
        rating: 4.8,
        location: '마포구 합정동',
        relatedOfferId: '3',
    },
    {
        id: 's2',
        nickname: '차한잔',
        avatarUrl: 'https://picsum.photos/seed/chahanjan/80/80',
        category: '음악',
        tagline: '독학 우쿨렐레 4년, 악보 없이도 가르쳐드려요',
        tags: ['악보 불필요', '초보 전문', '온라인 가능'],
        completedCount: 7,
        rating: 4.6,
        location: '송파구 잠실동',
        relatedOfferId: '4',
    },
    {
        id: 's3',
        nickname: '위스키러버',
        avatarUrl: 'https://picsum.photos/seed/whiskey-lover/80/80',
        category: '운동',
        tagline: '필라테스 2년, 자세 교정부터 코어 강화까지',
        tags: ['자세 교정', '소규모', '토요일'],
        completedCount: 19,
        rating: 4.9,
        location: '강서구 방화동',
        relatedOfferId: '6',
    },
];

const MOCK_FEED_APPLICATIONS: Record<string, SupporterApplication[]> = {
    '1': [
        {
            ...MOCK_SUPPORTERS[0],
            proposal:
                '공동구매 참여자 대상에게 클래스 준비물 체크리스트와 사전 안내를 맡아 진행할게요.',
            competitionScore: 94,
            status: 'LEADING',
        },
        {
            id: 's4',
            nickname: '라탄로그',
            avatarUrl: 'https://picsum.photos/seed/rattan-log/80/80',
            category: '공예',
            tagline:
                '소품 제작 5년차, 클래스 운영 보조와 현장 동선을 정리해드려요',
            tags: ['현장 운영', '사진 기록', '평일 가능'],
            completedCount: 16,
            rating: 4.7,
            location: '강남구 논현동',
            relatedOfferId: '1',
            relatedRequestId: '1',
            proposal:
                '참여자 응대와 테이블 세팅, 후기용 사진 촬영까지 맡아서 운영 피로도를 줄일 수 있어요.',
            competitionScore: 88,
            status: 'REVIEWING',
        },
        {
            id: 's5',
            nickname: '살림메이트',
            avatarUrl: 'https://picsum.photos/seed/sallim-mate/80/80',
            category: '요리',
            tagline:
                '공동구매 정산과 물품 수령 경험이 많아 실무를 꼼꼼하게 챙겨요',
            tags: ['정산 꼼꼼', '수령 대행', '카톡 응대'],
            completedCount: 21,
            rating: 4.9,
            location: '서초구 반포동',
            relatedOfferId: '1',
            relatedRequestId: '1',
            proposal:
                '입금 확인과 수령 시간 조율을 맡아 진행 속도를 높이고 누락 없이 정리하겠습니다.',
            competitionScore: 85,
            status: 'WAITING',
        },
    ],
    '2': [
        {
            ...MOCK_SUPPORTERS[2],
            relatedRequestId: '2',
            proposal:
                '주말 일정 조율부터 참여자 스트레칭 가이드까지 맡아서 첫 모임을 안정적으로 열어드릴게요.',
            competitionScore: 96,
            status: 'LEADING',
        },
        {
            ...MOCK_SUPPORTERS[1],
            relatedRequestId: '2',
            proposal:
                '신규 참여자 온보딩 문구와 활동 후기를 묶어 다음 모집까지 이어지는 흐름을 만들 수 있어요.',
            competitionScore: 89,
            status: 'REVIEWING',
        },
        {
            id: 's6',
            nickname: '텃밭친구',
            avatarUrl: 'https://picsum.photos/seed/garden-friend/80/80',
            category: '기타',
            tagline:
                '커뮤니티 운영 경험으로 첫 참여자들의 질문을 빠르게 정리해드려요',
            tags: ['Q&A 정리', '커뮤니티 운영', '주말 가능'],
            completedCount: 11,
            rating: 4.5,
            location: '동작구 상도동',
            relatedOfferId: '2',
            relatedRequestId: '2',
            proposal:
                '활동 안내 메시지와 준비물 공지를 템플릿으로 정리해 반복 문의를 줄일 수 있습니다.',
            competitionScore: 81,
            status: 'WAITING',
        },
    ],
    '3': [
        {
            ...MOCK_SUPPORTERS[0],
            relatedRequestId: '3',
            proposal:
                '원두 소개와 시음 가이드를 맡아 클래스 만족도를 높일 수 있어요.',
            competitionScore: 91,
            status: 'LEADING',
        },
    ],
    '5': [
        {
            id: 's7',
            nickname: '브루브릭',
            avatarUrl: 'https://picsum.photos/seed/brew-brick-app/80/80',
            category: '요리',
            tagline:
                '카페 원두 공동구매를 자주 맡아 주문 수량 정리와 수령 동선을 깔끔하게 맞춰드려요',
            tags: ['주문 취합', '수령 동선', '주말 가능'],
            completedCount: 14,
            rating: 4.7,
            location: '성동구 성수동',
            relatedOfferId: '5',
            relatedRequestId: '5',
            proposal:
                '원두 옵션별 신청 폼과 입금 마감 공지를 정리해 첫 모집에서도 혼선 없이 진행할 수 있어요.',
            competitionScore: 92,
            status: 'LEADING',
        },
        {
            id: 's8',
            nickname: '드립백노트',
            avatarUrl: 'https://picsum.photos/seed/dripbag-note/80/80',
            category: '요리',
            tagline:
                '커피 클래스 운영 경험을 바탕으로 참여자 질문 대응과 후기 회수를 맡아요',
            tags: ['Q&A 응대', '후기 회수', '카톡 정리'],
            completedCount: 9,
            rating: 4.6,
            location: '용산구 한남동',
            relatedOfferId: '5',
            relatedRequestId: '5',
            proposal:
                '픽업 일정 조율과 후기 수집까지 이어서 맡아 다음 모집에도 바로 활용할 수 있게 정리하겠습니다.',
            competitionScore: 84,
            status: 'REVIEWING',
        },
    ],
    '8': [
        {
            id: 's9',
            nickname: '현악메모',
            avatarUrl: 'https://picsum.photos/seed/string-memo-app/80/80',
            category: '음악',
            tagline:
                '입문 악기 수업 보조 경험으로 초보자의 질문을 쉽게 풀어 설명해드려요',
            tags: ['입문 전문', '악보 정리', '저녁 가능'],
            completedCount: 13,
            rating: 4.8,
            location: '중구 필동',
            relatedOfferId: '8',
            relatedRequestId: '8',
            proposal:
                '첫 연습 전에 손가락 번호표와 기본 코드 요약 이미지를 미리 보내 적응 시간을 줄일 수 있어요.',
            competitionScore: 90,
            status: 'LEADING',
        },
        {
            id: 's10',
            nickname: '폴크웨이브',
            avatarUrl: 'https://picsum.photos/seed/folk-wave-app/80/80',
            category: '음악',
            tagline:
                '소규모 합주 모임 운영으로 일정 조율과 참여 독려 메시지를 꾸준히 챙겨왔어요',
            tags: ['일정 조율', '합주 운영', '주말 가능'],
            completedCount: 17,
            rating: 4.9,
            location: '서대문구 연희동',
            relatedOfferId: '8',
            relatedRequestId: '8',
            proposal:
                '주간 연습 체크인과 간단한 연습 과제를 정리해 초보 모임이 끊기지 않도록 도와드릴게요.',
            competitionScore: 87,
            status: 'REVIEWING',
        },
    ],
};

const MOCK_CONFIRMED_PARTNERS: Record<string, FeedParticipantProfile[]> = {
    '1': [
        {
            id: 'p1',
            nickname: '라탄로그',
            avatarUrl: 'https://picsum.photos/seed/rattan-log-confirmed/80/80',
        },
        {
            id: 'p2',
            nickname: '살림메이트',
            avatarUrl: 'https://picsum.photos/seed/sallim-mate-confirmed/80/80',
        },
        {
            id: 'p3',
            nickname: '오브제무드',
            avatarUrl: 'https://picsum.photos/seed/object-mood/80/80',
        },
    ],
    '2': [
        {
            id: 'p4',
            nickname: '위스키러버',
            avatarUrl:
                'https://picsum.photos/seed/whiskey-lover-confirmed/80/80',
        },
        {
            id: 'p5',
            nickname: '차한잔',
            avatarUrl: 'https://picsum.photos/seed/chahanjan-confirmed/80/80',
        },
    ],
    '3': [
        {
            id: 'p6',
            nickname: '건강한삶',
            avatarUrl:
                'https://picsum.photos/seed/geonanghan-salm-confirmed/80/80',
        },
        {
            id: 'p7',
            nickname: '브루노트',
            avatarUrl: 'https://picsum.photos/seed/brew-note/80/80',
        },
        {
            id: 'p8',
            nickname: '잔향기록',
            avatarUrl: 'https://picsum.photos/seed/aftertaste-note/80/80',
        },
        {
            id: 'p9',
            nickname: '소일라운지',
            avatarUrl: 'https://picsum.photos/seed/soil-lounge/80/80',
        },
        {
            id: 'p10',
            nickname: '메종폴드',
            avatarUrl: 'https://picsum.photos/seed/maison-fold/80/80',
        },
        {
            id: 'p11',
            nickname: '시티베란다',
            avatarUrl: 'https://picsum.photos/seed/city-veranda/80/80',
        },
        {
            id: 'p12',
            nickname: '폼앤패턴',
            avatarUrl: 'https://picsum.photos/seed/form-pattern/80/80',
        },
        {
            id: 'p13',
            nickname: '무드스티치',
            avatarUrl: 'https://picsum.photos/seed/mood-stitch/80/80',
        },
        {
            id: 'p14',
            nickname: '온기서랍',
            avatarUrl: 'https://picsum.photos/seed/warm-drawer/80/80',
        },
    ],
    '5': [
        {
            id: 'p15',
            nickname: '브루브릭',
            avatarUrl: 'https://picsum.photos/seed/brew-brick/80/80',
        },
    ],
    '8': [
        {
            id: 'p16',
            nickname: '현악메모',
            avatarUrl: 'https://picsum.photos/seed/string-memo/80/80',
        },
        {
            id: 'p17',
            nickname: '폴크웨이브',
            avatarUrl: 'https://picsum.photos/seed/folk-wave/80/80',
        },
    ],
};

export const MOCK_FEED_MANAGEMENT: Record<string, FeedManagementFlow> = {
    '1': {
        feedId: '1',
        stageLabel: '파트너 확정 직전',
        demand: {
            fundingGoal: 300000,
            fundedAmount: 168000,
            requiredPartners: 5,
            confirmedPartners: MOCK_CONFIRMED_PARTNERS['1'].length,
            confirmedPartnerProfiles: MOCK_CONFIRMED_PARTNERS['1'],
            partnerSlotLabels: [
                '파트너 1',
                '파트너 2',
                '파트너 3',
                '파트너 4',
                '파트너 5',
            ],
            deadlineLabel: '4월 10일 마감',
            hostNote:
                '주문 확정 전에 운영 보조와 정산 경험이 있는 서포터를 우선 검토하고 있어요.',
        },
        applications: MOCK_FEED_APPLICATIONS['1'],
        insights: [
            { label: '지원 경쟁률', value: '2.6 : 1', tone: 'brand' },
            { label: '평균 평점', value: '4.8 / 5', tone: 'accent' },
            { label: '바로 투입 가능', value: '2명', tone: 'neutral' },
        ],
    },
    '2': {
        feedId: '2',
        stageLabel: '호스트 검토 중',
        demand: {
            fundingGoal: 180000,
            fundedAmount: 126000,
            requiredPartners: 4,
            confirmedPartners: MOCK_CONFIRMED_PARTNERS['2'].length,
            confirmedPartnerProfiles: MOCK_CONFIRMED_PARTNERS['2'],
            partnerSlotLabels: ['서포터', '파트너 1', '파트너 2', '파트너 3'],
            deadlineLabel: '4월 12일 지원 마감',
            hostNote:
                '첫 모임 운영 경험과 참여자 안내 능력을 가장 중요한 평가 기준으로 보고 있어요.',
            currentAmountLabel: '현재 맞춰본 예산',
            targetAmountLabel: '희망 예산',
            progressLabel: '예산 조율도',
        },
        applications: MOCK_FEED_APPLICATIONS['2'],
        insights: [
            { label: '상위 점수권', value: '96점 / 89점', tone: 'brand' },
            { label: '운영 경험 평균', value: '12.3회', tone: 'accent' },
            { label: '승인 예정 슬롯', value: '2명', tone: 'neutral' },
        ],
    },
    '3': {
        feedId: '3',
        stageLabel: '모집 완료 임박',
        demand: {
            fundingGoal: 250000,
            fundedAmount: 227500,
            requiredPartners: 10,
            confirmedPartners: MOCK_CONFIRMED_PARTNERS['3'].length,
            confirmedPartnerProfiles: MOCK_CONFIRMED_PARTNERS['3'],
            partnerSlotLabels: [
                '서포터',
                '파트너 1',
                '파트너 2',
                '파트너 3',
                '파트너 4',
                '파트너 5',
                '파트너 6',
                '파트너 7',
                '파트너 8',
                '파트너 9',
            ],
            deadlineLabel: '오늘 마감',
            hostNote:
                '마지막 한 자리를 확정하면 바로 공지와 결제 안내를 보낼 예정입니다.',
        },
        applications: MOCK_FEED_APPLICATIONS['3'],
        insights: [
            { label: '달성률', value: '91%', tone: 'accent' },
            { label: '대기 지원자', value: '1명', tone: 'brand' },
            { label: '결제 안내 예정', value: '오늘 오후', tone: 'neutral' },
        ],
    },
    '5': {
        feedId: '5',
        stageLabel: '서포터 첫 확정 대기',
        demand: {
            fundingGoal: 90000,
            fundedAmount: 45000,
            requiredPartners: 3,
            confirmedPartners: 1,
            confirmedPartnerProfiles: MOCK_CONFIRMED_PARTNERS['5'],
            partnerSlotLabels: ['서포터', '파트너 1', '파트너 2'],
            deadlineLabel: '지원 상시 확인 중',
            hostNote:
                '공동 주문 전에 수량 취합과 픽업 시간 안내를 맡아줄 파트너를 우선 비교하고 있어요.',
            currentAmountLabel: '현재 맞춰본 예산',
            targetAmountLabel: '희망 예산',
            progressLabel: '예산 조율도',
        },
        applications: MOCK_FEED_APPLICATIONS['5'],
        insights: [
            { label: '픽업 운영 경험', value: '평균 11회', tone: 'brand' },
            { label: '커피 카테고리 적합도', value: '높음', tone: 'accent' },
            { label: '남은 서포터 슬롯', value: '2명', tone: 'neutral' },
        ],
    },
    '8': {
        feedId: '8',
        stageLabel: '초보 모임 조율 중',
        demand: {
            fundingGoal: 45000,
            fundedAmount: 30000,
            requiredPartners: 4,
            confirmedPartners: 2,
            confirmedPartnerProfiles: MOCK_CONFIRMED_PARTNERS['8'],
            partnerSlotLabels: ['서포터', '파트너 1', '파트너 2', '파트너 3'],
            deadlineLabel: '4월 20일 전까지 비교',
            hostNote:
                '첫 수업 전에 초보자 안내와 연습 체크인을 맡을 수 있는 파트너를 중심으로 보고 있어요.',
            currentAmountLabel: '현재 맞춰본 예산',
            targetAmountLabel: '희망 예산',
            progressLabel: '예산 조율도',
        },
        applications: MOCK_FEED_APPLICATIONS['8'],
        insights: [
            { label: '입문 수업 경험', value: '평균 15회', tone: 'brand' },
            { label: '응답 속도', value: '당일 회신', tone: 'accent' },
            { label: '남은 서포터 슬롯', value: '2명', tone: 'neutral' },
        ],
    },
};

export const MOCK_POLLS: PollItem[] = [
    {
        id: 'p1',
        question: '홈카페 클래스 열리면 참여할래요?',
        options: [
            { label: '네, 꼭!', count: 47 },
            { label: '관심만 있어요', count: 31 },
            { label: '아니요', count: 8 },
        ],
        totalVotes: 86,
        relatedOfferId: '3',
    },
    {
        id: 'p2',
        question: '기타 배우고 싶은데 악기가 없어서 못하고 있나요?',
        options: [
            { label: '네, 그게 문제예요', count: 62 },
            { label: '빌리면 될 것 같아요', count: 29 },
            { label: '악기 있어요', count: 14 },
        ],
        totalVotes: 105,
        relatedOfferId: '7',
    },
    {
        id: 'p3',
        question: '또래 강사한테 배운다면 얼마까지 낼 수 있어요?',
        options: [
            { label: '1만원 이하', count: 38 },
            { label: '1~3만원', count: 71 },
            { label: '3만원 이상도 OK', count: 22 },
        ],
        totalVotes: 131,
    },
];
