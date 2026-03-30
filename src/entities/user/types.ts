import type { SpotType, SpotStatus } from '@/entities/spot/types';

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
