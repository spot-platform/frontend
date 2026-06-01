import { describe, expect, it } from 'vitest';
import { shouldSubmitChatDraft } from './ChatDetail';

function keyEvent({
    key,
    shiftKey = false,
    isComposing = false,
    keyCode,
}: {
    key: string;
    shiftKey?: boolean;
    isComposing?: boolean;
    keyCode?: number;
}) {
    return {
        key,
        shiftKey,
        nativeEvent: { isComposing, keyCode },
    };
}

describe('ChatDetail message composer', () => {
    it('does not submit while Korean IME composition is being finalized', () => {
        expect(
            shouldSubmitChatDraft(
                keyEvent({ key: 'Enter', isComposing: true }),
            ),
        ).toBe(false);
    });

    it('does not submit legacy IME Enter key events reported as keyCode 229', () => {
        expect(
            shouldSubmitChatDraft(
                keyEvent({ key: 'Enter', isComposing: false, keyCode: 229 }),
            ),
        ).toBe(false);
    });

    it('submits plain Enter when not composing', () => {
        expect(shouldSubmitChatDraft(keyEvent({ key: 'Enter' }))).toBe(true);
    });

    it('keeps Shift+Enter available for line breaks', () => {
        expect(
            shouldSubmitChatDraft(keyEvent({ key: 'Enter', shiftKey: true })),
        ).toBe(false);
    });
});
