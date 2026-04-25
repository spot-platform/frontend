// Locality (모드 B) API 의 mock 구현. 백엔드 합류 후 fetch 호출로 교체.

import suwonJson from './locality-fixtures/suwon.json';

import type { LocalityFeatureSet } from '@/entities/spot/locality-types';

const SIMULATED_LATENCY_MS = 60;
const sleep = (ms: number) =>
    new Promise<void>((res) => setTimeout(res, ms));

const FIXTURES: Record<string, LocalityFeatureSet> = {
    suwon: suwonJson as LocalityFeatureSet,
};

export async function fetchLocalityFeatures(
    targetCity: string,
): Promise<LocalityFeatureSet> {
    await sleep(SIMULATED_LATENCY_MS);
    const set = FIXTURES[targetCity];
    if (!set) {
        throw new Error(
            `mock-locality-api: unknown target_city="${targetCity}", available: ${Object.keys(FIXTURES).join(', ')}`,
        );
    }
    return set;
}

export const SUPPORTED_CITIES = Object.keys(FIXTURES);
