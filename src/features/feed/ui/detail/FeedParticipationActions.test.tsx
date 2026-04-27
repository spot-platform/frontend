import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FeedParticipationActions } from './FeedParticipationActions';
import { MOCK_FEED, MOCK_FEED_MANAGEMENT } from '../../model/mock';

const mockPush = vi.fn();
const mockSetQueryData = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockCreateOrSelectFeedParticipationRoom = vi.fn(() => ({ id: 'room-1' }));
const mockShowMessage = vi.fn();
const mockConsumeMockPoints = vi.fn(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_deposit: number, _label: string) => ({
        data: { balance: 39500 },
    }),
);
const mockUsePointBalance = vi.fn(() => ({
    data: { data: { balance: 50000 } },
    isLoading: false,
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        setQueryData: mockSetQueryData,
        invalidateQueries: mockInvalidateQueries,
    }),
}));

vi.mock('@/features/pay', () => ({
    payKeys: {
        balance: ['pay', 'balance'],
    },
    usePointBalance: () => mockUsePointBalance(),
}));

vi.mock('@/features/chat/model/use-main-chat-store', () => ({
    useMainChatStore: (
        selector: (state: {
            createOrSelectFeedParticipationRoom: typeof mockCreateOrSelectFeedParticipationRoom;
        }) => unknown,
    ) =>
        selector({
            createOrSelectFeedParticipationRoom:
                mockCreateOrSelectFeedParticipationRoom,
        }),
}));

vi.mock('@/shared/model/bottom-nav-message-store', () => ({
    useBottomNavMessageStore: (
        selector: (state: { showMessage: typeof mockShowMessage }) => unknown,
    ) =>
        selector({
            showMessage: mockShowMessage,
        }),
}));

vi.mock('@/features/pay/model/mock', () => ({
    consumeMockPoints: (deposit: number, label: string) =>
        mockConsumeMockPoints(deposit, label),
}));

vi.mock('@/shared/ui', () => ({
    BottomSheet: ({
        open,
        title,
        children,
    }: {
        open: boolean;
        title: string;
        children: React.ReactNode;
    }) =>
        open ? (
            <div data-testid="bottom-sheet">
                <h2>{title}</h2>
                {children}
            </div>
        ) : null,
}));

afterEach(() => {
    cleanup();
});

describe('FeedParticipationActions', () => {
    beforeEach(() => {
        mockPush.mockReset();
        mockSetQueryData.mockReset();
        mockInvalidateQueries.mockReset();
        mockCreateOrSelectFeedParticipationRoom.mockClear();
        mockCreateOrSelectFeedParticipationRoom.mockReturnValue({
            id: 'room-1',
        });
        mockShowMessage.mockReset();
        mockConsumeMockPoints.mockReset();
        mockConsumeMockPoints.mockReturnValue({ data: { balance: 39500 } });
        mockUsePointBalance.mockReset();
        mockUsePointBalance.mockReturnValue({
            data: { data: { balance: 50000 } },
            isLoading: false,
        });
    });

    it('uses the supporter desired funding goal for preview and charged deposit', async () => {
        const item = MOCK_FEED.find((feed) => feed.id === '2');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 2 to exist.');
        }

        render(
            <FeedParticipationActions
                item={item}
                management={MOCK_FEED_MANAGEMENT['2']}
            />,
        );

        fireEvent.click(
            screen.getByRole('button', { name: '서포터로 참여하기' }),
        );

        const input = screen.getByRole('textbox') as HTMLInputElement;

        expect(input.value).toBe('180000');
        expect(screen.getByText('기타 카테고리 평균 목표 금액')).toBeTruthy();

        fireEvent.change(input, { target: { value: '210,000원abc' } });

        expect(input.value).toBe('210000');
        expect(screen.getByText('10,500원')).toBeTruthy();
        expect(
            screen.getByText('현재 목표는 평균보다 50,000원 높아요.'),
        ).toBeTruthy();

        fireEvent.click(
            screen.getByRole('button', { name: '서포터로 참여 확정하기' }),
        );

        await waitFor(() => {
            expect(
                mockCreateOrSelectFeedParticipationRoom,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    item,
                    role: 'SUPPORTER',
                    deposit: 10500,
                }),
            );
        });
    });

    it('shows partner deposit breakdown with the current formula and category guidance', () => {
        const item = MOCK_FEED.find((feed) => feed.id === '2');

        expect(item).toBeDefined();

        if (!item) {
            throw new Error('Expected feed item 2 to exist.');
        }

        render(
            <FeedParticipationActions
                item={item}
                management={MOCK_FEED_MANAGEMENT['2']}
            />,
        );

        fireEvent.click(
            screen.getByRole('button', { name: '파트너로 참여하기' }),
        );

        expect(screen.queryByLabelText('희망 목표 금액')).toBeNull();
        expect(screen.getByText('보증금 계산 방식')).toBeTruthy();
        expect(
            screen.getByText('180,000원 ÷ 4명 = 1인 기준 45,000원'),
        ).toBeTruthy();
        expect(
            screen.getByText('1인 기준 45,000원 × 20% = 9,000원'),
        ).toBeTruthy();
        expect(
            screen.getByText(
                '같은 인원 기준 카테고리 평균 보증금은 8,000원이에요.',
            ),
        ).toBeTruthy();
    });
});
