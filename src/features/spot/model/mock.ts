import type {
    ChecklistItem,
    PagedResponse,
    ProgressNote,
    ScheduleSlot,
    SharedFile,
    Spot,
    SpotChecklist,
    SpotDetail,
    SpotDetailFull,
    SpotForfeitPool,
    SpotParticipant,
    SpotReview,
    SpotSchedule,
    SpotSettlementApproval,
    SpotStatus,
    SpotVote,
    SpotWorkflow,
    SubmitSettlementPayload,
    TimelineEventKind,
} from '@/entities/spot/types';

type SpotListParams = {
    type?: Spot['type'];
    status?: SpotStatus | SpotStatus[];
    participating?: boolean;
    page?: number;
    size?: number;
};

export type SpotWorkflowInboxIcon = 'vote' | 'approval' | 'settlement';

export type SpotWorkflowInboxItem = {
    spotId: string;
    label: string;
    description: string;
    icon: SpotWorkflowInboxIcon;
};

export const MOCK_MY_SPOTS: Spot[] = [
    {
        id: 'spot-6',
        type: 'OFFER',
        status: 'OPEN',
        title: '북클럽 독서 모임',
        description:
            '매주 한 권씩 읽고 함께 이야기를 나눠요. 진행 방식 투표 중이에요.',
        pointCost: 20000,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: 'spot-7',
        type: 'REQUEST',
        status: 'MATCHED',
        title: '주말 등산 파트너 모집',
        description:
            '북한산 코스를 함께 오를 파트너를 찾아요. 일정 조율 중이에요.',
        pointCost: 10000,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: 'spot-1',
        type: 'OFFER',
        status: 'OPEN',
        title: '베이킹 클래스 공동구매',
        description:
            '홍대 베이킹 스튜디오 클래스를 함께 신청해요. 할인율이 높아요!',
        pointCost: 84824,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
    {
        id: 'spot-4',
        type: 'OFFER',
        status: 'MATCHED',
        title: '요가 클래스 파트너 모집',
        description: '매주 화목 저녁 요가 클래스를 함께 다닐 분을 찾아요.',
        pointCost: 45000,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
    {
        id: 'spot-2',
        type: 'REQUEST',
        status: 'OPEN',
        title: '가드닝 파트너 모집',
        description: '주말 텃밭 가드닝 같이 하실 분 모집합니다.',
        pointCost: 30000,
        authorId: 'user-other',
        authorNickname: '초록이',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
        id: 'spot-5',
        type: 'REQUEST',
        status: 'MATCHED',
        title: '한강 러닝 크루 모집',
        description: '주말 아침 한강에서 함께 달릴 파트너를 찾아요.',
        pointCost: 15000,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
    {
        id: 'spot-3',
        type: 'OFFER',
        status: 'CLOSED',
        title: '홈카페 서포터 모집',
        description: '홈카페 세팅 도와드릴 서포터를 찾습니다.',
        pointCost: 50000,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 14,
        ).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
];

export const MOCK_SPOT_DETAILS: Record<string, SpotDetailFull> = {
    'spot-6': {
        id: 'spot-6',
        type: 'OFFER',
        status: 'OPEN',
        title: '북클럽 독서 모임',
        description:
            '매주 한 권씩 읽고 함께 이야기를 나눠요. 진행 방식 투표 중이에요.',
        pointCost: 20000,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        timeline: [
            {
                id: 'tl-6-1',
                kind: 'CREATED',
                actorId: 'user-me',
                actorNickname: '나',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 2,
                ).toISOString(),
            },
        ],
        participants: [
            {
                userId: 'user-me',
                nickname: '나',
                role: 'AUTHOR',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 2,
                ).toISOString(),
            },
            {
                userId: 'user-book1',
                nickname: '책벌레',
                role: 'PARTICIPANT',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 20,
                ).toISOString(),
            },
        ],
        schedule: undefined,
        votes: [
            {
                id: 'vote-6-1',
                spotId: 'spot-6',
                question: '독서 모임을 어떤 방식으로 진행할까요?',
                options: [
                    {
                        id: 'vote-6-opt-1',
                        label: '온라인 화상 미팅',
                        voterIds: ['user-me'],
                    },
                    {
                        id: 'vote-6-opt-2',
                        label: '카페 오프라인 모임',
                        voterIds: ['user-book1'],
                    },
                    {
                        id: 'vote-6-opt-3',
                        label: '격주 번갈아 진행',
                        voterIds: [],
                    },
                ],
                multiSelect: false,
            },
            {
                id: 'vote-6-2',
                spotId: 'spot-6',
                question: '첫 번째로 읽을 책은 무엇으로 할까요?',
                options: [
                    {
                        id: 'vote-6-2-opt-1',
                        label: '어린 왕자',
                        voterIds: ['user-book1'],
                    },
                    {
                        id: 'vote-6-2-opt-2',
                        label: '채식주의자',
                        voterIds: ['user-me'],
                    },
                ],
                multiSelect: false,
            },
        ],
        checklist: undefined,
        files: [
            {
                id: 'file-6-1',
                spotId: 'spot-6',
                uploaderNickname: '나',
                name: '독서모임_가이드.pdf',
                url: 'https://example.com/files/book-guide.pdf',
                sizeBytes: 72704,
                uploadedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 5,
                ).toISOString(),
            },
        ],
        notes: [],
        reviews: [],
    },
    'spot-7': {
        id: 'spot-7',
        type: 'REQUEST',
        status: 'MATCHED',
        title: '주말 등산 파트너 모집',
        description:
            '북한산 코스를 함께 오를 파트너를 찾아요. 일정 조율 중이에요.',
        pointCost: 10000,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        timeline: [
            {
                id: 'tl-7-1',
                kind: 'CREATED',
                actorId: 'user-me',
                actorNickname: '나',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 3,
                ).toISOString(),
            },
            {
                id: 'tl-7-2',
                kind: 'MATCHED',
                actorId: 'user-hiker',
                actorNickname: '산악인',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 1,
                ).toISOString(),
            },
        ],
        participants: [
            {
                userId: 'user-me',
                nickname: '나',
                role: 'AUTHOR',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 3,
                ).toISOString(),
            },
            {
                userId: 'user-hiker',
                nickname: '산악인',
                role: 'PARTICIPANT',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 1,
                ).toISOString(),
            },
        ],
        schedule: {
            spotId: 'spot-7',
            proposedSlots: [
                {
                    date: '2026-04-12',
                    hour: 7,
                    availableUserIds: ['user-me'],
                },
                {
                    date: '2026-04-12',
                    hour: 9,
                    availableUserIds: ['user-hiker'],
                },
                {
                    date: '2026-04-13',
                    hour: 7,
                    availableUserIds: ['user-me', 'user-hiker'],
                },
                {
                    date: '2026-04-13',
                    hour: 9,
                    availableUserIds: ['user-me'],
                },
                {
                    date: '2026-04-19',
                    hour: 8,
                    availableUserIds: ['user-hiker'],
                },
                {
                    date: '2026-04-20',
                    hour: 7,
                    availableUserIds: ['user-me', 'user-hiker'],
                },
            ],
        },
        votes: [],
        checklist: {
            spotId: 'spot-7',
            items: [
                { id: 'cl-7-1', text: '등산로 코스 확정', completed: false },
                { id: 'cl-7-2', text: '준비물 목록 공유', completed: false },
            ],
        },
        files: [],
        notes: [],
        reviews: [],
    },
    'spot-4': {
        id: 'spot-4',
        type: 'OFFER',
        status: 'MATCHED',
        title: '요가 클래스 파트너 모집',
        description: '매주 화목 저녁 요가 클래스를 함께 다닐 분을 찾아요.',
        pointCost: 45000,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        timeline: [
            {
                id: 'tl-1',
                kind: 'CREATED',
                actorId: 'user-me',
                actorNickname: '나',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 5,
                ).toISOString(),
            },
            {
                id: 'tl-2',
                kind: 'MATCHED',
                actorId: 'user-yoga',
                actorNickname: '요가러버',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 1,
                ).toISOString(),
            },
        ],
        participants: [
            {
                userId: 'user-me',
                nickname: '나',
                role: 'AUTHOR',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 5,
                ).toISOString(),
            },
            {
                userId: 'user-yoga',
                nickname: '요가러버',
                role: 'PARTICIPANT',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 1,
                ).toISOString(),
            },
        ],
        schedule: {
            spotId: 'spot-4',
            proposedSlots: [
                {
                    date: '2026-04-10',
                    hour: 19,
                    availableUserIds: ['user-me', 'user-yoga'],
                },
            ],
            confirmedSlot: {
                date: '2026-04-10',
                hour: 19,
                availableUserIds: ['user-me', 'user-yoga'],
            },
        },
        votes: [],
        checklist: {
            spotId: 'spot-4',
            items: [
                {
                    id: 'cl-1',
                    text: '요가매트 지참',
                    completed: true,
                    assigneeId: 'user-me',
                    assigneeNickname: '나',
                },
                {
                    id: 'cl-2',
                    text: '수강 등록 완료',
                    completed: false,
                    assigneeId: 'user-yoga',
                    assigneeNickname: '요가러버',
                },
            ],
        },
        files: [],
        notes: [],
        reviews: [],
    },
    'spot-5': {
        id: 'spot-5',
        type: 'REQUEST',
        status: 'MATCHED',
        title: '한강 러닝 크루 모집',
        description: '주말 아침 한강에서 함께 달릴 파트너를 찾아요.',
        pointCost: 15000,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        timeline: [
            {
                id: 'tl-1',
                kind: 'CREATED',
                actorId: 'user-me',
                actorNickname: '나',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 4,
                ).toISOString(),
            },
            {
                id: 'tl-2',
                kind: 'MATCHED',
                actorId: 'user-run',
                actorNickname: '달리기왕',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 1,
                ).toISOString(),
            },
        ],
        participants: [
            {
                userId: 'user-me',
                nickname: '나',
                role: 'AUTHOR',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 4,
                ).toISOString(),
            },
            {
                userId: 'user-run',
                nickname: '달리기왕',
                role: 'PARTICIPANT',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 1,
                ).toISOString(),
            },
            {
                userId: 'user-run2',
                nickname: '새벽런너',
                role: 'PARTICIPANT',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 12,
                ).toISOString(),
            },
        ],
        schedule: {
            spotId: 'spot-5',
            proposedSlots: [
                {
                    date: '2026-04-13',
                    hour: 7,
                    availableUserIds: ['user-me', 'user-run', 'user-run2'],
                },
            ],
            confirmedSlot: {
                date: '2026-04-13',
                hour: 7,
                availableUserIds: ['user-me', 'user-run', 'user-run2'],
            },
        },
        votes: [],
        checklist: {
            spotId: 'spot-5',
            items: [
                { id: 'cl-1', text: '집결 장소 공유', completed: true },
                { id: 'cl-2', text: '준비 운동 루틴 공유', completed: false },
            ],
        },
        files: [],
        notes: [],
        reviews: [],
    },
    'spot-1': {
        id: 'spot-1',
        type: 'OFFER',
        status: 'OPEN',
        title: '베이킹 클래스 공동구매',
        description:
            '홍대 베이킹 스튜디오 클래스를 함께 신청해요. 할인율이 높아요!',
        pointCost: 84824,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        timeline: [
            {
                id: 'tl-1',
                kind: 'CREATED',
                actorId: 'user-me',
                actorNickname: '나',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 3,
                ).toISOString(),
            },
        ],
        participants: [
            {
                userId: 'user-me',
                nickname: '나',
                role: 'AUTHOR',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 3,
                ).toISOString(),
            },
        ],
        schedule: {
            spotId: 'spot-1',
            proposedSlots: [
                {
                    date: '2026-04-12',
                    hour: 14,
                    availableUserIds: ['user-me'],
                },
                {
                    date: '2026-04-13',
                    hour: 10,
                    availableUserIds: ['user-me'],
                },
            ],
        },
        votes: [
            {
                id: 'vote-1',
                spotId: 'spot-1',
                question: '어떤 코스 신청할까요?',
                options: [
                    {
                        id: 'opt-1',
                        label: '마카롱 입문',
                        voterIds: ['user-me'],
                    },
                    { id: 'opt-2', label: '케이크 기초', voterIds: [] },
                    { id: 'opt-3', label: '브레드 클래스', voterIds: [] },
                ],
                multiSelect: false,
            },
        ],
        checklist: {
            spotId: 'spot-1',
            items: [
                {
                    id: 'cl-1',
                    text: '수강 신청 링크 공유',
                    completed: false,
                    assigneeId: 'user-me',
                    assigneeNickname: '나',
                },
                { id: 'cl-2', text: '결제 방법 확인', completed: false },
            ],
        },
        files: [],
        notes: [
            {
                id: 'note-1',
                spotId: 'spot-1',
                authorNickname: '나',
                content:
                    '수강 신청 마감이 4/15이에요. 빨리 파트너 구해야 할 것 같아요.',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 2,
                ).toISOString(),
            },
        ],
        reviews: [],
    },
    'spot-2': {
        id: 'spot-2',
        type: 'REQUEST',
        status: 'MATCHED',
        title: '가드닝 파트너 모집',
        description: '주말 텃밭 가드닝 같이 하실 분 모집합니다.',
        pointCost: 30000,
        authorId: 'user-other',
        authorNickname: '초록이',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        timeline: [
            {
                id: 'tl-1',
                kind: 'CREATED',
                actorId: 'user-other',
                actorNickname: '초록이',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 7,
                ).toISOString(),
            },
            {
                id: 'tl-2',
                kind: 'MATCHED',
                actorId: 'user-me',
                actorNickname: '나',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 2,
                ).toISOString(),
            },
        ],
        participants: [
            {
                userId: 'user-other',
                nickname: '초록이',
                role: 'AUTHOR',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 7,
                ).toISOString(),
            },
            {
                userId: 'user-me',
                nickname: '나',
                role: 'PARTICIPANT',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 2,
                ).toISOString(),
            },
        ],
        schedule: {
            spotId: 'spot-2',
            proposedSlots: [
                {
                    date: '2026-04-19',
                    hour: 9,
                    availableUserIds: ['user-me', 'user-other'],
                },
            ],
            confirmedSlot: {
                date: '2026-04-19',
                hour: 9,
                availableUserIds: ['user-me', 'user-other'],
            },
        },
        votes: [],
        checklist: {
            spotId: 'spot-2',
            items: [
                {
                    id: 'cl-1',
                    text: '모종 준비',
                    completed: true,
                    assigneeId: 'user-other',
                    assigneeNickname: '초록이',
                },
                {
                    id: 'cl-2',
                    text: '장갑 및 삽 지참',
                    completed: false,
                    assigneeId: 'user-me',
                    assigneeNickname: '나',
                },
                {
                    id: 'cl-3',
                    text: '텃밭 위치 공유',
                    completed: true,
                    assigneeId: 'user-other',
                    assigneeNickname: '초록이',
                },
            ],
        },
        files: [
            {
                id: 'file-1',
                spotId: 'spot-2',
                uploaderNickname: '초록이',
                name: '텃밭_위치.png',
                url: 'https://example.com/files/map.png',
                sizeBytes: 204800,
                uploadedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24,
                ).toISOString(),
            },
            {
                id: 'file-2',
                spotId: 'spot-2',
                uploaderNickname: '나',
                name: '씨앗_구매_리스트.pdf',
                url: 'https://example.com/files/seeds.pdf',
                sizeBytes: 98432,
                uploadedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 18,
                ).toISOString(),
            },
            {
                id: 'file-3',
                spotId: 'spot-2',
                uploaderNickname: '초록이',
                name: '주말_작업복.jpg',
                url: 'https://example.com/files/outfit.jpg',
                sizeBytes: 188743,
                uploadedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 9,
                ).toISOString(),
            },
        ],
        notes: [],
        reviews: [],
    },
    'spot-3': {
        id: 'spot-3',
        type: 'OFFER',
        status: 'CLOSED',
        title: '홈카페 서포터 모집',
        description: '홈카페 세팅 도와드릴 서포터를 찾습니다.',
        pointCost: 50000,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 14,
        ).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        timeline: [
            {
                id: 'tl-1',
                kind: 'CREATED',
                actorId: 'user-me',
                actorNickname: '나',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 14,
                ).toISOString(),
            },
            {
                id: 'tl-2',
                kind: 'MATCHED',
                actorId: 'user-partner',
                actorNickname: '커피러버',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 10,
                ).toISOString(),
            },
            {
                id: 'tl-3',
                kind: 'COMPLETED',
                actorId: 'user-me',
                actorNickname: '나',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 5,
                ).toISOString(),
            },
        ],
        participants: [
            {
                userId: 'user-me',
                nickname: '나',
                role: 'AUTHOR',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 14,
                ).toISOString(),
            },
            {
                userId: 'user-partner',
                nickname: '커피러버',
                role: 'PARTICIPANT',
                joinedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 10,
                ).toISOString(),
            },
        ],
        schedule: undefined,
        votes: [],
        checklist: undefined,
        files: [
            {
                id: 'file-4',
                spotId: 'spot-3',
                uploaderNickname: '커피러버',
                name: '원두_브리핑.png',
                url: 'https://example.com/files/beans.png',
                sizeBytes: 245760,
                uploadedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 8,
                ).toISOString(),
            },
            {
                id: 'file-5',
                spotId: 'spot-3',
                uploaderNickname: '나',
                name: '세팅_체크리스트.docx',
                url: 'https://example.com/files/setup.docx',
                sizeBytes: 54272,
                uploadedAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 9,
                ).toISOString(),
            },
        ],
        notes: [],
        reviews: [
            {
                id: 'review-1',
                spotId: 'spot-3',
                reviewerNickname: '나',
                targetNickname: '커피러버',
                rating: 5,
                comment: '정말 친절하고 꼼꼼하게 도와주셨어요!',
                createdAt: new Date(
                    Date.now() - 1000 * 60 * 60 * 24 * 4,
                ).toISOString(),
            },
        ],
    },
};

export const MOCK_SPOT_WORKFLOWS: Record<string, SpotWorkflow> = {
    'spot-1': {
        spotId: 'spot-1',
        progressLabel: '파트너 투표 진행 중',
        voteSummary: {
            question: '어떤 클래스를 먼저 열까요?',
            totalVotes: 5,
            consensusRate: 60,
            decidedLabel: '마카롱 입문',
            summary:
                '공동구매 참여자 공지가 바로 이어질 수 있도록 입문 코스가 우세합니다.',
            options: [
                { label: '마카롱 입문', count: 3, isWinner: true },
                { label: '케이크 기초', count: 2 },
                { label: '브레드 클래스', count: 0 },
            ],
        },
        finalApproval: {
            status: 'PENDING',
            approverNickname: '나',
            note: '투표 확정 후 참가 공지 문구와 결제 일정만 확인하면 최종 승인할 수 있어요.',
        },
        settlementApproval: {
            status: 'PENDING',
            requestedAmount: 84824,
            approvedAmount: 0,
            summary:
                '정산 자료는 아직 제출 전이에요. 클래스 결제 확정 후 승인 단계가 열립니다.',
            lineItems: [
                { label: '클래스 결제 예정', amount: 70000 },
                { label: '준비물 공동 구매', amount: 14824 },
            ],
        },
    },
    'spot-2': {
        spotId: 'spot-2',
        progressLabel: '호스트 최종 승인 대기',
        voteSummary: {
            question: '첫 활동은 어떤 방식으로 운영할까요?',
            totalVotes: 4,
            consensusRate: 75,
            decidedLabel: '주말 오전 현장 모임',
            summary:
                '참여자 대부분이 현장 모임을 선택해 일정과 준비물 공지를 확정할 수 있어요.',
            options: [
                { label: '주말 오전 현장 모임', count: 3, isWinner: true },
                { label: '평일 저녁 온라인 설명회', count: 1 },
            ],
        },
        finalApproval: {
            status: 'PENDING',
            approverNickname: '초록이',
            note: '투표 결과와 체크리스트 준비 상태는 충분해요. 호스트 확인만 끝나면 실행 상태로 전환됩니다.',
        },
        settlementApproval: {
            status: 'PENDING',
            requestedAmount: 30000,
            approvedAmount: 0,
            summary:
                '활동 완료 후 제출될 교통비/재료비 정산을 기다리는 중입니다.',
            lineItems: [
                { label: '모종/재료비 예상', amount: 22000 },
                { label: '현장 준비물', amount: 8000 },
            ],
        },
    },
    'spot-3': {
        spotId: 'spot-3',
        progressLabel: '정산 승인 완료',
        voteSummary: {
            question: '후기 공개 범위를 어떻게 할까요?',
            totalVotes: 6,
            consensusRate: 67,
            decidedLabel: '피드 요약 공개',
            summary:
                '후기를 요약 형태로 공개해 다음 모집 전환에 활용하기로 합의했어요.',
            options: [
                { label: '피드 요약 공개', count: 4, isWinner: true },
                { label: '참여자에게만 공유', count: 2 },
            ],
        },
        finalApproval: {
            status: 'APPROVED',
            approverNickname: '나',
            approvedAt: '2026-04-01T09:30:00.000Z',
            note: '모든 결과물 검수를 마쳤고 후기 공개 범위도 확정돼 활동 종료를 승인했어요.',
        },
        settlementApproval: {
            status: 'APPROVED',
            requestedAmount: 50000,
            approvedAmount: 48200,
            summary:
                '증빙 확인 후 소모품 일부만 조정해 최종 정산 승인을 완료했습니다.',
            lineItems: [
                { label: '원두/소모품', amount: 31200 },
                { label: '테이블 세팅 소품', amount: 17000 },
            ],
        },
    },
};

export function normalizeMockSpotId(id: string) {
    if (MOCK_SPOT_DETAILS[id] || MOCK_MY_SPOTS.some((spot) => spot.id === id)) {
        return id;
    }

    const prefixedId = `spot-${id}`;
    if (
        MOCK_SPOT_DETAILS[prefixedId] ||
        MOCK_MY_SPOTS.some((spot) => spot.id === prefixedId)
    ) {
        return prefixedId;
    }

    return id;
}

export function getMockSpotById(id: string) {
    const normalizedId = normalizeMockSpotId(id);
    return MOCK_MY_SPOTS.find((spot) => spot.id === normalizedId);
}

export function getMockSpotDetailById(id: string) {
    const normalizedId = normalizeMockSpotId(id);
    return MOCK_SPOT_DETAILS[normalizedId];
}

export function hasMockSpot(id: string) {
    return Boolean(getMockSpotDetailById(id) ?? getMockSpotById(id));
}

export function getSpotWorkflowInboxItems(): SpotWorkflowInboxItem[] {
    return Object.values(MOCK_SPOT_WORKFLOWS)
        .map((workflow) => {
            const spot =
                MOCK_SPOT_DETAILS[workflow.spotId] ??
                getMockSpotById(workflow.spotId);

            if (!spot) {
                return null;
            }

            if (workflow.finalApproval?.status === 'PENDING') {
                return {
                    spotId: workflow.spotId,
                    label: '호스트 최종 승인 대기',
                    description: spot.title,
                    icon: 'approval' as const,
                };
            }

            if (workflow.settlementApproval) {
                return {
                    spotId: workflow.spotId,
                    label:
                        workflow.settlementApproval.status === 'APPROVED'
                            ? '정산 승인 완료'
                            : '정산 검토 필요',
                    description: spot.title,
                    icon: 'settlement' as const,
                };
            }

            if (workflow.voteSummary) {
                return {
                    spotId: workflow.spotId,
                    label: '투표 요약 확인',
                    description: spot.title,
                    icon: 'vote' as const,
                };
            }

            return {
                spotId: workflow.spotId,
                label: workflow.progressLabel,
                description: spot.title,
                icon: 'approval' as const,
            };
        })
        .filter((item): item is SpotWorkflowInboxItem => item !== null);
}

function clone<T>(value: T): T {
    return structuredClone(value);
}

function now() {
    return new Date().toISOString();
}

function toSpotSummary(detail: SpotDetailFull): Spot {
    return {
        id: detail.id,
        type: detail.type,
        status: detail.status,
        title: detail.title,
        description: detail.description,
        pointCost: detail.pointCost,
        authorId: detail.authorId,
        authorNickname: detail.authorNickname,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
        forfeitPool: detail.forfeitPool,
    };
}

function ensureMockSpotSummary(detail: SpotDetailFull) {
    const nextSummary = toSpotSummary(detail);
    const currentIndex = MOCK_MY_SPOTS.findIndex(
        (spot) => spot.id === detail.id,
    );

    if (currentIndex >= 0) {
        MOCK_MY_SPOTS[currentIndex] = nextSummary;
        return;
    }

    MOCK_MY_SPOTS.unshift(nextSummary);
}

function ensureMockSpotDetail(id: string): SpotDetailFull {
    const normalizedId = normalizeMockSpotId(id);
    const existing = MOCK_SPOT_DETAILS[normalizedId];

    if (existing) {
        if (!existing.forfeitPool) {
            existing.forfeitPool = { toPool: 0, toPlatformFee: 0 };
        }
        return existing;
    }

    const summary = getMockSpotById(normalizedId);

    if (!summary) {
        throw new Error(`Mock spot not found: ${id}`);
    }

    const detail: SpotDetailFull = {
        ...clone(summary),
        forfeitPool: summary.forfeitPool ?? { toPool: 0, toPlatformFee: 0 },
        timeline: [],
        participants: [
            {
                userId: summary.authorId,
                nickname: summary.authorNickname,
                role: 'AUTHOR',
                joinedAt: summary.createdAt,
            },
        ],
        schedule: undefined,
        votes: [],
        checklist: undefined,
        files: [],
        notes: [],
        reviews: [],
    };

    MOCK_SPOT_DETAILS[normalizedId] = detail;
    ensureMockSpotSummary(detail);
    return detail;
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

function createTimelineEvent(
    detail: SpotDetailFull,
    kind: TimelineEventKind,
    extras?: { content?: string },
) {
    detail.timeline.unshift({
        id: `timeline-${detail.id}-${Date.now()}`,
        kind,
        actorId: 'user-me',
        actorNickname: '나',
        content: extras?.content,
        createdAt: detail.updatedAt,
    });
}

function statusToTimelineKind(status: SpotStatus): TimelineEventKind {
    switch (status) {
        case 'MATCHED':
            return 'MATCHED';
        case 'CLOSED':
            return 'COMPLETED';
        case 'CANCELLED':
            return 'CANCELLED';
        default:
            return 'CREATED';
    }
}

function updateSpotStatus(id: string, status: SpotStatus): Spot {
    const detail = ensureMockSpotDetail(id);
    detail.status = status;
    detail.updatedAt = now();

    if (
        status === 'MATCHED' &&
        !detail.participants.some(
            (participant) => participant.userId !== 'user-me',
        )
    ) {
        detail.participants.push({
            userId: 'user-mock-partner',
            nickname: '새 파트너',
            role: 'PARTICIPANT',
            joinedAt: detail.updatedAt,
        });
    }

    createTimelineEvent(detail, statusToTimelineKind(status));
    ensureMockSpotSummary(detail);
    return clone(toSpotSummary(detail));
}

export function listMockSpots(params?: SpotListParams): PagedResponse<Spot> {
    let spots = [...MOCK_MY_SPOTS].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
    );

    if (params?.type) {
        spots = spots.filter((spot) => spot.type === params.type);
    }

    if (params?.status) {
        const statuses = Array.isArray(params.status)
            ? params.status
            : [params.status];
        spots = spots.filter((spot) => statuses.includes(spot.status));
    }

    if (params?.participating) {
        spots = spots.filter((spot) => {
            const detail = MOCK_SPOT_DETAILS[spot.id];
            return (
                spot.authorId === 'user-me' ||
                detail?.participants.some(
                    (participant) => participant.userId === 'user-me',
                )
            );
        });
    }

    return paginate(spots, params);
}

export function getMockSpotDetail(id: string): { data: SpotDetail } {
    const detail = ensureMockSpotDetail(id);
    return { data: clone({ ...detail, timeline: detail.timeline }) };
}

export function getMockSpotParticipants(id: string): {
    data: SpotParticipant[];
} {
    return { data: clone(ensureMockSpotDetail(id).participants) };
}

export function getMockSpotSchedule(id: string): { data: SpotSchedule | null } {
    return { data: clone(ensureMockSpotDetail(id).schedule ?? null) };
}

export function getMockSpotVotes(id: string): { data: SpotVote[] } {
    return { data: clone(ensureMockSpotDetail(id).votes) };
}

export function getMockSpotChecklist(id: string): {
    data: SpotChecklist | null;
} {
    return { data: clone(ensureMockSpotDetail(id).checklist ?? null) };
}

export function getMockSpotFiles(id: string): { data: SharedFile[] } {
    return { data: clone(ensureMockSpotDetail(id).files) };
}

export function getMockSpotNotes(id: string): { data: ProgressNote[] } {
    return { data: clone(ensureMockSpotDetail(id).notes) };
}

export function getMockSpotReviews(id: string): { data: SpotReview[] } {
    return { data: clone(ensureMockSpotDetail(id).reviews) };
}

export function createMockSpot(payload: {
    type: Spot['type'];
    title: string;
    description: string;
    pointCost: number;
}): { data: Spot } {
    const createdAt = now();
    const detail: SpotDetailFull = {
        id: `spot-${Date.now()}`,
        type: payload.type,
        status: 'OPEN',
        title: payload.title,
        description: payload.description,
        pointCost: payload.pointCost,
        authorId: 'user-me',
        authorNickname: '나',
        createdAt,
        updatedAt: createdAt,
        timeline: [
            {
                id: `timeline-${Date.now()}`,
                kind: 'CREATED',
                actorId: 'user-me',
                actorNickname: '나',
                createdAt,
            },
        ],
        participants: [
            {
                userId: 'user-me',
                nickname: '나',
                role: 'AUTHOR',
                joinedAt: createdAt,
            },
        ],
        schedule: undefined,
        votes: [],
        checklist: undefined,
        files: [],
        notes: [],
        reviews: [],
    };

    MOCK_SPOT_DETAILS[detail.id] = detail;
    ensureMockSpotSummary(detail);
    return { data: clone(toSpotSummary(detail)) };
}

export function matchMockSpot(id: string): { data: Spot } {
    return { data: updateSpotStatus(id, 'MATCHED') };
}

export function cancelMockSpot(id: string): { data: Spot } {
    return { data: updateSpotStatus(id, 'CANCELLED') };
}

export function completeMockSpot(id: string): { data: Spot } {
    return { data: updateSpotStatus(id, 'CLOSED') };
}

export function upsertMockSpotSchedule(
    id: string,
    slots: ScheduleSlot[],
): { data: SpotSchedule } {
    const detail = ensureMockSpotDetail(id);
    detail.updatedAt = now();
    detail.schedule = {
        spotId: detail.id,
        proposedSlots: clone(slots),
        confirmedSlot: detail.schedule?.confirmedSlot,
    };
    ensureMockSpotSummary(detail);

    return { data: clone(detail.schedule) };
}

export function createMockSpotVote(
    id: string,
    payload: { question: string; options: string[]; multiSelect?: boolean },
): { data: SpotVote } {
    const detail = ensureMockSpotDetail(id);
    detail.updatedAt = now();
    const vote: SpotVote = {
        id: `vote-${Date.now()}`,
        spotId: detail.id,
        question: payload.question,
        options: payload.options.map((label, index) => ({
            id: `vote-option-${Date.now()}-${index}`,
            label,
            voterIds: [],
        })),
        multiSelect: Boolean(payload.multiSelect),
    };
    detail.votes.unshift(vote);
    ensureMockSpotSummary(detail);

    return { data: clone(vote) };
}

export function castMockSpotVote(
    id: string,
    voteId: string,
    optionIds: string[],
): { data: SpotVote } {
    const detail = ensureMockSpotDetail(id);
    const vote = detail.votes.find((item) => item.id === voteId);

    if (!vote) {
        throw new Error('투표 정보를 찾을 수 없어요.');
    }

    vote.options = vote.options.map((option) => {
        const nextVoterIds = option.voterIds.filter(
            (userId) => userId !== 'user-me',
        );

        if (optionIds.includes(option.id)) {
            nextVoterIds.push('user-me');
        }

        return {
            ...option,
            voterIds: nextVoterIds,
        };
    });

    detail.updatedAt = now();
    ensureMockSpotSummary(detail);
    return { data: clone(vote) };
}

export function upsertMockSpotChecklist(
    id: string,
    items: ChecklistItem[],
): { data: SpotChecklist } {
    const detail = ensureMockSpotDetail(id);
    detail.updatedAt = now();
    detail.checklist = {
        spotId: detail.id,
        items: clone(items),
    };
    ensureMockSpotSummary(detail);

    return { data: clone(detail.checklist) };
}

export function deleteMockSpotFile(id: string, fileId: string): void {
    const detail = ensureMockSpotDetail(id);
    detail.files = detail.files.filter((file) => file.id !== fileId);
    detail.updatedAt = now();
    ensureMockSpotSummary(detail);
}

export function createMockSpotNote(
    id: string,
    content: string,
): { data: ProgressNote } {
    const detail = ensureMockSpotDetail(id);
    detail.updatedAt = now();
    const note: ProgressNote = {
        id: `note-${Date.now()}`,
        spotId: detail.id,
        authorNickname: '나',
        content,
        createdAt: detail.updatedAt,
    };
    detail.notes.push(note);
    ensureMockSpotSummary(detail);

    return { data: clone(note) };
}

export function submitMockSpotReview(
    id: string,
    payload: {
        targetNickname: string;
        rating: 1 | 2 | 3 | 4 | 5;
        comment?: string;
    },
): { data: SpotReview } {
    const detail = ensureMockSpotDetail(id);
    detail.updatedAt = now();
    const review: SpotReview = {
        id: `review-${Date.now()}`,
        spotId: detail.id,
        reviewerNickname: '나',
        targetNickname: payload.targetNickname,
        rating: payload.rating,
        comment: payload.comment,
        createdAt: detail.updatedAt,
    };
    detail.reviews.unshift(review);
    ensureMockSpotSummary(detail);

    return { data: clone(review) };
}

export function addSpotForfeitPool(
    spotId: string,
    amounts: { toPool: number; toPlatformFee: number },
): { data: SpotForfeitPool } {
    const detail = ensureMockSpotDetail(spotId);
    const current = detail.forfeitPool ?? { toPool: 0, toPlatformFee: 0 };
    detail.forfeitPool = {
        toPool: current.toPool + Math.max(0, amounts.toPool),
        toPlatformFee:
            current.toPlatformFee + Math.max(0, amounts.toPlatformFee),
    };
    detail.updatedAt = now();
    ensureMockSpotSummary(detail);
    return { data: clone(detail.forfeitPool) };
}

function sumLineItems(payload: SubmitSettlementPayload): number {
    return payload.lineItems.reduce(
        (total, item) => total + Math.max(0, Math.round(item.amount)),
        0,
    );
}

export function submitMockSpotSettlement(
    spotId: string,
    payload: SubmitSettlementPayload,
): { data: SpotSettlementApproval } {
    const detail = ensureMockSpotDetail(spotId);
    if (detail.status !== 'CLOSED') {
        throw new Error('정산은 스팟이 종료된 후에만 제출할 수 있어요.');
    }

    const requestedAmount = sumLineItems(payload);
    const submittedAt = now();
    const approval: SpotSettlementApproval = {
        status: 'PENDING',
        requestedAmount,
        approvedAmount: 0,
        summary: payload.summary,
        lineItems: clone(payload.lineItems),
        submittedBy: 'user-me',
        submittedAt,
    };

    const workflow = MOCK_SPOT_WORKFLOWS[detail.id] ?? {
        spotId: detail.id,
        progressLabel: '정산 제출됨',
    };
    MOCK_SPOT_WORKFLOWS[detail.id] = {
        ...workflow,
        settlementApproval: approval,
    };

    detail.updatedAt = submittedAt;
    createTimelineEvent(detail, 'SETTLEMENT_REQUESTED', {
        content: `정산 ${requestedAmount.toLocaleString('ko-KR')}P 제출`,
    });
    ensureMockSpotSummary(detail);

    return { data: clone(approval) };
}

export function approveMockSpotSettlement(spotId: string): {
    data: SpotSettlementApproval;
} {
    const detail = ensureMockSpotDetail(spotId);
    const workflow = MOCK_SPOT_WORKFLOWS[detail.id];
    const current = workflow?.settlementApproval;
    if (!current || current.status !== 'PENDING') {
        throw new Error('승인 가능한 정산 요청이 없습니다.');
    }

    const approvedAt = now();
    const approved: SpotSettlementApproval = {
        ...current,
        status: 'APPROVED',
        approvedAmount:
            current.requestedAmount + (detail.forfeitPool?.toPool ?? 0),
        approvedBy: 'user-me',
        approvedAt,
    };
    MOCK_SPOT_WORKFLOWS[detail.id] = {
        ...workflow,
        settlementApproval: approved,
    };

    detail.updatedAt = approvedAt;
    createTimelineEvent(detail, 'SETTLEMENT_APPROVED', {
        content: `정산 ${approved.approvedAmount.toLocaleString('ko-KR')}P 승인`,
    });
    ensureMockSpotSummary(detail);

    return { data: clone(approved) };
}
