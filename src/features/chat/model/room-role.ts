import type { SpotChatRoom } from './types';

export type ChatRoomLifecycleSource = 'feed' | 'spot';
export type ChatRoomUserRole = 'OWNER' | 'SUPPORTER' | 'PARTNER';

export type ChatRoomRoleContext = {
    roomLifecycleSource: ChatRoomLifecycleSource;
    userFeedRole: ChatRoomUserRole;
    canManageOwnerActions: boolean;
    canCreateReverseOffer: boolean;
};

export function computeRoomLifecycleSource(
    room: SpotChatRoom,
): ChatRoomLifecycleSource {
    return (
        room.sourceKind ??
        (room.sourceFeedId && room.spot.status === 'OPEN' ? 'feed' : 'spot')
    );
}

export function computeUserFeedRole(room: SpotChatRoom): ChatRoomUserRole {
    if (room.participationRole) return room.participationRole;
    if (room.spot.isOwner || room.spot.authorId === room.currentUserId) {
        return 'OWNER';
    }

    const isSupporter =
        room.spot.type === 'OFFER'
            ? room.spot.authorId === room.currentUserId
            : room.spot.authorId !== room.currentUserId;

    return isSupporter ? 'SUPPORTER' : 'PARTNER';
}

export function computeChatRoomRoleContext(
    room: SpotChatRoom,
): ChatRoomRoleContext {
    const roomLifecycleSource = computeRoomLifecycleSource(room);
    const userFeedRole = computeUserFeedRole(room);
    const canManageOwnerActions = userFeedRole === 'OWNER';
    const canCreateReverseOffer =
        roomLifecycleSource === 'feed' && userFeedRole === 'SUPPORTER';

    return {
        roomLifecycleSource,
        userFeedRole,
        canManageOwnerActions,
        canCreateReverseOffer,
    };
}
