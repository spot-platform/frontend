import type { SpotCategory } from '@/entities/spot/categories';
import type { GeoCoord } from '@/entities/spot/types';

export type PersonaRef = {
    id: string;
    emoji: string;
    name: string;
};

export type ActivityCluster = {
    id: string;
    centerCoord: GeoCoord;
    category: SpotCategory;
    intent: 'offer' | 'request';
    personas: PersonaRef[];
    isPulse?: boolean;
};

export type ClusterInput = {
    id: string;
    coord: GeoCoord;
    category: SpotCategory;
    intent: 'offer' | 'request';
    emoji: string;
    name: string;
};

export type ClusterOptions = {
    radiusMeters?: number;
};
