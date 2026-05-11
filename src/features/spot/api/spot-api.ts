// spot-api - 스팟 조회와 액션 요청, 서버 전용 mock fallback을 제공한다.
import { buildQueryString, clientApiFetch } from '@/lib/client-api';
import { serverApiFetch } from '@/lib/server-api';
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
    getMockSpotReviews,
    submitMockSpotReview,
    submitMockSpotSettlement,
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
    // 2026-04-30 contextBuilder 통합. OFFER 는 작성 시 채움, REQUEST 는 옵셔널.
    plan?: import('@/entities/spot/simulation-types').PlanV3;
    priceBreakdown?: import('@/entities/spot/simulation-types').PriceBreakdown;
    preparation?: import('@/entities/spot/simulation-types').Preparation;
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

type BackendPaged<T> = {
    data?: T[];
    meta?: PagedResponse<T>['meta'];
};

type BackendSpot = Omit<Spot, 'type' | 'status'> & {
    type: Spot['type'] | 'RENT';
    status: Spot['status'];
};

type BackendParticipant = {
    userId: string;
    role: SpotParticipant['role'];
    joinedAt: string;
};

type BackendSchedule = {
    id: number;
    title: string;
    scheduledAt: string;
};

type BackendVote = {
    id: number;
    question: string;
    state?: 'ACTIVE' | 'CLOSED';
    options?: {
        id: number;
        content: string;
        voteCount?: number;
    }[];
};

type BackendChecklistItem = {
    id: number;
    content: string;
    isDone?: boolean;
};

type BackendFile = {
    id: number;
    uploaderId?: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
};

type BackendNote = {
    id: number;
    authorId?: string;
    content: string;
    createdAt: string;
};

function toSpot(spot: BackendSpot): Spot {
    return {
        ...spot,
        type: spot.type === 'RENT' ? 'OFFER' : spot.type,
    };
}

function toSpotDetail(spot: BackendSpot): SpotDetail {
    return {
        ...toSpot(spot),
        timeline: [],
    };
}

function toPagedResponse<T>(response: BackendPaged<T>): PagedResponse<T> {
    return {
        data: response.data ?? [],
        meta: response.meta,
    };
}

function toParticipant(participant: BackendParticipant): SpotParticipant {
    return {
        userId: participant.userId,
        nickname: participant.userId,
        role: participant.role,
        joinedAt: participant.joinedAt,
    };
}

function toScheduleSlot(schedule: BackendSchedule): ScheduleSlot {
    const date = new Date(schedule.scheduledAt);

    return {
        date: Number.isNaN(date.getTime())
            ? schedule.scheduledAt.slice(0, 10)
            : date.toISOString().slice(0, 10),
        hour: Number.isNaN(date.getTime()) ? 0 : date.getHours(),
        availableUserIds: [],
    };
}

function toSchedule(
    spotId: string,
    schedules: BackendSchedule[] | BackendSchedule | null,
): SpotSchedule | null {
    const scheduleList = Array.isArray(schedules)
        ? schedules
        : schedules
          ? [schedules]
          : [];

    if (scheduleList.length === 0) {
        return null;
    }

    return {
        spotId,
        proposedSlots: scheduleList.map(toScheduleSlot),
        confirmedSlot: toScheduleSlot(scheduleList[0]),
    };
}

function toVote(spotId: string, vote: BackendVote): SpotVote {
    return {
        id: String(vote.id),
        spotId,
        question: vote.question,
        options: (vote.options ?? []).map((option) => ({
            id: String(option.id),
            label: option.content,
            voterIds: Array.from(
                { length: option.voteCount ?? 0 },
                (_, index) => `voter-${option.id}-${index}`,
            ),
        })),
        multiSelect: false,
        closedAt:
            vote.state === 'CLOSED' ? new Date().toISOString() : undefined,
    };
}

function toChecklist(
    spotId: string,
    items: BackendChecklistItem[] | BackendChecklistItem | null,
): SpotChecklist | null {
    const itemList = Array.isArray(items) ? items : items ? [items] : [];

    if (itemList.length === 0) {
        return null;
    }

    return {
        spotId,
        items: itemList.map((item) => ({
            id: String(item.id),
            text: item.content,
            completed: item.isDone ?? false,
        })),
    };
}

function toFile(spotId: string, file: BackendFile): SharedFile {
    return {
        id: String(file.id),
        spotId,
        uploaderNickname: file.uploaderId ?? '',
        name: file.fileName,
        url: file.fileUrl,
        sizeBytes: 0,
        uploadedAt: file.uploadedAt,
    };
}

function toNote(spotId: string, note: BackendNote): ProgressNote {
    return {
        id: String(note.id),
        spotId,
        authorNickname: note.authorId ?? '',
        content: note.content,
        createdAt: note.createdAt,
    };
}

function firstSchedulePayload(slots: ScheduleSlot[]) {
    const firstSlot = slots[0];

    if (!firstSlot) {
        throw new Error('등록할 일정이 없습니다.');
    }

    return {
        title: '스팟 일정',
        scheduledAt: `${firstSlot.date}T${String(firstSlot.hour).padStart(2, '0')}:00:00`,
    };
}

function firstChecklistPayload(items: ChecklistItem[]) {
    const firstItem = items[0];

    if (!firstItem) {
        throw new Error('등록할 체크리스트 항목이 없습니다.');
    }

    return { content: firstItem.text };
}

function toSpotListQuery(params?: SpotListParams) {
    return {
        ...params,
        status: params?.status,
    };
}

export const spotServerApi = {
    get: async (id: string): Promise<{ data: SpotDetail }> => {
        const data = await serverApiFetch(`/api/spots/${id}`).then(
            async (response) => {
                if (!response.ok) {
                    throw new Error('스팟 상세 조회에 실패했어요.');
                }
                const payload = (await response.json()) as {
                    data: BackendSpot;
                };
                return payload.data;
            },
        );
        return { data: toSpotDetail(data) };
    },

    getParticipants: async (
        id: string,
    ): Promise<{ data: SpotParticipant[] }> => {
        const data = await serverApiFetch(`/api/spots/${id}/participants`).then(
            async (response) => {
                if (!response.ok) {
                    throw new Error('스팟 참여자 조회에 실패했어요.');
                }
                const payload = (await response.json()) as {
                    data: BackendParticipant[];
                };
                return payload.data;
            },
        );
        return { data: (data ?? []).map(toParticipant) };
    },

    getSchedule: async (id: string): Promise<{ data: SpotSchedule | null }> => {
        const data = await serverApiFetch(`/api/spots/${id}/schedule`).then(
            async (response) => {
                if (!response.ok) {
                    throw new Error('스팟 일정 조회에 실패했어요.');
                }
                const payload = (await response.json()) as {
                    data: BackendSchedule[];
                };
                return payload.data;
            },
        );
        return { data: toSchedule(id, data) };
    },

    getVotes: async (id: string): Promise<{ data: SpotVote[] }> => {
        const data = await serverApiFetch(`/api/spots/${id}/votes`).then(
            async (response) => {
                if (!response.ok) {
                    throw new Error('스팟 투표 조회에 실패했어요.');
                }
                const payload = (await response.json()) as {
                    data: BackendVote[];
                };
                return payload.data;
            },
        );
        return { data: (data ?? []).map((vote) => toVote(id, vote)) };
    },

    getChecklist: async (
        id: string,
    ): Promise<{ data: SpotChecklist | null }> => {
        const data = await serverApiFetch(`/api/spots/${id}/checklist`).then(
            async (response) => {
                if (!response.ok) {
                    throw new Error('스팟 체크리스트 조회에 실패했어요.');
                }
                const payload = (await response.json()) as {
                    data: BackendChecklistItem[];
                };
                return payload.data;
            },
        );
        return { data: toChecklist(id, data) };
    },

    getFiles: async (id: string): Promise<{ data: SharedFile[] }> => {
        const data = await serverApiFetch(`/api/spots/${id}/files`).then(
            async (response) => {
                if (!response.ok) {
                    throw new Error('스팟 파일 조회에 실패했어요.');
                }
                const payload = (await response.json()) as {
                    data: BackendFile[];
                };
                return payload.data;
            },
        );
        return { data: (data ?? []).map((file) => toFile(id, file)) };
    },

    getNotes: async (id: string): Promise<{ data: ProgressNote[] }> => {
        const data = await serverApiFetch(`/api/spots/${id}/notes`).then(
            async (response) => {
                if (!response.ok) {
                    throw new Error('스팟 노트 조회에 실패했어요.');
                }
                const payload = (await response.json()) as {
                    data: BackendNote[];
                };
                return payload.data;
            },
        );
        return { data: (data ?? []).map((note) => toNote(id, note)) };
    },

    getReviews: async (id: string): Promise<{ data: SpotReview[] }> => {
        return getMockSpotReviews(id);
    },
};

export const spotsApi = {
    list: async (params?: SpotListParams): Promise<PagedResponse<Spot>> =>
        clientApiFetch<BackendPaged<BackendSpot>>(
            `/spots${buildQueryString(toSpotListQuery(params))}`,
        ).then((response) => {
            const paged = toPagedResponse(response);
            return {
                ...paged,
                data: paged.data.map(toSpot),
            };
        }),

    get: async (id: string): Promise<{ data: SpotDetail }> =>
        clientApiFetch<BackendSpot>(`/spots/${id}`).then((data) => ({
            data: toSpotDetail(data),
        })),

    create: async (payload: CreateSpotPayload): Promise<{ data: Spot }> =>
        clientApiFetch<BackendSpot>('/spots', {
            method: 'POST',
            body: JSON.stringify(payload),
        }).then((data) => ({ data: toSpot(data) })),

    match: async (id: string): Promise<{ data: Spot }> =>
        clientApiFetch<BackendSpot>(`/spots/${id}/match`, {
            method: 'POST',
        }).then((data) => ({ data: toSpot(data) })),

    cancel: async (id: string): Promise<{ data: Spot }> =>
        clientApiFetch<BackendSpot>(`/spots/${id}/cancel`, {
            method: 'POST',
        }).then((data) => ({ data: toSpot(data) })),

    complete: async (id: string): Promise<{ data: Spot }> =>
        clientApiFetch<BackendSpot>(`/spots/${id}/complete`, {
            method: 'POST',
        }).then((data) => ({ data: toSpot(data) })),

    getParticipants: async (id: string): Promise<{ data: SpotParticipant[] }> =>
        clientApiFetch<BackendParticipant[]>(`/spots/${id}/participants`).then(
            (data) => ({ data: (data ?? []).map(toParticipant) }),
        ),

    getSchedule: async (id: string): Promise<{ data: SpotSchedule | null }> =>
        clientApiFetch<BackendSchedule[]>(`/spots/${id}/schedule`).then(
            (data) => ({ data: toSchedule(id, data) }),
        ),

    upsertSchedule: async (
        id: string,
        slots: ScheduleSlot[],
    ): Promise<{ data: SpotSchedule }> =>
        clientApiFetch<BackendSchedule>(`/spots/${id}/schedule`, {
            method: 'PUT',
            body: JSON.stringify(firstSchedulePayload(slots)),
        }).then((data) => ({
            data: toSchedule(id, data) ?? {
                spotId: id,
                proposedSlots: slots,
            },
        })),

    getVotes: async (id: string): Promise<{ data: SpotVote[] }> =>
        clientApiFetch<BackendVote[]>(`/spots/${id}/votes`).then((data) => ({
            data: (data ?? []).map((vote) => toVote(id, vote)),
        })),

    createVote: async (
        id: string,
        payload: CreateVotePayload,
    ): Promise<{ data: SpotVote }> =>
        clientApiFetch<BackendVote>(`/spots/${id}/votes`, {
            method: 'POST',
            body: JSON.stringify({
                question: payload.question,
                options: payload.options,
            }),
        }).then((data) => ({ data: toVote(id, data) })),

    castVote: async (
        id: string,
        voteId: string,
        optionIds: string[],
    ): Promise<{ data: SpotVote }> =>
        clientApiFetch<BackendVote>(`/spots/${id}/votes/${voteId}/cast`, {
            method: 'POST',
            body: JSON.stringify({
                optionId: Number(optionIds[0]),
            }),
        }).then((data) => ({ data: toVote(id, data) })),

    getChecklist: async (id: string): Promise<{ data: SpotChecklist | null }> =>
        clientApiFetch<BackendChecklistItem[]>(`/spots/${id}/checklist`).then(
            (data) => ({ data: toChecklist(id, data) }),
        ),

    upsertChecklist: async (
        id: string,
        items: ChecklistItem[],
    ): Promise<{ data: SpotChecklist }> =>
        clientApiFetch<BackendChecklistItem>(`/spots/${id}/checklist`, {
            method: 'PUT',
            body: JSON.stringify(firstChecklistPayload(items)),
        }).then((data) => ({
            data: toChecklist(id, data) ?? {
                spotId: id,
                items,
            },
        })),

    getFiles: async (id: string): Promise<{ data: SharedFile[] }> =>
        clientApiFetch<BackendFile[]>(`/spots/${id}/files`).then((data) => ({
            data: (data ?? []).map((file) => toFile(id, file)),
        })),

    deleteFile: async (id: string, fileId: string): Promise<void> =>
        clientApiFetch<void>(`/spots/${id}/files/${fileId}`, {
            method: 'DELETE',
        }),

    getNotes: async (id: string): Promise<{ data: ProgressNote[] }> =>
        clientApiFetch<BackendNote[]>(`/spots/${id}/notes`).then((data) => ({
            data: (data ?? []).map((note) => toNote(id, note)),
        })),

    createNote: async (
        id: string,
        content: string,
    ): Promise<{ data: ProgressNote }> =>
        clientApiFetch<BackendNote>(`/spots/${id}/notes`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        }).then((data) => ({ data: toNote(id, data) })),

    getReviews: async (id: string): Promise<{ data: SpotReview[] }> =>
        clientApiFetch<unknown>(`/spots/${id}/reviews`).then((data) => ({
            data: Array.isArray(data) ? (data as SpotReview[]) : [],
        })),

    submitReview: async (
        id: string,
        payload: SubmitReviewPayload,
    ): Promise<{ data: SpotReview }> =>
        clientApiFetch<void>(`/spots/${id}/reviews`, {
            method: 'POST',
            body: JSON.stringify(payload),
        })
            .then(() => ({
                data: {
                    id: `review-${Date.now()}`,
                    spotId: id,
                    reviewerNickname: '',
                    targetNickname: payload.targetNickname,
                    rating: payload.rating,
                    comment: payload.comment,
                    createdAt: new Date().toISOString(),
                },
            }))
            .catch(() => submitMockSpotReview(id, payload)),

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
