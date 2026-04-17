# Spot 맵 퍼스트 피봇 — 구현 플랜 v2

> CLI 에이전트(Claude Code) 기반 개발을 전제로 한 실행 계획
> 기준 레포: github.com/spot-platform/frontend (Next.js 16 + React 19)
> v2: 코드베이스 리뷰 반영 — FSD 배치 수정, 기존 컴포넌트 재활용, 리스크 대응 구체화

---

## 0. 전체 로드맵

```
Sprint 1 (1주)  — PoC: 카카오맵 위 움직이는 페르소나
Sprint 2 (1주)  — 맵 메인 셸: 풀스크린맵 + 플로팅 컨트롤
Sprint 3 (1주)  — 피드 → 맵 마이그레이션 (바텀시트 + 마커)
Sprint 4 (1주)  — 채팅 레버 + 드로어
Sprint 5 (1주)  — 레이어 시스템 (현실/가상/혼합)         ← optional
Sprint 6 (1주)  — 시뮬레이션 연동 + 인터랙션 연결         ← optional
Sprint 7 (1주)  — 통합 테스트 + 기존 라우트 정리
```

각 Sprint는 독립적으로 동작하는 결과물을 가진다.
**Sprint 5~6은 Sprint 4 안정화 후 진행 여부를 판단한다.** MVP는 Sprint 1~4 + 7로 완성 가능.

---

## 0-1. FSD 파일 배치 원칙

v1에서는 모든 코드가 `features/map/`에 들어갔다. v2에서는 FSD 레이어 규칙에 맞게 분산한다.

| 역할                                    | 배치                                                               | 이유                                                |
| --------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------- |
| 맵 셸 (MapCanvas, MapHeader, MapFooter) | `src/app/(map)/` layout 내 조합, 컴포넌트는 `src/features/map/ui/` | 맵은 앱 셸이지만 feature 수준의 고유 UI/로직을 가짐 |
| 맵 상태 (필터, 줌, 선택된 마커)         | `src/features/map/model/`                                          | feature-level 상태                                  |
| 피드 바텀시트, 프리뷰 시트              | `src/features/feed/ui/` 확장                                       | 피드 데이터를 다루므로 feed feature에 속함          |
| 채팅 드로어, 레버                       | `src/features/chat/ui/` 확장                                       | 채팅 데이터를 다루므로 chat feature에 속함          |
| 페르소나/시뮬레이션                     | `src/features/simulation/` (새 feature)                            | 독립 도메인 — map과 feed 어디에도 속하지 않음       |
| 레이어 시스템                           | `src/features/layer/` (새 feature)                                 | 독립 도메인                                         |
| 맵 좌표가 포함된 Spot 타입 확장         | `src/entities/spot/types.ts` 확장                                  | 엔티티 레이어                                       |
| 페르소나 엔티티 타입                    | `src/entities/persona/types.ts` (새)                               | 엔티티 레이어                                       |

### 임포트 방향 (FSD 하향만 허용)

```
app/(map)/ → features/map, features/feed, features/chat, features/simulation
features/map → entities/spot, shared
features/feed → entities/spot, shared
features/simulation → entities/persona, entities/spot, shared
shared → (외부 라이브러리만)
```

**금지:**

- `features/map/` → `features/feed/` 직접 임포트 (공유 필요 시 entities 또는 shared 경유)
- `features/feed/` → `features/map/` 직접 임포트
- 크로스-feature 통신은 `app/(map)/layout.tsx`에서 조합하거나, zustand store를 `shared/model/`에 배치

---

## Sprint 1 — PoC: 카카오맵 위 움직이는 페르소나

### 목표

> 카카오맵 풀스크린 위에 아바타 5개가 A→B→C 경유지를 따라 부드럽게 이동하고, 스팟 마커가 표시되는 것을 확인한다.

이것만 되면 맵 퍼스트 UX의 기술적 가능성이 증명된다.

### Step 1-0: 기술 스파이크 — 아바타 이동 방식 결정 (2~3h)

```
목적: CustomOverlayMap의 position 변경 시 부드러운 이동이 가능한지 검증

테스트 항목:
  A) CSS transition 접근
     - CustomOverlayMap position prop 변경
     - 아바타 DOM에 transition: transform 2s ease 적용
     - 카카오맵이 left/top을 직접 설정하므로 transition이 안 먹을 가능성 높음

  B) lat/lng 보간(lerp) 접근
     - requestAnimationFrame으로 매 프레임 position을 보간
     - 시작점 → 끝점 사이를 60프레임에 나눠 이동
     - CustomOverlayMap position을 프레임마다 업데이트

  C) 맵 밖 DOM + pixel 좌표 접근
     - CustomOverlayMap 대신 맵 컨테이너 위에 absolute div
     - map.getProjection().pointFromCoords()로 pixel 좌표 계산
     - CSS transition으로 pixel 이동 (이건 확실히 동작)
     - 맵 패닝/줌 시 좌표 재계산 필요

스파이크 파일: src/features/map/__spike/MovementTest.tsx (완료 후 삭제)

결과 → Step 1-4에서 채택할 방식 결정
```

### Step 1-1: 맵 풀스크린 렌더링

```
파일:
  src/features/map/ui/MapCanvas.tsx      — 맵 렌더 컴포넌트
  src/app/(map)/layout.tsx               — 맵 라우트 레이아웃
  src/app/(map)/page.tsx                 — 테스트 엔트리

작업:
  1. 의존성 확인 및 설치
     pnpm add react-kakao-maps-sdk

  2. MapCanvas 컴포넌트
     - next/dynamic으로 ssr: false 감싸기 (카카오맵은 window 필수)
     - 수원시 중심 좌표 (lat: 37.2636, lng: 127.0286)
     - 풀스크린 (100dvh)
     - 환경변수: NEXT_PUBLIC_KAKAO_MAP_KEY
     - 키 없을 시 폴백: MockMapCanvas (정적 회색 배경 + 격자 + 좌표 텍스트)

  3. MockMapCanvas (개발/CI용)
     src/features/map/ui/MockMapCanvas.tsx
     - 카카오맵 키 없이도 마커/아바타 위치를 시각적으로 확인 가능
     - 위도/경도 → 간단한 2D 평면 변환 (선형 매핑)
     - 마커/아바타 오버레이 인터페이스를 카카오맵과 동일하게 유지
     - pnpm build / pnpm lint가 키 없이도 통과

  4. 라우트 설정
     src/app/(map)/layout.tsx — 맵 전용 레이아웃 (BottomNav 없음)
     src/app/(map)/page.tsx — MapCanvas 렌더

환경변수:
  .env.local에 NEXT_PUBLIC_KAKAO_MAP_KEY 추가 (gitignore 대상)
  .env.example에 NEXT_PUBLIC_KAKAO_MAP_KEY= 추가 (빈 값)

검증:
  - 키 있을 때: 카카오맵 풀스크린, 핀치/줌/패닝 정상
  - 키 없을 때: MockMapCanvas 폴백, 빌드 통과
  - 모바일 뷰포트 100dvh 정상
```

### Step 1-2: 정적 마커 렌더링

```
파일:
  src/features/map/ui/SpotMarker.tsx
  src/features/map/model/mock-spots.ts
  src/entities/spot/types.ts              — GeoCoord 타입 추가

엔티티 확장 (entities/spot/types.ts):
  export type GeoCoord = {
    lat: number;
    lng: number;
  };

  export type SpotMapItem = Pick<Spot, 'id' | 'type' | 'status' | 'title'> & {
    coord: GeoCoord;
    category: string;
  };

마커 컴포넌트:
  - 카카오맵 CustomOverlayMap 사용
  - props: spot: SpotMapItem
  - 마커 타입 2종: Offer(브랜드 초록 --color-brand-500), Request(보라 #8b5cf6)
  - 원형 36px, 중앙에 카테고리 이모지
  - 탭 시 onSelect(spotId) 콜백

mock 데이터 (mock-spots.ts):
  5개 스팟: 수원시 연무동, 인계동, 영통동, 매탄동, 권선동
  각각 타입(OFFER/REQUEST), 카테고리, 좌표 포함

검증:
  - 맵 위 5개 마커 정상 표시
  - Offer/Request 색상 구분
  - 줌 변경 시 마커 위치 정확
  - 마커 탭 이벤트 발생
```

### Step 1-3: 페르소나 아바타 렌더링 (정적)

```
파일:
  src/features/simulation/ui/PersonaAvatar.tsx
  src/features/simulation/model/mock-personas.ts
  src/entities/persona/types.ts            — 새 엔티티

엔티티 정의 (entities/persona/types.ts):
  import type { GeoCoord } from '@/entities/spot/types';

  export type PersonaArchetype = 'explorer' | 'helper' | 'creator' | 'connector' | 'learner';

  export type Persona = {
    id: string;
    emoji: string;
    name: string;
    archetype: PersonaArchetype;
    initialCoord: GeoCoord;
  };

아바타 컴포넌트:
  - CustomOverlayMap으로 DOM 오버레이
  - 원형 42px, 이모지 중앙, 테두리 2px white, 그림자
  - SpotMarker(36px)보다 크게 → 시각적 구분
  - props: persona: Persona, coord: GeoCoord

mock 데이터 (mock-personas.ts):
  5개 페르소나, 각각 이모지/이름/archetype/초기 좌표

검증:
  - 맵 위 5개 아바타 표시
  - 스팟 마커와 시각적으로 명확히 구분
  - 줌 변경 시 위치 유지
```

### Step 1-4: 아바타 이동 애니메이션 (핵심)

```
파일:
  src/features/simulation/model/use-persona-movement.ts

기술 접근: Step 1-0 스파이크 결과에 따라 결정

  [A안] CSS transition이 동작하는 경우:
    - position prop 변경 + CSS transition
    - 가장 단순, 성능도 좋음

  [B안] lat/lng lerp (스파이크에서 가장 유력):
    - requestAnimationFrame으로 현재 좌표 → 목표 좌표 보간
    - duration: 2000ms, easing: ease-in-out
    - 매 프레임 setPosition → CustomOverlayMap 업데이트

  [C안] pixel 좌표 직접 제어:
    - 맵 getProjection() API로 lat/lng → pixel 변환
    - absolute div에 CSS transition
    - 맵 이벤트(zoom/pan)마다 좌표 재계산

훅 인터페이스:
  type UsePersonaMovementReturn = {
    positions: Map<string, GeoCoord>;  // personaId → 현재 좌표
  };

  function usePersonaMovement(
    personas: Persona[],
    waypoints: Map<string, GeoCoord[]>,  // personaId → 경유지 배열
    options?: { intervalMs?: number; durationMs?: number }
  ): UsePersonaMovementReturn;

waypoint 데이터:
  src/features/simulation/model/mock-waypoints.ts
  각 페르소나에 3~5개 경유지 (수원시 내 실제 좌표)

검증:
  - 5개 아바타가 각자 경로를 따라 부드럽게 이동
  - 맵 패닝/줌 중에도 아바타 위치 정확
  - 이동이 점프가 아닌 슬라이딩
  - 두 아바타가 같은 스팟 근처로 수렴하는 시나리오 포함
```

### Step 1-5: 이벤트 시퀀스 재생

```
파일:
  src/features/simulation/model/use-event-player.ts
  src/features/simulation/model/mock-event-sequence.ts
  src/features/simulation/model/types.ts

이벤트 타입 정의 (simulation/model/types.ts):
  export type MapEvent =
    | { type: 'PERSONA_MOVE'; personaId: string; targetCoord: GeoCoord }
    | { type: 'SPOT_CREATED'; spot: SpotMapItem }
    | { type: 'PERSONA_JOIN'; personaId: string; spotId: string }
    | { type: 'SPOT_MATCHED'; spotId: string };

  export type TimedMapEvent = {
    timestampMs: number;
    event: MapEvent;
  };

이벤트 플레이어 훅:
  function useEventPlayer(events: TimedMapEvent[]): {
    isPlaying: boolean;
    currentIndex: number;
    spots: SpotMapItem[];            // 현재까지 생성된 스팟
    personaPositions: Map<string, GeoCoord>;  // 현재 위치
    spotStatuses: Map<string, SpotStatus>;    // 스팟 상태
  };

  - 페이지 로드 후 자동 재생
  - setTimeout 체인으로 timestampMs 간격 실행
  - 각 이벤트 타입별 처리:
    SPOT_CREATED: spots 배열에 추가 (UI에서 fade in)
    PERSONA_MOVE: usePersonaMovement에 목표 좌표 전달
    PERSONA_JOIN: 해당 아바타를 스팟 좌표로 이동
    SPOT_MATCHED: spotStatuses 업데이트 (UI에서 색상 변경)

mock 데이터 (mock-event-sequence.ts):
  10개 이벤트, 3초 간격
  시나리오: 스팟 생성 → 페르소나 이동 → 참여 → 매칭

검증:
  - 페이지 로드 후 이벤트 자동 재생
  - SPOT_CREATED → 마커 fade in (opacity 0→1, 0.3s)
  - PERSONA_JOIN → 아바타가 해당 마커로 이동
  - SPOT_MATCHED → 마커 색상 변경 (초록→노란색 or 골드 테두리)
```

### Sprint 1 완료 기준

```
- [ ] 카카오맵 풀스크린 렌더링 (키 없으면 MockMapCanvas 폴백)
- [ ] 스팟 마커 5개 표시 (Offer/Request 구분)
- [ ] 페르소나 아바타 5개 표시
- [ ] 아바타가 waypoint를 따라 부드럽게 이동
- [ ] 이벤트 시퀀스 자동 재생 (마커 등장, 참여, 매칭)
- [ ] 모바일 뷰포트에서 정상 동작
- [ ] pnpm lint + pnpm build 통과 (카카오맵 키 없이도)
- [ ] Backend handoff: GeoCoord 타입, SpotMapItem 타입 추가 → BACKEND_HANDOFF_ENTITIES.md 업데이트
```

---

## Sprint 2 — 맵 메인 셸

### 목표

> 맵 풀스크린을 앱의 메인 화면으로 전환. 상단 컨트롤, 필터 칩, 하단 플로팅 버튼을 배치한다.

### Step 2-1: 라우트 구조 변경

```
작업:
  - src/app/(map)/ 라우트 그룹 정비 (Sprint 1에서 이미 생성됨)
  - src/app/(map)/layout.tsx: MapCanvas + FloatingControls 합성
  - src/app/(map)/page.tsx: 맵 홈
  - 기존 (main) 라우트는 유지 (병행 운영)
  - next.config.ts redirects: / → /(map)으로 리다이렉트

주의:
  - (main) 라우트를 삭제하지 않음 — Sprint 7에서 판단
  - /feed, /chat, /spot 등 기존 경로는 그대로 동작

검증:
  - localhost:3000 → 맵 메인
  - localhost:3000/feed → 기존 피드 (정상 동작)
```

### Step 2-2: 상단 플로팅 컨트롤

```
파일: src/features/map/ui/MapHeader.tsx

레이아웃:
  [🔍 검색바              👤  [+]]
  - 검색바: 탭 → /search 이동 (기존 SearchBar 재사용 가능 여부 확인)
  - 👤: 탭 → /my 이동
    - 알림 뱃지: bottom-nav-message-store 연동
  - [+]: 탭 → /post 생성 플로우

스타일:
  - position: fixed, top: env(safe-area-inset-top)
  - backdrop-filter: blur(12px), bg-white/70
  - z-index: 맵 위, 바텀시트 아래

기존 컴포넌트 참조:
  - src/shared/ui/Header.tsx — 스타일 참고 (직접 재사용은 구조 불일치)
  - src/shared/ui/SearchBar.tsx — 검색 UI 재사용 가능
```

### Step 2-3: 필터 칩 바

```
파일:
  src/features/map/ui/FilterChipBar.tsx
  src/features/map/model/use-filter-store.ts

레이아웃:
  [전체] [해볼래🙋] [알려줘🙏] [요리] [운동] [음악] [공예] ...

구현:
  - 가로 스크롤 (overflow-x: auto, scrollbar-hide)
  - 디자인시스템 Chip 컴포넌트 활용
  - "해볼래/알려줘"는 배타적 토글 (전체/offer/request)
  - 카테고리는 복수 선택 가능
  - 필터 변경 시 맵 마커 fade in/out (opacity transition 0.2s)

상태 (use-filter-store.ts):
  type FilterState = {
    feedType: 'all' | 'offer' | 'request';
    categories: string[];
    setFeedType: (type: FilterState['feedType']) => void;
    toggleCategory: (category: string) => void;
    resetFilters: () => void;
  };

  → features/map/model/ 에 배치 (맵 화면 전용 필터)
```

### Step 2-4: 하단 플로팅 버튼

```
파일: src/features/map/ui/MapFooter.tsx

레이아웃:
  [🌐레이어]         ◉내위치        [☰리스트뷰]

  - 레이어: placeholder (Sprint 5에서 구현, 또는 MVP에서 생략)
  - 내 위치: Geolocation API → 맵 center 이동
  - 리스트뷰: placeholder (Sprint 3에서 바텀시트 연결)

스타일:
  - position: fixed, bottom: env(safe-area-inset-bottom) + 16px
  - 디자인시스템 IconButton 활용

검증:
  - 내 위치 버튼 → 위치 권한 요청 → 맵 이동
  - Geolocation 거부 시 fallback (수원시 중심 유지)
```

### Sprint 2 완료 기준

```
- [ ] / → 맵 메인 + 상단 컨트롤 + 필터 칩 + 하단 버튼
- [ ] 검색바 탭 → /search
- [ ] 프로필 아이콘 탭 → /my
- [ ] + 버튼 탭 → /post
- [ ] 필터 칩 탭 → 마커 필터링 (fade in/out)
- [ ] 내 위치 버튼 동작 (+ 권한 거부 핸들링)
- [ ] 기존 라우트 (/feed, /chat 등) 여전히 동작
- [ ] pnpm lint + pnpm build 통과
- [ ] Backend handoff: 맵 마커 필터링 쿼리 필요 시 업데이트
```

---

## Sprint 3 — 피드 → 맵 마이그레이션

### 목표

> 기존 피드 리스트를 맵 바텀시트로 이동. 마커 탭 시 프리뷰 시트 표시.

### Step 3-1: 디자인시스템 BottomSheet 확장

```
파일: packages/design-system/src/components/BottomSheet.tsx

현재 상태:
  - snap: 'half'(55vh) | 'full'(92vh)
  - 아래로 드래그 시 닫힘 (onClose)
  - 백드롭 클릭으로 닫힘

확장 사항:
  - snap에 'peek' 추가: peek(80px) | 'half'(55vh) | 'full'(92vh)
  - 다단계 스냅: peek ↔ half ↔ full 드래그 전환
  - peek 상태: 백드롭 없음, 맵 터치 가능
  - half/full 상태: 백드롭 표시
  - persistent 모드: onClose 없이 peek↔half↔full만 전환
    (기존 모달형 사용법과 구분)

터치 충돌 해결:
  - peek 상태: 바텀시트 영역만 touch-action: none, 나머지는 맵 터치
  - half 상태: 시트 내부 스크롤 우선, 시트 밖은 맵 터치
  - full 상태: 시트 내부 스크롤만
  - framer-motion dragConstraints로 각 snap 경계 설정

인터페이스 변경:
  type BottomSheetSnapPoint = 'peek' | 'half' | 'full';

  export interface BottomSheetProps {
    open: boolean;
    onClose?: () => void;               // optional로 변경 (persistent 모드)
    title?: string;
    children: ReactNode;
    snapPoint?: BottomSheetSnapPoint;
    onSnapChange?: (snap: BottomSheetSnapPoint) => void;  // 새 콜백
    persistent?: boolean;                // true면 peek까지만 내려감
    className?: string;
  }
```

### Step 3-2: 피드 바텀시트

```
파일: src/features/feed/ui/FeedBottomSheet.tsx

작업:
  - 확장된 디자인시스템 BottomSheet 사용 (persistent 모드)
  - 기존 컴포넌트 재사용:
    - FeedCard (src/features/feed/ui/FeedCard.tsx)
    - CategoryGrid 등 피드 UI
  - useFilterStore 연동 (features/map/model/ 의 필터)
    → 크로스-feature 참조 회피: 필터 상태를 shared/model/로 승격
      또는 app/(map)/layout에서 props로 내려주기
  - 정렬: 거리순(기본), 최신순, 인기순

통합 방법:
  - src/app/(map)/layout.tsx에서 FeedBottomSheet를 조합
  - MapFooter의 [☰리스트뷰] → 바텀시트 snap을 half로 전환

검증:
  - 리스트뷰 버튼 탭 → 바텀시트 half로 올라옴
  - 드래그로 peek/half/full 전환
  - 기존 피드 카드 그대로 렌더링
```

### Step 3-3: 마커 프리뷰 시트

```
파일: src/features/feed/ui/SpotPreviewSheet.tsx

작업:
  - 마커 탭 시 하단에서 미니 카드 올라옴 (peek 높이보다 약간 높은 고정 높이)
  - 피드 바텀시트와 배타적 (프리뷰 열리면 피드시트는 peek으로)
  - 카드 내용:
    Offer: 제목 + 카테고리 + 위치 + 인원 현황 + [참여하기]
    Request: 제목 + 금액 + 카테고리 + 거리 + [제안하기]
  - 카드 탭 → 기존 상세 페이지 (/feed/[id])
  - 다른 마커 탭 → 프리뷰 교체 (AnimatePresence mode="wait")
  - 맵 빈 공간 탭 → 프리뷰 닫힘

검증:
  - 마커 탭 → 프리뷰 카드 슬라이드 업
  - Offer/Request 레이아웃 차이 확인
  - 빈 공간 탭 → 닫힘
```

### Step 3-4: 피드↔맵 연동

```
작업:
  - 바텀시트 피드 카드 탭 → 맵이 해당 좌표로 panTo
  - 해당 마커 하이라이트 (scale 1.3 + ring 애니메이션, 2초 후 복원)
  - 바텀시트가 peek으로 내려감 (맵 확인)

필터 상태 공유 문제 해결:
  - useFilterStore를 src/shared/model/filter-store.ts 로 이동
  - features/map과 features/feed 모두 shared에서 import
  - FSD 하향 규칙 충족
```

### Sprint 3 완료 기준

```
- [ ] 디자인시스템 BottomSheet에 peek snap + persistent 모드 추가
- [ ] 리스트뷰 버튼 → 바텀시트 3단계 스냅
- [ ] 기존 피드 카드 바텀시트 안에서 정상 렌더링
- [ ] 마커 탭 → 프리뷰 시트 표시
- [ ] 필터 상태 공유 (shared/model/)
- [ ] 터치 충돌 없음 (맵 패닝 vs 시트 드래그)
- [ ] pnpm lint + pnpm build 통과
- [ ] Backend handoff: 좌표 기반 피드 조회 API 스펙 추가
```

---

## Sprint 4 — 채팅 레버 + 드로어

### 목표

> 맵 우측에 채팅 레버를 상시 배치하고, 스와이프로 채팅 드로어를 열 수 있게 한다.

### Step 4-1: 채팅 레버

```
파일: src/features/chat/ui/ChatLever.tsx

위치: 맵 우측, 화면 세로 60% 지점 (엄지 닿는 곳)
디자인:
  - 세로 44px × 가로 22px 둥근 탭
  - 채팅 아이콘 (디자인시스템 IconButton 참고)
  - 읽지 않은 메시지 뱃지 (빨간 원 + 숫자)
    → 기존 bottom-nav-message-store 또는 chat-nav-store 연동

인터랙션:
  - 탭 → 드로어 열림
  - 좌측 스와이프 → 드로어 열림 (화면 우측 가장자리에서)

통합: src/app/(map)/layout.tsx 에서 배치
```

### Step 4-2: 채팅 드로어

```
파일: src/features/chat/ui/ChatDrawer.tsx

작업:
  - framer-motion AnimatePresence + 우→좌 슬라이드
  - 너비: min(360px, 90vw)
  - 드로어 열림 시: 맵에 dark overlay (bg-black/40)
  - 기존 채팅 컴포넌트 재사용:
    - ChatRoomList (src/features/chat/ui/ChatRoomList.tsx) → 방 목록
    - ChatDetail (src/features/chat/ui/ChatDetail.tsx) → 메시지 뷰
    - ChatWorkspace (src/features/chat/ui/ChatWorkspace.tsx)
  - 드로어 내 네비게이션: 방 목록 → 방 상세 (드로어 내부 전환)

닫기:
  - 오른쪽 스와이프 (dragConstraints)
  - 오버레이 탭
  - ESC 키

기존 features/chat/model/useMainChatStore.ts 활용:
  - 채팅 목록/선택 상태는 이미 zustand로 관리됨
  - 드로어 open/close 상태만 추가
```

### Step 4-3: 스팟 전환기

```
파일: src/features/chat/ui/SpotSwitcher.tsx

작업:
  - 드로어 상단 드롭다운 (디자인시스템 Dropdown 활용)
  - 참여 중인 스팟 목록 (기존 mock 데이터)
  - 각 항목: 스팟 제목 + 읽지 않은 수 뱃지
  - 선택 → 해당 스팟 채팅으로 전환
```

### Sprint 4 완료 기준

```
- [ ] 맵 우측에 채팅 레버 상시 표시
- [ ] 레버 탭 or 스와이프 → 드로어 열림
- [ ] 드로어 안에서 기존 채팅 UI 정상 렌더링
- [ ] 스팟 전환 드롭다운 동작
- [ ] 드로어 닫기 (스와이프, 오버레이 탭, ESC)
- [ ] 드로어 열림/닫힘 시 맵 애니메이션 정상
- [ ] pnpm lint + pnpm build 통과
- [ ] Backend handoff: 필요 시 채팅 관련 스펙 업데이트
```

---

## Sprint 5 — 레이어 시스템 (Optional)

> **진행 조건:** Sprint 4 완료 + 맵 UX 안정 확인 후 진행 여부 결정

### 목표

> 현실/가상/혼합 3개 레이어를 전환하는 UI와 각 레이어별 콘텐츠 분리.

### Step 5-1: 레이어 상태 관리

```
파일: src/features/layer/model/use-layer-store.ts

상태:
  type LayerType = 'mixed' | 'real' | 'virtual';

  type LayerState = {
    activeLayer: LayerType;
    setLayer: (layer: LayerType) => void;
  };

레이어별 콘텐츠 규칙:
  real: 실제 사용자가 만든 피드/스팟만
  virtual: AI 페르소나 + AI 생성 피드만
  mixed: 둘 다 (기본값)
```

### Step 5-2: 레이어 토글 UI

```
파일: src/features/layer/ui/LayerToggle.tsx

작업:
  - MapFooter의 [🌐레이어] 버튼 탭 → 바텀시트 (디자인시스템 BottomSheet)
  - 3개 옵션: 혼합(기본), 현실, 가상
  - 현재 선택에 체크 표시
  - 옵션별 한 줄 설명:
    혼합: "실제 모임 + AI 아이디어가 섞여요"
    현실: "실제 사용자 모임만 볼 수 있어요"
    가상: "AI들의 시뮬레이션 세계를 구경해요"
```

### Step 5-3: 레이어 전환 시각 효과

```
작업:
  - MVP: opacity fade 전환 (0.4s ease)
  - 해당 레이어 마커/아바타만 opacity 1, 나머지 0
  - will-change: opacity 힌트로 깜빡임 방지
  - 맵 배경 tint: virtual일 때 약간 보라색 오버레이

  이터레이션: blur + tint "차원 이동" 연출은 MVP 이후
```

### Step 5-4: 가상 레이어 깃발 꽂기

```
작업:
  - 가상 레이어 마커 프리뷰에 [이 아이디어로 모임 열기 🚩] CTA
  - 탭 → /post/request (또는 /post/offer)로 이동
    AI 피드의 카테고리, 지역, 설명이 폼에 프리필
  - 성공 시 해당 마커가 현실 레이어에도 표시
```

### Sprint 5 완료 기준

```
- [ ] 레이어 토글 UI + 3개 레이어 전환
- [ ] 레이어별 마커/아바타 필터링
- [ ] fade 전환 애니메이션 (깜빡임 없음)
- [ ] 가상 레이어 깃발 꽂기 → 게시 생성
- [ ] pnpm lint + pnpm build 통과
```

---

## Sprint 6 — 시뮬레이션 연동 (Optional)

> **진행 조건:** Sprint 5 완료 + spot-simulator의 event_log.jsonl 준비됨

### Step 6-1: 이벤트 로그 파서

```
파일: src/features/simulation/model/event-log-parser.ts

작업:
  - event_log.jsonl 파싱 (줄 단위 JSON)
  - simulator 이벤트 → MapEvent 변환:
    CREATE_SPOT → SPOT_CREATED
    JOIN_SPOT → PERSONA_MOVE + PERSONA_JOIN
    SPOT_MATCHED → SPOT_MATCHED
    WRITE_REVIEW → REVIEW (새 이벤트 타입)
    CHECK_IN → CHECK_IN (새 이벤트 타입)
  - tick → ms 변환 (1 tick = configurable, 기본 2500ms)
  - 파서에 버전 체크: 알 수 없는 이벤트는 skip + console.warn

주의: spot-simulator가 아직 없을 수 있음
  → Sprint 1의 mock-event-sequence.ts로 충분히 동작
  → 파서는 준비만 해두고, 실제 연동은 시뮬레이터 준비 후
```

### Step 6-2: 이벤트 플레이어 고도화

```
파일: src/features/simulation/model/use-event-player.ts (Sprint 1 확장)

추가:
  - 재생/일시정지 토글
  - 속도 조절 (0.5x, 1x, 2x)
  - 동시 이벤트 배치 처리 (같은 tick 이벤트 한 번에)
  - 재생 프로그레스 바 (선택적 UI)
```

### Step 6-3: 시뮬레이션 데이터 프리빌드

```
작업:
  - 시뮬레이터 결과물에서 바이럴/데모용 이벤트 30~50개 추출
  - 수원시 실제 행정동 좌표에 매핑
  - src/features/simulation/data/prebuilt-events.json
  - 빌드 타임 포함 (런타임 API 불필요)

  시뮬레이터 미준비 시: mock-event-sequence.ts 확장으로 대체
```

### Step 6-4: 페르소나 인터랙션

```
작업:
  - 아바타 탭 → 미니 프로필 카드
    이모지, 이름, archetype, 현재 상태
  - [따라가기] → 카메라가 해당 페르소나 추적
    페르소나 이동 시 맵 panTo 연동
    다른 곳 탭 → 추적 해제
  - 스팟에 페르소나 도착 → 마커 주변 아바타 클러스터 표시
```

### Sprint 6 완료 기준

```
- [ ] event_log.jsonl 파서 동작 (또는 mock 확장)
- [ ] 재생/일시정지/속도 조절
- [ ] 페르소나 탭 → 프로필 카드
- [ ] 따라가기 → 카메라 추적
- [ ] pnpm lint + pnpm build 통과
```

---

## Sprint 7 — 통합 + 기존 라우트 정리

### 목표

> 맵 메인이 안정적으로 기존 기능을 대체하는지 확인하고, 조건부로 라우트를 정리한다.

### Step 7-1: 기존 라우트 평가 및 정리

```
판단 기준 (Sprint 4 완료 후 평가):
  - /feed → 맵 바텀시트가 100% 대체? → Y: redirect, N: 유지
  - /spot → 채팅 드로어가 대체? → Y: redirect, N: 유지
  - /chat → 채팅 드로어가 대체? → Y: redirect, N: 유지

확정 이동:
  - /my → 유지 (독립 풀페이지)
  - /pay → 유지 (/my 하위)
  - /bookmarks → 유지 (/my 하위)
  - /notifications → 유지 (/my 하위)
  - /search → 유지 (맵 검색바에서 진입)
  - /post → 유지 (맵 + 버튼에서 진입)

삭제 대신 redirect:
  next.config.ts의 redirects로 처리
  → 기존 딥링크/북마크가 깨지지 않음

(main) layout의 BottomNav:
  - 맵 메인이 완전 대체 시 제거
  - 아닐 시 유지 (병행 운영)
```

### Step 7-2: 통합 테스트 시나리오

```
핵심 플로우:
  1. 앱 진입 → 맵 풀스크린 + (Sprint 5 있으면) 페르소나 이동
  2. 필터 칩 [알려줘] 탭 → Request 마커만 표시
  3. 마커 탭 → 프리뷰 시트 → 상세 페이지 → 뒤로 → 맵
  4. 리스트뷰 → 바텀시트 피드 → 카드 탭 → 맵 이동
  5. 채팅 레버 → 드로어 → 메시지 확인 → 닫기
  6. + 버튼 → 게시 생성 → 완료 → 맵 복귀
  7. 프로필 아이콘 → /my → 뒤로 → 맵
  8. 검색바 → /search → 결과 탭 → 맵 이동
  9. 내 위치 버튼 → 현위치 이동
  10. (Sprint 5) 레이어 전환 → 마커/아바타 필터

디바이스 검증:
  - 모바일: iOS Safari, Android Chrome
  - 데스크톱: 최대 너비 제한 (max-w-107.5 현행 유지)
```

### Step 7-3: 성능 확인

```
체크리스트:
  - 마커 20개 + 아바타 15개 → 모바일 60fps?
  - 바텀시트 드래그 시 프레임 드랍?
  - 채팅 드로어 + 맵 동시 렌더 메모리
  - 카카오맵 API 호출 빈도

성능 문제 대응:
  - 뷰포트 밖 마커/아바타 → 조건부 렌더 (맵 bounds 체크)
  - 마커 클러스터링 (20개 초과 시)
  - 아바타 최대 표시 수 제한 (화면 내 10개)
  - React.memo + useMemo로 불필요한 리렌더 방지
```

### Sprint 7 완료 기준

```
- [ ] 라우트 정리 완료 (redirect 또는 유지 — 삭제는 최후 수단)
- [ ] 핵심 플로우 10개 시나리오 통과
- [ ] 모바일 실기기 테스트 통과
- [ ] pnpm lint + pnpm build + pnpm test 통과
- [ ] Backend handoff: 최종 API 스펙 정리
```

---

## CLI 에이전트 작업 가이드

### 작업 단위 원칙

```
1개 Step = 1개 에이전트 세션

각 Step을 에이전트에게 넘길 때 포함할 것:
  - 이 문서의 해당 Step 전문
  - 현재 파일 구조 (tree로 관련 디렉토리)
  - 관련 기존 컴포넌트 경로 (재사용할 것)
  - 이전 Step 결과물 확인 커맨드
```

### 검증 커맨드

```bash
# 매 Step 완료 후 (필수)
pnpm lint
pnpm build

# Sprint 완료 후
pnpm test
pnpm dev  # 수동 확인
```

### 커밋 전략

```
Sprint 단위 브랜치:
  feat/map-poc        (Sprint 1)
  feat/map-shell      (Sprint 2)
  feat/map-feed       (Sprint 3)
  feat/map-chat       (Sprint 4)
  feat/map-layers     (Sprint 5, optional)
  feat/map-simulation (Sprint 6, optional)
  feat/map-migrate    (Sprint 7)

Step 단위 커밋:
  feat(map): add MapCanvas fullscreen with mock fallback
  feat(map): add spot markers with offer/request types
  feat(simulation): add persona avatar rendering
  feat(simulation): add persona waypoint movement
  feat(simulation): add event sequence player
  ...
```

---

## 리스크 & 대응 (v2 업데이트)

| #   | 리스크                                       | 시점              | 대응                                                                      |
| --- | -------------------------------------------- | ----------------- | ------------------------------------------------------------------------- |
| 1   | CustomOverlay 위 아바타 이동이 부드럽지 않음 | Sprint 1 Step 1-0 | **기술 스파이크로 사전 검증** — CSS transition / lerp / pixel 중 선택     |
| 2   | 카카오맵 키 없이 CI 빌드 실패                | Sprint 1 Step 1-1 | MockMapCanvas 폴백 + dynamic import (ssr: false)                          |
| 3   | 바텀시트 + 맵 터치 충돌                      | Sprint 3          | 디자인시스템 BottomSheet에 persistent 모드 추가, snap별 touch-action 분리 |
| 4   | 크로스-feature import (map↔feed)             | Sprint 3          | 공유 상태는 shared/model/로 승격, app layer에서 조합                      |
| 5   | 채팅 드로어 열려있을 때 맵 퍼포먼스          | Sprint 4          | 드로어 open 시 맵 애니메이션(페르소나 이동) 일시정지                      |
| 6   | 레이어 전환 시 깜빡임                        | Sprint 5          | opacity + will-change, MVP는 단순 fade                                    |
| 7   | 시뮬레이터 미준비                            | Sprint 6          | mock 데이터로 대체, 파서만 준비                                           |
| 8   | 기존 딥링크 깨짐                             | Sprint 7          | 삭제 대신 redirect, 점진적 마이그레이션                                   |
| 9   | BottomSheet 확장이 기존 사용처에 영향        | Sprint 3          | persistent/onSnapChange는 optional prop, 기존 동작 변경 없음              |

---

## 의존성 추가

```bash
# Sprint 1
pnpm add react-kakao-maps-sdk

# 나머지는 기존 스택으로 해결:
# - framer-motion (설치됨) → 애니메이션, 드래그, 드로어
# - zustand (설치됨) → 상태 관리
# - tailwind v4 (설치됨) → 스타일링
# - @frontend/design-system (워크스페이스) → 공통 컴포넌트
```

---

## v1 → v2 변경 요약

| 항목            | v1                  | v2                                                       |
| --------------- | ------------------- | -------------------------------------------------------- |
| 파일 배치       | 전부 features/map/  | FSD 규칙 준수: map셸, feed확장, chat확장, simulation신규 |
| BottomSheet     | 직접 구현           | 디자인시스템 기존 컴포넌트 확장 (peek snap + persistent) |
| 카카오맵 폴백   | "회색 배경" 한 줄   | MockMapCanvas + dynamic import + .env 전략               |
| 아바타 이동     | CSS transition 확정 | Step 1-0 기술 스파이크 후 결정                           |
| Sprint 5~6      | 필수                | optional — Sprint 4 안정화 후 판단                       |
| Sprint 7 라우트 | 확정 삭제           | 조건부 — redirect 우선, 삭제는 최후 수단                 |
| 필터 상태 공유  | features/map 내부   | shared/model/로 승격 (크로스-feature 접근)               |
| Backend handoff | 미언급              | 각 Sprint 완료 기준에 포함                               |
| 엔티티          | 미정의              | GeoCoord, SpotMapItem, Persona 엔티티 명시               |
