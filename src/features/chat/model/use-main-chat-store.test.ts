import { beforeEach, describe, expect, it } from 'vitest';
import {
    PERSONAL_CHAT_CONTEXT_ID,
    useMainChatStore,
} from './use-main-chat-store';
import { MOCK_FEED } from '@/features/feed/model/mock';
import { getShareableSpotActionItems } from './spot-action-items';

describe('useMainChatStore', () => {
    beforeEach(() => {
        useMainChatStore.getState().reset();
    });

    it('selects a spot room from route intent', () => {
        const resolution = useMainChatStore
            .getState()
            .applyRouteIntent({ kind: 'spot', spotId: 'spot-2' });

        expect(resolution.roomId).toBe('spot-room-spot-2');
        expect(useMainChatStore.getState().selectedContextId).toBe(
            'spot-room-spot-2',
        );
    });

    it('reuses an existing personal room for user intent', () => {
        const resolution = useMainChatStore
            .getState()
            .applyRouteIntent({ kind: 'user', userId: 'user-milk' });

        expect(resolution.roomId).toBe('personal-room-2');
        expect(useMainChatStore.getState().selectedContextId).toBe(
            PERSONAL_CHAT_CONTEXT_ID,
        );
    });

    it('adds a local directory candidate when a shared user route is opened', () => {
        const resolution = useMainChatStore
            .getState()
            .applyRouteIntent({ kind: 'user', userId: 'user-note' });

        const state = useMainChatStore.getState();
        const createdRoom = state.rooms.find(
            (room) => room.id === resolution.roomId,
        );

        expect(state.friends.some((friend) => friend.id === 'user-note')).toBe(
            true,
        );
        expect(state.selectedContextId).toBe(PERSONAL_CHAT_CONTEXT_ID);
        expect(state.selectedFriendId).toBe('user-note');
        expect(createdRoom?.category).toBe('personal');
        expect(
            createdRoom && 'partnerId' in createdRoom
                ? createdRoom.partnerId
                : null,
        ).toBe('user-note');
    });

    it('prevents self add when the shared user route points to the current user', () => {
        const beforeFriendCount = useMainChatStore.getState().friends.length;
        const resolution = useMainChatStore
            .getState()
            .applyRouteIntent({ kind: 'user', userId: 'user-me' });

        const state = useMainChatStore.getState();

        expect(state.friends).toHaveLength(beforeFriendCount);
        expect(state.selectedFriendId).toBeNull();
        expect(resolution.fallbackMessage).toContain('내 공유 링크');
    });

    it('creates a personal room for a friend added locally', () => {
        const addedFriend = useMainChatStore
            .getState()
            .addFriendById('user-forest');
        const room = useMainChatStore.getState().createPersonalRoom();

        expect(addedFriend?.id).toBe('user-forest');
        expect(room?.partnerId).toBe('user-forest');
        expect(
            useMainChatStore
                .getState()
                .friends.some((friend) => friend.id === 'user-forest'),
        ).toBe(true);
    });

    it('appends messages into the shared room state', () => {
        const previousRoom = useMainChatStore
            .getState()
            .rooms.find((room) => room.id === 'personal-room-1');

        expect(previousRoom).not.toBeNull();

        const message = useMainChatStore
            .getState()
            .sendMessage('personal-room-1', '테스트 메시지');
        const nextRoom = useMainChatStore
            .getState()
            .rooms.find((room) => room.id === 'personal-room-1');

        expect(message?.kind).toBe('message');

        if (!message || message.kind !== 'message') {
            throw new Error('Expected a plain text chat message.');
        }

        expect(message.content).toBe('테스트 메시지');
        expect(nextRoom?.messages.at(-1)).toEqual(message);
        expect(nextRoom?.messages).toHaveLength(
            (previousRoom?.messages.length ?? 0) + 1,
        );
    });

    it('creates a local team room for feed participation and selects it', () => {
        const item = MOCK_FEED.find((feed) => feed.id === '1');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 1 to exist.');
        }

        const room = useMainChatStore
            .getState()
            .createOrSelectFeedParticipationRoom({
                item,
                role: 'PARTNER',
                deposit: 12000,
            });

        expect(room.category).toBe('spot');
        expect(room.id).toBe('spot-room-feed-1');
        expect(room.spot.id).toBe('feed-1');
        expect(room.participationRole).toBe('PARTNER');
        expect(useMainChatStore.getState().selectedContextId).toBe(room.id);
    });

    it('reuses an existing local team room for the same feed', () => {
        const item = MOCK_FEED.find((feed) => feed.id === '1');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 1 to exist.');
        }

        const firstRoom = useMainChatStore
            .getState()
            .createOrSelectFeedParticipationRoom({
                item,
                role: 'PARTNER',
                deposit: 12000,
            });
        const secondRoom = useMainChatStore
            .getState()
            .createOrSelectFeedParticipationRoom({
                item,
                role: 'SUPPORTER',
                deposit: 12000,
            });

        expect(secondRoom.id).toBe(firstRoom.id);
        expect(secondRoom.participationRole).toBe('SUPPORTER');
        expect(
            useMainChatStore
                .getState()
                .rooms.filter((room) => room.id === firstRoom.id),
        ).toHaveLength(1);
    });

    it('creates reverse-offer approval counts on room and thread message', () => {
        useMainChatStore.getState().setSelectedContextId('spot-room-spot-2');

        const room = useMainChatStore.getState().createTeamReverseOffer(true);

        expect(room?.category).toBe('spot');
        expect(room?.reverseOffer).toMatchObject({
            status: 'PARTNER_REVIEW',
            approvedPartnerCount: 0,
            totalPartnerCount: Math.max(
                (room?.spot.participants.length ?? 0) - 1,
                0,
            ),
            priorAgreementReachedInChat: true,
            financialSnapshot: {
                sourceKind: 'estimated',
                targetAmount: room?.spot.pointCost,
                agreedHeadcount: room?.spot.participants.length,
                currentHeadcount: room?.spot.participants.length,
            },
        });

        const reverseOfferMessage = room?.messages.at(-1);

        expect(reverseOfferMessage?.kind).toBe('reverse-offer');

        if (!room?.reverseOffer || !reverseOfferMessage) {
            throw new Error('Expected reverse-offer data to be created.');
        }

        if (reverseOfferMessage.kind !== 'reverse-offer') {
            throw new Error('Expected reverse-offer message to be appended.');
        }

        expect(reverseOfferMessage.reverseOffer).toBe(room.reverseOffer);
        expect(reverseOfferMessage.reverseOffer).toMatchObject({
            approvedPartnerCount: 0,
            totalPartnerCount: Math.max(room.spot.participants.length - 1, 0),
        });
    });

    it('appends a lightweight shortcut message for an existing spot action item', () => {
        const room = useMainChatStore
            .getState()
            .rooms.find(
                (candidate) =>
                    candidate.id === 'spot-room-spot-2' &&
                    candidate.category === 'spot',
            );

        expect(room).not.toBeNull();

        if (!room || room.category !== 'spot') {
            throw new Error('Expected a spot room with existing action items.');
        }

        const item = getShareableSpotActionItems(room)[0];

        expect(item).toBeDefined();

        if (!item) {
            throw new Error(
                'Expected at least one shareable spot action item.',
            );
        }

        const message = useMainChatStore
            .getState()
            .shareActionShortcut(room.id, item);
        const updatedRoom = useMainChatStore
            .getState()
            .rooms.find((candidate) => candidate.id === room.id);

        expect(message?.kind).toBe('shortcut');

        if (!message || message.kind !== 'shortcut') {
            throw new Error('Expected a shortcut message to be appended.');
        }

        expect(message.shortcut.actionKind).toBe(item.kind);
        expect(message.shortcut.actionId).toBe(item.id);
        expect(updatedRoom?.messages.at(-1)).toEqual(message);
    });
});
