export type GeoCoord = {
    lat: number;
    lng: number;
};

export type SpotMapItem = {
    id: string;
    type: SpotType;
    status: SpotStatus;
    title: string;
    coord: GeoCoord;
    category: string;
    provenance?: 'virtual' | 'real' | 'mixed';
    personFitnessScore?: number;
    attractivenessScore?: number;
    authorId?: string;
    participantCount?: number;
    location?: string;
};

// Standard success envelope
export type ApiResponse<T> = {
    data: T;
    meta?: {
        page?: number;
        size?: number;
        total?: number;
        hasNext?: boolean;
    };
};

export type PagedResponse<T> = ApiResponse<T[]>;

export type SpotType = 'OFFER' | 'REQUEST';
export type SpotStatus = 'OPEN' | 'MATCHED' | 'CLOSED' | 'CANCELLED';

export type SpotForfeitPool = {
    toPool: number;
    toPlatformFee: number;
};

export type Spot = {
    id: string;
    type: SpotType;
    status: SpotStatus;
    title: string;
    description: string;
    pointCost: number;
    authorId: string;
    authorNickname: string;
    createdAt: string;
    updatedAt: string;
    forfeitPool?: SpotForfeitPool;
};

export type TimelineEventKind =
    | 'CREATED'
    | 'MATCHED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'COMMENT'
    | 'SETTLEMENT_REQUESTED'
    | 'SETTLEMENT_APPROVED';

export type TimelineEvent = {
    id: string;
    kind: TimelineEventKind;
    actorId: string;
    actorNickname: string;
    content?: string;
    createdAt: string;
};

export type SpotDetail = Spot & {
    timeline: TimelineEvent[];
};

// ─── 목록 필터 ────────────────────────────────────────────────────────────────
export type SpotTabFilter = 'ACTIVE' | 'COMPLETED' | 'ALL';
export type SpotDashboardTab = 'OFFER' | 'REQUEST' | 'RENT';

// ─── 참여자 ───────────────────────────────────────────────────────────────────
export type SpotParticipant = {
    userId: string;
    nickname: string;
    role: 'AUTHOR' | 'PARTICIPANT';
    joinedAt: string;
};

// ─── 일정 조율 ────────────────────────────────────────────────────────────────
export type ScheduleSlot = {
    date: string; // ISO "2026-04-10"
    hour: number; // 0-23
    availableUserIds: string[];
};

export type SpotSchedule = {
    spotId: string;
    proposedSlots: ScheduleSlot[];
    confirmedSlot?: ScheduleSlot;
};

// ─── 투표 ─────────────────────────────────────────────────────────────────────
export type VoteOption = {
    id: string;
    label: string;
    voterIds: string[];
};

export type SpotVote = {
    id: string;
    spotId: string;
    question: string;
    options: VoteOption[];
    multiSelect: boolean;
    closedAt?: string;
};

// ─── 체크리스트 ───────────────────────────────────────────────────────────────
export type ChecklistItem = {
    id: string;
    text: string;
    completed: boolean;
    assigneeId?: string;
    assigneeNickname?: string;
};

export type SpotChecklist = {
    spotId: string;
    items: ChecklistItem[];
};

// ─── 파일 공유 ────────────────────────────────────────────────────────────────
export type SharedFile = {
    id: string;
    spotId: string;
    uploaderNickname: string;
    name: string;
    url: string;
    sizeBytes: number;
    uploadedAt: string;
};

// ─── 진행 노트 ────────────────────────────────────────────────────────────────
export type ProgressNote = {
    id: string;
    spotId: string;
    authorNickname: string;
    content: string;
    createdAt: string;
};

// ─── 후기 / 별점 ──────────────────────────────────────────────────────────────
export type SpotReview = {
    id: string;
    spotId: string;
    reviewerNickname: string;
    targetNickname: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment?: string;
    createdAt: string;
};

export type WorkflowApprovalStatus = 'PENDING' | 'APPROVED';

export type SpotVoteSummaryOption = {
    label: string;
    count: number;
    isWinner?: boolean;
};

export type SpotPartnerVoteSummary = {
    question: string;
    totalVotes: number;
    consensusRate: number;
    decidedLabel: string;
    summary: string;
    options: SpotVoteSummaryOption[];
};

export type SpotFinalApproval = {
    status: WorkflowApprovalStatus;
    approverNickname: string;
    note: string;
    approvedAt?: string;
};

export type SpotSettlementLineItem = {
    label: string;
    amount: number;
};

export type SpotSettlementApproval = {
    status: WorkflowApprovalStatus;
    requestedAmount: number;
    approvedAmount: number;
    summary: string;
    lineItems: SpotSettlementLineItem[];
    submittedBy?: string;
    submittedAt?: string;
    approvedBy?: string;
    approvedAt?: string;
};

export type SubmitSettlementPayload = {
    lineItems: SpotSettlementLineItem[];
    summary: string;
};

export type SpotWorkflow = {
    spotId: string;
    progressLabel: string;
    voteSummary?: SpotPartnerVoteSummary;
    finalApproval?: SpotFinalApproval;
    settlementApproval?: SpotSettlementApproval;
};

// ─── 상세 풀 모델 ─────────────────────────────────────────────────────────────
export type SpotDetailFull = SpotDetail & {
    participants: SpotParticipant[];
    schedule?: SpotSchedule;
    votes: SpotVote[];
    checklist?: SpotChecklist;
    files: SharedFile[];
    notes: ProgressNote[];
    reviews: SpotReview[];
};
