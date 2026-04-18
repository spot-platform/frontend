import type { SpotCategory } from '@/entities/spot/categories';
import type { GeoCoord } from '@/entities/spot/types';

export type PersonaArchetype =
    | 'explorer'
    | 'helper'
    | 'creator'
    | 'connector'
    | 'learner';

export type PersonaIntent = 'offer' | 'request';

export type Persona = {
    id: string;
    emoji: string;
    name: string;
    archetype: PersonaArchetype;
    initialCoord: GeoCoord;
    category: SpotCategory;
    intent: PersonaIntent;
    interestItemIds?: string[];
};

export type UserPersonaRole = 'SUPPORTER' | 'PARTNER';

export type UserPersona = {
    userId: string;
    role: UserPersonaRole;
    archetype: PersonaArchetype;
    /** FeedCategory values ('음악' | '요리' | '운동' | '공예' | '언어' | '기타'). Kept as string[] to avoid entities→features import. */
    interests: string[];
    createdAt: string;
};
