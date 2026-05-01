# SPOT Frontend API Contract — Fresh Start

> 목적: 기존 handoff 문서의 누적 수정 이력을 버리고, 현재 프론트엔드를 구현/연동하기 위해 필요한 **엔티티**, **스키마**, **Swagger 스타일 API 명세**를 백지 기준으로 다시 정의한다.
>
> 기준: 프론트엔드 화면/상태/액션에서 필요한 계약을 우선 정의한다. 백엔드 구현 세부사항은 이 문서에 맞춰 조정해도 되고, 불가피한 변경은 프론트와 동기화한다.

---

## 0. 공통 규칙

### Base URL

```txt
/api/v1
```

### Auth

- 기본 인증: `Authorization: Bearer <accessToken>`
- 웹 쿠키 병행 가능: `spot-auth-token` httpOnly cookie
- refresh token은 httpOnly cookie 또는 body 방식 중 하나로 통일 필요

### 날짜/시간

- 모든 timestamp: ISO 8601 string
- 기본 timezone: `Asia/Seoul`
- 날짜만 필요한 필드: `YYYY-MM-DD`

### 좌표

```ts
type GeoCoord = {
  lat: number;
  lng: number;
};
```

### 응답 envelope

```ts
type ApiResponse<T> = {
  data: T;
  meta?: PageMeta;
};

type PageMeta = {
  page: number;
  size: number;
  total: number;
  hasNext: boolean;
};

type ErrorResponse = {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
};
```

### 페이지네이션

- query: `page`, `size`
- `page`는 1-base 권장
- 정렬이 필요한 API는 `sort=createdAt,desc` 형태 권장

---

## 1. 핵심 엔티티

### 1.1 User

```ts
type UserProfile = {
  id: string;
  nickname: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  pointBalance: number;
  joinedAt: string;
};

type ProfileType = 'SUPPORTER' | 'PARTNER';

type SupporterRegistrationStatus =
  | 'NOT_SUBMITTED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED';

type SupporterRegistration = {
  field: string;
  mediaUrls: string[];
  career: string;
  bio: string;
  verificationStatus: SupporterRegistrationStatus;
  verificationNotes: string;
  extraNotes: string;
  updatedAt?: string;
};

type ProfileReview = {
  id: string;
  reviewerNickname: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  spotTitle: string;
  createdAt: string;
};

type SupporterProfile = {
  id: string;
  profileType: 'SUPPORTER';
  nickname: string;
  avatarUrl?: string;
  field: string;
  mediaUrls: string[];
  career: string;
  bio: string;
  avgRating: number;
  reviewCount: number;
  reviews: ProfileReview[];
  history: ProfileHistory[];
};

type PartnerProfile = {
  id: string;
  profileType: 'PARTNER';
  nickname: string;
  avatarUrl?: string;
  interestCategories: string[];
  isFriend: boolean;
};
```

### 1.2 Auth

```ts
type OAuthProvider = 'kakao' | 'google';

type LoginRequest = {
  email: string;
  password: string;
  next?: string;
};

type LoginResult = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  redirectTo: string;
};

type RefreshTokenRequest = {
  refreshToken: string;
};

type TokenRefreshResult = {
  accessToken: string;
};
```

### 1.3 Persona / Onboarding

```ts
type UserPersonaRole = 'SUPPORTER' | 'PARTNER';
type PersonaArchetype = 'explorer' | 'helper' | 'creator' | 'connector' | 'learner';

type OnboardingSelection = {
  role: UserPersonaRole;
  archetype: PersonaArchetype;
  interests: string[];
};

type UserPersona = OnboardingSelection & {
  userId: string;
  createdAt: string;
};
```

### 1.4 Spot

```ts
type SpotType = 'OFFER' | 'REQUEST';
type SpotStatus = 'OPEN' | 'MATCHED' | 'CLOSED' | 'CANCELLED';

type Spot = {
  id: string;
  type: SpotType;
  status: SpotStatus;
  title: string;
  description: string;
  pointCost: number;
  authorId: string;
  authorNickname: string;
  createdAt: string;
  updatedAt: string;
  forfeitPool?: {
    toPool: number;
    toPlatformFee: number;
  };
};

type SpotMapItem = {
  id: string;
  type: SpotType;
  status: SpotStatus;
  title: string;
  coord: GeoCoord;
  category: string;
  provenance?: 'virtual' | 'real' | 'mixed';
  personFitnessScore?: number;
  attractivenessScore?: number;
  authorId?: string;
  participantCount?: number;
  location?: string;
};

type TimelineEventKind =
  | 'CREATED'
  | 'MATCHED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'COMMENT'
  | 'SETTLEMENT_REQUESTED'
  | 'SETTLEMENT_APPROVED';

type TimelineEvent = {
  id: string;
  kind: TimelineEventKind;
  actorId: string;
  actorNickname: string;
  content?: string;
  createdAt: string;
};

type SpotDetail = Spot & {
  timeline: TimelineEvent[];
};
```

### 1.5 Spot Collaboration

```ts
type SpotParticipant = {
  userId: string;
  nickname: string;
  role: 'AUTHOR' | 'PARTICIPANT';
  joinedAt: string;
};

type ScheduleSlot = {
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  availableUserIds: string[];
};

type SpotSchedule = {
  spotId: string;
  proposedSlots: ScheduleSlot[];
  confirmedSlot?: ScheduleSlot;
};

type VoteOption = {
  id: string;
  label: string;
  voterIds: string[];
};

type SpotVote = {
  id: string;
  spotId: string;
  question: string;
  options: VoteOption[];
  multiSelect: boolean;
  closedAt?: string;
};

type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
  assigneeId?: string;
  assigneeNickname?: string;
};

type SpotChecklist = {
  spotId: string;
  items: ChecklistItem[];
};

type SharedFile = {
  id: string;
  spotId: string;
  uploaderNickname: string;
  name: string;
  url: string;
  sizeBytes: number;
  uploadedAt: string;
};

type ProgressNote = {
  id: string;
  spotId: string;
  authorNickname: string;
  content: string;
  createdAt: string;
};

type SpotReview = {
  id: string;
  spotId: string;
  reviewerNickname: string;
  targetNickname: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string;
};
```

### 1.6 Feed

```ts
type FeedItemType = 'OFFER' | 'REQUEST' | 'RENT';
type FeedItemStatus = 'OPEN' | 'MATCHED' | 'CLOSED';
type FeedCategory = '음악' | '요리' | '운동' | '공예' | '언어' | '기타';
type FeedAuthorRole = 'SUPPORTER' | 'PARTNER';
type FeedApplicationStatus = 'APPLIED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
type FeedApplicationRole = 'SUPPORTER' | 'PARTNER';

type FeedAuthorProfile = {
  id: string;
  nickname: string;
  avatarUrl?: string;
  role: FeedAuthorRole;
  rating?: number;
  field?: string;
};

type FeedItem = {
  id: string;
  title: string;
  description?: string;
  location: string;
  authorNickname: string;
  authorProfile?: FeedAuthorProfile;
  price: number;
  type: FeedItemType;
  status: FeedItemStatus;
  progressPercent?: number;
  imageUrl?: string;
  views: number;
  likes: number;
  partnerCount?: number;
  applicantCount?: number;
  category?: FeedCategory;
  deadline?: string;
  maxParticipants?: number;
  isRentable?: boolean;
  isBookmarked?: boolean;
  myApplicationStatus?: FeedApplicationStatus;
  myApplicationRole?: FeedApplicationRole;
  myApplicationDeposit?: number;
  spotId?: string;
  isAi?: boolean;
};

type FeedApplication = {
  id: string;
  feedId: string;
  userId: string;
  proposal: string;
  status: FeedApplicationStatus;
  appliedRole: FeedApplicationRole;
  deposit: number;
  createdAt: string;
};
```

### 1.7 Chat

```ts
type ChatRoomCategory = 'personal' | 'spot';
type ChatActionKind = 'vote' | 'schedule' | 'file' | 'reverse-offer';

type ChatMessage =
  | { id: string; kind: 'system'; content: string; createdAt: string }
  | { id: string; kind: 'message'; authorId: string; authorName: string; content: string; createdAt: string }
  | { id: string; kind: 'vote'; authorId: string; authorName: string; vote: SpotVote; createdAt: string }
  | { id: string; kind: 'schedule'; authorId: string; authorName: string; schedule: ChatScheduleDraft; createdAt: string }
  | { id: string; kind: 'file'; authorId: string; authorName: string; file: SharedFile; createdAt: string }
  | { id: string; kind: 'reverse-offer'; authorId: string; authorName: string; reverseOffer: ChatReverseOfferSummary; createdAt: string }
  | { id: string; kind: 'proposal'; authorId: string; authorName: string; proposal: ProposalPayload; status: 'PENDING' | 'ACCEPTED' | 'NEGOTIATING' | 'DECLINED'; createdAt: string };

type PersonalChatRoom = {
  id: string;
  category: 'personal';
  currentUserId: string;
  currentUserName: string;
  title: string;
  subtitle: string;
  description: string;
  metaLabel: string;
  updatedAt: string;
  partnerId: string;
  partnerName: string;
  presenceLabel: string;
  unreadCount: number;
  counterpartRole: 'SUPPORTER' | 'PARTNER';
  messages: ChatMessage[];
};

type SpotChatRoom = {
  id: string;
  category: 'spot';
  currentUserId: string;
  currentUserName: string;
  title: string;
  subtitle: string;
  description: string;
  metaLabel: string;
  updatedAt: string;
  spot: SpotDetailFull;
  sourceFeedId?: string;
  participationRole?: 'SUPPORTER' | 'PARTNER';
  messages: ChatMessage[];
};

type ChatRoom = PersonalChatRoom | SpotChatRoom;
```

### 1.8 Pay / Point

```ts
type PointTransaction = {
  id: string;
  type: 'CHARGE' | 'USE' | 'REFUND' | 'WITHDRAW';
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
};

type PointBalance = {
  balance: number;
  updatedAt: string;
};

type LinkedBankAccount = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  updatedAt: string;
};

type PointWithdrawal = {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  requestedAt: string;
};
```

### 1.9 Simulation / Map Data

프론트의 맵/시뮬레이션 화면은 아래 계약이 필요하다.

```ts
type SpotProvenance = 'virtual' | 'real' | 'mixed';
type SpotTeachMode = '1:1' | 'small_group' | 'workshop';
type SpotVenueType = 'cafe' | 'home' | 'studio' | 'park' | 'gym';

type ResolvedPlace = {
  place_id: number;
  name: string;
  primary_category: string;
  role: 'meetup' | 'main' | 'secondary' | 'wrapup';
  lat: number;
  lng: number;
  address: string;
  road_address?: string;
  confidence: number;
};

type PlanV3 = {
  steps: Array<{
    time: string;
    activity: string;
    place_id: number | null;
    intent: string | null;
  }>;
  total_duration_minutes: number;
};

type PriceBreakdown = {
  base_fee: number;
  included_items: Array<{ name: string; value: string }>;
  optional_addons: Array<{
    name: string;
    price: number;
    mechanism: 'fixed' | 'funding' | 'realcost';
    explanation: string | null;
  }>;
  refund_policy: {
    cutoff_hours: number;
    full_refund_until: string | null;
    note: string | null;
  } | null;
  summary_line: string | null;
};

type Preparation = {
  host_provides: string[];
  partner_brings: string[];
  weather_contingency: string | null;
  safety_notes: string[];
  host_tip: string | null;
};
```

---

## 2. DB 스키마 초안

백엔드가 RDB 기준으로 구현한다면 아래 테이블을 1차 기준으로 잡는다. 문서 목적상 상세 index/constraint는 최소만 적는다.

### users

| column | type | note |
|---|---:|---|
| id | uuid/string pk | user id |
| email | varchar unique | login id |
| password_hash | varchar nullable | OAuth only 가능 |
| nickname | varchar | 표시명 |
| phone | varchar nullable | |
| avatar_url | text nullable | |
| point_balance | integer | 캐시 가능 |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### user_oauth_accounts

| column | type | note |
|---|---:|---|
| id | uuid/string pk | |
| user_id | fk users.id | |
| provider | enum('kakao','google') | |
| provider_user_id | varchar | provider 내 unique |
| created_at | timestamptz | |

### user_personas

| column | type | note |
|---|---:|---|
| user_id | fk users.id pk | |
| role | enum('SUPPORTER','PARTNER') | |
| archetype | enum | explorer/helper/creator/connector/learner |
| interests | json/text[] | string[] |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### supporter_profiles

| column | type | note |
|---|---:|---|
| user_id | fk users.id pk | |
| field | varchar | 분야 |
| media_urls | json/text[] | |
| career | text | |
| bio | text | |
| verification_status | enum | NOT_SUBMITTED/PENDING/VERIFIED/REJECTED |
| verification_notes | text | 운영자 메모/거절 사유 |
| extra_notes | text | 사용자 추가 메모 |
| updated_at | timestamptz | |

### spots

| column | type | note |
|---|---:|---|
| id | uuid/string pk | |
| type | enum('OFFER','REQUEST') | |
| status | enum('OPEN','MATCHED','CLOSED','CANCELLED') | |
| title | varchar | |
| description | text | |
| point_cost | integer | |
| author_id | fk users.id | |
| category | varchar nullable | |
| location_label | varchar nullable | |
| lat | decimal nullable | map marker |
| lng | decimal nullable | map marker |
| plan_json | jsonb nullable | PlanV3 |
| price_breakdown_json | jsonb nullable | PriceBreakdown |
| preparation_json | jsonb nullable | Preparation |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### spot_participants

| column | type | note |
|---|---:|---|
| spot_id | fk spots.id | composite unique with user_id |
| user_id | fk users.id | |
| role | enum('AUTHOR','PARTICIPANT') | |
| joined_at | timestamptz | |

### spot_timeline_events

| column | type | note |
|---|---:|---|
| id | uuid/string pk | |
| spot_id | fk spots.id | |
| kind | enum | CREATED/MATCHED/... |
| actor_id | fk users.id | |
| content | text nullable | |
| created_at | timestamptz | |

### feed_items

Feed는 `spots`의 projection으로 만들어도 되고, 별도 curated/admin 글과 합쳐지는 read model로 둘 수 있다.

| column | type | note |
|---|---:|---|
| id | uuid/string pk | |
| spot_id | fk spots.id nullable | spot 연결 |
| type | enum('OFFER','REQUEST','RENT') | |
| status | enum('OPEN','MATCHED','CLOSED') | |
| title | varchar | |
| description | text nullable | |
| location | varchar | |
| price | integer | |
| author_id | fk users.id | |
| category | varchar nullable | |
| image_url | text nullable | |
| views | integer | |
| likes | integer | |
| deadline | date nullable | |
| max_participants | integer nullable | |
| is_ai | boolean | simulation-origin marker |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### feed_applications

| column | type | note |
|---|---:|---|
| id | uuid/string pk | |
| feed_id | fk feed_items.id | |
| user_id | fk users.id | |
| proposal | text | |
| applied_role | enum('SUPPORTER','PARTNER') | |
| deposit | integer | |
| status | enum('APPLIED','ACCEPTED','REJECTED','CANCELLED') | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### chats / chat_messages

| table | key fields |
|---|---|
| chat_rooms | id, category, title, spot_id?, created_at, updated_at |
| chat_room_members | room_id, user_id, role_label?, last_read_at |
| chat_messages | id, room_id, kind, author_id?, payload_json, created_at |

`kind`별 payload는 ChatMessage union을 따른다.

### point_transactions / withdrawals / bank_accounts

| table | key fields |
|---|---|
| point_transactions | id, user_id, type, amount, balance_after, description, created_at |
| linked_bank_accounts | user_id, bank_name, account_number_masked, account_holder, updated_at |
| point_withdrawals | id, user_id, amount, status, requested_at, processed_at? |

### bookmarks / recent_views / notifications

| table | key fields |
|---|---|
| bookmarks | id, user_id, target_type, target_id, created_at |
| recent_views | id, user_id, target_type, target_id, viewed_at |
| notifications | id, user_id, type, title, body, read_at?, created_at |
| notification_settings | user_id, service_notice_enabled, activity_enabled, push_enabled, email_enabled, updated_at |

---

## 3. Swagger 스타일 API 명세

아래는 OpenAPI 느낌의 프론트 필요 API 목록이다.

### 3.1 Auth

#### POST `/auth/login`

```yaml
summary: 이메일 로그인
requestBody:
  application/json:
    email: string
    password: string
    next?: string
responses:
  200:
    application/json: LoginResult
  400:
    application/json: ErrorResponse
```

#### POST `/auth/logout`

```yaml
summary: 로그아웃
responses:
  200:
    application/json:
      ok: true
```

#### POST `/auth/refresh`

```yaml
summary: access token 갱신
requestBody:
  application/json:
    refreshToken?: string
responses:
  200:
    application/json: ApiResponse<TokenRefreshResult>
  401:
    application/json: ErrorResponse
```

#### GET `/auth/oauth/{provider}/start`

```yaml
summary: OAuth 로그인 시작
parameters:
  path:
    provider: kakao | google
  query:
    next?: string
responses:
  302:
    description: provider 인증 페이지 또는 post-login path로 redirect
```

---

### 3.2 Me / User

#### GET `/me`

```yaml
summary: 내 프로필 조회
security: bearerAuth
responses:
  200:
    application/json: ApiResponse<UserProfile>
```

#### PATCH `/me`

```yaml
summary: 내 프로필 수정
requestBody:
  application/json:
    nickname?: string
    email?: string
    phone?: string
    avatarUrl?: string
responses:
  200:
    application/json: ApiResponse<UserProfile>
```

#### PATCH `/me/password`

```yaml
summary: 비밀번호 변경
requestBody:
  application/json:
    currentPassword: string
    newPassword: string
    confirmPassword: string
responses:
  204:
    description: no content
```

#### GET `/me/notification-settings`

```yaml
responses:
  200:
    application/json: ApiResponse<NotificationSettings>
```

#### PUT `/me/notification-settings`

```yaml
requestBody:
  application/json:
    serviceNoticeEnabled: boolean
    activityEnabled: boolean
    pushEnabled: boolean
    emailEnabled: boolean
responses:
  200:
    application/json: ApiResponse<NotificationSettings>
```

#### GET `/me/supporter-registration`

```yaml
responses:
  200:
    application/json: ApiResponse<SupporterRegistration>
```

#### PUT `/me/supporter-registration`

```yaml
requestBody:
  application/json:
    field: string
    mediaUrls: string[]
    career: string
    bio: string
    verificationStatus?: SupporterRegistrationStatus # BE가 무시/관리 권장
    verificationNotes?: string # BE가 무시/관리 권장
    extraNotes: string
responses:
  200:
    application/json: ApiResponse<SupporterRegistration>
```

#### GET `/users/{userId}/supporter-profile`

```yaml
responses:
  200:
    application/json: ApiResponse<SupporterProfile>
```

#### GET `/users/{userId}/partner-profile`

```yaml
responses:
  200:
    application/json: ApiResponse<PartnerProfile>
```

---

### 3.3 Onboarding / Persona

#### GET `/me/persona`

```yaml
responses:
  200:
    application/json: ApiResponse<UserPersona | null>
```

#### PUT `/me/persona`

```yaml
requestBody:
  application/json:
    role: SUPPORTER | PARTNER
    archetype: explorer | helper | creator | connector | learner
    interests: string[]
responses:
  200:
    application/json: ApiResponse<UserPersona>
```

---

### 3.4 Feed

#### GET `/feeds`

```yaml
summary: 홈/탐색 피드 목록
parameters:
  query:
    tab?: HOME | EXPLORE
    type?: OFFER | REQUEST | RENT
    category?: string
    status?: OPEN | MATCHED | CLOSED
    q?: string
    nearLat?: number
    nearLng?: number
    page?: number
    size?: number
responses:
  200:
    application/json: ApiResponse<FeedItem[]>
```

#### GET `/feeds/{feedId}`

```yaml
responses:
  200:
    application/json: ApiResponse<FeedItem>
  404:
    application/json: ErrorResponse
```

#### POST `/feeds/{feedId}/applications`

```yaml
summary: 피드 신청
requestBody:
  application/json:
    proposal: string
    role: SUPPORTER | PARTNER
    deposit: number
responses:
  201:
    application/json: ApiResponse<FeedApplication>
```

#### DELETE `/feeds/{feedId}/applications/me`

```yaml
summary: 내 신청 취소
responses:
  200:
    application/json:
      data:
        feedId: string
        status: CANCELLED
```

#### POST `/feeds/{feedId}/bookmark`

```yaml
summary: 북마크 추가
responses:
  204: {}
```

#### DELETE `/feeds/{feedId}/bookmark`

```yaml
summary: 북마크 제거
responses:
  204: {}
```

---

### 3.5 Spots

#### GET `/spots`

```yaml
summary: 스팟 목록
parameters:
  query:
    type?: OFFER | REQUEST
    status?: OPEN | MATCHED | CLOSED | CANCELLED
    participating?: boolean
    page?: number
    size?: number
responses:
  200:
    application/json: ApiResponse<Spot[]>
```

#### GET `/spots/map`

```yaml
summary: 지도 마커용 스팟 목록
parameters:
  query:
    swLat?: number
    swLng?: number
    neLat?: number
    neLng?: number
    category?: string
    type?: OFFER | REQUEST
    status?: OPEN | MATCHED | CLOSED | CANCELLED
responses:
  200:
    application/json: ApiResponse<SpotMapItem[]>
```

#### GET `/spots/search`

```yaml
summary: 스팟 검색
parameters:
  query:
    q: string
    page?: number
    size?: number
responses:
  200:
    application/json: ApiResponse<Spot[]>
```

#### POST `/spots`

```yaml
summary: OFFER/REQUEST 작성
requestBody:
  application/json:
    type: OFFER | REQUEST
    title: string
    description: string
    pointCost: number
    category?: string
    location?: string
    coord?: GeoCoord
    deadline?: string
    plan?: PlanV3
    priceBreakdown?: PriceBreakdown
    preparation?: Preparation
responses:
  201:
    application/json: ApiResponse<Spot>
```

#### GET `/spots/{spotId}`

```yaml
responses:
  200:
    application/json: ApiResponse<SpotDetail>
```

#### POST `/spots/{spotId}/match`

```yaml
summary: 스팟 매칭 처리
responses:
  200:
    application/json: ApiResponse<Spot>
```

#### POST `/spots/{spotId}/cancel`

```yaml
responses:
  200:
    application/json: ApiResponse<Spot>
```

#### POST `/spots/{spotId}/complete`

```yaml
responses:
  200:
    application/json: ApiResponse<Spot>
```

#### GET `/spots/{spotId}/participants`

```yaml
responses:
  200:
    application/json: ApiResponse<SpotParticipant[]>
```

#### GET `/spots/{spotId}/schedule`

```yaml
responses:
  200:
    application/json: ApiResponse<SpotSchedule | null>
```

#### PUT `/spots/{spotId}/schedule`

```yaml
requestBody:
  application/json:
    proposedSlots: ScheduleSlot[]
    confirmedSlot?: ScheduleSlot
responses:
  200:
    application/json: ApiResponse<SpotSchedule>
```

#### GET `/spots/{spotId}/votes`

```yaml
responses:
  200:
    application/json: ApiResponse<SpotVote[]>
```

#### POST `/spots/{spotId}/votes`

```yaml
requestBody:
  application/json:
    question: string
    options: string[]
    multiSelect?: boolean
responses:
  201:
    application/json: ApiResponse<SpotVote>
```

#### POST `/spots/{spotId}/votes/{voteId}/cast`

```yaml
requestBody:
  application/json:
    optionIds: string[]
responses:
  200:
    application/json: ApiResponse<SpotVote>
```

#### GET `/spots/{spotId}/checklist`

```yaml
responses:
  200:
    application/json: ApiResponse<SpotChecklist | null>
```

#### PUT `/spots/{spotId}/checklist`

```yaml
requestBody:
  application/json:
    items: ChecklistItem[]
responses:
  200:
    application/json: ApiResponse<SpotChecklist>
```

#### GET `/spots/{spotId}/files`

```yaml
responses:
  200:
    application/json: ApiResponse<SharedFile[]>
```

#### POST `/spots/{spotId}/files`

```yaml
requestBody:
  multipart/form-data:
    file: binary
responses:
  201:
    application/json: ApiResponse<SharedFile>
```

#### DELETE `/spots/{spotId}/files/{fileId}`

```yaml
responses:
  204: {}
```

#### GET `/spots/{spotId}/notes`

```yaml
responses:
  200:
    application/json: ApiResponse<ProgressNote[]>
```

#### POST `/spots/{spotId}/notes`

```yaml
requestBody:
  application/json:
    content: string
responses:
  201:
    application/json: ApiResponse<ProgressNote>
```

#### GET `/spots/{spotId}/reviews`

```yaml
responses:
  200:
    application/json: ApiResponse<SpotReview[]>
```

#### POST `/spots/{spotId}/reviews`

```yaml
requestBody:
  application/json:
    targetNickname: string
    rating: 1 | 2 | 3 | 4 | 5
    comment?: string
responses:
  201:
    application/json: ApiResponse<SpotReview>
```

#### POST `/spots/{spotId}/settlement`

```yaml
requestBody:
  application/json:
    lineItems:
      - label: string
        amount: number
    summary: string
responses:
  200:
    application/json: ApiResponse<SpotSettlementApproval>
```

#### POST `/spots/{spotId}/settlement/approve`

```yaml
responses:
  200:
    application/json: ApiResponse<SpotSettlementApproval>
```

---

### 3.6 Chat

#### GET `/chat/rooms`

```yaml
parameters:
  query:
    category?: personal | spot
    tab?: personal | team
    filter?: string
    page?: number
    size?: number
responses:
  200:
    application/json: ApiResponse<ChatRoom[]>
```

#### GET `/chat/rooms/{roomId}`

```yaml
responses:
  200:
    application/json: ApiResponse<ChatRoom>
```

#### POST `/chat/rooms`

```yaml
summary: 개인/스팟 채팅방 생성 또는 기존 방 반환
requestBody:
  application/json:
    category: personal | spot
    partnerId?: string
    spotId?: string
responses:
  200:
    application/json: ApiResponse<ChatRoom>
```

#### GET `/chat/rooms/{roomId}/messages`

```yaml
parameters:
  query:
    cursor?: string
    size?: number
responses:
  200:
    application/json:
      data: ChatMessage[]
      meta:
        nextCursor?: string
        hasNext: boolean
```

#### POST `/chat/rooms/{roomId}/messages`

```yaml
requestBody:
  application/json:
    kind: message
    content: string
responses:
  201:
    application/json: ApiResponse<ChatMessage>
```

#### GET `/chat/rooms/{roomId}/stream`

```yaml
summary: SSE 채팅 이벤트 스트림
responses:
  200:
    text/event-stream:
      events:
        - type: message
        - type: read
        - type: typing
```

#### POST `/chat/rooms/{roomId}/read`

```yaml
responses:
  204: {}
```

#### GET `/chat/action-items`

```yaml
summary: 채팅 탭에 노출할 투표/일정/파일/역제안 액션 아이템
parameters:
  query:
    kind?: vote | schedule | file | reverse-offer
responses:
  200:
    application/json: ApiResponse<SpotActionItem[]>
```

---

### 3.7 Pay / Points

#### GET `/pay/balance`

```yaml
responses:
  200:
    application/json: ApiResponse<PointBalance>
```

#### GET `/pay/history`

```yaml
parameters:
  query:
    page?: number
    size?: number
responses:
  200:
    application/json: ApiResponse<PointTransaction[]>
```

#### POST `/pay/charge`

```yaml
requestBody:
  application/json:
    amount: number
responses:
  200:
    application/json: ApiResponse<PointBalance>
```

#### GET `/pay/bank-account`

```yaml
responses:
  200:
    application/json: ApiResponse<LinkedBankAccount | null>
```

#### PUT `/pay/bank-account`

```yaml
requestBody:
  application/json:
    bankName: string
    accountNumber: string
    accountHolder: string
responses:
  200:
    application/json: ApiResponse<LinkedBankAccount>
```

#### GET `/pay/withdrawals`

```yaml
parameters:
  query:
    page?: number
    size?: number
responses:
  200:
    application/json: ApiResponse<PointWithdrawal[]>
```

#### POST `/pay/withdrawals`

```yaml
requestBody:
  application/json:
    amount: number
responses:
  200:
    application/json: ApiResponse<PointBalance>
```

---

### 3.8 My Activity

#### GET `/me/participations`

```yaml
parameters:
  query:
    page?: number
    size?: number
responses:
  200:
    application/json: ApiResponse<Participation[]>
```

#### GET `/me/favorites`

```yaml
responses:
  200:
    application/json: ApiResponse<MyFavoriteItem[]>
```

#### DELETE `/me/favorites/{favoriteId}`

```yaml
responses:
  204: {}
```

#### GET `/me/recent-views`

```yaml
responses:
  200:
    application/json: ApiResponse<MyRecentViewItem[]>
```

#### DELETE `/me/recent-views/{recentViewId}`

```yaml
responses:
  204: {}
```

#### DELETE `/me/recent-views`

```yaml
summary: 최근 본 항목 전체 삭제
responses:
  204: {}
```

#### GET `/me/support-activity-summary`

```yaml
responses:
  200:
    application/json: ApiResponse<MySupportActivitySummary>
```

---

### 3.9 Notifications

#### GET `/notifications`

```yaml
parameters:
  query:
    unreadOnly?: boolean
    page?: number
    size?: number
responses:
  200:
    application/json: ApiResponse<NotificationItem[]>
```

#### POST `/notifications/{notificationId}/read`

```yaml
responses:
  204: {}
```

#### POST `/notifications/read-all`

```yaml
responses:
  204: {}
```

---

### 3.10 Admin Posts / Notices

#### GET `/admin-posts`

```yaml
parameters:
  query:
    type?: curation | notice | report
    page?: number
    size?: number
responses:
  200:
    application/json: ApiResponse<AdminPost[]>
```

#### GET `/admin-posts/{postId}`

```yaml
responses:
  200:
    application/json: ApiResponse<AdminPost>
```

---

### 3.11 Simulation / Locality

#### GET `/sim/runs/{runId}/manifest`

```yaml
responses:
  200:
    application/json: SimManifest
```

#### GET `/sim/runs/{runId}/movements`

```yaml
parameters:
  query:
    fromTick: number
    toTick: number
responses:
  200:
    application/json: MovementChunk
```

#### GET `/sim/runs/{runId}/lifecycle`

```yaml
parameters:
  query:
    fromTick: number
    toTick: number
responses:
  200:
    application/json: LifecycleChunk
```

#### GET `/sim/spots/{spotId}`

```yaml
responses:
  200:
    application/json: ApiResponse<SimulationSpotDetail | null>
```

#### GET `/locality/regions`

```yaml
parameters:
  query:
    targetCity: string # current: suwon
responses:
  200:
    application/json: LocalityFeatureSet
```

---

## 4. 프론트 구현 우선순위

### Phase 1 — MVP 연결 필수

1. Auth: login/logout/refresh/oauth
2. Feed: list/detail/apply/cancel/bookmark
3. Spot: list/map/search/detail/create + schedule/vote/checklist/files/notes/reviews
4. Chat: room list/detail/messages/SSE
5. Me: profile/persona/participations/favorites/recent views
6. Pay: balance/history/charge/bank/withdraw

### Phase 2 — 운영/고도화

1. Notification 목록/읽음 처리
2. Admin posts/notice/curation
3. Supporter verification workflow
4. Settlement approval workflow
5. Simulation/locality real backend 연결

---

## 5. 백엔드와 확정해야 할 결정사항

- `page`를 0-base로 할지 1-base로 할지: 이 문서는 1-base 권장
- token 저장 방식: Authorization header + refresh cookie 조합 권장
- Feed와 Spot의 관계: `feed_items` read model vs `spots` projection 중 선택
- `RENT` 타입을 Spot에도 포함할지, Feed-only 타입으로 둘지 결정 필요
- 파일 업로드: presigned URL 방식 vs multipart 직접 업로드 방식 결정 필요
- 실시간 채팅: SSE 우선, 추후 WebSocket 전환 가능
- 시뮬레이션/지역 데이터는 MVP에서는 read-only API로 시작 권장

---

## 6. 최소 OpenAPI 골격

```yaml
openapi: 3.0.3
info:
  title: SPOT API
  version: 0.1.0
servers:
  - url: /api/v1
security:
  - bearerAuth: []
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    ErrorResponse:
      type: object
      required: [message]
      properties:
        message: { type: string }
        code: { type: string }
        details: { type: object }
paths:
  /auth/login:
    post:
      summary: 이메일 로그인
  /me:
    get:
      summary: 내 프로필 조회
    patch:
      summary: 내 프로필 수정
  /feeds:
    get:
      summary: 피드 목록
  /spots:
    get:
      summary: 스팟 목록
    post:
      summary: 스팟 작성
  /chat/rooms:
    get:
      summary: 채팅방 목록
    post:
      summary: 채팅방 생성 또는 반환
  /pay/balance:
    get:
      summary: 포인트 잔액
```
