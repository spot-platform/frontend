// spot-api - 스팟 조회와 액션 요청, 서버 전용 mock fallback을 제공한다.
import { buildQueryString, clientApiFetch } from '@/lib/client-api';
import { endpoints } from '@/lib/endpoint';
import { serverApiFetch } from '@/lib/server-api';
import type {
    Spot,
    SpotDetail,
    SpotMapItem,
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
import { getMockSpotReviews, submitMockSpotReview } from '../model/mock';

export type SpotListParams = {
    type?: SpotType;
    status?: SpotStatus | SpotStatus[];
    participating?: boolean;
    page?: number;
    size?: number;
};

export type SpotSearchParams = {
    q: string;
    scope?: 'ALL' | 'TITLE' | 'CONTENT' | string;
    page?: number;
    size?: number;
};

export type SpotMapParams = {
    swLat?: number;
    swLng?: number;
    neLat?: number;
    neLng?: number;
    category?: string;
    type?: SpotType | 'RENT' | string;
    status?: SpotStatus | string;
};

export type UploadFilePayload = {
    fileName: string;
    fileUrl: string;
    sizeBytes?: number;
};

export type AssignChecklistPayload = {
    assigneeId?: string | null;
};

export type CreateSpotPayload = {
    type: SpotType;
    title: string;
    description: string;
    pointCost: number;
    category?: string;
    lat?: number;
    lng?: number;
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

type BackendSettlementLineItem = {
    label?: string;
    amount?: number;
};

type BackendSettlement = {
    id?: string | number;
    spotId?: string | number;
    status?: SpotSettlementApproval['status'];
    summary?: string;
    totalAmount?: number;
    requestedAmount?: number;
    approvedAmount?: number;
    lineItems?: BackendSettlementLineItem[];
    requesterId?: string;
    createdAt?: string;
    approvedBy?: string;
    approvedAt?: string | null;
};

type BackendSpot = Omit<Spot, 'id' | 'type' | 'status'> & {
    id: string | number;
    type: Spot['type'] | 'RENT';
    status: Spot['status'];
    settlement?: BackendSettlement | null;
    participantCount?: number;
    isOwner?: boolean;
    timeline?: SpotDetail['timeline'];
};

type BackendSpotMapItem = Omit<SpotMapItem, 'id' | 'type'> & {
    id: string | number;
    type: SpotMapItem['type'] | 'RENT';
};

type BackendParticipant = {
    userId: string;
    nickname?: string;
    role?: SpotParticipant['role'];
    joinedAt: string;
};

type BackendScheduleSlot = {
    date: string;
    hour: number;
    availableUserIds?: string[];
};

type BackendSchedule = {
    spotId: number;
    proposedSlots?: BackendScheduleSlot[];
    confirmedSlot?: BackendScheduleSlot | null;
};

type BackendVote = {
    id: number;
    question: string;
    state?: 'ACTIVE' | 'CLOSED';
    multiSelect?: boolean;
    closedAt?: string;
    options?: {
        id: number;
        label?: string;
        content?: string;
        voteCount?: number;
        voterIds?: string[];
    }[];
    myVotedOptionIds?: number[] | null;
};

type BackendChecklistItem = {
    id: number;
    text?: string;
    content?: string;
    isDone?: boolean;
    completed?: boolean;
    assigneeId?: string;
    assigneeNickname?: string;
};

type BackendFile = {
    id: number;
    uploaderId?: string;
    uploaderNickname?: string;
    fileName?: string;
    name?: string;
    fileUrl?: string;
    url?: string;
    sizeBytes?: number;
    uploadedAt: string;
};

type BackendNote = {
    id: number;
    authorId?: string;
    authorNickname?: string;
    content: string;
    createdAt: string;
};

function toSpot(spot: BackendSpot): Spot {
    return {
        ...spot,
        id: String(spot.id),
        type: spot.type === 'RENT' ? 'OFFER' : spot.type,
    };
}

function toSettlement(
    settlement?: BackendSettlement | null,
): SpotSettlementApproval | null {
    if (!settlement) return null;

    const requestedAmount =
        settlement.requestedAmount ?? settlement.totalAmount ?? 0;
    const approvedAmount =
        settlement.approvedAmount ??
        (settlement.status === 'APPROVED' ? requestedAmount : 0);

    return {
        id: settlement.id == null ? undefined : String(settlement.id),
        spotId:
            settlement.spotId == null ? undefined : String(settlement.spotId),
        status: settlement.status ?? 'PENDING',
        requestedAmount,
        approvedAmount,
        summary: settlement.summary ?? '',
        lineItems: (settlement.lineItems ?? []).map((item) => ({
            label: item.label ?? '정산 항목',
            amount: item.amount ?? 0,
        })),
        submittedBy: settlement.requesterId,
        submittedAt: settlement.createdAt,
        approvedBy: settlement.approvedBy,
        approvedAt: settlement.approvedAt ?? undefined,
    };
}

function toSpotMapItem(item: BackendSpotMapItem): SpotMapItem {
    return {
        ...item,
        id: String(item.id),
        type: item.type === 'RENT' ? 'OFFER' : item.type,
    };
}

function toSpotDetail(spot: BackendSpot): SpotDetail {
    return {
        ...toSpot(spot),
        participantCount: spot.participantCount,
        isOwner: spot.isOwner,
        settlement: toSettlement(spot.settlement),
        timeline: spot.timeline ?? [],
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
        nickname: participant.nickname ?? participant.userId,
        role: (participant.role ?? 'PARTNER') as SpotParticipant['role'],
        joinedAt: participant.joinedAt,
    };
}

function toScheduleSlot(schedule: BackendScheduleSlot): ScheduleSlot {
    return {
        date: schedule.date,
        hour: schedule.hour,
        availableUserIds: schedule.availableUserIds ?? [],
    };
}

function toSchedule(schedule: BackendSchedule | null): SpotSchedule | null {
    if (!schedule) {
        return null;
    }

    return {
        spotId: String(schedule.spotId),
        proposedSlots: (schedule.proposedSlots ?? []).map(toScheduleSlot),
        confirmedSlot: schedule.confirmedSlot
            ? toScheduleSlot(schedule.confirmedSlot)
            : undefined,
    };
}

function toVote(spotId: string, vote: BackendVote): SpotVote {
    return {
        id: String(vote.id),
        spotId,
        question: vote.question,
        options: (vote.options ?? []).map((option) => ({
            id: String(option.id),
            label: option.label ?? option.content ?? '',
            voterIds:
                option.voterIds ??
                Array.from(
                    { length: option.voteCount ?? 0 },
                    (_, index) => `voter-${option.id}-${index}`,
                ),
        })),
        multiSelect: vote.multiSelect ?? false,
        closedAt:
            vote.closedAt ??
            (vote.state === 'CLOSED' ? new Date().toISOString() : undefined),
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
            text: item.text ?? item.content ?? '',
            completed: item.completed ?? item.isDone ?? false,
            assigneeId: item.assigneeId,
            assigneeNickname: item.assigneeNickname,
        })),
    };
}

function toFile(spotId: string, file: BackendFile): SharedFile {
    return {
        id: String(file.id),
        spotId,
        uploaderNickname: file.uploaderNickname ?? file.uploaderId ?? '',
        name: file.name ?? file.fileName ?? '',
        url: file.url ?? file.fileUrl ?? '',
        sizeBytes: file.sizeBytes ?? 0,
        uploadedAt: file.uploadedAt,
    };
}

function toNote(spotId: string, note: BackendNote): ProgressNote {
    return {
        id: String(note.id),
        spotId,
        authorNickname: note.authorNickname ?? note.authorId ?? '',
        content: note.content,
        createdAt: note.createdAt,
    };
}

function schedulePayload(slots: ScheduleSlot[]) {
    return {
        proposedSlots: slots.map((slot) => ({
            date: slot.date,
            hour: slot.hour,
            availableUserIds: slot.availableUserIds ?? [],
        })),
        confirmedSlot: null,
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
        const data = await serverApiFetch(endpoints.spots.detail(id)).then(
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
        const data = await serverApiFetch(
            endpoints.spots.participants(id),
        ).then(async (response) => {
            if (!response.ok) {
                throw new Error('스팟 참여자 조회에 실패했어요.');
            }
            const payload = (await response.json()) as {
                data: BackendParticipant[];
            };
            return payload.data;
        });
        return { data: (data ?? []).map(toParticipant) };
    },

    getSchedule: async (id: string): Promise<{ data: SpotSchedule | null }> => {
        const data = await serverApiFetch(endpoints.spots.schedule(id)).then(
            async (response) => {
                if (!response.ok) {
                    throw new Error('스팟 일정 조회에 실패했어요.');
                }
                const payload = (await response.json()) as {
                    data: BackendSchedule;
                };
                return payload.data;
            },
        );
        return { data: toSchedule(data) };
    },

    getVotes: async (id: string): Promise<{ data: SpotVote[] }> => {
        const data = await serverApiFetch(endpoints.spots.votes(id)).then(
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
        const data = await serverApiFetch(endpoints.spots.checklist(id)).then(
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
        const data = await serverApiFetch(endpoints.spots.files(id)).then(
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
        const data = await serverApiFetch(endpoints.spots.notes(id)).then(
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
            `${endpoints.spots.root}${buildQueryString(toSpotListQuery(params))}`,
        ).then((response) => {
            const paged = toPagedResponse(response);
            return {
                ...paged,
                data: paged.data.map(toSpot),
            };
        }),

    search: async (params: SpotSearchParams): Promise<PagedResponse<Spot>> =>
        clientApiFetch<BackendPaged<BackendSpot>>(
            `${endpoints.spots.search}${buildQueryString(params)}`,
        ).then((response) => {
            const paged = toPagedResponse(response);
            return {
                ...paged,
                data: paged.data.map(toSpot),
            };
        }),

    map: async (params?: SpotMapParams): Promise<{ data: SpotMapItem[] }> =>
        clientApiFetch<BackendSpotMapItem[]>(
            `${endpoints.spots.map}${buildQueryString(params)}`,
        ).then((data) => ({ data: (data ?? []).map(toSpotMapItem) })),

    get: async (id: string): Promise<{ data: SpotDetail }> =>
        clientApiFetch<BackendSpot>(endpoints.spots.detail(id)).then(
            (data) => ({
                data: toSpotDetail(data),
            }),
        ),

    create: async (payload: CreateSpotPayload): Promise<{ data: Spot }> =>
        clientApiFetch<BackendSpot>(endpoints.spots.root, {
            method: 'POST',
            body: JSON.stringify(payload),
        }).then((data) => ({ data: toSpot(data) })),

    match: async (id: string): Promise<{ data: Spot }> =>
        clientApiFetch<BackendSpot>(endpoints.spots.match(id), {
            method: 'POST',
        }).then((data) => ({ data: toSpot(data) })),

    cancel: async (id: string): Promise<{ data: Spot }> =>
        clientApiFetch<BackendSpot>(endpoints.spots.cancel(id), {
            method: 'POST',
        }).then((data) => ({ data: toSpot(data) })),

    complete: async (id: string): Promise<{ data: Spot }> =>
        clientApiFetch<BackendSpot>(endpoints.spots.complete(id), {
            method: 'POST',
        }).then((data) => ({ data: toSpot(data) })),

    getParticipants: async (id: string): Promise<{ data: SpotParticipant[] }> =>
        clientApiFetch<BackendParticipant[]>(
            endpoints.spots.participants(id),
        ).then((data) => ({ data: (data ?? []).map(toParticipant) })),

    getSchedule: async (id: string): Promise<{ data: SpotSchedule | null }> =>
        clientApiFetch<BackendSchedule>(endpoints.spots.schedule(id)).then(
            (data) => ({ data: toSchedule(data) }),
        ),

    upsertSchedule: async (
        id: string,
        slots: ScheduleSlot[],
    ): Promise<{ data: SpotSchedule }> =>
        clientApiFetch<BackendSchedule>(endpoints.spots.schedule(id), {
            method: 'PUT',
            body: JSON.stringify(schedulePayload(slots)),
        }).then((data) => ({
            data: toSchedule(data) ?? {
                spotId: id,
                proposedSlots: slots,
            },
        })),

    getVotes: async (id: string): Promise<{ data: SpotVote[] }> =>
        clientApiFetch<BackendVote[]>(endpoints.spots.votes(id)).then(
            (data) => ({
                data: (data ?? []).map((vote) => toVote(id, vote)),
            }),
        ),

    createVote: async (
        id: string,
        payload: CreateVotePayload,
    ): Promise<{ data: SpotVote }> =>
        clientApiFetch<BackendVote>(endpoints.spots.votes(id), {
            method: 'POST',
            body: JSON.stringify({
                question: payload.question,
                options: payload.options,
                multiSelect: payload.multiSelect ?? false,
            }),
        }).then((data) => ({ data: toVote(id, data) })),

    castVote: async (
        id: string,
        voteId: string,
        optionIds: string[],
    ): Promise<{ data: SpotVote }> =>
        clientApiFetch<BackendVote>(endpoints.spots.voteMyAnswers(id, voteId), {
            method: 'PUT',
            body: JSON.stringify({
                optionIds: optionIds.map(Number),
            }),
        }).then((data) => ({ data: toVote(id, data) })),

    getChecklist: async (id: string): Promise<{ data: SpotChecklist | null }> =>
        clientApiFetch<BackendChecklistItem[]>(
            endpoints.spots.checklist(id),
        ).then((data) => ({ data: toChecklist(id, data) })),

    upsertChecklist: async (
        id: string,
        items: ChecklistItem[],
    ): Promise<{ data: SpotChecklist }> =>
        clientApiFetch<BackendChecklistItem>(endpoints.spots.checklist(id), {
            method: 'PUT',
            body: JSON.stringify(firstChecklistPayload(items)),
        }).then((data) => ({
            data: toChecklist(id, data) ?? {
                spotId: id,
                items,
            },
        })),

    toggleChecklistItem: async (
        id: string,
        itemId: string,
    ): Promise<{ data: SpotChecklist }> =>
        clientApiFetch<BackendChecklistItem>(
            endpoints.spots.checklistToggle(id, itemId),
            { method: 'PATCH' },
        ).then((data) => ({
            data: toChecklist(id, data) ?? {
                spotId: id,
                items: [],
            },
        })),

    assignChecklistItem: async (
        id: string,
        itemId: string,
        payload: AssignChecklistPayload,
    ): Promise<{ data: SpotChecklist }> =>
        clientApiFetch<BackendChecklistItem>(
            endpoints.spots.checklistAssignee(id, itemId),
            {
                method: 'PATCH',
                body: JSON.stringify({
                    assigneeId: payload.assigneeId ?? null,
                }),
            },
        ).then((data) => ({
            data: toChecklist(id, data) ?? {
                spotId: id,
                items: [],
            },
        })),

    getFiles: async (id: string): Promise<{ data: SharedFile[] }> =>
        clientApiFetch<BackendFile[]>(endpoints.spots.files(id)).then(
            (data) => ({
                data: (data ?? []).map((file) => toFile(id, file)),
            }),
        ),

    uploadFile: async (
        id: string,
        payload: UploadFilePayload,
    ): Promise<{ data: SharedFile }> =>
        clientApiFetch<BackendFile>(endpoints.spots.files(id), {
            method: 'POST',
            body: JSON.stringify(payload),
        }).then((data) => ({ data: toFile(id, data) })),

    deleteFile: async (id: string, fileId: string): Promise<void> =>
        clientApiFetch<void>(endpoints.spots.file(id, fileId), {
            method: 'DELETE',
        }),

    getNotes: async (id: string): Promise<{ data: ProgressNote[] }> =>
        clientApiFetch<BackendNote[]>(endpoints.spots.notes(id)).then(
            (data) => ({
                data: (data ?? []).map((note) => toNote(id, note)),
            }),
        ),

    createNote: async (
        id: string,
        content: string,
    ): Promise<{ data: ProgressNote }> =>
        clientApiFetch<BackendNote>(endpoints.spots.notes(id), {
            method: 'POST',
            body: JSON.stringify({ content }),
        }).then((data) => ({ data: toNote(id, data) })),

    getReviews: async (id: string): Promise<{ data: SpotReview[] }> =>
        clientApiFetch<unknown>(endpoints.spots.reviews(id)).then((payload) => {
            const data =
                typeof payload === 'object' &&
                payload !== null &&
                'data' in payload &&
                Array.isArray(payload.data)
                    ? payload.data
                    : payload;

            return {
                data: Array.isArray(data) ? (data as SpotReview[]) : [],
            };
        }),

    submitReview: async (
        id: string,
        payload: SubmitReviewPayload,
    ): Promise<{ data: SpotReview }> =>
        clientApiFetch<void>(endpoints.spots.reviews(id), {
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
        clientApiFetch<BackendSettlement>(endpoints.spots.settlement(id), {
            method: 'POST',
            body: JSON.stringify(payload),
        }).then((data) => ({
            data: toSettlement(data) ?? {
                status: 'PENDING',
                requestedAmount: 0,
                approvedAmount: 0,
                summary: '',
                lineItems: [],
            },
        })),

    approveSettlement: async (
        id: string,
    ): Promise<{ data: SpotSettlementApproval }> =>
        clientApiFetch<BackendSettlement>(
            endpoints.spots.settlementApprove(id),
            {
                method: 'POST',
            },
        ).then((data) => ({
            data: toSettlement(data) ?? {
                status: 'APPROVED',
                requestedAmount: 0,
                approvedAmount: 0,
                summary: '',
                lineItems: [],
            },
        })),
};
