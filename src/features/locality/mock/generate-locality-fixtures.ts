// Locality (모드 B) mock fixture 생성 스크립트.
//
// 실행:
//   pnpm run gen:locality-fixtures
//   (산출물: ./locality-fixtures/suwon.json)
//
// 설계 의도:
//   - deterministic seed. 매 실행 동일 산출물.
//   - 수원시 행정동 약 44개를 상수 테이블로 박는다(region_master 가 정착되기 전 작업용).
//     실제 좌표는 행정안전부 API 결과의 근사치.
//   - 카테고리별 밀집도는 region 의 "성격" 프로필(상업/주거/공원/대학가) 기반 가중치로 합성.
//   - polygon 은 bbox 사각형으로 시작. 정밀 polygon 은 백엔드 합류 후.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
    GeoJsonPolygon,
    LocalityCategory,
    LocalityDensity,
    LocalityFeatureSet,
    LocalityRegion,
    LocalitySuitability,
} from '../../../entities/spot/locality-types';

// ─── seed RNG ───────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
    let t = seed >>> 0;
    return () => {
        t = (t + 0x6d2b79f5) >>> 0;
        let r = t;
        r = Math.imul(r ^ (r >>> 15), r | 1);
        r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}
const rand = mulberry32(0xb00b1e5b);
const jitter = (base: number, spread: number) =>
    base + (rand() * 2 - 1) * spread;

// ─── 수원시 행정동 시드 (이름 + 중심좌표 + 면적 + 성격 프로필) ───────────────

type RegionProfile = 'commercial' | 'residential' | 'park' | 'campus' | 'mixed';

type RegionSeed = {
    code: string;
    name: string;
    gu: '장안구' | '권선구' | '팔달구' | '영통구';
    lat: number;
    lng: number;
    area_km2: number;
    profile: RegionProfile;
};

// 수원시 4개구 주요 행정동 모음 (실측 좌표 근사). 데모 용도.
const SUWON_REGIONS: RegionSeed[] = [
    // 장안구
    { code: 'jangan_1',  name: '파장동',     gu: '장안구', lat: 37.310, lng: 127.012, area_km2: 3.1, profile: 'residential' },
    { code: 'jangan_2',  name: '율천동',     gu: '장안구', lat: 37.296, lng: 126.985, area_km2: 4.6, profile: 'campus' },
    { code: 'jangan_3',  name: '정자1동',    gu: '장안구', lat: 37.290, lng: 127.005, area_km2: 1.6, profile: 'residential' },
    { code: 'jangan_4',  name: '정자2동',    gu: '장안구', lat: 37.300, lng: 127.000, area_km2: 1.4, profile: 'residential' },
    { code: 'jangan_5',  name: '정자3동',    gu: '장안구', lat: 37.305, lng: 127.008, area_km2: 1.3, profile: 'residential' },
    { code: 'jangan_6',  name: '영화동',     gu: '장안구', lat: 37.288, lng: 127.018, area_km2: 1.8, profile: 'residential' },
    { code: 'jangan_7',  name: '송죽동',     gu: '장안구', lat: 37.296, lng: 127.022, area_km2: 1.7, profile: 'residential' },
    { code: 'jangan_8',  name: '조원1동',    gu: '장안구', lat: 37.300, lng: 127.030, area_km2: 1.5, profile: 'residential' },
    { code: 'jangan_9',  name: '조원2동',    gu: '장안구', lat: 37.305, lng: 127.025, area_km2: 1.6, profile: 'residential' },
    { code: 'jangan_10', name: '연무동',     gu: '장안구', lat: 37.286, lng: 127.034, area_km2: 2.3, profile: 'park' },

    // 권선구
    { code: 'gwonseon_1',  name: '세류1동', gu: '권선구', lat: 37.270, lng: 127.020, area_km2: 1.5, profile: 'residential' },
    { code: 'gwonseon_2',  name: '세류2동', gu: '권선구', lat: 37.265, lng: 127.025, area_km2: 1.4, profile: 'residential' },
    { code: 'gwonseon_3',  name: '세류3동', gu: '권선구', lat: 37.262, lng: 127.030, area_km2: 1.6, profile: 'residential' },
    { code: 'gwonseon_4',  name: '평동',     gu: '권선구', lat: 37.255, lng: 127.000, area_km2: 6.2, profile: 'mixed' },
    { code: 'gwonseon_5',  name: '서둔동',   gu: '권선구', lat: 37.270, lng: 126.985, area_km2: 4.8, profile: 'campus' },
    { code: 'gwonseon_6',  name: '구운동',   gu: '권선구', lat: 37.275, lng: 126.998, area_km2: 2.0, profile: 'residential' },
    { code: 'gwonseon_7',  name: '권선1동', gu: '권선구', lat: 37.260, lng: 127.020, area_km2: 1.8, profile: 'residential' },
    { code: 'gwonseon_8',  name: '권선2동', gu: '권선구', lat: 37.255, lng: 127.025, area_km2: 1.7, profile: 'commercial' },
    { code: 'gwonseon_9',  name: '곡선동',   gu: '권선구', lat: 37.250, lng: 127.030, area_km2: 1.9, profile: 'residential' },
    { code: 'gwonseon_10', name: '입북동',   gu: '권선구', lat: 37.290, lng: 126.965, area_km2: 5.4, profile: 'mixed' },
    { code: 'gwonseon_11', name: '금호동',   gu: '권선구', lat: 37.245, lng: 126.990, area_km2: 3.5, profile: 'residential' },

    // 팔달구
    { code: 'paldal_1', name: '인계동',     gu: '팔달구', lat: 37.273, lng: 127.029, area_km2: 1.5, profile: 'commercial' },
    { code: 'paldal_2', name: '매교동',     gu: '팔달구', lat: 37.272, lng: 127.020, area_km2: 1.0, profile: 'commercial' },
    { code: 'paldal_3', name: '매산동',     gu: '팔달구', lat: 37.265, lng: 127.012, area_km2: 1.1, profile: 'commercial' },
    { code: 'paldal_4', name: '고등동',     gu: '팔달구', lat: 37.270, lng: 127.005, area_km2: 1.0, profile: 'residential' },
    { code: 'paldal_5', name: '화서1동',   gu: '팔달구', lat: 37.282, lng: 127.005, area_km2: 1.4, profile: 'residential' },
    { code: 'paldal_6', name: '화서2동',   gu: '팔달구', lat: 37.288, lng: 127.000, area_km2: 1.6, profile: 'residential' },
    { code: 'paldal_7', name: '지동',       gu: '팔달구', lat: 37.275, lng: 127.030, area_km2: 0.9, profile: 'residential' },
    { code: 'paldal_8', name: '우만1동',   gu: '팔달구', lat: 37.280, lng: 127.040, area_km2: 1.3, profile: 'residential' },
    { code: 'paldal_9', name: '우만2동',   gu: '팔달구', lat: 37.275, lng: 127.043, area_km2: 1.2, profile: 'residential' },
    { code: 'paldal_10', name: '행궁동',   gu: '팔달구', lat: 37.282, lng: 127.018, area_km2: 1.4, profile: 'commercial' },

    // 영통구
    { code: 'yeongtong_1',  name: '매탄1동', gu: '영통구', lat: 37.269, lng: 127.045, area_km2: 1.0, profile: 'commercial' },
    { code: 'yeongtong_2',  name: '매탄2동', gu: '영통구', lat: 37.265, lng: 127.052, area_km2: 0.9, profile: 'residential' },
    { code: 'yeongtong_3',  name: '매탄3동', gu: '영통구', lat: 37.258, lng: 127.055, area_km2: 1.5, profile: 'residential' },
    { code: 'yeongtong_4',  name: '매탄4동', gu: '영통구', lat: 37.262, lng: 127.060, area_km2: 1.3, profile: 'residential' },
    { code: 'yeongtong_5',  name: '원천동', gu: '영통구', lat: 37.275, lng: 127.060, area_km2: 2.4, profile: 'campus' },
    { code: 'yeongtong_6',  name: '이의동', gu: '영통구', lat: 37.290, lng: 127.060, area_km2: 4.1, profile: 'mixed' },
    { code: 'yeongtong_7',  name: '광교1동', gu: '영통구', lat: 37.295, lng: 127.072, area_km2: 5.5, profile: 'commercial' },
    { code: 'yeongtong_8',  name: '광교2동', gu: '영통구', lat: 37.300, lng: 127.078, area_km2: 4.8, profile: 'park' },
    { code: 'yeongtong_9',  name: '영통1동', gu: '영통구', lat: 37.252, lng: 127.072, area_km2: 1.6, profile: 'residential' },
    { code: 'yeongtong_10', name: '영통2동', gu: '영통구', lat: 37.248, lng: 127.075, area_km2: 1.5, profile: 'residential' },
    { code: 'yeongtong_11', name: '영통3동', gu: '영통구', lat: 37.255, lng: 127.078, area_km2: 1.4, profile: 'residential' },
    { code: 'yeongtong_12', name: '망포1동', gu: '영통구', lat: 37.245, lng: 127.060, area_km2: 1.7, profile: 'residential' },
    { code: 'yeongtong_13', name: '망포2동', gu: '영통구', lat: 37.240, lng: 127.065, area_km2: 1.6, profile: 'residential' },
];

// ─── profile → 기준 밀집도 (POI / km²) ──────────────────────────────────────

const PROFILE_BASE: Record<RegionProfile, LocalityDensity> = {
    commercial:  { food: 320, cafe: 210, activity: 35, park: 6,  culture: 28, nightlife: 95, lesson: 70 },
    residential: { food: 95,  cafe: 60,  activity: 18, park: 14, culture: 6,  nightlife: 12, lesson: 35 },
    park:        { food: 60,  cafe: 40,  activity: 55, park: 80, culture: 25, nightlife: 8,  lesson: 18 },
    campus:      { food: 240, cafe: 180, activity: 28, park: 12, culture: 18, nightlife: 55, lesson: 110 },
    mixed:       { food: 130, cafe: 85,  activity: 22, park: 18, culture: 12, nightlife: 25, lesson: 45 },
};

const PROFILE_SUITABILITY: Record<RegionProfile, LocalitySuitability> = {
    commercial:  { casual_meetup_score: 0.85, lesson_spot_score: 0.55, solo_activity_score: 0.50, group_activity_score: 0.78, night_liveliness_score: 0.90 },
    residential: { casual_meetup_score: 0.50, lesson_spot_score: 0.45, solo_activity_score: 0.45, group_activity_score: 0.40, night_liveliness_score: 0.30 },
    park:        { casual_meetup_score: 0.70, lesson_spot_score: 0.60, solo_activity_score: 0.75, group_activity_score: 0.65, night_liveliness_score: 0.30 },
    campus:      { casual_meetup_score: 0.78, lesson_spot_score: 0.85, solo_activity_score: 0.65, group_activity_score: 0.80, night_liveliness_score: 0.65 },
    mixed:       { casual_meetup_score: 0.60, lesson_spot_score: 0.55, solo_activity_score: 0.55, group_activity_score: 0.55, night_liveliness_score: 0.50 },
};

// ─── 헬퍼 ───────────────────────────────────────────────────────────────────

function makeBbox(centerLat: number, centerLng: number, areaKm2: number) {
    // bbox 변 길이를 원형 근사로 산정. 실제 polygon 은 백엔드 합류 후 교체.
    const side = Math.sqrt(areaKm2); // km
    const halfLat = (side / 111.32) / 2;
    const halfLng = (side / (111.32 * Math.cos((centerLat * Math.PI) / 180))) / 2;
    return {
        sw: { lat: centerLat - halfLat, lng: centerLng - halfLng },
        ne: { lat: centerLat + halfLat, lng: centerLng + halfLng },
    };
}

function bboxToPolygon(bbox: ReturnType<typeof makeBbox>): GeoJsonPolygon {
    const { sw, ne } = bbox;
    return {
        type: 'Polygon',
        coordinates: [
            [
                [sw.lng, sw.lat],
                [ne.lng, sw.lat],
                [ne.lng, ne.lat],
                [sw.lng, ne.lat],
                [sw.lng, sw.lat],
            ],
        ],
    };
}

function applyJitter(base: LocalityDensity): LocalityDensity {
    const out = {} as LocalityDensity;
    for (const k of Object.keys(base) as LocalityCategory[]) {
        const b = base[k];
        // ±25% 가량 흩뿌려 region 별 차이 부여.
        out[k] = Math.max(0, Math.round(jitter(b, b * 0.25)));
    }
    return out;
}

function applySuitabilityJitter(base: LocalitySuitability): LocalitySuitability {
    const out = {} as LocalitySuitability;
    for (const k of Object.keys(base) as (keyof LocalitySuitability)[]) {
        const b = base[k];
        const v = jitter(b, 0.08);
        out[k] = Math.max(0, Math.min(1, Number(v.toFixed(3))));
    }
    return out;
}

// ─── 빌드 ───────────────────────────────────────────────────────────────────

function build(): LocalityFeatureSet {
    const regions: LocalityRegion[] = [];
    const maxDensity: LocalityDensity = {
        food: 0, cafe: 0, activity: 0, park: 0, culture: 0, nightlife: 0, lesson: 0,
    };

    for (const seed of SUWON_REGIONS) {
        const density = applyJitter(PROFILE_BASE[seed.profile]);
        const suitability = applySuitabilityJitter(PROFILE_SUITABILITY[seed.profile]);

        for (const k of Object.keys(density) as LocalityCategory[]) {
            if (density[k] > maxDensity[k]) maxDensity[k] = density[k];
        }

        const bbox = makeBbox(seed.lat, seed.lng, seed.area_km2);

        regions.push({
            region_id: seed.code,
            name: seed.name,
            sido: '경기도',
            sigungu: `수원시 ${seed.gu}`,
            centroid: { lat: seed.lat, lng: seed.lng },
            bbox,
            area_km2: seed.area_km2,
            density,
            suitability,
            raw_place_count: Math.round(
                Object.values(density).reduce((s, v) => s + v, 0) * seed.area_km2,
            ),
            polygon_geojson: bboxToPolygon(bbox),
        });
    }

    return {
        dataset_version: 'mock_v1',
        target_city: 'suwon',
        density_max: maxDensity,
        regions,
    };
}

// ─── 진입점 ─────────────────────────────────────────────────────────────────

function main() {
    const args = process.argv.slice(2);
    const outArgIdx = args.indexOf('--out');
    let outDir: string;
    if (outArgIdx >= 0 && args[outArgIdx + 1]) {
        outDir = resolve(args[outArgIdx + 1]);
    } else if (process.env.LOCALITY_OUT_DIR) {
        outDir = resolve(process.env.LOCALITY_OUT_DIR);
    } else {
        const here = dirname(fileURLToPath(import.meta.url));
        outDir = resolve(here, 'locality-fixtures');
    }
    mkdirSync(outDir, { recursive: true });

    const set = build();
    writeFileSync(
        resolve(outDir, `${set.target_city}.json`),
        JSON.stringify(set, null, 2),
    );

    console.log(`✓ wrote locality fixture to ${outDir}`);
    console.log(`  regions: ${set.regions.length}`);
    console.log(`  density_max:`, set.density_max);
}

main();
