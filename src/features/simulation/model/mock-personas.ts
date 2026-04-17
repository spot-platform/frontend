import type { Persona } from '@/entities/persona/types';

export const MOCK_PERSONAS: Persona[] = [
    {
        id: 'A_80381',
        emoji: '🏃',
        name: '민지',
        archetype: 'explorer',
        initialCoord: { lat: 37.268, lng: 127.025 },
    },
    {
        id: 'A_11504',
        emoji: '🧑‍🏫',
        name: '지훈',
        archetype: 'helper',
        initialCoord: { lat: 37.295, lng: 127.01 },
    },
    {
        id: 'A_83000',
        emoji: '🎨',
        name: '서연',
        archetype: 'creator',
        initialCoord: { lat: 37.278, lng: 127.04 },
    },
    {
        id: 'A_97841',
        emoji: '🤝',
        name: '현우',
        archetype: 'connector',
        initialCoord: { lat: 37.305, lng: 127.02 },
    },
    {
        id: 'A_44522',
        emoji: '📚',
        name: '수빈',
        archetype: 'learner',
        initialCoord: { lat: 37.26, lng: 127.035 },
    },
];
