import { describe, expect, it } from 'vitest';
import { resolveChatTopTab } from './resolve-chat-top-tab';

describe('resolveChatTopTab', () => {
    it('respects the explicit tab query when there is no route intent override', () => {
        expect(resolveChatTopTab({ tab: 'team' })).toBe('team');
        expect(resolveChatTopTab({ tab: [' personal ', 'team'] })).toBe(
            'personal',
        );
    });

    it('forces route intents into the correct top-level tab', () => {
        expect(
            resolveChatTopTab(
                { tab: 'personal', spotId: 'spot-2' },
                {
                    kind: 'spot',
                    spotId: 'spot-2',
                },
            ),
        ).toBe('team');

        expect(
            resolveChatTopTab(
                { tab: 'team', userId: 'user-milk' },
                {
                    kind: 'user',
                    userId: 'user-milk',
                },
            ),
        ).toBe('personal');

        expect(
            resolveChatTopTab(
                { tab: 'team', roomId: 'personal-room-2' },
                {
                    kind: 'room',
                    roomId: 'personal-room-2',
                },
            ),
        ).toBe('personal');

        expect(
            resolveChatTopTab(
                { tab: 'personal', roomId: 'spot-room-spot-2' },
                {
                    kind: 'room',
                    roomId: 'spot-room-spot-2',
                },
            ),
        ).toBe('team');
    });

    it('falls back to personal when the tab query is missing or invalid', () => {
        expect(resolveChatTopTab({ tab: 'unknown' })).toBe('personal');
        expect(resolveChatTopTab()).toBe('personal');
    });
});
