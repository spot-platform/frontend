import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatDrawer } from './ChatDrawer';
import type { ChatRoom } from '../model/types';

const mockPush = vi.fn();
const mockLoadRooms = vi.fn();
const mockOnClose = vi.fn();
let mockRooms: ChatRoom[] = [];

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    motion: {
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
            <div {...props}>{children}</div>
        ),
    },
}));

vi.mock('../model/use-main-chat-store', () => ({
    useMainChatStore: (selector: (state: unknown) => unknown) =>
        selector({ rooms: mockRooms, loadRooms: mockLoadRooms }),
}));

describe('ChatDrawer', () => {
    beforeEach(() => {
        mockPush.mockReset();
        mockLoadRooms.mockReset();
        mockLoadRooms.mockResolvedValue(undefined);
        mockOnClose.mockReset();
        mockRooms = [];
    });

    afterEach(() => {
        cleanup();
    });

    it('requests chat rooms when the drawer opens so personal/feed/spot sections are populated from API state', async () => {
        render(<ChatDrawer open onClose={mockOnClose} />);

        await waitFor(() => {
            expect(mockLoadRooms).toHaveBeenCalledTimes(1);
        });
        expect(screen.getByText('개인 채팅')).not.toBeNull();
        expect(screen.getByText('피드 채팅')).not.toBeNull();
        expect(screen.getByText('스팟 채팅')).not.toBeNull();
    });

    it('does not request chat rooms while the drawer is closed', () => {
        render(<ChatDrawer open={false} onClose={mockOnClose} />);

        expect(mockLoadRooms).not.toHaveBeenCalled();
    });
});
