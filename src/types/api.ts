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

// Spot domain types
export type SpotType = 'OFFER' | 'REQUEST';
export type SpotStatus = 'OPEN' | 'MATCHED' | 'CLOSED' | 'CANCELLED';

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
};

export type TimelineEventKind =
    | 'CREATED'
    | 'MATCHED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'COMMENT';

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

// Point domain types
export type PointTransaction = {
    id: string;
    type: 'CHARGE' | 'USE' | 'REFUND';
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
};

export type PointBalance = {
    balance: number;
    updatedAt: string;
};

// User/My domain types
export type UserProfile = {
    id: string;
    nickname: string;
    email: string;
    pointBalance: number;
    joinedAt: string;
};

export type Participation = {
    spotId: string;
    spotTitle: string;
    spotType: SpotType;
    role: 'AUTHOR' | 'PARTICIPANT';
    status: SpotStatus;
    joinedAt: string;
};
