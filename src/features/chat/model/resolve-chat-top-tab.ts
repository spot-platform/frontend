import { getChatRooms } from './mock';
import type {
    ChatRouteIntent,
    ChatRouteSearchParams,
    MainChatTopTab,
} from './types';

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

function resolveRequestedTopTab(
    searchParams?: ChatRouteSearchParams,
): MainChatTopTab | null {
    const tab = pickRouteValue(searchParams?.tab);

    if (tab === 'personal' || tab === 'team') {
        return tab;
    }

    return null;
}

export function resolveChatTopTab(
    searchParams?: ChatRouteSearchParams,
    intent: ChatRouteIntent = { kind: 'default' },
): MainChatTopTab {
    if (intent.kind === 'spot') {
        return 'team';
    }

    if (intent.kind === 'user') {
        return 'personal';
    }

    if (intent.kind === 'room') {
        const room = getChatRooms().find(
            (candidate) => candidate.id === intent.roomId,
        );

        if (room) {
            return room.category === 'spot' ? 'team' : 'personal';
        }
    }

    return resolveRequestedTopTab(searchParams) ?? 'personal';
}
