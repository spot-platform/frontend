import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MainChatPageClient } from './MainChatPageClient';
import { getChatRooms } from '../model/mock';
import { getSpotActionItems } from '../model/spot-action-items';
import type {
    ChatRouteIntent,
    MainChatPersonalFilter,
    SpotActionItem,
    SpotChatRoom,
} from '../model/types';

const mockReplace = vi.fn();
const mockPush = vi.fn();
const mockCloseChatNav = vi.fn();
const mockOpenActionItem = vi.fn();
const mockOpenPersonalCreate = vi.fn();
const mockOpenFriendAdd = vi.fn();
const mockSetSubNavOpen = vi.fn();
const mockApplyRouteIntent = vi.fn();
const mockSetSelectedContextId = vi.fn();
const mockSetPersonalFilter = vi.fn();

type MainChatStoreState = {
    rooms: ReturnType<typeof getChatRooms>;
    selectedContextId: string;
    personalFilter: MainChatPersonalFilter;
    setSelectedContextId: typeof mockSetSelectedContextId;
    setPersonalFilter: typeof mockSetPersonalFilter;
    applyRouteIntent: typeof mockApplyRouteIntent;
};

type ChatNavStoreState = {
    subNavOpen: boolean;
    setSubNavOpen: typeof mockSetSubNavOpen;
    close: typeof mockCloseChatNav;
    openPersonalCreate: typeof mockOpenPersonalCreate;
    openFriendAdd: typeof mockOpenFriendAdd;
    openActionItem: typeof mockOpenActionItem;
};

let mockMainChatState: MainChatStoreState;
let mockChatNavState: ChatNavStoreState;

vi.mock('next/navigation', () => ({
    usePathname: () => '/chat',
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
}));

vi.mock('../model/use-main-chat-store', () => ({
    PERSONAL_CHAT_CONTEXT_ID: 'personal',
    useMainChatStore: (selector?: (state: MainChatStoreState) => unknown) =>
        selector ? selector(mockMainChatState) : mockMainChatState,
}));

vi.mock('@/shared/model/chat-nav-store', () => ({
    useChatNavStore: (selector?: (state: ChatNavStoreState) => unknown) =>
        selector ? selector(mockChatNavState) : mockChatNavState,
}));

vi.mock('@frontend/design-system', () => ({
    Chip: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    IconButton: ({
        icon,
        label,
        onClick,
    }: {
        icon: React.ReactNode;
        label: string;
        onClick?: () => void;
    }) => (
        <button type="button" aria-label={label} onClick={onClick}>
            {icon}
        </button>
    ),
}));

vi.mock('../ui/ChatHeaderContextSelect', () => ({
    ChatHeaderContextSelect: ({
        value,
        options,
        disabled,
    }: {
        value: string;
        options: Array<{ label: string; value: string }>;
        disabled?: boolean;
    }) => (
        <div
            data-testid="chat-context-select"
            data-value={value}
            data-disabled={disabled ? 'true' : 'false'}
            data-options={options.map((option) => option.label).join('|')}
        />
    ),
}));

vi.mock('../ui/ChatRoomList', () => ({
    ChatRoomList: () => <div data-testid="chat-room-list" />,
}));

vi.mock('@/shared/ui/SearchBar', () => ({
    SearchBar: () => <div data-testid="search-bar" />,
}));

vi.mock('@/shared/ui', () => ({
    Main: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

vi.mock('@/shared/ui/Tabs', () => ({
    Tabs: ({
        tabs,
        active,
        onChange,
    }: {
        tabs: Array<{ value: string; label: string }>;
        active: string;
        onChange: (value: string) => void;
    }) => (
        <div data-testid="main-chat-top-tabs" data-active={active}>
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onChange(tab.value)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    ),
}));

describe('MainChatPageClient', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        const rooms = getChatRooms();

        mockReplace.mockReset();
        mockPush.mockReset();
        mockCloseChatNav.mockReset();
        mockOpenActionItem.mockReset();
        mockOpenPersonalCreate.mockReset();
        mockOpenFriendAdd.mockReset();
        mockSetSubNavOpen.mockReset();
        mockApplyRouteIntent.mockReset();
        mockSetSelectedContextId.mockReset();
        mockSetPersonalFilter.mockReset();
        mockApplyRouteIntent.mockReturnValue({ roomId: null });

        mockMainChatState = {
            rooms,
            selectedContextId: 'personal',
            personalFilter: 'all',
            setSelectedContextId: mockSetSelectedContextId,
            setPersonalFilter: mockSetPersonalFilter,
            applyRouteIntent: mockApplyRouteIntent,
        };

        mockChatNavState = {
            subNavOpen: false,
            setSubNavOpen: mockSetSubNavOpen,
            close: mockCloseChatNav,
            openPersonalCreate: mockOpenPersonalCreate,
            openFriendAdd: mockOpenFriendAdd,
            openActionItem: mockOpenActionItem,
        };
    });

    it('keeps the action panel open path on cold-loaded room action routes', async () => {
        const room = mockMainChatState.rooms.find(
            (candidate) =>
                candidate.id === 'spot-room-spot-2' &&
                candidate.category === 'spot',
        );

        expect(room).toBeDefined();

        if (!room || room.category !== 'spot') {
            throw new Error('Expected spot-room-spot-2 to exist.');
        }

        const actionItem = getSpotActionItems(room).find(
            (item): item is Extract<SpotActionItem, { kind: 'file' }> =>
                item.kind === 'file',
        );

        expect(actionItem).toBeDefined();

        if (!actionItem) {
            throw new Error('Expected a file action item for the room.');
        }

        const initialIntent: ChatRouteIntent = {
            kind: 'room',
            roomId: room.id,
            actionTarget: {
                actionKind: actionItem.kind,
                actionId: actionItem.id,
            },
        };

        mockApplyRouteIntent.mockReturnValue({ roomId: room.id });

        render(<MainChatPageClient initialIntent={initialIntent} />);

        await waitFor(() => {
            expect(mockOpenActionItem).toHaveBeenCalledWith(actionItem);
        });

        expect(mockReplace).not.toHaveBeenCalled();
        expect(mockCloseChatNav).not.toHaveBeenCalled();
    });

    it('closes stale route-action panels when the target item cannot be resolved', async () => {
        const initialIntent: ChatRouteIntent = {
            kind: 'room',
            roomId: 'spot-room-spot-2',
            actionTarget: {
                actionKind: 'file',
                actionId: 'missing-file-id',
            },
        };

        mockApplyRouteIntent.mockReturnValue({ roomId: 'spot-room-spot-2' });

        render(<MainChatPageClient initialIntent={initialIntent} />);

        await waitFor(() => {
            expect(mockCloseChatNav).toHaveBeenCalled();
        });

        expect(mockOpenActionItem).not.toHaveBeenCalled();
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('renders the selected spot room row before its action items and opens the room on tap', () => {
        const room = mockMainChatState.rooms.find(
            (candidate) => candidate.category === 'spot',
        );

        expect(room).toBeDefined();

        if (!room || room.category !== 'spot') {
            throw new Error('Expected a spot room to exist.');
        }

        mockMainChatState.selectedContextId = room.id;
        mockApplyRouteIntent.mockReturnValue({ roomId: room.id });

        const firstActionItem = getSpotActionItems(room)[0];

        render(<MainChatPageClient initialTopTab="team" />);

        const roomTitle = screen.getAllByText(room.title).at(-1);

        expect(roomTitle).toBeDefined();

        if (!roomTitle) {
            throw new Error('Expected the selected spot room title to render.');
        }

        const roomRow = roomTitle.closest('button');
        const roomPreview = screen.getByText(/팀 채팅방 ·/);

        expect(roomRow).not.toBeNull();
        expect(roomPreview).not.toBeNull();

        if (firstActionItem?.kind === 'reverse-offer') {
            const actionTitle = screen.getByText('역제안 진행 상태');
            const actionRow = actionTitle.closest('button');

            expect(actionRow).not.toBeNull();
            expect(roomRow?.compareDocumentPosition(actionRow as Node)).toBe(
                Node.DOCUMENT_POSITION_FOLLOWING,
            );
        }

        fireEvent.click(roomRow as HTMLButtonElement);

        expect(mockPush).toHaveBeenCalledWith(`/chat/${room.id}`);
    });

    it('still renders the selected spot room row when there are no action items', () => {
        const room = mockMainChatState.rooms.find(
            (candidate) => candidate.category === 'spot',
        );

        expect(room).toBeDefined();

        if (!room || room.category !== 'spot') {
            throw new Error('Expected a spot room to exist.');
        }

        const roomWithoutActionItems: SpotChatRoom = {
            ...room,
            spot: {
                ...room.spot,
                votes: [],
                files: [],
            },
        };
        delete roomWithoutActionItems.reverseOffer;
        delete roomWithoutActionItems.spot.schedule;

        mockMainChatState.rooms = [
            roomWithoutActionItems,
            ...mockMainChatState.rooms.filter(
                (candidate) => candidate.id !== room.id,
            ),
        ];
        mockMainChatState.selectedContextId = room.id;
        mockApplyRouteIntent.mockReturnValue({ roomId: room.id });

        render(<MainChatPageClient initialTopTab="team" />);

        expect(screen.getAllByText(room.title).at(-1)).not.toBeNull();
        expect(screen.getByText(/팀 채팅방 ·/)).not.toBeNull();
        expect(
            screen.getByText('아직 등록된 투표·일정·파일·역제안이 없어요.'),
        ).not.toBeNull();
    });

    it('shows the personal search ui only while personal search is open', () => {
        render(<MainChatPageClient initialTopTab="personal" />);

        fireEvent.click(screen.getByLabelText('개인 채팅 검색'));

        expect(screen.getByTestId('search-bar')).not.toBeNull();
        expect(screen.queryByTestId('chat-context-select')).toBeNull();
    });

    it('renders team mode safely with no team rooms and no personal option in the dropdown', () => {
        mockMainChatState.rooms = mockMainChatState.rooms.filter(
            (candidate) => candidate.category === 'personal',
        );

        render(<MainChatPageClient initialTopTab="team" />);

        expect(
            screen
                .getByTestId('chat-context-select')
                .getAttribute('data-disabled'),
        ).toBe('true');
        expect(
            screen
                .getByTestId('chat-context-select')
                .getAttribute('data-options'),
        ).not.toContain('개인 채팅');
        expect(screen.getByText('참여 중인 팀 채팅이 없어요.')).not.toBeNull();
    });

    it('falls back to the personal tab when a spot intent resolves to a personal room', async () => {
        const personalRoom = mockMainChatState.rooms.find(
            (candidate) => candidate.category === 'personal',
        );

        expect(personalRoom).toBeDefined();

        if (!personalRoom || personalRoom.category !== 'personal') {
            throw new Error('Expected a personal room to exist.');
        }

        mockMainChatState.rooms = mockMainChatState.rooms.filter(
            (candidate) => candidate.category === 'personal',
        );
        mockApplyRouteIntent.mockReturnValue({ roomId: personalRoom.id });

        render(
            <MainChatPageClient
                initialIntent={{ kind: 'spot', spotId: 'missing-spot' }}
                initialTopTab="team"
            />,
        );

        await waitFor(() => {
            expect(
                screen
                    .getByTestId('main-chat-top-tabs')
                    .getAttribute('data-active'),
            ).toBe('personal');
        });

        expect(screen.queryByTestId('chat-context-select')).toBeNull();
        expect(screen.getByTestId('chat-room-list')).not.toBeNull();
    });
});
