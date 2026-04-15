import type { ChatRouteIntent, ChatRouteSearchParams } from './types';
import { isSupportedChatActionKind } from './spot-action-items';

function pickRouteValue(value?: string | string[]): string | null {
    if (typeof value === 'string') {
        const trimmedValue = value.trim();

        return trimmedValue.length > 0 ? trimmedValue : null;
    }

    if (Array.isArray(value)) {
        return pickRouteValue(value[0]);
    }

    return null;
}

export function resolveChatRoom(
    searchParams?: ChatRouteSearchParams,
): ChatRouteIntent {
    const roomId = pickRouteValue(searchParams?.roomId);
    const actionKind = pickRouteValue(searchParams?.actionKind);
    const actionId = pickRouteValue(searchParams?.actionId);

    if (roomId) {
        return {
            kind: 'room',
            roomId,
            actionTarget:
                actionKind && actionId && isSupportedChatActionKind(actionKind)
                    ? {
                          actionKind,
                          actionId,
                      }
                    : undefined,
        };
    }

    const spotId = pickRouteValue(searchParams?.spotId);

    if (spotId) {
        return {
            kind: 'spot',
            spotId,
        };
    }

    const userId = pickRouteValue(searchParams?.userId);

    if (userId) {
        return {
            kind: 'user',
            userId,
        };
    }

    return {
        kind: 'default',
    };
}
