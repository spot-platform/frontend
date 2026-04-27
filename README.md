# Spot Frontend

Spot의 1차 MVP 프론트엔드입니다. Next.js App Router 기반으로 맵, 피드, 스팟, 채팅, 인증, 마이페이지, 온보딩, 시뮬레이션 흐름을 구성하고 있으며 일부 도메인은 실제 API 대신 로컬 mock 데이터로 연결되어 있습니다.

## Stack

| 영역               | 기술                                     |
| ------------------ | ---------------------------------------- |
| Framework          | Next.js 16 + React 19 (App Router)       |
| Styling            | Tailwind CSS v4 (`@theme` in CSS)        |
| Theming            | next-themes (light/dark)                 |
| State              | Zustand v5                               |
| Server state       | TanStack Query v5                        |
| HTTP               | Ky                                       |
| Animation          | framer-motion 12                         |
| Bottom sheet       | Vaul                                     |
| Map                | Naver Maps (with MockMapCanvas fallback) |
| PWA                | Serwist                                  |
| Test               | Vitest + Testing Library                 |
| Component explorer | Storybook 10                             |
| Commit             | Commitizen + Conventional Changelog      |

## Workspace structure

```
frontend/
├── src/
│   ├── app/                  # App Router — layouts, route handlers, page entrypoints
│   │   ├── (auth)/           # 인증 라우트 (로그인, 회원가입, 온보딩)
│   │   ├── (map)/            # 맵 surface (홈 — `/` → `/map` 리다이렉트)
│   │   ├── (detail)/         # 상세 surface (feed, spot, chat, my, pay, post,
│   │   │                     #   admin-post, bookmarks, notifications, users)
│   │   └── api/              # Route Handlers (auth 등)
│   ├── features/             # Feature slices — client / ui / model / api 레이어
│   │   ├── map/              # 맵 셸, URL state, 마커/바텀시트/드로어 orchestration
│   │   ├── feed/
│   │   ├── spot/
│   │   ├── chat/
│   │   ├── auth/
│   │   ├── onboarding/       # 페르소나 위저드 (role / archetype / interest)
│   │   ├── my/
│   │   ├── pay/
│   │   ├── post/
│   │   ├── admin-post/
│   │   ├── layer/            # 맵 레이어 토글 / 필터 시스템
│   │   └── simulation/       # 페르소나 이동/이벤트 재생, SSE 타임라인
│   ├── entities/             # 공유 도메인 타입 및 mock 엔티티 (spot, user, pay, persona)
│   └── shared/               # UI 컴포넌트, API 클라이언트, stores, utils, env
└── packages/
    └── design-system/        # @frontend/design-system — 토큰 + 공통 컴포넌트
```

## Frontend structure rules

페이지와 컴포넌트는 아래 기준으로 배치합니다.

- `src/app/**`
    - App Router 진입점만 둡니다.
    - `page.tsx`, `layout.tsx`, `metadata`, `params/searchParams`, `redirect/notFound` 같은 라우트 책임을 가집니다.
    - 가능한 한 얇게 유지하고, 실제 화면 조합과 인터랙션은 `features`로 위임합니다.
- `src/features/<feature>/client/**`
    - `'use client'`가 필요한 feature-level client boundary를 둡니다.
    - route/page 단위 orchestration, interactive flow, modal/action controller 성격의 컴포넌트는 여기에 둡니다.
    - 예: `*PageClient`, `*Client`
- `src/features/<feature>/ui/**`
    - 재사용 가능한 feature UI를 둡니다.
    - section, card, panel, form part, presentational component는 여기에 둡니다.
    - client file과 섞지 않습니다.
- `src/shared/ui/**`
    - feature를 넘어서 재사용되는 공용 UI와 layout primitive를 둡니다.
    - 예: `Main`, `Section`, `DetailPageShell`

### Placement rules

- `app`에서 직접 import하는 feature client entry는 우선 feature root barrel(`@/features/<feature>`)을 통해 노출합니다.
- 단, route-private 성격이 강한 client는 무리해서 public API로 올리지 않고 deep import를 유지할 수 있습니다.
- `features` 내부에서는 `_components`를 사용하지 않습니다.
- `features` 내부에서 `ui`는 "렌더링 조각", `client`는 "client boundary"라는 역할로 고정합니다.
- 새 파일을 만들 때 먼저 두 가지를 판단합니다.
    1. 이 파일이 `'use client'` 경계인가?
    2. 이 파일이 feature 내부에서 재사용되는 UI인가?
- 답이 1번이면 `client/`, 2번이면 `ui/`에 둡니다.

### Page composition rules

앱은 크게 **맵 surface**와 **디테일 surface** 두 갈래로 구성됩니다.

- `(map)` 계열은 `/map`을 홈으로 하는 단일 맵 셸입니다. 선택된 스팟, 바텀시트, 채팅 드로어, 페르소나 등 상호작용 상태는 `useMapUrlState`를 통해 URL로 동기화됩니다 (`/map?spot=<id>&sheet=half&chat=open` 형태로 딥링크 왕복).
- `(detail)` 계열 페이지는 `DetailHeader` + `DetailPageShell` 조합을 우선 사용합니다. 뒤로가기는 맵으로 복귀합니다.
- 과거 개별 페이지였던 라우트를 정리할 때는 `createMapRedirect(...)` 또는 `next.config.ts#redirects` 항목으로 맵 surface의 해당 상태로 포워딩합니다.
- `Section`은 page shell이 아니라 content section 용도로만 사용합니다.
- 페이지에서 `pt-*`, `pb-*`, `min-h-*`, 바깥쪽 `px-*`로 shell spacing을 직접 보정하지 않습니다. 이런 책임은 route layout 또는 shared layout primitive로 올립니다.

## Getting started

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

`http://localhost:3000`에서 확인할 수 있습니다. (`/`는 `/map`으로 리다이렉트됩니다.)

### 환경 변수

`.env.example`을 참고하여 `.env.local`을 생성합니다.

```bash
cp .env.example .env.local
```

| 변수                                | 설명                                                                 |
| ----------------------------------- | -------------------------------------------------------------------- |
| `ENABLE_DEV_DUMMY_LOGIN`            | `true`로 설정하면 로그인 화면에 개발용 더미 로그인 버튼이 노출됩니다 |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_KEY`  | 네이버 지도 client ID. 비워두면 `MockMapCanvas`로 폴백합니다         |
| `NEXT_PUBLIC_NAVER_MAP_STYLE_LIGHT` | 네이버 지도 라이트 모드 customStyleId (Naver Cloud Console에서 발급) |
| `NEXT_PUBLIC_NAVER_MAP_STYLE_DARK`  | 네이버 지도 다크 모드 customStyleId                                  |

## Scripts

```bash
pnpm dev                          # 개발 서버
pnpm build                        # 프로덕션 빌드
pnpm lint                         # ESLint 검사
pnpm format                       # ESLint --fix + Prettier
pnpm test                         # 단위 테스트 (Vitest)
pnpm test:coverage                # 커버리지 포함 테스트
pnpm storybook                    # Storybook 서버 (포트 6006)
pnpm storybook:design-system      # 디자인 시스템 Storybook
pnpm commit                       # Commitizen 대화형 커밋
```

## Design system

`packages/design-system` 워크스페이스 패키지로 분리된 디자인 시스템입니다. Tailwind v4 `@theme` 기반 토큰(라이트/다크)과 공통 컴포넌트(Button, Input, Textarea, Chip, Modal, BottomSheet, Dropdown, IconButton, Tab 등)를 포함합니다.

```bash
pnpm storybook:design-system
```

## Mock strategy

이 MVP는 실제 백엔드 없이 feature/entity 레벨 mock 모듈을 1차 데이터 소스로 사용합니다.

- `auth`, `my`, `pay`, `spot` — 로컬 mock 흐름으로 동작
- `feed`, `chat`, `admin-post`, `user`, `onboarding`, `simulation` — 인메모리 mock 데이터 소비
- MSW 및 외부 백엔드 연결은 MVP 런타임 경로에 포함되어 있지 않음

FE↔BE 계약은 저장소 루트의 `BACKEND_HANDOFF*.md`(entities / schemas / swagger) 문서에 기록합니다. 엔티티·엔드포인트·요청/응답 shape이 바뀌면 해당 문서를 함께 업데이트합니다.

## Current status

| 도메인                              | 완성도                                         |
| ----------------------------------- | ---------------------------------------------- |
| map / app shell                     | 가장 완성된 영역 (홈 surface)                  |
| feed                                | 맵 바텀시트 연동 완료                          |
| onboarding (persona wizard)         | 3-step 위저드 + mock 응답                      |
| simulation (persona / SSE timeline) | 아바타 이동, 이벤트 재생, 하이라이트 피드      |
| auth                                | Route Handler 부분 연결 (`src/app/api/auth/*`) |
| spot, chat, my                      | mock 기반 정상 동작                            |
| pay, notifications, bookmarks       | scaffold 위주의 MVP 라우트                     |

## Contributing

- 패키지 매니저는 반드시 `pnpm`을 사용합니다 (`pnpm@10.22.0`)
- 커밋은 `pnpm commit`으로 Conventional Commits 규칙을 따릅니다
- mock 동작을 확장할 때는 기존 feature 레벨 패턴을 우선 따릅니다
- CI는 `lint` + `build` 단계로 구성되어 있습니다 (`.github/workflows/ci.yml`)
- API-touching 변경은 루트의 `BACKEND_HANDOFF*.md`를 동시에 업데이트합니다
