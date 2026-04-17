import type { TimedMapEvent } from './types';

export const MOCK_EVENT_SEQUENCE: TimedMapEvent[] = [
    {
        timestampMs: 0,
        event: {
            type: 'SPOT_CREATED',
            spot: {
                id: 'S_demo_01',
                type: 'OFFER',
                status: 'OPEN',
                title: '아침 요가 같이해요',
                coord: { lat: 37.27, lng: 127.025 },
                category: '요가',
            },
        },
    },
    {
        timestampMs: 3000,
        event: {
            type: 'SPOT_CREATED',
            spot: {
                id: 'S_demo_02',
                type: 'REQUEST',
                status: 'OPEN',
                title: '볼더링 파트너 구합니다',
                coord: { lat: 37.29, lng: 127.015 },
                category: '볼더링',
            },
        },
    },
    {
        timestampMs: 6000,
        event: {
            type: 'PERSONA_MOVE',
            personaId: 'A_80381',
            targetCoord: { lat: 37.27, lng: 127.025 },
        },
    },
    {
        timestampMs: 9000,
        event: {
            type: 'PERSONA_MOVE',
            personaId: 'A_11504',
            targetCoord: { lat: 37.29, lng: 127.015 },
        },
    },
    {
        timestampMs: 12000,
        event: {
            type: 'PERSONA_JOIN',
            personaId: 'A_80381',
            spotId: 'S_demo_01',
        },
    },
    {
        timestampMs: 15000,
        event: {
            type: 'PERSONA_MOVE',
            personaId: 'A_83000',
            targetCoord: { lat: 37.27, lng: 127.025 },
        },
    },
    {
        timestampMs: 18000,
        event: {
            type: 'PERSONA_JOIN',
            personaId: 'A_83000',
            spotId: 'S_demo_01',
        },
    },
    {
        timestampMs: 21000,
        event: {
            type: 'PERSONA_JOIN',
            personaId: 'A_11504',
            spotId: 'S_demo_02',
        },
    },
    {
        timestampMs: 24000,
        event: {
            type: 'SPOT_MATCHED',
            spotId: 'S_demo_01',
        },
    },
    {
        timestampMs: 27000,
        event: {
            type: 'PERSONA_MOVE',
            personaId: 'A_97841',
            targetCoord: { lat: 37.29, lng: 127.015 },
        },
    },
];
