import { buildQueryString, clientApiFetch } from '@/lib/client-api';
import type { ChatMessage, ChatRoom } from '../model/types';

export type ChatRoomsQuery = {
    category?: ChatRoom['category'];
    filter?: string;
    page?: number;
    size?: number;
};

export type ChatMessagesQuery = {
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

type BackendRoom = {
    id: number | string;
    spotId?: string | null;
    type?: 'GROUP' | 'PERSONAL';
    createdAt?: string;
};

type BackendMessage = {
    id: number | string;
    chatRoomId: number | string;
    senderId?: string;
    content?: string;
    createdAt?: string;
};

type BackendMessageList = {
    messages?: BackendMessage[];
    nextCursor?: number | string | null;
    hasMore?: boolean;
};

export type ChatMessageListResponse = {
    data: ChatMessage[];
    nextCursor?: number | string | null;
    hasMore?: boolean;
};

function toChatMessage(message: BackendMessage): ChatMessage {
    return {
        id: String(message.id),
        kind: 'message',
        authorId: message.senderId ?? '',
        authorName: message.senderId ?? '상대',
        content: message.content ?? '',
        createdAt: message.createdAt ?? new Date().toISOString(),
    };
}

function toChatRoom(room: BackendRoom): ChatRoom {
    const id = String(room.id);
    const isSpotRoom = room.type === 'GROUP' || Boolean(room.spotId);
    const updatedAt = room.createdAt ?? new Date().toISOString();

    if (isSpotRoom) {
        return {
            id,
            category: 'spot',
            currentUserId: '',
            currentUserName: '나',
            title: room.spotId ? `스팟 ${room.spotId}` : `팀 채팅 ${id}`,
            subtitle: '팀 채팅',
            description: '백엔드 채팅방입니다.',
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
        currentUserId: '',
        currentUserName: '나',
        partnerId: '',
        partnerName: `개인 채팅 ${id}`,
        presenceLabel: '',
        unreadCount: 0,
        counterpartRole: 'PARTNER',
        title: `개인 채팅 ${id}`,
        subtitle: '개인 채팅',
        description: '백엔드 채팅방입니다.',
        metaLabel: '개인 채팅',
        updatedAt,
        messages: [],
    };
}

function toBackendRoomPayload(payload: CreateChatRoomPayload) {
    return {
        spotId: payload.spotId,
        type: payload.category === 'spot' ? 'GROUP' : 'PERSONAL',
    };
}

export const chatApi = {
    listRooms: async (params?: ChatRoomsQuery): Promise<{ data: ChatRoom[] }> =>
        clientApiFetch<BackendRoom[]>(
            `/chat/rooms${buildQueryString(params)}`,
        ).then((rooms) => ({ data: (rooms ?? []).map(toChatRoom) })),

    getRoom: async (roomId: string): Promise<{ data: ChatRoom }> =>
        clientApiFetch<BackendRoom>(`/chat/rooms/${roomId}`).then((room) => ({
            data: toChatRoom(room),
        })),

    getMessages: async (
        roomId: string,
        params?: ChatMessagesQuery,
    ): Promise<ChatMessageListResponse> =>
        clientApiFetch<BackendMessageList>(
            `/chat/rooms/${roomId}/messages${buildQueryString(params)}`,
        ).then((response) => ({
            data: (response.messages ?? []).map(toChatMessage),
            nextCursor: response.nextCursor,
            hasMore: response.hasMore,
        })),

    markRead: async (roomId: string): Promise<void> =>
        clientApiFetch<void>(`/chat/rooms/${roomId}/read`, {
            method: 'POST',
        }),

    getRoomBySpot: async (spotId: string): Promise<{ data: ChatRoom }> =>
        clientApiFetch<BackendRoom>(`/chat/rooms/by-spot/${spotId}`).then(
            (room) => ({ data: toChatRoom(room) }),
        ),

    getRoomsByUser: async (userId: string): Promise<{ data: ChatRoom[] }> =>
        clientApiFetch<BackendRoom[]>(`/chat/rooms/by-user/${userId}`).then(
            (rooms) => ({ data: (rooms ?? []).map(toChatRoom) }),
        ),

    createRoom: async (
        payload: CreateChatRoomPayload,
    ): Promise<{ data: ChatRoom }> =>
        clientApiFetch<BackendRoom>('/chat/rooms', {
            method: 'POST',
            body: JSON.stringify(toBackendRoomPayload(payload)),
        }).then((room) => ({ data: toChatRoom(room) })),

    sendMessage: async (
        roomId: string,
        payload: SendChatMessagePayload,
    ): Promise<{ data: ChatMessage }> => {
        if (payload.kind && payload.kind !== 'message') {
            throw new Error('BE v1 채팅 전송은 텍스트 메시지만 지원합니다.');
        }

        return clientApiFetch<BackendMessage>(
            `/chat/rooms/${roomId}/messages`,
            {
                method: 'POST',
                body: JSON.stringify({ content: payload.content ?? '' }),
            },
        ).then((message) => ({ data: toChatMessage(message) }));
    },
};
