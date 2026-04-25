# 지역 특성 (모드 B) — 핸드오프

스토리: 줌 아웃 시 행정동 단위로 *어떤 동네인지* 보여주는 모드. 카테고리별 POI 밀집도(음식/카페/액티비티/공원/문화/나이트라이프/레슨)와 적합도 점수를 기반으로 단계구분도(choropleth) / 버블맵 / 레이더 카드 등으로 표현.

**상태**: 백엔드 (local-context-builder의 `/api/locality/...` 엔드포인트) 미구현. **mock 으로 프론트 단독 동작 가능**.

---

## 1. 무엇을 받는가

타입은 [`src/entities/spot/locality-types.ts`](src/entities/spot/locality-types.ts).

### `GET /api/locality/regions?city=suwon` → `LocalityFeatureSet`

```ts
type LocalityFeatureSet = {
  dataset_version: string;
  target_city: string;            // 현재 'suwon' 만
  density_max: LocalityDensity;   // 도시 전체 카테고리별 max — 색 스케일 캘리브레이션용
  regions: LocalityRegion[];
};

type LocalityRegion = {
  region_id: string;              // 'yeongtong_5' 등
  name: string;                   // '원천동'
  sido: string;                   // '경기도'
  sigungu: string;                // '수원시 영통구'
  centroid: GeoCoord;
  bbox: { sw: GeoCoord; ne: GeoCoord };
  area_km2: number;
  density: LocalityDensity;       // 카테고리별 POI 수 / km²
  suitability: LocalitySuitability; // 0..1 점수 5종
  raw_place_count: number;
  polygon_geojson?: GeoJsonPolygon; // mock 단계: bbox 사각형. 백엔드 합류 후 정밀 polygon
};

type LocalityCategory =
  | 'food' | 'cafe' | 'activity'
  | 'park' | 'culture' | 'nightlife' | 'lesson';

type LocalitySuitability = {
  casual_meetup_score: number;
  lesson_spot_score: number;
  solo_activity_score: number;
  group_activity_score: number;
  night_liveliness_score: number;
};
```

시간 차원이 없음. 정적 GET 1번. 캐시 영구.

---

## 2. mock 디렉토리

```
src/features/locality/
├─ mock/
│  ├─ locality-fixtures/
│  │   └─ suwon.json                     # 44 region, 65KB
│  ├─ generate-locality-fixtures.ts
│  └─ mock-locality-api.ts
└─ model/
   └─ use-locality-features.ts
```

### 재생성

```bash
pnpm run gen:locality-fixtures
```

수원시 44개 행정동 (장안/권선/팔달/영통 4개구). 좌표는 행정안전부 기반 근사. 카테고리별 밀집도는 region 의 *성격 프로필* (commercial / residential / park / campus / mixed) 에 ±25% jitter 적용. `density_max` 는 도시 전체 max 를 자동 계산.

---

## 3. 사용법

```tsx
'use client';
import {
  useLocalityFeatures,
} from '@/features/locality/model/use-locality-features';

export function LocalityChoropleth() {
  const loc = useLocalityFeatures({ targetCity: 'suwon' });
  if (!loc.isReady) return <div>loading…</div>;
  if (loc.error) return <div>error: {loc.error.message}</div>;

  const foodNorm = loc.densityNormalized('food'); // region_id → 0..1
  return (
    <Map>
      {loc.features!.regions.map((r) => (
        <Polygon
          key={r.region_id}
          geojson={r.polygon_geojson}
          fillOpacity={foodNorm.get(r.region_id) ?? 0}
          fill={pickColor('food')}
        />
      ))}
    </Map>
  );
}
```

훅이 노출하는 것:
- `features` — 원본 `LocalityFeatureSet`
- `regionMap` — region_id → LocalityRegion
- `densityNormalized(category)` — region_id → 0..1 (메모이즈됨, 카테고리 단위 캐시)

---

## 4. 시각화 패턴 권장

### 4-1) 단계구분도 (choropleth)
- 카테고리 1개 선택 → `densityNormalized(category)` 로 region 별 fillOpacity
- 색은 카테고리 자체 컬러스킴(food=빨강, cafe=노랑 등)
- 줌아웃 상태(zoom ≤ 12)에서 디폴트

### 4-2) 버블맵
- region centroid 에 카테고리별 size 버블
- 여러 카테고리 한 번에 보일 때

### 4-3) 적합도 레이더
- region 클릭 → 사이드 패널에 `suitability` 5축 레이더
- "이 동네는 *casual meetup* 80점, *lesson* 65점…" 식 설명

### 4-4) 모드 A 와 cross-fade
- zoom 12 이하: locality choropleth only
- zoom 12~14: choropleth (옅게) + sim run agents 마커
- zoom 14 이상: sim run only (locality 폴리곤은 옅은 경계만)
- 임계 zoom 은 데이터 양에 따라 동적 조정 (publish spot 50개 미만이면 임계 zoom 15 로 미루기)

---

## 5. 백엔드 합류 시 마이그레이션

`mock-locality-api.ts` 의 `fetchLocalityFeatures` 만 fetch 호출로 교체:

```ts
// before (mock)
import suwonJson from './locality-fixtures/suwon.json';
export async function fetchLocalityFeatures(targetCity: string) {
  return FIXTURES[targetCity];
}

// after (real)
export async function fetchLocalityFeatures(targetCity: string) {
  const res = await fetch(`/api/locality/regions?city=${targetCity}`);
  if (!res.ok) throw new Error(`locality ${res.status}`);
  return res.json();
}
```

엔드포인트 계약 (백엔드 측 작업 항목):
- `GET /api/locality/regions?city=suwon` → `LocalityFeatureSet`
- 출처: `region_master` + `region_feature` (이미 처리된 dataset_version) + `place_normalized` 카테고리 카운트
- `polygon_geojson` 은 행정안전부 행정동 GeoJSON 합치는 처리 필요 (`load_region_master.py` 가 이미 하고 있는지 확인)

응답 캐시: `Cache-Control: public, max-age=86400` (하루) 권장. dataset_version 갱신 시 ETag 바꾸기.

---

## 6. 의도적으로 *안* 한 것

- **카카오 POI 마커 직접 노출**: 너무 많고(2만+개) *행위 데이터*가 아님. region 집계로만 사용.
- **시간 차원**: 영업시간/요일 패턴 등은 백엔드에 데이터 없음. 추후 확장 시 별도 엔드포인트.
- **다른 도시**: 현재 `'suwon'` 만. 백엔드가 다른 시 처리 시 mock 도 새 fixture 추가.
- **모드 A 와의 통합 UI**: cross-fade 임계 zoom, 토글 UI 등은 시각화 작업자가 결정.

---

## 7. 파일 인덱스

- 타입: [`src/entities/spot/locality-types.ts`](src/entities/spot/locality-types.ts)
- 훅: [`src/features/locality/model/use-locality-features.ts`](src/features/locality/model/use-locality-features.ts)
- mock API: [`src/features/locality/mock/mock-locality-api.ts`](src/features/locality/mock/mock-locality-api.ts)
- 생성기: [`src/features/locality/mock/generate-locality-fixtures.ts`](src/features/locality/mock/generate-locality-fixtures.ts)
- fixture: [`src/features/locality/mock/locality-fixtures/`](src/features/locality/mock/locality-fixtures/)
- 재생성: `pnpm run gen:locality-fixtures`
