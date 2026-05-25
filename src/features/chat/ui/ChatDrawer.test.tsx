import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatDrawer } from './ChatDrawer';
import type { ChatRoom, PersonalChatRoom, SpotChatRoom } from '../model/types';

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

function createPersonalRoom(
    overrides: Partial<PersonalChatRoom>,
): PersonalChatRoom {
    return {
        id: 'personal-room',
        category: 'personal',
        currentUserId: 'user-me',
        currentUserName: '나',
        partnerId: 'user-partner',
        partnerName: '민수',
        presenceLabel: '온라인',
        unreadCount: 2,
        counterpartRole: 'PARTNER',
        title: '민수',
        subtitle: '개인 채팅',
        description: '개인 마지막 메시지',
        metaLabel: '개인 채팅',
        updatedAt: '2026-05-24T12:00:00.000Z',
        messages: [],
        ...overrides,
    };
}

function createSpotRoom(overrides: Partial<SpotChatRoom>): SpotChatRoom {
    return {
        id: 'spot-room',
        category: 'spot',
        currentUserId: 'user-me',
        currentUserName: '나',
        title: '한강 러닝 스팟',
        subtitle: '스팟 채팅',
        description: '스팟 마지막 메시지',
        metaLabel: '팀 채팅',
        updatedAt: '2026-05-24T11:00:00.000Z',
        unreadCount: 1,
        messages: [],
        spot: { id: 'spot-1' } as SpotChatRoom['spot'],
        ...overrides,
    };
}

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

    it('requests chat rooms when the drawer opens and renders the messenger-style filter badges', async () => {
        render(<ChatDrawer open onClose={mockOnClose} />);

        await waitFor(() => {
            expect(mockLoadRooms).toHaveBeenCalledTimes(1);
        });
        expect(
            screen.getByRole('button', { name: '전체 채팅 필터' }),
        ).not.toBeNull();
        expect(
            screen.getByRole('button', { name: '개인 채팅 필터' }),
        ).not.toBeNull();
        expect(
            screen.getByRole('button', { name: '피드 채팅 필터' }),
        ).not.toBeNull();
        expect(
            screen.getByRole('button', { name: '스팟 채팅 필터' }),
        ).not.toBeNull();
        expect(screen.queryByText('개인 채팅')).toBeNull();
        expect(screen.queryByText('피드 채팅')).toBeNull();
        expect(screen.queryByText('스팟 채팅')).toBeNull();
    });

    it('filters one shared chat list into personal, feed, and spot buckets', () => {
        mockRooms = [
            createPersonalRoom({ id: 'personal-room', title: '민수' }),
            createSpotRoom({
                id: 'feed-room',
                title: '저녁 산책 피드',
                sourceFeedId: 'feed-1',
                spot: { id: 'feed-1' } as SpotChatRoom['spot'],
            }),
            createSpotRoom({
                id: 'spot-room',
                title: '한강 러닝 스팟',
                sourceFeedId: undefined,
                spot: { id: 'spot-1' } as SpotChatRoom['spot'],
            }),
        ];

        render(<ChatDrawer open onClose={mockOnClose} />);

        expect(screen.getByText('민수')).not.toBeNull();
        expect(screen.getByText('저녁 산책 피드')).not.toBeNull();
        expect(screen.getByText('한강 러닝 스팟')).not.toBeNull();

        fireEvent.click(screen.getByRole('button', { name: '피드 채팅 필터' }));
        expect(screen.queryByText('민수')).toBeNull();
        expect(screen.getByText('저녁 산책 피드')).not.toBeNull();
        expect(screen.queryByText('한강 러닝 스팟')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: '스팟 채팅 필터' }));
        expect(screen.queryByText('민수')).toBeNull();
        expect(screen.queryByText('저녁 산책 피드')).toBeNull();
        expect(screen.getByText('한강 러닝 스팟')).not.toBeNull();
    });

    it('sorts each chat filter by the latest updated room first', () => {
        mockRooms = [
            createPersonalRoom({
                id: 'personal-old',
                title: '오래된 개인',
                updatedAt: '2026-05-24T10:00:00.000Z',
            }),
            createPersonalRoom({
                id: 'personal-new',
                title: '최신 개인',
                updatedAt: '2026-05-24T13:00:00.000Z',
            }),
            createSpotRoom({
                id: 'spot-old',
                title: '오래된 스팟',
                updatedAt: '2026-05-24T09:00:00.000Z',
                sourceFeedId: undefined,
                spot: { id: 'spot-old' } as SpotChatRoom['spot'],
            }),
            createSpotRoom({
                id: 'spot-new',
                title: '최신 스팟',
                updatedAt: '2026-05-24T14:00:00.000Z',
                sourceFeedId: undefined,
                spot: { id: 'spot-new' } as SpotChatRoom['spot'],
            }),
        ];

        render(<ChatDrawer open onClose={mockOnClose} />);

        fireEvent.click(screen.getByRole('button', { name: '개인 채팅 필터' }));
        const personalRows = screen.getAllByRole('button');
        expect(
            personalRows.findIndex((row) =>
                row.textContent?.includes('최신 개인'),
            ),
        ).toBeLessThan(
            personalRows.findIndex((row) =>
                row.textContent?.includes('오래된 개인'),
            ),
        );

        fireEvent.click(screen.getByRole('button', { name: '스팟 채팅 필터' }));
        const spotRows = screen.getAllByRole('button');
        expect(
            spotRows.findIndex((row) => row.textContent?.includes('최신 스팟')),
        ).toBeLessThan(
            spotRows.findIndex((row) =>
                row.textContent?.includes('오래된 스팟'),
            ),
        );
    });

    it('does not request chat rooms while the drawer is closed', () => {
        render(<ChatDrawer open={false} onClose={mockOnClose} />);

        expect(mockLoadRooms).not.toHaveBeenCalled();
    });
});
