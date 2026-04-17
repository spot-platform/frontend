import type { GeoCoord } from '@/entities/spot/types';

export type PersonaArchetype =
    | 'explorer'
    | 'helper'
    | 'creator'
    | 'connector'
    | 'learner';

export type Persona = {
    id: string;
    emoji: string;
    name: string;
    archetype: PersonaArchetype;
    initialCoord: GeoCoord;
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
