// spot-api - 스팟 조회와 액션 요청, 서버 전용 mock fallback을 제공한다.
import type {
    Spot,
    SpotDetail,
    SpotSettlementApproval,
    SpotStatus,
    SpotType,
    PagedResponse,
    SpotParticipant,
    SpotSchedule,
    ScheduleSlot,
    SpotVote,
    SpotChecklist,
    ChecklistItem,
    SharedFile,
    ProgressNote,
    SpotReview,
    SubmitSettlementPayload,
} from '@/entities/spot/types';
import {
    approveMockSpotSettlement,
    cancelMockSpot,
    castMockSpotVote,
    createMockSpot,
    createMockSpotNote,
    createMockSpotVote,
    deleteMockSpotFile,
    getMockSpotChecklist,
    getMockSpotDetail,
    getMockSpotFiles,
    getMockSpotNotes,
    getMockSpotParticipants,
    getMockSpotReviews,
    getMockSpotSchedule,
    getMockSpotVotes,
    listMockSpots,
    matchMockSpot,
    completeMockSpot,
    submitMockSpotReview,
    submitMockSpotSettlement,
    upsertMockSpotChecklist,
    upsertMockSpotSchedule,
} from '../model/mock';

export type SpotListParams = {
    type?: SpotType;
    status?: SpotStatus | SpotStatus[];
    participating?: boolean;
    page?: number;
    size?: number;
};

export type CreateSpotPayload = {
    type: SpotType;
    title: string;
    description: string;
    pointCost: number;
};

export type CreateVotePayload = {
    question: string;
    options: string[];
    multiSelect?: boolean;
};

export type SubmitReviewPayload = {
    targetNickname: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment?: string;
};

export const spotServerApi = {
    get: async (id: string): Promise<{ data: SpotDetail }> => {
        return getMockSpotDetail(id);
    },

    getParticipants: async (
        id: string,
    ): Promise<{ data: SpotParticipant[] }> => {
        return getMockSpotParticipants(id);
    },

    getSchedule: async (id: string): Promise<{ data: SpotSchedule | null }> => {
        return getMockSpotSchedule(id);
    },

    getVotes: async (id: string): Promise<{ data: SpotVote[] }> => {
        return getMockSpotVotes(id);
    },

    getChecklist: async (
        id: string,
    ): Promise<{ data: SpotChecklist | null }> => {
        return getMockSpotChecklist(id);
    },

    getFiles: async (id: string): Promise<{ data: SharedFile[] }> => {
        return getMockSpotFiles(id);
    },

    getNotes: async (id: string): Promise<{ data: ProgressNote[] }> => {
        return getMockSpotNotes(id);
    },

    getReviews: async (id: string): Promise<{ data: SpotReview[] }> => {
        return getMockSpotReviews(id);
    },
};

export const spotsApi = {
    list: async (params?: SpotListParams): Promise<PagedResponse<Spot>> =>
        listMockSpots(params),

    get: async (id: string): Promise<{ data: SpotDetail }> =>
        getMockSpotDetail(id),

    create: async (payload: CreateSpotPayload): Promise<{ data: Spot }> =>
        createMockSpot(payload),

    match: async (id: string): Promise<{ data: Spot }> => matchMockSpot(id),

    cancel: async (id: string): Promise<{ data: Spot }> => cancelMockSpot(id),

    complete: async (id: string): Promise<{ data: Spot }> =>
        completeMockSpot(id),

    getParticipants: async (id: string): Promise<{ data: SpotParticipant[] }> =>
        getMockSpotParticipants(id),

    getSchedule: async (id: string): Promise<{ data: SpotSchedule | null }> =>
        getMockSpotSchedule(id),

    upsertSchedule: async (
        id: string,
        slots: ScheduleSlot[],
    ): Promise<{ data: SpotSchedule }> => upsertMockSpotSchedule(id, slots),

    getVotes: async (id: string): Promise<{ data: SpotVote[] }> =>
        getMockSpotVotes(id),

    createVote: async (
        id: string,
        payload: CreateVotePayload,
    ): Promise<{ data: SpotVote }> => createMockSpotVote(id, payload),

    castVote: async (
        id: string,
        voteId: string,
        optionIds: string[],
    ): Promise<{ data: SpotVote }> => castMockSpotVote(id, voteId, optionIds),

    getChecklist: async (id: string): Promise<{ data: SpotChecklist | null }> =>
        getMockSpotChecklist(id),

    upsertChecklist: async (
        id: string,
        items: ChecklistItem[],
    ): Promise<{ data: SpotChecklist }> => upsertMockSpotChecklist(id, items),

    getFiles: async (id: string): Promise<{ data: SharedFile[] }> =>
        getMockSpotFiles(id),

    deleteFile: async (id: string, fileId: string): Promise<void> =>
        deleteMockSpotFile(id, fileId),

    getNotes: async (id: string): Promise<{ data: ProgressNote[] }> =>
        getMockSpotNotes(id),

    createNote: async (
        id: string,
        content: string,
    ): Promise<{ data: ProgressNote }> => createMockSpotNote(id, content),

    getReviews: async (id: string): Promise<{ data: SpotReview[] }> =>
        getMockSpotReviews(id),

    submitReview: async (
        id: string,
        payload: SubmitReviewPayload,
    ): Promise<{ data: SpotReview }> => submitMockSpotReview(id, payload),

    submitSettlement: async (
        id: string,
        payload: SubmitSettlementPayload,
    ): Promise<{ data: SpotSettlementApproval }> =>
        submitMockSpotSettlement(id, payload),

    approveSettlement: async (
        id: string,
    ): Promise<{ data: SpotSettlementApproval }> =>
        approveMockSpotSettlement(id),
};
