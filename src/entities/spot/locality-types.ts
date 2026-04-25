// 지역 특성 ("모드 B") 데이터 계약. 줌 아웃 시 행정동 단위로 카테고리 밀집도/적합도를
// 시각화한다. 백엔드 출처는 local-context-builder(region_master + region_feature +
// place_normalized 카테고리별 카운트). 시뮬 모드(A) 와 달리 시간 차원이 없다.
//
// 필드명은 백엔드 snake_case 유지(다른 *-types 파일과 일관).
//
// region_feature 테이블의 모든 점수 필드를 그대로 노출하지 않고, *시각화에 필요한 것만*
// 골라서 평탄화한다. 향후 새 점수가 추가되면 `feature_json` 패스스루로 우회.

import type { GeoCoord } from './types';

// 카테고리 키. region_feature 의 *_density 컬럼 + place_normalized.is_* 와 매핑.
export type LocalityCategory =
    | 'food'
    | 'cafe'
    | 'activity'
    | 'park'
    | 'culture'
    | 'nightlife'
    | 'lesson';

export const LOCALITY_CATEGORIES: readonly LocalityCategory[] = [
    'food',
    'cafe',
    'activity',
    'park',
    'culture',
    'nightlife',
    'lesson',
] as const;

export type LocalityDensity = Record<LocalityCategory, number>;

/** 0..1 정규화된 적합도 점수 (region_feature 기반). */
export type LocalitySuitability = {
    casual_meetup_score: number;
    lesson_spot_score: number;
    solo_activity_score: number;
    group_activity_score: number;
    night_liveliness_score: number;
};

/** 행정동 1개 = LocalityRegion 1개. */
export type LocalityRegion = {
    /** 행정동 ID. region_master.region_code 또는 단순 slug 일 수 있음. */
    region_id: string;
    /** UI 라벨. 예: "영통동". */
    name: string;
    /** sido / sigungu (예: "경기도", "수원시"). */
    sido: string;
    sigungu: string;
    /** 대표 좌표(중심). */
    centroid: GeoCoord;
    /** bounding box. 줌 인 시 fit-to-bounds 등에 사용. */
    bbox: {
        sw: GeoCoord;
        ne: GeoCoord;
    };
    /** 행정구역 면적(km²). 밀집도 정규화에 활용. */
    area_km2: number;

    /** 카테고리별 POI 수 / km². region_feature.*_density 매핑. */
    density: LocalityDensity;

    /** 적합도 점수 0..1. */
    suitability: LocalitySuitability;

    /** 정규화 전 raw POI 카운트(필요 시 UI 노출). */
    raw_place_count: number;

    /** GeoJSON Polygon 경계. mock 단계에선 bbox 직사각형, 추후 행정안전부 데이터 합치면 정밀 polygon. */
    polygon_geojson?: GeoJsonPolygon;
};

/** GeoJSON Polygon (RFC 7946). 외곽선 1개만. 좌표는 [lng, lat]. */
export type GeoJsonPolygon = {
    type: 'Polygon';
    coordinates: [number, number][][];
};

/** /api/locality/regions 응답. */
export type LocalityFeatureSet = {
    /** 어느 publish dataset 기준인지(region_feature.dataset_version). */
    dataset_version: string;
    /** 대상 시. 현재는 'suwon' 만. */
    target_city: string;
    /** 카테고리별 도시 전체 max density(클라이언트 정규화·color scale 캘리브레이션용). */
    density_max: LocalityDensity;
    regions: LocalityRegion[];
};

export type { GeoCoord };
