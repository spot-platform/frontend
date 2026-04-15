# Spot Frontend

Spot의 1차 MVP 프론트엔드입니다. Next.js App Router 기반으로 피드, 스팟, 채팅, 인증, 마이페이지 흐름을 구성하고 있으며 일부 도메인은 실제 API 대신 로컬 mock 데이터로 연결되어 있습니다.

## Stack

| 영역               | 기술                                |
| ------------------ | ----------------------------------- |
| Framework          | Next.js 16 + React 19 (App Router)  |
| Styling            | Tailwind CSS v4                     |
| State              | Zustand                             |
| Server state       | TanStack Query v5                   |
| HTTP               | Ky                                  |
| PWA                | Serwist                             |
| Test               | Vitest + Testing Library            |
| Component explorer | Storybook 10                        |
| Commit             | Commitizen + Conventional Changelog |

## Workspace structure

```
frontend/
├── src/
│   ├── app/                  # App Router — layouts, route handlers, page entrypoints
│   │   ├── (auth)/           # 인증 라우트 (로그인, 회원가입)
│   │   ├── (main)/           # 메인 탭 네비게이션 라우트
│   │   │   ├── feed/
│   │   │   ├── spot/
│   │   │   ├── chat/
│   │   │   ├── my/
│   │   │   ├── pay/
│   │   │   ├── search/
│   │   │   ├── bookmarks/
│   │   │   └── notifications/
│   │   ├── (detail)/         # 상세 뷰 라우트
│   │   └── api/              # Route Handlers (auth 등)
│   ├── features/             # Feature slices — api / model / ui 레이어
│   │   ├── feed/
│   │   ├── spot/
│   │   ├── chat/
│   │   ├── auth/
│   │   ├── my/
│   │   ├── pay/
│   │   ├── post/
│   │   └── admin-post/
│   ├── entities/             # 공유 도메인 타입 및 mock 엔티티
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
- `features` 내부에서 `ui`는 “렌더링 조각”, `client`는 “client boundary”라는 역할로 고정합니다.
- 새 파일을 만들 때 먼저 두 가지를 판단합니다.
    1. 이 파일이 `'use client'` 경계인가?
    2. 이 파일이 feature 내부에서 재사용되는 UI인가?
- 답이 1번이면 `client/`, 2번이면 `ui/`에 둡니다.

### Page composition rules

- `(main)` 계열 페이지는 공용 layout primitive인 `Main`을 우선 사용합니다.
- `(detail)` 계열 페이지는 `DetailHeader` + `DetailPageShell` 조합을 우선 사용합니다.
- `Section`은 page shell이 아니라 content section 용도로만 사용합니다.
- 페이지에서 `pt-*`, `pb-*`, `min-h-*`, 바깥쪽 `px-*`로 shell spacing을 직접 보정하지 않습니다. 이런 책임은 route layout 또는 shared layout primitive로 올립니다.

## Getting started

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

`http://localhost:3000`에서 확인할 수 있습니다.

### 환경 변수

`.env.example`을 참고하여 `.env.local`을 생성합니다.

```bash
cp .env.example .env.local
```

| 변수                     | 설명                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| `ENABLE_DEV_DUMMY_LOGIN` | `true`로 설정하면 로그인 화면에 개발용 더미 로그인 버튼이 노출됩니다 |

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

`packages/design-system` 워크스페이스 패키지로 분리된 디자인 시스템입니다. CSS 커스텀 프로퍼티 기반 토큰과 공통 컴포넌트(Button, Input, Chip, Modal 등)를 포함합니다.

```bash
pnpm storybook:design-system
```

## Mock strategy

이 MVP는 실제 백엔드 없이 feature/entity 레벨 mock 모듈을 1차 데이터 소스로 사용합니다.

- `auth`, `my`, `pay`, `spot` — 로컬 mock 흐름으로 동작
- `feed`, `chat`, `admin-post`, `user` — 인메모리 mock 데이터 소비
- MSW 및 외부 백엔드 연결은 MVP 런타임 경로에 포함되어 있지 않음

## Current status

| 도메인                        | 완성도                                         |
| ----------------------------- | ---------------------------------------------- |
| feed / app shell              | 가장 완성된 영역                               |
| auth                          | Route Handler 부분 연결 (`src/app/api/auth/*`) |
| spot, chat, my                | mock 기반 정상 동작                            |
| pay, notifications, bookmarks | scaffold 위주의 MVP 라우트                     |

## Contributing

- 패키지 매니저는 반드시 `pnpm`을 사용합니다 (`pnpm@10.22.0`)
- 커밋은 `pnpm commit`으로 Conventional Commits 규칙을 따릅니다
- mock 동작을 확장할 때는 기존 feature 레벨 패턴을 우선 따릅니다
- CI는 `lint` + `build` 단계로 구성되어 있습니다 (`.github/workflows/ci.yml`)
