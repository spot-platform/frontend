import type { GeoCoord } from '@/entities/spot/types';

export const MOCK_WAYPOINTS: Map<string, GeoCoord[]> = new Map([
    [
        'A_80381',
        [
            { lat: 37.268, lng: 127.025 },
            { lat: 37.272, lng: 127.03 },
            { lat: 37.278, lng: 127.028 },
            { lat: 37.286, lng: 127.015 },
        ],
    ],
    [
        'A_11504',
        [
            { lat: 37.295, lng: 127.01 },
            { lat: 37.29, lng: 127.015 },
            { lat: 37.286, lng: 127.015 },
        ],
    ],
    [
        'A_83000',
        [
            { lat: 37.278, lng: 127.04 },
            { lat: 37.27, lng: 127.035 },
            { lat: 37.265, lng: 127.03 },
            { lat: 37.258, lng: 127.032 },
        ],
    ],
    [
        'A_97841',
        [
            { lat: 37.305, lng: 127.02 },
            { lat: 37.3, lng: 127.022 },
            { lat: 37.302, lng: 127.018 },
        ],
    ],
    [
        'A_44522',
        [
            { lat: 37.26, lng: 127.035 },
            { lat: 37.262, lng: 127.03 },
            { lat: 37.2636, lng: 127.0286 },
        ],
    ],
]);
