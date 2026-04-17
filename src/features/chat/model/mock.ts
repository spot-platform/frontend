import { MOCK_SPOT_DETAILS } from '@/features/spot/model/mock';
import type {
    SharedFile,
    SpotParticipant,
    SpotVote,
} from '@/entities/spot/types';
import type {
    ChatFriend,
    ChatMessage,
    ChatReverseOfferSummary,
    ChatScheduleDraft,
    ChatRoom,
    PersonalChatRoom,
    SpotChatRoom,
} from './types';

export const CHAT_CURRENT_USER_ID = 'user-me';
export const CHAT_CURRENT_USER_NAME = '나';
export const DEFAULT_CHAT_ROOM_ID = 'personal-room-1';

const CHAT_DIRECTORY: ChatFriend[] = [
    {
        id: 'user-other',
        name: '초록이',
        role: 'PARTNER',
        presenceLabel: '오늘 저녁까지 응답 가능',
    },
    {
        id: 'user-milk',
        name: '우유빛',
        role: 'SUPPORTER',
        presenceLabel: '방금 접속함',
    },
    {
        id: 'user-yoga',
        name: '요가러버',
        role: 'PARTNER',
        presenceLabel: '오늘 오후에 답장 가능',
    },
    {
        id: 'user-run',
        name: '달리기왕',
        role: 'SUPPORTER',
        presenceLabel: '주말 아침에 자주 접속해요',
    },
    {
        id: 'user-note',
        name: '노트폴리오',
        role: 'PARTNER',
        presenceLabel: '평일 저녁에 답장이 빨라요',
    },
    {
        id: 'user-forest',
        name: '숲산책러',
        role: 'SUPPORTER',
        presenceLabel: '점심시간에 자주 확인해요',
    },
];

const CHAT_FRIEND_IDS = new Set([
    'user-other',
    'user-milk',
    'user-yoga',
    'user-run',
]);

const CHAT_FRIENDS = CHAT_DIRECTORY.filter((friend) =>
    CHAT_FRIEND_IDS.has(friend.id),
);

function createMessage(
    id: string,
    authorId: string,
    authorName: string,
    content: string,
    createdAt: string,
): ChatMessage {
    return {
        id,
        kind: 'message',
        authorId,
        authorName,
        content,
        createdAt,
    };
}

function createSystemMessage(
    id: string,
    content: string,
    createdAt: string,
): ChatMessage {
    return {
        id,
        kind: 'system',
        content,
        createdAt,
    };
}

function resolveParticipantByNickname(
    participants: SpotParticipant[],
    nickname: string,
): SpotParticipant | undefined {
    return participants.find(
        (participant) => participant.nickname === nickname,
    );
}

function createVoteThreadMessage(
    spot: SpotChatRoom['spot'],
    vote: SpotVote,
    createdAt: string,
): ChatMessage {
    return {
        id: `spot-${spot.id}-vote-${vote.id}`,
        kind: 'vote',
        authorId: spot.authorId,
        authorName: spot.authorNickname,
        vote,
        createdAt,
    };
}

function createScheduleThreadMessage(
    spot: SpotChatRoom['spot'],
    schedule: ChatScheduleDraft,
    createdAt: string,
): ChatMessage {
    return {
        id: `spot-${spot.id}-schedule-${schedule.id}`,
        kind: 'schedule',
        authorId: spot.authorId,
        authorName: spot.authorNickname,
        schedule,
        createdAt,
    };
}

function createFileThreadMessage(
    spot: SpotChatRoom['spot'],
    file: SharedFile,
): ChatMessage {
    const participant = resolveParticipantByNickname(
        spot.participants,
        file.uploaderNickname,
    );

    return {
        id: `spot-${spot.id}-file-${file.id}`,
        kind: 'file',
        authorId: participant?.userId ?? spot.authorId,
        authorName: file.uploaderNickname,
        file,
        createdAt: file.uploadedAt,
    };
}

function buildScheduleDraft(
    spot: SpotChatRoom['spot'],
): ChatScheduleDraft | null {
    if (!spot.schedule) {
        return null;
    }

    return {
        id: `${spot.id}-base-schedule`,
        spotId: spot.id,
        title: spot.schedule.confirmedSlot
            ? '확정된 일정'
            : '일정 후보 조율 중',
        description: spot.schedule.confirmedSlot
            ? `${spot.schedule.confirmedSlot.date} ${spot.schedule.confirmedSlot.hour}:00에 진행하기로 했어요.`
            : `${spot.schedule.proposedSlots.length}개의 일정 후보가 열려 있어요.`,
        metaLabel: spot.schedule.confirmedSlot
            ? '일정 확정'
            : `${spot.schedule.proposedSlots.length}개 후보`,
        createdAt: spot.updatedAt,
    };
}

function buildSpotThreadMessages(spot: SpotChatRoom['spot']): ChatMessage[] {
    const counterpart = spot.participants.find(
        (participant) => participant.userId !== CHAT_CURRENT_USER_ID,
    );

    const baseMessages: ChatMessage[] = [
        createSystemMessage(
            `spot-${spot.id}-system-1`,
            `${spot.title} 스팟 채팅이 열렸어요.`,
            spot.createdAt,
        ),
        createMessage(
            `spot-${spot.id}-message-1`,
            counterpart?.userId ?? spot.authorId,
            counterpart?.nickname ?? spot.authorNickname,
            spot.type === 'REQUEST'
                ? '안녕하세요. 여기서는 일정 얘기보다 필요한 준비만 가볍게 맞춰봐요.'
                : '채팅방으로 바로 이어졌네요. 필요한 내용만 편하게 남겨주세요.',
            new Date(
                new Date(spot.updatedAt).getTime() - 1000 * 60 * 40,
            ).toISOString(),
        ),
        createMessage(
            `spot-${spot.id}-message-2`,
            CHAT_CURRENT_USER_ID,
            CHAT_CURRENT_USER_NAME,
            spot.type === 'REQUEST'
                ? '좋아요. 이번 주 안에 준비물만 정리해두면 될 것 같아요.'
                : '확인했어요. 필요한 내용 생기면 바로 여기로 남길게요.',
            new Date(
                new Date(spot.updatedAt).getTime() - 1000 * 60 * 18,
            ).toISOString(),
        ),
    ];

    const scheduleDraft = buildScheduleDraft(spot);
    const threadItems: ChatMessage[] = [
        ...(scheduleDraft
            ? [
                  createScheduleThreadMessage(
                      spot,
                      scheduleDraft,
                      scheduleDraft.createdAt,
                  ),
              ]
            : []),
        ...spot.votes.map((vote, index) =>
            createVoteThreadMessage(
                spot,
                vote,
                new Date(
                    new Date(spot.updatedAt).getTime() -
                        1000 * 60 * (12 - index),
                ).toISOString(),
            ),
        ),
        ...spot.files.map((file) => createFileThreadMessage(spot, file)),
    ].sort(
        (left, right) =>
            new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime(),
    );

    return [
        ...baseMessages,
        ...threadItems,
        createSystemMessage(
            `spot-${spot.id}-system-2`,
            spot.status === 'MATCHED'
                ? '매칭된 스팟이라 대화가 더 자연스럽게 이어지고 있어요.'
                : '스팟 상태에 맞춰 대화를 편하게 이어갈 수 있어요.',
            spot.updatedAt,
        ),
    ].sort(
        (left, right) =>
            new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime(),
    );
}

function buildPersonalRooms(): PersonalChatRoom[] {
    return [
        {
            id: 'personal-room-1',
            category: 'personal',
            currentUserId: CHAT_CURRENT_USER_ID,
            currentUserName: CHAT_CURRENT_USER_NAME,
            partnerId: 'user-other',
            partnerName: '초록이',
            presenceLabel: '오늘 저녁까지 응답 가능',
            unreadCount: 2,
            counterpartRole: 'PARTNER',
            title: '초록이',
            subtitle: '개인 채팅',
            description:
                '가볍게 안부를 나누거나 스팟 밖에서 일정을 다시 맞춰볼 수 있어요.',
            metaLabel: '개인 대화 · 느긋하게 이어지는 대화',
            updatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
            messages: [
                createSystemMessage(
                    'personal-1-system-1',
                    '개인 채팅이 열렸어요.',
                    new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
                ),
                createMessage(
                    'personal-1-message-1',
                    'user-other',
                    '초록이',
                    '가드닝 끝나고 괜찮으시면 다음엔 허브 화분도 같이 볼까요?',
                    new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
                ),
                createMessage(
                    'personal-1-message-2',
                    CHAT_CURRENT_USER_ID,
                    CHAT_CURRENT_USER_NAME,
                    '좋아요. 이번엔 제가 필요한 도구도 미리 정리해둘게요.',
                    new Date(Date.now() - 1000 * 60 * 60 * 25.5).toISOString(),
                ),
                createMessage(
                    'personal-1-message-3',
                    'user-other',
                    '초록이',
                    '그럼 주말 전에 한번 더 메시지 드릴게요.',
                    new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                ),
            ],
        },
        {
            id: 'personal-room-2',
            category: 'personal',
            currentUserId: CHAT_CURRENT_USER_ID,
            currentUserName: CHAT_CURRENT_USER_NAME,
            partnerId: 'user-milk',
            partnerName: '우유빛',
            presenceLabel: '방금 접속함',
            unreadCount: 0,
            counterpartRole: 'SUPPORTER',
            title: '우유빛',
            subtitle: '개인 채팅',
            description:
                '지난 대화를 이어서 준비물이나 근황을 편하게 주고받는 공간이에요.',
            metaLabel: '개인 대화 · 빠르게 답장이 오는 편',
            updatedAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
            messages: [
                createSystemMessage(
                    'personal-2-system-1',
                    '연결된 이후 개인 메시지를 이어가고 있어요.',
                    new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                ),
                createMessage(
                    'personal-2-message-1',
                    'user-milk',
                    '우유빛',
                    '베이킹 클래스 후기 사진 봤어요. 분위기 너무 좋네요!',
                    new Date(Date.now() - 1000 * 60 * 35).toISOString(),
                ),
                createMessage(
                    'personal-2-message-2',
                    CHAT_CURRENT_USER_ID,
                    CHAT_CURRENT_USER_NAME,
                    '다음에는 도구 리스트 먼저 공유드릴게요. 훨씬 수월했어요.',
                    new Date(Date.now() - 1000 * 60 * 12).toISOString(),
                ),
            ],
        },
        {
            id: 'personal-room-3',
            category: 'personal',
            currentUserId: CHAT_CURRENT_USER_ID,
            currentUserName: CHAT_CURRENT_USER_NAME,
            partnerId: 'user-yoga',
            partnerName: '요가러버',
            presenceLabel: '오늘 오후에 답장 가능',
            unreadCount: 1,
            counterpartRole: 'PARTNER',
            title: '요가러버',
            subtitle: '개인 채팅',
            description:
                '요가 클래스 준비물과 모임 템포를 편하게 맞춰보는 개인 채팅이에요.',
            metaLabel: '개인 대화 · 일정 조율이 빠른 대화',
            updatedAt: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
            messages: [
                createSystemMessage(
                    'personal-3-system-1',
                    '매칭 이후 개인 대화로 이어지고 있어요.',
                    new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
                ),
                createMessage(
                    'personal-3-message-1',
                    'user-yoga',
                    '요가러버',
                    '다음 수업 전에 편한 복장만 챙겨오시면 될 것 같아요.',
                    new Date(Date.now() - 1000 * 60 * 80).toISOString(),
                ),
                createMessage(
                    'personal-3-message-2',
                    CHAT_CURRENT_USER_ID,
                    CHAT_CURRENT_USER_NAME,
                    '좋아요. 도착 시간은 수업 시작 10분 전으로 맞출게요.',
                    new Date(Date.now() - 1000 * 60 * 52).toISOString(),
                ),
            ],
        },
        {
            id: 'personal-room-4',
            category: 'personal',
            currentUserId: CHAT_CURRENT_USER_ID,
            currentUserName: CHAT_CURRENT_USER_NAME,
            partnerId: 'user-run',
            partnerName: '달리기왕',
            presenceLabel: '주말 아침에 자주 접속해요',
            unreadCount: 0,
            counterpartRole: 'SUPPORTER',
            title: '달리기왕',
            subtitle: '개인 채팅',
            description:
                '러닝 모임 전에 페이스와 집결 장소를 바로 조율할 수 있는 대화예요.',
            metaLabel: '개인 대화 · 활동 전 체크인이 잦은 대화',
            updatedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
            messages: [
                createSystemMessage(
                    'personal-4-system-1',
                    '개인 채팅으로 집결 안내를 이어갈 수 있어요.',
                    new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
                ),
                createMessage(
                    'personal-4-message-1',
                    'user-run',
                    '달리기왕',
                    '토요일엔 반포대교 쪽이 덜 붐벼서 거기서 시작해도 괜찮아요.',
                    new Date(Date.now() - 1000 * 60 * 170).toISOString(),
                ),
                createMessage(
                    'personal-4-message-2',
                    CHAT_CURRENT_USER_ID,
                    CHAT_CURRENT_USER_NAME,
                    '좋네요. 출발 전에 스트레칭 루틴도 같이 공유해주세요!',
                    new Date(Date.now() - 1000 * 60 * 140).toISOString(),
                ),
            ],
        },
    ];
}

function buildReverseOfferScenario(
    spot: SpotChatRoom['spot'],
    counterpart: SpotParticipant,
): {
    reverseOffer: ChatReverseOfferSummary;
    message: ChatMessage;
} | null {
    if (spot.id !== 'spot-3') {
        return null;
    }

    const createdAt = new Date(
        new Date(spot.updatedAt).getTime() - 1000 * 60 * 6,
    ).toISOString();

    const reverseOffer: ChatReverseOfferSummary = {
        id: `chat-reverse-offer-${spot.id}`,
        spotId: spot.id,
        authorId: counterpart.userId,
        status: 'PARTNER_REVIEW',
        approvedPartnerCount: 0,
        totalPartnerCount: 1,
        approverIds: [],
        priorAgreementReachedInChat: true,
        financialSnapshot: {
            sourceKind: 'estimated',
            targetAmount: spot.pointCost,
            agreedHeadcount: spot.participants.length,
            currentHeadcount: spot.participants.length,
            agreedPerPersonAmount: Math.floor(
                spot.pointCost / Math.max(spot.participants.length, 1),
            ),
            agreedRemainder:
                spot.pointCost % Math.max(spot.participants.length, 1),
            currentPerPersonAmount: Math.floor(
                spot.pointCost / Math.max(spot.participants.length, 1),
            ),
            currentRemainder:
                spot.pointCost % Math.max(spot.participants.length, 1),
            comparisonNeeded: false,
        },
        createdAt,
        updatedAt: createdAt,
    };

    const message: ChatMessage = {
        id: `spot-${spot.id}-reverse-offer`,
        kind: 'reverse-offer',
        authorId: counterpart.userId,
        authorName: counterpart.nickname,
        reverseOffer,
        createdAt,
    };

    return { reverseOffer, message };
}

function buildSpotRoom(spotId: string): SpotChatRoom | null {
    const spot = MOCK_SPOT_DETAILS[spotId];

    if (!spot) {
        return null;
    }

    const counterpart = spot.participants.find(
        (participant) => participant.userId !== CHAT_CURRENT_USER_ID,
    );

    if (!counterpart) {
        return null;
    }

    const baseMessages = buildSpotThreadMessages(spot);
    const reverseOfferScenario = buildReverseOfferScenario(spot, counterpart);
    const messages = reverseOfferScenario
        ? [...baseMessages, reverseOfferScenario.message].sort(
              (left, right) =>
                  new Date(left.createdAt).getTime() -
                  new Date(right.createdAt).getTime(),
          )
        : baseMessages;

    return {
        id: `spot-room-${spot.id}`,
        category: 'spot',
        currentUserId: CHAT_CURRENT_USER_ID,
        currentUserName: CHAT_CURRENT_USER_NAME,
        title: spot.title,
        subtitle: `${counterpart.nickname}님과 연결된 스팟 채팅`,
        description: spot.description,
        metaLabel: `${spot.participants.length}명 참여 · ${spot.pointCost.toLocaleString('ko-KR')}P`,
        updatedAt: spot.updatedAt,
        spot,
        reverseOffer: reverseOfferScenario?.reverseOffer,
        sourceFeedId: spot.type === 'OFFER' ? `feed-${spot.id}` : undefined,
        messages,
    };
}

export function getChatRooms(): ChatRoom[] {
    const spotRooms = Object.keys(MOCK_SPOT_DETAILS)
        .map((spotId) => buildSpotRoom(spotId))
        .filter((room): room is SpotChatRoom => room !== null);

    return [...buildPersonalRooms(), ...spotRooms].sort(
        (left, right) =>
            new Date(right.updatedAt).getTime() -
            new Date(left.updatedAt).getTime(),
    );
}

export function getChatFriends(): ChatFriend[] {
    return [...CHAT_FRIENDS];
}

export function getChatDirectoryCandidates(): ChatFriend[] {
    return [...CHAT_DIRECTORY];
}

export function getFriendById(friendId: string): ChatFriend | null {
    return CHAT_FRIENDS.find((friend) => friend.id === friendId) ?? null;
}

export function getChatDirectoryCandidateById(
    friendId: string,
): ChatFriend | null {
    return CHAT_DIRECTORY.find((friend) => friend.id === friendId) ?? null;
}

export function isSupporterForSpot(
    room: SpotChatRoom,
    userId: string = CHAT_CURRENT_USER_ID,
): boolean {
    return room.spot.type === 'OFFER'
        ? room.spot.authorId === userId
        : room.spot.authorId !== userId;
}
