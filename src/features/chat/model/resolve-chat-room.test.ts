import { describe, expect, it } from 'vitest';
import { resolveChatRoom } from './resolve-chat-room';

describe('resolveChatRoom', () => {
    it('prioritizes an explicit room id', () => {
        expect(
            resolveChatRoom({
                roomId: 'personal-room-2',
                spotId: 'spot-1',
                userId: 'user-other',
            }),
        ).toEqual({
            kind: 'room',
            roomId: 'personal-room-2',
            actionTarget: undefined,
        });
    });

    it('keeps action intent attached when room shortcut params are present', () => {
        expect(
            resolveChatRoom({
                roomId: 'spot-room-spot-2',
                actionKind: 'file',
                actionId: 'shared-file-2',
            }),
        ).toEqual({
            kind: 'room',
            roomId: 'spot-room-spot-2',
            actionTarget: {
                actionKind: 'file',
                actionId: 'shared-file-2',
            },
        });
    });

    it('ignores incomplete or unsupported action params', () => {
        expect(
            resolveChatRoom({
                roomId: 'spot-room-spot-2',
                actionKind: 'unknown',
                actionId: 'item-1',
            }),
        ).toEqual({
            kind: 'room',
            roomId: 'spot-room-spot-2',
            actionTarget: undefined,
        });
    });

    it('resolves spot and user intent from query params', () => {
        expect(resolveChatRoom({ spotId: 'spot-2' })).toEqual({
            kind: 'spot',
            spotId: 'spot-2',
        });
        expect(resolveChatRoom({ userId: 'user-milk' })).toEqual({
            kind: 'user',
            userId: 'user-milk',
        });
        expect(
            resolveChatRoom({ userId: ['  user-note  ', 'user-milk'] }),
        ).toEqual({
            kind: 'user',
            userId: 'user-note',
        });
    });

    it('falls back to the default intent for empty params', () => {
        expect(resolveChatRoom({ userId: ['  '] })).toEqual({
            kind: 'default',
        });
    });
});
