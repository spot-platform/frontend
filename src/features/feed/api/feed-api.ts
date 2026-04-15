import type { FeedApplication, FeedApplicationRole } from '../model/types';
import {
    applyMockFeedApplication,
    cancelMockFeedApplication,
} from '../model/mock';

export type FeedApplyPayload = {
    proposal: string;
    role: FeedApplicationRole;
    deposit: number;
};

export const feedApi = {
    apply: async (
        feedId: string,
        payload: FeedApplyPayload,
    ): Promise<{ data: FeedApplication }> =>
        applyMockFeedApplication(feedId, payload),

    cancelApply: async (
        feedId: string,
    ): Promise<{ data: { feedId: string; status: 'CANCELLED' } }> =>
        cancelMockFeedApplication(feedId),
};
