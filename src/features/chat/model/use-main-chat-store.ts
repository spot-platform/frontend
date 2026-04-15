'use client';

import { create } from 'zustand';
import type { SpotDetailFull } from '@/entities/spot/types';
import type { SharedFile, SpotVote } from '@/entities/spot/types';
import {
    CHAT_CURRENT_USER_ID,
    CHAT_CURRENT_USER_NAME,
    getChatDirectoryCandidateById,
    getChatFriends,
    getChatRooms,
} from './mock';
import type {
    ChatFriend,
    ChatMessage,
    ChatReverseOfferFinancialSnapshot,
    ChatReverseOfferSummary,
    ChatRouteIntent,
    ChatRoom,
    ChatScheduleDraft,
    MainChatPersonalFilter,
    MainChatTeamFilter,
    PersonalChatRoom,
    ResolvedChatRoom,
    SpotChatRoom,
} from './types';
import type { FeedItem } from '@/features/feed/model/types';
import type { FeedParticipationRole } from '@/features/feed/model/participation';
import {
    resolveReverseOfferFinancialSummary,
    toReverseOfferFinancialSnapshot,
} from './reverse-offer-finance';

export const PERSONAL_CHAT_CONTEXT_ID = 'personal';

type MainChatState = {
    rooms: ChatRoom[];
    friends: ReturnType<typeof getChatFriends>;
    selectedContextId: string;
    personalFilter: MainChatPersonalFilter;
    teamFilter: MainChatTeamFilter;
    selectedFriendId: string | null;
    setSelectedContextId: (contextId: string) => void;
    setPersonalFilter: (filter: MainChatPersonalFilter) => void;
    setTeamFilter: (filter: MainChatTeamFilter) => void;
    setSelectedFriendId: (friendId: string | null) => void;
    addFriendById: (friendId: string) => ChatFriend | null;
    createPersonalRoom: () => PersonalChatRoom | null;
    createTeamVote: (
        question?: string,
        options?: string[],
        multiSelect?: boolean,
    ) => SpotChatRoom | null;
    createTeamScheduleVote: () => SpotChatRoom | null;
    createTeamFileShare: (
        fileName?: string,
        fileSize?: number,
    ) => SpotChatRoom | null;
    createTeamReverseOffer: (
        priorAgreementReachedInChat: boolean,
    ) => SpotChatRoom | null;
    approveReverseOffer: (roomId: string) => SpotChatRoom | null;
    updateSpotSchedule: (
        roomId: string,
        slots: import('@/entities/spot/types').ScheduleSlot[],
    ) => void;
    applyRouteIntent: (intent: ChatRouteIntent) => ResolvedChatRoom;
    createOrSelectFeedParticipationRoom: (payload: {
        item: FeedItem;
        role: FeedParticipationRole;
        deposit: number;
    }) => SpotChatRoom;
    sendMessage: (roomId: string, content: string) => ChatMessage | null;
    shareActionShortcut: (
        roomId: string,
        item: import('./types').SpotActionItem,
    ) => ChatMessage | null;
    reset: () => void;
};

function createInitialState() {
    return {
        rooms: getChatRooms(),
        friends: getChatFriends(),
        selectedContextId: PERSONAL_CHAT_CONTEXT_ID,
        personalFilter: 'all' as const,
        teamFilter: 'all' as const,
        selectedFriendId: null,
    };
}

function sortRoomsByUpdatedAt(rooms: ChatRoom[]) {
    return [...rooms].sort(
        (left, right) =>
            new Date(right.updatedAt).getTime() -
            new Date(left.updatedAt).getTime(),
    );
}

function findFriendById(friends: ChatFriend[], friendId: string) {
    return friends.find((friend) => friend.id === friendId) ?? null;
}

function upsertFriend(friends: ChatFriend[], friend: ChatFriend) {
    if (findFriendById(friends, friend.id)) {
        return friends;
    }

    return [...friends, friend];
}

function updateSpotRoom(
    rooms: ChatRoom[],
    roomId: string,
    updater: (room: SpotChatRoom) => SpotChatRoom,
) {
    return sortRoomsByUpdatedAt(
        rooms.map((room) => {
            if (room.id !== roomId || room.category !== 'spot') {
                return room;
            }

            return updater(room);
        }),
    );
}

function appendMessageToRoom(
    rooms: ChatRoom[],
    roomId: string,
    message: ChatMessage,
) {
    return sortRoomsByUpdatedAt(
        rooms.map((room) =>
            room.id === roomId
                ? {
                      ...room,
                      updatedAt: message.createdAt,
                      messages: [...room.messages, message],
                  }
                : room,
        ),
    );
}

function createReverseOfferSummary(payload: {
    spotId: string;
    authorId: string;
    createdAt: string;
    priorAgreementReachedInChat: boolean;
    totalPartnerCount: number;
    financialSnapshot?: ChatReverseOfferFinancialSnapshot;
}): ChatReverseOfferSummary {
    const {
        spotId,
        authorId,
        createdAt,
        priorAgreementReachedInChat,
        totalPartnerCount,
        financialSnapshot,
    } = payload;

    return {
        id: `chat-reverse-offer-${Date.now()}`,
        spotId,
        authorId,
        status: 'PARTNER_REVIEW',
        approvedPartnerCount: 0,
        totalPartnerCount,
        approverIds: [],
        priorAgreementReachedInChat,
        financialSnapshot,
        createdAt,
        updatedAt: createdAt,
    };
}

function touchRoom(rooms: ChatRoom[], roomId: string, updatedAt: string) {
    return sortRoomsByUpdatedAt(
        rooms.map((room) =>
            room.id === roomId
                ? {
                      ...room,
                      updatedAt,
                  }
                : room,
        ),
    );
}

function upsertPersonalRoom(
    rooms: ChatRoom[],
    friend: ChatFriend,
    now: string,
): {
    room: PersonalChatRoom;
    rooms: ChatRoom[];
} {
    const existingRoom = rooms.find(
        (room): room is PersonalChatRoom =>
            room.category === 'personal' && room.partnerId === friend.id,
    );

    if (existingRoom) {
        return {
            room: {
                ...existingRoom,
                updatedAt: now,
            },
            rooms: touchRoom(rooms, existingRoom.id, now),
        };
    }

    const createdRoom: PersonalChatRoom = {
        id: `personal-room-${Date.now()}`,
        category: 'personal',
        currentUserId: CHAT_CURRENT_USER_ID,
        currentUserName: CHAT_CURRENT_USER_NAME,
        partnerId: friend.id,
        partnerName: friend.name,
        presenceLabel: friend.presenceLabel,
        unreadCount: 0,
        counterpartRole: friend.role,
        title: friend.name,
        subtitle: '개인 채팅',
        description: `${friend.name}님과 바로 대화를 시작할 수 있어요.`,
        metaLabel: `개인 대화 · ${friend.role === 'SUPPORTER' ? '서포터' : '파트너'}`,
        updatedAt: now,
        messages: [
            {
                id: `personal-system-${Date.now()}`,
                kind: 'system',
                content: `${friend.name}님과의 개인 채팅이 열렸어요.`,
                createdAt: now,
            },
        ],
    };

    return {
        room: createdRoom,
        rooms: sortRoomsByUpdatedAt([createdRoom, ...rooms]),
    };
}

function getContextStateForRoom(room: ChatRoom | null) {
    if (!room) {
        return {
            selectedContextId: PERSONAL_CHAT_CONTEXT_ID,
            selectedFriendId: null,
        };
    }

    return {
        selectedContextId:
            room.category === 'spot' ? room.id : PERSONAL_CHAT_CONTEXT_ID,
        selectedFriendId: room.category === 'personal' ? room.partnerId : null,
    };
}

function createFeedParticipationSpotRoom(payload: {
    item: FeedItem;
    role: FeedParticipationRole;
    deposit: number;
    now: string;
}): SpotChatRoom {
    const { item, role, deposit, now } = payload;
    const feedSpotId = `feed-${item.id}`;
    const roleLabel = role === 'SUPPORTER' ? '서포터' : '파트너';
    const spot: SpotDetailFull = {
        id: feedSpotId,
        type: item.type === 'REQUEST' ? 'REQUEST' : 'OFFER',
        status: 'MATCHED',
        title: item.title,
        description:
            item.description ??
            `${roleLabel} 참여가 확정되어 팀 채팅에서 바로 조율을 이어갈 수 있어요.`,
        pointCost: deposit,
        authorId: item.authorProfile?.id ?? `feed-author-${item.id}`,
        authorNickname: item.authorNickname,
        createdAt: now,
        updatedAt: now,
        timeline: [
            {
                id: `feed-room-${item.id}-created`,
                kind: 'CREATED',
                actorId: item.authorProfile?.id ?? `feed-author-${item.id}`,
                actorNickname: item.authorNickname,
                createdAt: now,
            },
            {
                id: `feed-room-${item.id}-matched`,
                kind: 'MATCHED',
                actorId: CHAT_CURRENT_USER_ID,
                actorNickname: CHAT_CURRENT_USER_NAME,
                content: `${roleLabel} 참여가 확정되었어요.`,
                createdAt: now,
            },
        ],
        participants: [
            {
                userId: item.authorProfile?.id ?? `feed-author-${item.id}`,
                nickname: item.authorNickname,
                role: 'AUTHOR',
                joinedAt: now,
            },
            {
                userId: CHAT_CURRENT_USER_ID,
                nickname: CHAT_CURRENT_USER_NAME,
                role: 'PARTICIPANT',
                joinedAt: now,
            },
        ],
        schedule: undefined,
        votes: [],
        checklist: undefined,
        files: [],
        notes: [],
        reviews: [],
    };

    return {
        id: `spot-room-${feedSpotId}`,
        category: 'spot',
        currentUserId: CHAT_CURRENT_USER_ID,
        currentUserName: CHAT_CURRENT_USER_NAME,
        title: item.title,
        subtitle: `${roleLabel} 참여가 확정된 팀 채팅`,
        description: spot.description,
        metaLabel: `2명 참여 · ${deposit.toLocaleString('ko-KR')}P`,
        updatedAt: now,
        sourceFeedId: item.id,
        participationRole: role,
        spot,
        messages: [
            {
                id: `feed-room-${item.id}-system`,
                kind: 'system',
                content: `${roleLabel} 참여가 확정되어 팀 채팅이 열렸어요.`,
                createdAt: now,
            },
        ],
    };
}

export const useMainChatStore = create<MainChatState>()((set, get) => ({
    ...createInitialState(),
    setSelectedContextId: (selectedContextId) => set({ selectedContextId }),
    setPersonalFilter: (personalFilter) => set({ personalFilter }),
    setTeamFilter: (teamFilter) => set({ teamFilter }),
    setSelectedFriendId: (selectedFriendId) => set({ selectedFriendId }),
    addFriendById: (friendId) => {
        if (friendId === CHAT_CURRENT_USER_ID) {
            return null;
        }

        const { friends } = get();
        const existingFriend = findFriendById(friends, friendId);

        if (existingFriend) {
            set({ selectedFriendId: existingFriend.id });
            return existingFriend;
        }

        const candidate = getChatDirectoryCandidateById(friendId);

        if (!candidate) {
            return null;
        }

        const nextFriends = upsertFriend(friends, candidate);

        set({
            friends: nextFriends,
            selectedFriendId: candidate.id,
            selectedContextId: PERSONAL_CHAT_CONTEXT_ID,
        });

        return candidate;
    },
    createPersonalRoom: () => {
        const { selectedFriendId, rooms, friends } = get();

        if (!selectedFriendId) {
            return null;
        }

        const friend = findFriendById(friends, selectedFriendId);

        if (!friend) {
            return null;
        }

        const now = new Date().toISOString();
        const nextRoom = upsertPersonalRoom(rooms, friend, now);

        set({
            rooms: nextRoom.rooms,
            selectedContextId: PERSONAL_CHAT_CONTEXT_ID,
            selectedFriendId: friend.id,
            friends: upsertFriend(friends, friend),
        });

        return nextRoom.room;
    },
    createTeamVote: (question?, options?, multiSelect?) => {
        const { selectedContextId, rooms } = get();

        if (selectedContextId === PERSONAL_CHAT_CONTEXT_ID) {
            return null;
        }

        const targetRoom = rooms.find(
            (room): room is SpotChatRoom =>
                room.id === selectedContextId && room.category === 'spot',
        );

        if (!targetRoom) {
            return null;
        }

        const now = new Date().toISOString();
        const ts = Date.now();
        const resolvedOptions =
            options && options.length >= 2
                ? options
                : ['준비물 먼저 정리', '역할 분담 먼저 정리'];
        const vote: SpotVote = {
            id: `chat-vote-${ts}`,
            spotId: targetRoom.spot.id,
            question:
                question ??
                `${targetRoom.spot.title}에서 먼저 정할 안건은 무엇인가요?`,
            options: resolvedOptions.map((label, i) => ({
                id: `chat-vote-option-${ts}-${i}`,
                label,
                voterIds: i === 0 ? [CHAT_CURRENT_USER_ID] : [],
            })),
            multiSelect: multiSelect ?? false,
        };

        const message: ChatMessage = {
            id: `chat-vote-message-${Date.now()}`,
            kind: 'vote',
            authorId: targetRoom.currentUserId,
            authorName: targetRoom.currentUserName,
            vote,
            createdAt: now,
        };

        const updatedRoom: SpotChatRoom = {
            ...targetRoom,
            updatedAt: now,
            messages: [...targetRoom.messages, message],
            spot: {
                ...targetRoom.spot,
                updatedAt: now,
                votes: [vote, ...targetRoom.spot.votes],
            },
        };

        set({
            rooms: updateSpotRoom(rooms, targetRoom.id, () => updatedRoom),
        });

        return updatedRoom;
    },
    createTeamScheduleVote: () => {
        const { selectedContextId, rooms } = get();

        if (selectedContextId === PERSONAL_CHAT_CONTEXT_ID) {
            return null;
        }

        const targetRoom = rooms.find(
            (room): room is SpotChatRoom =>
                room.id === selectedContextId && room.category === 'spot',
        );

        if (!targetRoom) {
            return null;
        }

        const now = new Date().toISOString();
        const draft: ChatScheduleDraft = {
            id: `chat-schedule-${Date.now()}`,
            spotId: targetRoom.spot.id,
            title: '새 일정 투표',
            description:
                '가능한 시간대를 다시 모아 일정 후보를 빠르게 정리했어요.',
            metaLabel: '일정 후보 수집 중',
            createdAt: now,
        };

        const message: ChatMessage = {
            id: `chat-schedule-message-${Date.now()}`,
            kind: 'schedule',
            authorId: targetRoom.currentUserId,
            authorName: targetRoom.currentUserName,
            schedule: draft,
            createdAt: now,
        };

        set({
            rooms: updateSpotRoom(rooms, targetRoom.id, (room) => ({
                ...room,
                updatedAt: now,
                messages: [...room.messages, message],
                spot: {
                    ...room.spot,
                    updatedAt: now,
                },
            })),
        });

        return {
            ...targetRoom,
            updatedAt: now,
            messages: [...targetRoom.messages, message],
        };
    },
    createTeamFileShare: (fileName?, fileSize?) => {
        const { selectedContextId, rooms } = get();

        if (selectedContextId === PERSONAL_CHAT_CONTEXT_ID) {
            return null;
        }

        const targetRoom = rooms.find(
            (room): room is SpotChatRoom =>
                room.id === selectedContextId && room.category === 'spot',
        );

        if (!targetRoom) {
            return null;
        }

        const now = new Date().toISOString();
        const file: SharedFile = {
            id: `chat-file-${Date.now()}`,
            spotId: targetRoom.spot.id,
            uploaderNickname: targetRoom.currentUserName,
            name: fileName ?? '준비물_정리.pdf',
            url: 'https://example.com/files/chat-shared-file.pdf',
            sizeBytes: fileSize ?? 128 * 1024,
            uploadedAt: now,
        };

        const message: ChatMessage = {
            id: `chat-file-message-${Date.now()}`,
            kind: 'file',
            authorId: targetRoom.currentUserId,
            authorName: targetRoom.currentUserName,
            file,
            createdAt: now,
        };

        const updatedRoom: SpotChatRoom = {
            ...targetRoom,
            updatedAt: now,
            messages: [...targetRoom.messages, message],
            spot: {
                ...targetRoom.spot,
                updatedAt: now,
                files: [file, ...targetRoom.spot.files],
            },
        };

        set({
            rooms: updateSpotRoom(rooms, targetRoom.id, () => updatedRoom),
        });

        return updatedRoom;
    },
    createTeamReverseOffer: (priorAgreementReachedInChat) => {
        const { selectedContextId, rooms } = get();

        if (selectedContextId === PERSONAL_CHAT_CONTEXT_ID) {
            return null;
        }

        const targetRoom = rooms.find(
            (room): room is SpotChatRoom =>
                room.id === selectedContextId && room.category === 'spot',
        );

        if (!targetRoom) {
            return null;
        }

        const now = new Date().toISOString();
        const financialSummary =
            resolveReverseOfferFinancialSummary(targetRoom);
        const reverseOffer = createReverseOfferSummary({
            spotId: targetRoom.spot.id,
            authorId: targetRoom.currentUserId,
            createdAt: now,
            priorAgreementReachedInChat,
            totalPartnerCount: Math.max(
                targetRoom.spot.participants.length - 1,
                0,
            ),
            financialSnapshot: financialSummary
                ? toReverseOfferFinancialSnapshot(financialSummary)
                : undefined,
        });

        const message: ChatMessage = {
            id: `chat-reverse-offer-message-${Date.now()}`,
            kind: 'reverse-offer',
            authorId: targetRoom.currentUserId,
            authorName: targetRoom.currentUserName,
            reverseOffer,
            createdAt: now,
        };

        const updatedRoom: SpotChatRoom = {
            ...targetRoom,
            updatedAt: now,
            reverseOffer,
            messages: [...targetRoom.messages, message],
        };

        set({
            rooms: updateSpotRoom(rooms, targetRoom.id, () => updatedRoom),
        });

        return updatedRoom;
    },
    approveReverseOffer: (roomId) => {
        const { rooms } = get();
        const targetRoom = rooms.find(
            (candidate): candidate is SpotChatRoom =>
                candidate.id === roomId && candidate.category === 'spot',
        );

        if (!targetRoom || !targetRoom.reverseOffer) {
            return null;
        }

        const viewerId = targetRoom.currentUserId;
        const current = targetRoom.reverseOffer;

        if (
            current.authorId === viewerId ||
            current.status === 'ADMIN_APPROVAL_PENDING' ||
            current.approverIds.includes(viewerId)
        ) {
            return null;
        }

        const now = new Date().toISOString();
        const nextApproverIds = [...current.approverIds, viewerId];
        const nextApprovedCount = nextApproverIds.length;
        const allApproved = nextApprovedCount >= current.totalPartnerCount;

        const updatedReverseOffer: ChatReverseOfferSummary = {
            ...current,
            approverIds: nextApproverIds,
            approvedPartnerCount: nextApprovedCount,
            status: allApproved ? 'ADMIN_APPROVAL_PENDING' : 'PARTNER_REVIEW',
            updatedAt: now,
        };

        const messagesWithUpdatedCard = targetRoom.messages.map((message) =>
            message.kind === 'reverse-offer' &&
            message.reverseOffer.id === current.id
                ? { ...message, reverseOffer: updatedReverseOffer }
                : message,
        );

        const systemMessage: ChatMessage = {
            id: `reverse-offer-approve-${targetRoom.id}-${Date.now()}`,
            kind: 'system',
            content: allApproved
                ? `${targetRoom.currentUserName}님의 승인으로 모든 파트너가 역제안을 승인했어요. 어드민 승인 대기 단계로 넘어갑니다.`
                : `${targetRoom.currentUserName}님이 역제안을 승인했어요. (${nextApprovedCount}/${current.totalPartnerCount})`,
            createdAt: now,
        };

        const updatedRoom: SpotChatRoom = {
            ...targetRoom,
            updatedAt: now,
            reverseOffer: updatedReverseOffer,
            messages: [...messagesWithUpdatedCard, systemMessage],
        };

        set({
            rooms: updateSpotRoom(rooms, targetRoom.id, () => updatedRoom),
        });

        return updatedRoom;
    },
    updateSpotSchedule: (roomId, slots) => {
        const { rooms } = get();
        set({
            rooms: updateSpotRoom(rooms, roomId, (room) => ({
                ...room,
                updatedAt: new Date().toISOString(),
                spot: {
                    ...room.spot,
                    schedule: {
                        spotId: room.spot.id,
                        proposedSlots: slots,
                        confirmedSlot: room.spot.schedule?.confirmedSlot,
                    },
                },
            })),
        });
    },
    applyRouteIntent: (intent) => {
        const { rooms, friends } = get();
        const fallbackRoom = rooms[0] ?? null;

        if (intent.kind === 'default') {
            set({
                selectedContextId: PERSONAL_CHAT_CONTEXT_ID,
                selectedFriendId: null,
            });

            return {
                roomId: fallbackRoom?.id ?? null,
            };
        }

        if (intent.kind === 'spot') {
            const spotRoom = rooms.find(
                (room): room is SpotChatRoom =>
                    room.category === 'spot' && room.spot.id === intent.spotId,
            );

            if (spotRoom) {
                set({
                    selectedContextId: spotRoom.id,
                    selectedFriendId: null,
                });

                return {
                    roomId: spotRoom.id,
                };
            }

            const fallbackSpotRoom = rooms.find(
                (room): room is SpotChatRoom => room.category === 'spot',
            );

            set({
                selectedContextId:
                    fallbackSpotRoom?.id ?? PERSONAL_CHAT_CONTEXT_ID,
                selectedFriendId: null,
            });

            return {
                roomId: fallbackSpotRoom?.id ?? fallbackRoom?.id ?? null,
                fallbackMessage:
                    '요청한 스팟 채팅을 찾지 못해 참여 중인 다른 채팅을 보여드리고 있어요.',
            };
        }

        if (intent.kind === 'user') {
            if (intent.userId === CHAT_CURRENT_USER_ID) {
                set({
                    selectedContextId: PERSONAL_CHAT_CONTEXT_ID,
                    selectedFriendId: null,
                });

                return {
                    roomId: fallbackRoom?.id ?? null,
                    fallbackMessage:
                        '내 공유 링크로는 친구를 추가할 수 없어 채팅 목록으로 안내했어요.',
                };
            }

            const friend =
                findFriendById(friends, intent.userId) ??
                getChatDirectoryCandidateById(intent.userId);

            if (!friend) {
                set({
                    selectedContextId: PERSONAL_CHAT_CONTEXT_ID,
                    selectedFriendId: null,
                });

                return {
                    roomId: fallbackRoom?.id ?? null,
                    fallbackMessage:
                        '요청한 개인 채팅 대상을 찾지 못해 채팅 목록으로 안내했어요.',
                };
            }

            const now = new Date().toISOString();
            const nextRoom = upsertPersonalRoom(rooms, friend, now);
            const nextFriends = upsertFriend(friends, friend);

            set({
                rooms: nextRoom.rooms,
                friends: nextFriends,
                selectedContextId: PERSONAL_CHAT_CONTEXT_ID,
                selectedFriendId: friend.id,
            });

            return {
                roomId: nextRoom.room.id,
            };
        }

        const room = rooms.find((candidate) => candidate.id === intent.roomId);

        if (!room) {
            set(getContextStateForRoom(fallbackRoom));

            return {
                roomId: fallbackRoom?.id ?? null,
                fallbackMessage:
                    '요청한 채팅방을 찾지 못해 가장 최근 대화로 이동할 수 있게 준비했어요.',
            };
        }

        set(getContextStateForRoom(room));

        return {
            roomId: room.id,
        };
    },
    createOrSelectFeedParticipationRoom: ({ item, role, deposit }) => {
        const { rooms } = get();
        const roleLabel = role === 'SUPPORTER' ? '서포터' : '파트너';
        const existingRoom = rooms.find(
            (room): room is SpotChatRoom =>
                room.category === 'spot' && room.spot.id === `feed-${item.id}`,
        );

        if (existingRoom) {
            const updatedAt = new Date().toISOString();
            const updatedRoom: SpotChatRoom = {
                ...existingRoom,
                updatedAt,
                subtitle: `${roleLabel} 참여가 확정된 팀 채팅`,
                metaLabel: `2명 참여 · ${deposit.toLocaleString('ko-KR')}P`,
                sourceFeedId: item.id,
                participationRole: role,
                spot: {
                    ...existingRoom.spot,
                    pointCost: deposit,
                    updatedAt,
                },
            };

            set({
                rooms: updateSpotRoom(
                    rooms,
                    existingRoom.id,
                    () => updatedRoom,
                ),
                selectedContextId: updatedRoom.id,
                selectedFriendId: null,
            });

            return updatedRoom;
        }

        const now = new Date().toISOString();
        const nextRoom = createFeedParticipationSpotRoom({
            item,
            role,
            deposit,
            now,
        });

        set({
            rooms: sortRoomsByUpdatedAt([nextRoom, ...rooms]),
            selectedContextId: nextRoom.id,
            selectedFriendId: null,
        });

        return nextRoom;
    },
    sendMessage: (roomId, content) => {
        const trimmedContent = content.trim();

        if (!trimmedContent) {
            return null;
        }

        const { rooms } = get();
        const room = rooms.find((candidate) => candidate.id === roomId);

        if (!room) {
            return null;
        }

        const now = new Date().toISOString();
        const message: ChatMessage = {
            id: `local-message-${room.id}-${Date.now()}`,
            kind: 'message',
            authorId: room.currentUserId,
            authorName: room.currentUserName,
            content: trimmedContent,
            createdAt: now,
        };

        set({
            rooms: appendMessageToRoom(rooms, roomId, message),
        });

        return message;
    },
    shareActionShortcut: (roomId, item) => {
        if (
            item.roomId !== roomId ||
            (item.kind !== 'vote' &&
                item.kind !== 'schedule' &&
                item.kind !== 'file')
        ) {
            return null;
        }

        const { rooms } = get();
        const room = rooms.find(
            (candidate): candidate is SpotChatRoom =>
                candidate.id === roomId && candidate.category === 'spot',
        );

        if (!room) {
            return null;
        }

        const now = new Date().toISOString();
        const shortcut: Extract<ChatMessage, { kind: 'shortcut' }>['shortcut'] =
            item.kind === 'vote'
                ? {
                      actionKind: 'vote',
                      actionId: item.id,
                      label: '투표 바로가기',
                      title: item.vote.question,
                      preview: `${item.vote.options.length}개 선택지 · ${item.vote.multiSelect ? '복수 선택' : '단일 선택'}`,
                  }
                : item.kind === 'schedule'
                  ? {
                        actionKind: 'schedule',
                        actionId: item.id,
                        label: '일정 바로가기',
                        title: item.schedule.title,
                        preview: item.schedule.description,
                    }
                  : {
                        actionKind: 'file',
                        actionId: item.id,
                        label: '파일 바로가기',
                        title: item.file.name,
                        preview: `${item.file.uploaderNickname}님이 공유한 파일`,
                    };

        const message: ChatMessage = {
            id: `shortcut-message-${room.id}-${Date.now()}`,
            kind: 'shortcut',
            authorId: room.currentUserId,
            authorName: room.currentUserName,
            shortcut,
            createdAt: now,
        };

        set({
            rooms: appendMessageToRoom(rooms, roomId, message),
        });

        return message;
    },
    reset: () => set(createInitialState()),
}));
