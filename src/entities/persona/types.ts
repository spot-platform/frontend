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
