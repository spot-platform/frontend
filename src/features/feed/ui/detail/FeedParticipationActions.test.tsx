import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FeedParticipationActions } from './FeedParticipationActions';
import { MOCK_FEED, MOCK_FEED_MANAGEMENT } from '../../model/mock';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockSetQueryData = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockCreateOrSelectFeedParticipationRoom = vi.fn(() => ({ id: 'room-1' }));
const mockShowMessage = vi.fn();
const {
    mockFeedApply,
    mockFeedCancelApply,
    mockFeedApplications,
    mockFeedAcceptApplication,
    mockFeedRejectApplication,
    mockAuthUserId,
} = vi.hoisted(() => ({
    mockFeedApply: vi.fn(),
    mockFeedCancelApply: vi.fn(),
    mockFeedApplications: vi.fn(),
    mockFeedAcceptApplication: vi.fn(),
    mockFeedRejectApplication: vi.fn(),
    mockAuthUserId: { current: null as string | null },
}));
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
        refresh: mockRefresh,
    }),
}));

vi.mock('@tanstack/react-query', () => ({
    useQuery: ({
        queryFn,
        enabled = true,
    }: {
        queryFn: () => unknown;
        enabled?: boolean;
    }) => ({
        data: enabled ? queryFn() : undefined,
        isLoading: false,
    }),
    useMutation: ({
        mutationFn,
    }: {
        mutationFn: (variables: unknown) => unknown;
    }) => ({
        mutate: vi.fn(),
        mutateAsync: mutationFn,
        isPending: false,
    }),
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

vi.mock('../../api/feed-api', () => ({
    feedApi: {
        apply: mockFeedApply,
        cancelApply: mockFeedCancelApply,
        applications: mockFeedApplications,
        acceptApplication: mockFeedAcceptApplication,
        rejectApplication: mockFeedRejectApplication,
    },
}));

vi.mock('@/shared/model/auth-store', () => ({
    useAuthStore: (selector: (state: { userId: string | null }) => unknown) =>
        selector({ userId: mockAuthUserId.current }),
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
        mockRefresh.mockReset();
        mockSetQueryData.mockReset();
        mockInvalidateQueries.mockReset();
        mockCreateOrSelectFeedParticipationRoom.mockClear();
        mockCreateOrSelectFeedParticipationRoom.mockReturnValue({
            id: 'room-1',
        });
        mockShowMessage.mockReset();
        mockFeedApply.mockReset();
        mockFeedApply.mockResolvedValue({
            data: { id: 'application-1', status: 'APPLIED' },
        });
        mockFeedCancelApply.mockReset();
        mockFeedCancelApply.mockResolvedValue({
            data: { feedId: '2', status: 'CANCELLED' },
        });
        mockFeedApplications.mockReset();
        mockFeedApplications.mockReturnValue({
            data: [
                {
                    id: 'application-1',
                    feedId: '2',
                    userId: 'user-applicant',
                    proposal: '파트너로 참여하고 싶어요.',
                    status: 'APPLIED',
                    appliedRole: 'PARTNER',
                    deposit: 9000,
                    createdAt: '2026-05-01T00:00:00.000Z',
                    applicantProfile: {
                        id: 'user-applicant',
                        nickname: '지원자1',
                        avatarUrl: null,
                    },
                },
            ],
        });
        mockFeedAcceptApplication.mockReset();
        mockFeedAcceptApplication.mockResolvedValue({
            data: { id: 'application-1', status: 'ACCEPTED' },
        });
        mockFeedRejectApplication.mockReset();
        mockFeedRejectApplication.mockResolvedValue({
            data: { id: 'application-1', status: 'REJECTED' },
        });
        mockAuthUserId.current = null;
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

        const input = screen.getByPlaceholderText(
            '180,000원',
        ) as HTMLInputElement;

        expect(input.value).toBe('180000');
        expect(screen.getByText('기타 카테고리 평균 목표 금액')).toBeTruthy();

        fireEvent.change(input, { target: { value: '210,000원abc' } });

        expect(input.value).toBe('210000');
        expect(screen.getByText('10,500원')).toBeTruthy();
        expect(
            screen.getByText('현재 목표는 평균보다 50,000원 높아요.'),
        ).toBeTruthy();
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

    it('keeps the applicant on the feed detail until approval instead of opening chat', async () => {
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
        fireEvent.click(
            screen.getByRole('button', { name: '파트너로 참여 확정하기' }),
        );

        await vi.waitFor(() => {
            expect(mockShowMessage).toHaveBeenCalledWith(
                '참여 신청이 완료되었어요. 승인되면 팀 채팅에 참여할 수 있어요.',
                '',
            );
        });
        expect(mockPush).not.toHaveBeenCalledWith(
            expect.stringContaining('/chat'),
        );
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('shows owner approval actions when the logged-in user matches authorProfile.id', async () => {
        const item = MOCK_FEED.find((feed) => feed.id === '2');

        expect(item?.authorProfile?.id).toBeDefined();

        if (!item?.authorProfile?.id) {
            throw new Error('Expected feed item 2 author profile to exist.');
        }

        mockAuthUserId.current = item.authorProfile.id;

        render(<FeedParticipationActions item={item} />);

        expect(
            screen.queryByRole('button', { name: '파트너로 참여하기' }),
        ).toBeNull();
        expect(screen.getByText('내 피드 신청 관리')).toBeTruthy();
        expect(screen.getByText('지원자1')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: '수락' }));

        await vi.waitFor(() => {
            expect(mockFeedAcceptApplication).toHaveBeenCalledWith(
                item.id,
                'application-1',
            );
        });
        expect(mockShowMessage).toHaveBeenCalledWith(
            '신청자를 수락했어요.',
            '',
        );
        expect(mockRefresh).toHaveBeenCalled();
    });
});
