import type { GeoCoord, SpotMapItem } from '@/entities/spot/types';

export type MapEvent =
    | { type: 'PERSONA_MOVE'; personaId: string; targetCoord: GeoCoord }
    | { type: 'SPOT_CREATED'; spot: SpotMapItem }
    | { type: 'PERSONA_JOIN'; personaId: string; spotId: string }
    | { type: 'SPOT_MATCHED'; spotId: string };

export type TimedMapEvent = {
    timestampMs: number;
    event: MapEvent;
};
