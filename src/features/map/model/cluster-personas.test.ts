import { describe, expect, it } from 'vitest';
import { clusterPersonas } from './cluster-personas';
import type { ClusterInput } from './types';

const BASE_LAT = 37.26;
const BASE_LNG = 127.02;

const METERS_PER_LAT_DEG = (Math.PI / 180) * 6371000;

function offsetLat(meters: number): number {
    return meters / METERS_PER_LAT_DEG;
}

function makeInput(
    id: string,
    lat: number,
    lng: number,
    category: ClusterInput['category'] = '운동',
    intent: ClusterInput['intent'] = 'offer',
): ClusterInput {
    return {
        id,
        coord: { lat, lng },
        category,
        intent,
        emoji: '🏃',
        name: id,
    };
}

describe('clusterPersonas', () => {
    it('1. empty input returns empty array', () => {
        expect(clusterPersonas([])).toEqual([]);
    });

    it('2. a single persona in a category produces no cluster', () => {
        const clusters = clusterPersonas([makeInput('a', BASE_LAT, BASE_LNG)]);
        expect(clusters).toEqual([]);
    });

    it('3. different category/intent pairs near each other stay separated', () => {
        const clusters = clusterPersonas([
            makeInput('a', BASE_LAT, BASE_LNG, '운동', 'offer'),
            makeInput('b', BASE_LAT + offsetLat(1), BASE_LNG, '요리', 'offer'),
            makeInput(
                'c',
                BASE_LAT + offsetLat(0.5),
                BASE_LNG,
                '운동',
                'request',
            ),
        ]);
        expect(clusters).toEqual([]);
    });

    it('4. two personas in the same category+intent within radius form one cluster', () => {
        const clusters = clusterPersonas([
            makeInput('a', BASE_LAT, BASE_LNG, '운동', 'offer'),
            makeInput('b', BASE_LAT + offsetLat(30), BASE_LNG, '운동', 'offer'),
        ]);
        expect(clusters).toHaveLength(1);
        expect(clusters[0].personas).toHaveLength(2);
        expect(clusters[0].category).toBe('운동');
        expect(clusters[0].intent).toBe('offer');
    });

    it('5. three personas in a linear arrangement collapse into one cluster with averaged center', () => {
        const clusters = clusterPersonas(
            [
                makeInput('a', BASE_LAT, BASE_LNG, '운동', 'offer'),
                makeInput(
                    'b',
                    BASE_LAT + offsetLat(55),
                    BASE_LNG,
                    '운동',
                    'offer',
                ),
                makeInput(
                    'c',
                    BASE_LAT + offsetLat(110),
                    BASE_LNG,
                    '운동',
                    'offer',
                ),
            ],
            { radiusMeters: 80 },
        );

        expect(clusters).toHaveLength(1);
        expect(clusters[0].personas).toHaveLength(3);
        const expectedLat = BASE_LAT + offsetLat(55);
        expect(clusters[0].centerCoord.lat).toBeCloseTo(expectedLat, 6);
        expect(clusters[0].centerCoord.lng).toBeCloseTo(BASE_LNG, 6);
    });

    it('6. radius boundary — 79.9m groups together', () => {
        const clusters = clusterPersonas(
            [
                makeInput('a', BASE_LAT, BASE_LNG, '운동', 'offer'),
                makeInput(
                    'b',
                    BASE_LAT + offsetLat(79.9),
                    BASE_LNG,
                    '운동',
                    'offer',
                ),
            ],
            { radiusMeters: 80 },
        );
        expect(clusters).toHaveLength(1);
        expect(clusters[0].personas).toHaveLength(2);
    });

    it('6b. radius boundary — 80.1m separates', () => {
        const clusters = clusterPersonas(
            [
                makeInput('a', BASE_LAT, BASE_LNG, '운동', 'offer'),
                makeInput(
                    'b',
                    BASE_LAT + offsetLat(80.1),
                    BASE_LNG,
                    '운동',
                    'offer',
                ),
            ],
            { radiusMeters: 80 },
        );
        expect(clusters).toEqual([]);
    });

    it('7. identical input yields deterministic cluster id', () => {
        const input = [
            makeInput('a', BASE_LAT, BASE_LNG, '운동', 'offer'),
            makeInput('b', BASE_LAT + offsetLat(30), BASE_LNG, '운동', 'offer'),
        ];
        const first = clusterPersonas(input);
        const second = clusterPersonas(input);
        expect(first).toHaveLength(1);
        expect(second).toHaveLength(1);
        expect(first[0].id).toBe(second[0].id);
        expect(first[0].id).toMatch(/^운동-offer-\d+\.\d{4}-\d+\.\d{4}$/);
    });
});
