import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FeedCard } from './FeedCard';
import type { FeedItem } from '../model/types';

vi.mock('next/image', () => ({
    default: ({ alt }: { alt?: string }) => <img alt={alt ?? ''} />,
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('@/shared/ui', () => ({
    UserAvatarStatic: ({ nickname }: { nickname: string }) => (
        <div>{nickname}</div>
    ),
}));

vi.mock('@frontend/design-system', () => ({
    Chip: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

afterEach(() => {
    cleanup();
});

const baseFeedItem: FeedItem = {
    id: 'feed-card-test-item',
    title: '함께 할 사람 찾는 오퍼',
    location: '성수동',
    authorNickname: '윤하림',
    price: 180000,
    type: 'OFFER',
    status: 'OPEN',
    views: 42,
    likes: 7,
};

describe('FeedCard', () => {
    it('renders 0% and the remaining-start copy for zero-participant OFFER cards', () => {
        render(
            <FeedCard
                item={{
                    ...baseFeedItem,
                    partnerCount: 0,
                    maxParticipants: 4,
                }}
            />,
        );

        expect(screen.getByText('0%')).toBeTruthy();
        expect(screen.getByText('4명만 더 모이면 시작')).toBeTruthy();
    });

    it('does not change REQUEST cards when progressPercent is missing', () => {
        render(
            <FeedCard
                item={{
                    ...baseFeedItem,
                    id: 'feed-card-request-item',
                    type: 'REQUEST',
                    applicantCount: 0,
                    maxParticipants: 4,
                }}
            />,
        );

        expect(screen.queryByText('0%')).toBeNull();
        expect(screen.queryByText('4명만 더 모이면 시작')).toBeNull();
        expect(screen.getByText('요청 금액 미정')).toBeTruthy();
    });

    it('keeps existing non-zero OFFER progress rendering unchanged', () => {
        render(
            <FeedCard
                item={{
                    ...baseFeedItem,
                    id: 'feed-card-non-zero-offer-item',
                    partnerCount: 2,
                    maxParticipants: 4,
                    progressPercent: 50,
                }}
            />,
        );

        expect(screen.getByText('50%')).toBeTruthy();
        expect(screen.getByText('2명만 더 모이면 시작')).toBeTruthy();
    });
});
