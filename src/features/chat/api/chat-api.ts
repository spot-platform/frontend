import { buildQueryString, clientApiFetch } from '@/lib/client-api';
import { backendProxyEndpoint, endpoints } from '@/lib/endpoint';
import type { ChatMessage, ChatRoom } from '../model/types';

export type ChatRoomsQuery = {
    category?: ChatRoom['category'];
    filter?: string;
    page?: number;
    size?: number;
};

export type ChatMessagesQuery = {
    cursor?: string | number;
    beforeId?: string | number;
    size?: number;
};

export type CreateChatRoomPayload = {
    category: ChatRoom['category'];
    userId?: string;
    spotId?: string;
};

export type SendChatMessagePayload = {
    kind?: ChatMessage['kind'];
    content?: string;
};

export type ChatBlock = {
    id: string;
    blockedId: string;
    blockedNickname?: string;
    createdAt: string;
};

type BackendChatBlock = Omit<ChatBlock, 'id'> & {
    id: string | number;
};

type BackendRoom = {
    id: number | string;
    spotId?: string | null;
    type?: 'GROUP' | 'PERSONAL';
    title?: string;
    subtitle?: string;
    currentUserId?: string;
    currentUserName?: string;
    partnerId?: string;
    partnerNickname?: string;
    unreadCount?: number;
    lastMessagePreview?: string;
    lastMessageAt?: string;
    createdAt?: string;
};

type BackendMessage = {
    id: number | string;
    chatRoomId: number | string;
    senderId?: string;
    authorId?: string | null;
    authorName?: string | null;
    kind?: 'message' | 'system';
    blocked?: boolean;
    content?: string;
    createdAt?: string;
};

type BackendMessageList =
    | BackendMessage[]
    | {
          messages?: BackendMessage[];
          nextCursor?: number | string | null;
          hasMore?: boolean;
      };

export type ChatMessageListResponse = {
    data: ChatMessage[];
    nextCursor?: number | string | null;
    hasMore?: boolean;
};

export type ChatMessageEventHandler = (message: ChatMessage) => void;

function toChatMessage(message: BackendMessage): ChatMessage {
    return {
        id: String(message.id),
        kind: message.kind ?? 'message',
        authorId: message.authorId ?? message.senderId ?? '',
        authorName:
            message.authorName ??
            message.authorId ??
            message.senderId ??
            '상대',
        content: message.content ?? '',
        createdAt: message.createdAt ?? new Date().toISOString(),
    };
}

function toChatBlock(block: BackendChatBlock): ChatBlock {
    return {
        ...block,
        id: String(block.id),
    };
}

function toChatRoom(room: BackendRoom): ChatRoom {
    const id = String(room.id);
    const isSpotRoom = room.type === 'GROUP' || Boolean(room.spotId);
    const updatedAt =
        room.lastMessageAt ?? room.createdAt ?? new Date().toISOString();

    if (isSpotRoom) {
        return {
            id,
            category: 'spot',
            currentUserId: room.currentUserId ?? '',
            currentUserName: room.currentUserName ?? '나',
            title:
                room.title ??
                (room.spotId ? `스팟 ${room.spotId}` : `팀 채팅 ${id}`),
            subtitle: room.subtitle ?? '팀 채팅',
            description: room.lastMessagePreview ?? '백엔드 채팅방입니다.',
            metaLabel: '팀 채팅',
            updatedAt,
            messages: [],
            spot: {
                id: room.spotId ?? id,
                type: 'REQUEST',
                status: 'OPEN',
                title: room.spotId ? `스팟 ${room.spotId}` : `팀 채팅 ${id}`,
                description: '백엔드 채팅방입니다.',
                pointCost: 0,
                authorId: '',
                authorNickname: '',
                createdAt: updatedAt,
                updatedAt,
                timeline: [],
                participants: [],
                votes: [],
                files: [],
                notes: [],
                reviews: [],
            },
        };
    }

    return {
        id,
        category: 'personal',
        currentUserId: room.currentUserId ?? '',
        currentUserName: room.currentUserName ?? '나',
        partnerId: room.partnerId ?? '',
        partnerName: room.partnerNickname ?? `개인 채팅 ${id}`,
        presenceLabel: '',
        unreadCount: room.unreadCount ?? 0,
        counterpartRole: 'PARTNER',
        title: room.title ?? `개인 채팅 ${id}`,
        subtitle: room.subtitle ?? '개인 채팅',
        description: room.lastMessagePreview ?? '백엔드 채팅방입니다.',
        metaLabel: '개인 채팅',
        updatedAt,
        messages: [],
    };
}

function toChronologicalMessages(messages: BackendMessage[]): ChatMessage[] {
    return messages
        .map(toChatMessage)
        .sort(
            (left, right) =>
                new Date(left.createdAt).getTime() -
                new Date(right.createdAt).getTime(),
        );
}

function toMessageListResponse(
    response: BackendMessageList,
): ChatMessageListResponse {
    if (Array.isArray(response)) {
        return { data: toChronologicalMessages(response) };
    }

    return {
        data: toChronologicalMessages(response.messages ?? []),
        nextCursor: response.nextCursor,
        hasMore: response.hasMore,
    };
}

function toBackendMessagesQuery(params?: ChatMessagesQuery) {
    if (!params) {
        return undefined;
    }

    const { beforeId, cursor, ...rest } = params;

    return {
        ...rest,
        cursor: cursor ?? beforeId,
    };
}

function toBackendRoomPayload(payload: CreateChatRoomPayload) {
    return {
        spotId: payload.spotId,
        type: payload.category === 'spot' ? 'GROUP' : 'PERSONAL',
    };
}

function toPersonalRoomPayload(payload: CreateChatRoomPayload) {
    if (!payload.userId) {
        throw new Error('개인 채팅을 시작할 상대가 필요합니다.');
    }

    return { partnerId: payload.userId };
}

export const chatApi = {
    listRooms: async (params?: ChatRoomsQuery): Promise<{ data: ChatRoom[] }> =>
        clientApiFetch<BackendRoom[]>(
            `${endpoints.chat.rooms}${buildQueryString(params)}`,
        ).then((rooms) => ({ data: (rooms ?? []).map(toChatRoom) })),

    getRoom: async (roomId: string): Promise<{ data: ChatRoom }> =>
        clientApiFetch<BackendRoom>(endpoints.chat.room(roomId)).then(
            (room) => ({
                data: toChatRoom(room),
            }),
        ),

    getMessages: async (
        roomId: string,
        params?: ChatMessagesQuery,
    ): Promise<ChatMessageListResponse> =>
        clientApiFetch<BackendMessageList>(
            `${endpoints.chat.roomMessages(roomId)}${buildQueryString(toBackendMessagesQuery(params))}`,
        ).then(toMessageListResponse),

    markRead: async (roomId: string): Promise<void> =>
        clientApiFetch<void>(endpoints.chat.roomRead(roomId), {
            method: 'POST',
        }),

    markMessageRead: async (
        roomId: string,
        messageId: string | number,
    ): Promise<void> =>
        clientApiFetch<void>(endpoints.chat.messageRead(roomId, messageId), {
            method: 'POST',
        }),

    typing: async (roomId: string): Promise<void> =>
        clientApiFetch<void>(endpoints.chat.roomTyping(roomId), {
            method: 'POST',
        }),

    leaveRoom: async (roomId: string): Promise<void> =>
        clientApiFetch<void>(endpoints.chat.roomLeave(roomId), {
            method: 'DELETE',
        }),

    getRoomsBySpot: async (spotId: string): Promise<{ data: ChatRoom[] }> =>
        clientApiFetch<BackendRoom[]>(endpoints.chat.roomsBySpot(spotId)).then(
            (rooms) => ({ data: (rooms ?? []).map(toChatRoom) }),
        ),

    getRoomBySpot: async (spotId: string): Promise<{ data: ChatRoom | null }> =>
        clientApiFetch<BackendRoom[]>(endpoints.chat.roomsBySpot(spotId)).then(
            (rooms) => ({ data: rooms[0] ? toChatRoom(rooms[0]) : null }),
        ),

    getRoomsByUser: async (userId: string): Promise<{ data: ChatRoom[] }> =>
        clientApiFetch<BackendRoom[]>(endpoints.chat.roomsByUser(userId)).then(
            (rooms) => ({ data: (rooms ?? []).map(toChatRoom) }),
        ),

    createRoom: async (
        payload: CreateChatRoomPayload,
    ): Promise<{ data: ChatRoom }> => {
        const endpoint =
            payload.category === 'personal'
                ? endpoints.chat.personalRooms
                : endpoints.chat.rooms;
        const body =
            payload.category === 'personal'
                ? toPersonalRoomPayload(payload)
                : toBackendRoomPayload(payload);

        return clientApiFetch<BackendRoom>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        }).then((room) => ({ data: toChatRoom(room) }));
    },

    sendMessage: async (
        roomId: string,
        payload: SendChatMessagePayload,
    ): Promise<{ data: ChatMessage }> => {
        if (payload.kind && payload.kind !== 'message') {
            throw new Error('BE v1 채팅 전송은 텍스트 메시지만 지원합니다.');
        }

        return clientApiFetch<BackendMessage>(
            endpoints.chat.roomMessages(roomId),
            {
                method: 'POST',
                body: JSON.stringify({ content: payload.content ?? '' }),
            },
        ).then((message) => ({ data: toChatMessage(message) }));
    },

    getBlocks: async (): Promise<{ data: ChatBlock[] }> =>
        clientApiFetch<BackendChatBlock[]>(endpoints.chat.blocks).then(
            (blocks) => ({ data: (blocks ?? []).map(toChatBlock) }),
        ),

    blockUser: async (userId: string): Promise<{ data: ChatBlock }> =>
        clientApiFetch<BackendChatBlock>(endpoints.chat.blocks, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        }).then((block) => ({ data: toChatBlock(block) })),

    unblockUser: async (userId: string): Promise<void> =>
        clientApiFetch<void>(endpoints.chat.block(userId), {
            method: 'DELETE',
        }),

    subscribeToUser: (onMessage: ChatMessageEventHandler): EventSource => {
        const eventSource = new EventSource(
            backendProxyEndpoint(endpoints.chat.stream),
        );

        eventSource.addEventListener('message', (event) => {
            const payload = JSON.parse(event.data) as BackendMessage;
            onMessage(toChatMessage(payload));
        });

        return eventSource;
    },

    subscribeToRoom: (
        roomId: string,
        onMessage: ChatMessageEventHandler,
    ): EventSource => {
        const eventSource = new EventSource(
            backendProxyEndpoint(endpoints.chat.roomStream(roomId)),
        );

        eventSource.addEventListener('message', (event) => {
            const payload = JSON.parse(event.data) as BackendMessage;
            onMessage(toChatMessage(payload));
        });

        return eventSource;
    },
};
