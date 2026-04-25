'use client';

// Locality (모드 B) 데이터 로드 훅.
//
// - 1회 fetch + 메모리 캐시.
// - 줌 아웃 모드에서만 enabled. 줌 인이면 unmount 해도 좋고, 캐시 보존이라 떠 있어도 무해.
// - 카테고리별 max density 와 region 별 density 를 그대로 노출. 정규화/색칠은 시각화 레이어 담당.

import { useEffect, useMemo, useRef, useState } from 'react';

import type {
    LocalityCategory,
    LocalityFeatureSet,
    LocalityRegion,
} from '@/entities/spot/locality-types';

import { fetchLocalityFeatures } from '../mock/mock-locality-api';

export type UseLocalityFeaturesOptions = {
    targetCity?: string;
    enabled?: boolean;
};

export type UseLocalityFeaturesResult = {
    features: LocalityFeatureSet | null;
    isReady: boolean;
    error: Error | null;
    /**
     * region_id → LocalityRegion. 마커/폴리곤 클릭 시 빠른 조회.
     */
    regionMap: Map<string, LocalityRegion>;
    /**
     * 카테고리 1개 기준으로 region 들을 0..1 정규화한 dictionary.
     * choropleth 색칠 등 시각화에서 그대로 사용.
     */
    densityNormalized: (category: LocalityCategory) => Map<string, number>;
};

const DEFAULT_CITY = 'suwon';

export function useLocalityFeatures(
    options: UseLocalityFeaturesOptions = {},
): UseLocalityFeaturesResult {
    const { targetCity = DEFAULT_CITY, enabled = true } = options;

    const [features, setFeatures] = useState<LocalityFeatureSet | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // 정규화된 결과를 카테고리 단위로 메모이즈.
    const normCacheRef = useRef<Map<LocalityCategory, Map<string, number>>>(
        new Map(),
    );

    useEffect(() => {
        if (!enabled) return;
        let mounted = true;
        setIsReady(false);
        setError(null);
        normCacheRef.current.clear();

        fetchLocalityFeatures(targetCity)
            .then((set) => {
                if (!mounted) return;
                setFeatures(set);
                setIsReady(true);
            })
            .catch((e: unknown) => {
                if (!mounted) return;
                setError(e instanceof Error ? e : new Error(String(e)));
            });

        return () => {
            mounted = false;
        };
    }, [targetCity, enabled]);

    const regionMap = useMemo(() => {
        const m = new Map<string, LocalityRegion>();
        if (features) {
            for (const r of features.regions) m.set(r.region_id, r);
        }
        return m;
    }, [features]);

    const densityNormalized = useMemo(
        () =>
            (category: LocalityCategory): Map<string, number> => {
                if (!features) return new Map();
                const cached = normCacheRef.current.get(category);
                if (cached) return cached;

                const max = features.density_max[category] || 1;
                const out = new Map<string, number>();
                for (const r of features.regions) {
                    out.set(r.region_id, Math.min(1, r.density[category] / max));
                }
                normCacheRef.current.set(category, out);
                return out;
            },
        [features],
    );

    return { features, isReady, error, regionMap, densityNormalized };
}
