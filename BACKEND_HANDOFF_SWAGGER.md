# Backend Handoff (Swagger style)

This document is the API contract the frontend expects.

Auth is exposed via the frontend BFF routes under `/api/auth/*`.
Other domains use the API base URL configured by `NEXT_PUBLIC_API_BASE_URL`.

## Shared conventions

### Base URL

- Public API (non-auth): `${NEXT_PUBLIC_API_BASE_URL}/` (see `src/shared/api/client.ts`)
- Frontend BFF (auth only): `/api/auth/*` (Next.js route handlers in `src/app/api/auth/*`)

### Auth

- For non-BFF requests, the client sends `Authorization: Bearer <accessToken>` when an access token is available.
- BFF login sets an HTTP-only cookie: `spot-auth-token` (stores `accessToken`).
- BFF logout clears `spot-auth-token`.
- When `accessToken` expires, call `POST /api/auth/refresh` with the `refreshToken` to obtain a new `accessToken`.

### Content types

- JSON requests use `Content-Type: application/json`.
- File upload uses `multipart/form-data`.

### Success envelope

Most wired endpoints return an envelope.

Schema: `ApiResponse<T>`

- `data`: `T`
- `meta?`: pagination metadata

Schema: `PagedResponse<T>` is `ApiResponse<T[]>`.

### Error shape

The shared API client normalizes error bodies to:

Schema: `ApiErrorBody`

- `code`: `string`
- `message`: `string`
- `status`: `number`

Note: BFF auth endpoints may return `{ "message": string }` on error.

### Pagination

- `page?: number`
- `size?: number`
- success `meta` may include `total?: number` and `hasNext?: boolean`

### Dates

- All date-time strings are ISO 8601 strings (`string`).

---

## Auth (Frontend BFF)

### POST /api/auth/login

- Purpose: Sign in with email/password. Persists auth token in HTTP-only cookie and returns token + user id for client state.
- Auth: Public
- Path params: none
- Query params: none
- Request body: `LoginRequest`
- Response body (200): `LoginResult`
- Errors: 400 `{ message: string }`, 5xx `{ message: string }`
- Referenced schemas: `LoginRequest`, `LoginResult`

Upstream detail (not the public contract): this route proxies to `${NEXT_PUBLIC_API_BASE_URL}/${AUTH_LOGIN_PATH || "auth/login"}`.

**Request**

```json
{
    "email": "user@example.com",
    "password": "secret1234",
    "next": "/feed"
}
```

**Response 200**

```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
    "userId": "user-abc123",
    "redirectTo": "/feed"
}
```

**Response 400**

```json
{ "message": "이메일 또는 비밀번호가 올바르지 않습니다." }
```

---

### POST /api/auth/login/dummy

- Purpose: Dummy login for development flows.
- Auth: Public
- Path params: none
- Query params: none
- Request body: `{ next?: string }`
- Response body (200): `LoginResult`
- Referenced schemas: `LoginResult`

**Request**

```json
{ "next": "/feed" }
```

**Response 200**

```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.dummy...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g.dummy...",
    "userId": "user-dev-001",
    "redirectTo": "/feed"
}
```

---

### POST /api/auth/refresh

- Purpose: Renew access token using a valid refresh token.
- Auth: Public
- Path params: none
- Query params: none
- Request body: `RefreshTokenRequest`
- Response body (200): `TokenRefreshResult`
- Errors: 400 `{ message: string }`, 401 `{ message: string }`
- Referenced schemas: `RefreshTokenRequest`, `TokenRefreshResult`

**Request**

```json
{ "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g..." }
```

**Response 200**

```json
{ "accessToken": "eyJhbGciOiJIUzI1NiJ9.new..." }
```

**Response 401**

```json
{ "message": "Refresh token expired or invalid." }
```

---

### POST /api/auth/logout

- Purpose: Sign out by clearing the auth cookie.
- Auth: Public
- Path params: none
- Query params: none
- Request body: none
- Response body (200): `LogoutResult`
- Referenced schemas: `LogoutResult`

**Response 200**

```json
{ "ok": true }
```

---

### GET /api/auth/oauth/{provider}/start

- Purpose: Start OAuth login via redirect.
- Auth: Public
- Path params:
    - `provider`: `OAuthProvider` (enum)
- Query params:
    - `next?`: `string` (path to redirect to after login, sanitized)
- Request body: none
- Response body: 302 redirect to upstream auth server
- Referenced schemas: `OAuthProvider`

Upstream detail (not the public contract): redirects to `${NEXT_PUBLIC_API_BASE_URL}/${AUTH_OAUTH_*_START_PATH}`.

---

## Shared

Common endpoints used across multiple domains.

### POST /uploads

- Purpose: Upload a single file (post images, profile media, etc.).
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `UploadFileRequest` (multipart/form-data)
- Response body (200): `UploadFileResponse`
- Referenced schemas: `UploadFileRequest`, `UploadFileResponse`

**Request** (`multipart/form-data`)

```
file: <binary>
```

**Response 200**

```json
{ "url": "https://cdn.example.com/uploads/image-abc123.jpg" }
```

---

### POST /uploads/batch

- Purpose: Upload multiple files at once.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `BatchUploadRequest` (multipart/form-data)
- Response body (200): `BatchUploadResponse`
- Referenced schemas: `BatchUploadRequest`, `BatchUploadResponse`

**Request** (`multipart/form-data`)

```
files[]: <binary>
files[]: <binary>
```

**Response 200**

```json
{
    "urls": [
        "https://cdn.example.com/uploads/image-001.jpg",
        "https://cdn.example.com/uploads/image-002.jpg"
    ]
}
```

---

## Spot

Frontend loading note: On SpotDetail page entry, `GET /spots/{spotId}/votes`, `/checklist`, `/files`, and `/notes` are fetched in parallel (`Promise.all`). Each section handles its own loading/skeleton state independently. The `GET /spots/{spotId}` response intentionally excludes these sub-resources.

Wired via `src/features/spot/api/spot-api.ts`.

### GET /spots

- Purpose: List spots.
- Auth: Optional (Bearer if available)
- Path params: none
- Query params: `SpotListParams`
    - `type?`: `SpotType`
    - `status?`: `SpotStatus | SpotStatus[]`
    - `participating?`: `boolean`
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `PagedResponse<Spot>`
- Referenced schemas: `Spot`, `SpotType`, `SpotStatus`, `PagedResponse`, `ApiResponseMeta`

**Response 200**

```json
{
    "data": [
        {
            "id": "spot-001",
            "type": "OFFER",
            "status": "OPEN",
            "title": "홈카페 클래스 — 핸드드립부터 라떼아트까지",
            "description": "원두 샘플 증정, 초보 환영",
            "pointCost": 25000,
            "authorId": "user-healthy",
            "authorNickname": "건강한삶",
            "createdAt": "2026-04-01T09:00:00Z",
            "updatedAt": "2026-04-05T12:00:00Z"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 38, "hasNext": true }
}
```

---

### GET /spots/{spotId}

- Purpose: Get spot detail. Sub-resources (votes, checklist, files, notes) are NOT included — fetch separately in parallel.
- Auth: Optional (Bearer if available)
- Path params:
    - `spotId`: `string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<SpotDetail>`
- Referenced schemas: `SpotDetail`, `TimelineEvent`

**Response 200**

```json
{
    "data": {
        "id": "spot-001",
        "type": "OFFER",
        "status": "MATCHED",
        "title": "홈카페 클래스 — 핸드드립부터 라떼아트까지",
        "description": "원두 샘플 증정, 초보 환영",
        "pointCost": 25000,
        "authorId": "user-healthy",
        "authorNickname": "건강한삶",
        "createdAt": "2026-04-01T09:00:00Z",
        "updatedAt": "2026-04-06T08:00:00Z",
        "timeline": [
            {
                "id": "tl-001",
                "kind": "CREATED",
                "actorId": "user-healthy",
                "actorNickname": "건강한삶",
                "createdAt": "2026-04-01T09:00:00Z"
            },
            {
                "id": "tl-002",
                "kind": "MATCHED",
                "actorId": "user-healthy",
                "actorNickname": "건강한삶",
                "content": "파트너 매칭이 완료되었습니다.",
                "createdAt": "2026-04-06T08:00:00Z"
            }
        ]
    }
}
```

---

### POST /spots

- Purpose: Create a new spot.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `CreateSpotRequest`
- Response body (200): `ApiResponse<Spot>`
- Referenced schemas: `Spot`, `SpotType`

**Request**

```json
{
    "type": "OFFER",
    "title": "홈카페 클래스 — 핸드드립부터 라떼아트까지",
    "description": "원두 샘플 증정, 초보 환영",
    "pointCost": 25000
}
```

**Response 200**

```json
{
    "data": {
        "id": "spot-002",
        "type": "OFFER",
        "status": "OPEN",
        "title": "홈카페 클래스 — 핸드드립부터 라떼아트까지",
        "description": "원두 샘플 증정, 초보 환영",
        "pointCost": 25000,
        "authorId": "user-healthy",
        "authorNickname": "건강한삶",
        "createdAt": "2026-04-08T10:00:00Z",
        "updatedAt": "2026-04-08T10:00:00Z"
    }
}
```

---

### POST /spots/{spotId}/match

- Purpose: Match the spot.
- Auth: Required (Bearer)
- Path params: `spotId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<Spot>`
- Referenced schemas: `Spot`

**Response 200**

```json
{
    "data": {
        "id": "spot-001",
        "type": "OFFER",
        "status": "MATCHED",
        "title": "홈카페 클래스",
        "description": "원두 샘플 증정",
        "pointCost": 25000,
        "authorId": "user-healthy",
        "authorNickname": "건강한삶",
        "createdAt": "2026-04-01T09:00:00Z",
        "updatedAt": "2026-04-08T11:00:00Z"
    }
}
```

---

### POST /spots/{spotId}/cancel

- Purpose: Cancel the spot.
- Auth: Required (Bearer)
- Path params: `spotId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<Spot>`
- Referenced schemas: `Spot`

**Response 200**: same shape as match, `status: "CANCELLED"`

---

### POST /spots/{spotId}/complete

- Purpose: Mark the spot as completed.
- Auth: Required (Bearer)
- Path params: `spotId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<Spot>`
- Referenced schemas: `Spot`

**Response 200**: same shape as match, `status: "CLOSED"`

---

### GET /spots/{spotId}/participants

- Purpose: List participants.
- Auth: Optional (Bearer if available)
- Path params: `spotId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<SpotParticipant[]>`
- Referenced schemas: `SpotParticipant`

**Response 200**

```json
{
    "data": [
        {
            "userId": "user-healthy",
            "nickname": "건강한삶",
            "role": "AUTHOR",
            "joinedAt": "2026-04-01T09:00:00Z"
        },
        {
            "userId": "user-partner-01",
            "nickname": "커피향기",
            "role": "PARTICIPANT",
            "joinedAt": "2026-04-03T14:30:00Z"
        }
    ]
}
```

---

### GET /spots/{spotId}/schedule

- Purpose: Get schedule negotiation state.
- Auth: Optional (Bearer if available)
- Path params: `spotId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<SpotSchedule | null>`
- Referenced schemas: `SpotSchedule`, `ScheduleSlot`

**Response 200**

```json
{
    "data": {
        "spotId": "spot-001",
        "proposedSlots": [
            {
                "date": "2026-04-12",
                "hour": 10,
                "availableUserIds": ["user-healthy", "user-partner-01"]
            },
            {
                "date": "2026-04-13",
                "hour": 14,
                "availableUserIds": ["user-healthy"]
            }
        ],
        "confirmedSlot": {
            "date": "2026-04-12",
            "hour": 10,
            "availableUserIds": ["user-healthy", "user-partner-01"]
        }
    }
}
```

---

### PUT /spots/{spotId}/schedule

- Purpose: Upsert proposed schedule slots.
- Auth: Required (Bearer)
- Path params: `spotId: string`
- Query params: none
- Request body: `UpsertSpotScheduleRequest`
- Response body (200): `ApiResponse<SpotSchedule>`
- Referenced schemas: `SpotSchedule`, `ScheduleSlot`

**Request**

```json
{
    "slots": [
        {
            "date": "2026-04-12",
            "hour": 10,
            "availableUserIds": ["user-healthy"]
        },
        {
            "date": "2026-04-13",
            "hour": 14,
            "availableUserIds": ["user-healthy"]
        }
    ]
}
```

---

### GET /spots/{spotId}/votes

- Purpose: List votes in a spot.
- Auth: Optional (Bearer if available)
- Path params: `spotId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<SpotVote[]>`
- Referenced schemas: `SpotVote`, `VoteOption`

**Response 200**

```json
{
    "data": [
        {
            "id": "vote-001",
            "spotId": "spot-001",
            "question": "모임 장소 어디가 좋을까요?",
            "options": [
                {
                    "id": "opt-01",
                    "label": "홍대 카페",
                    "voterIds": ["user-healthy", "user-partner-01"]
                },
                { "id": "opt-02", "label": "강남 스터디룸", "voterIds": [] }
            ],
            "multiSelect": false,
            "closedAt": null
        }
    ]
}
```

---

### POST /spots/{spotId}/votes

- Purpose: Create a new vote.
- Auth: Required (Bearer)
- Path params: `spotId: string`
- Query params: none
- Request body: `CreateSpotVoteRequest`
- Response body (200): `ApiResponse<SpotVote>`
- Referenced schemas: `SpotVote`, `VoteOption`

**Request**

```json
{
    "question": "모임 장소 어디가 좋을까요?",
    "options": ["홍대 카페", "강남 스터디룸"],
    "multiSelect": false
}
```

---

### POST /spots/{spotId}/votes/{voteId}/cast

- Purpose: Cast vote.
- Auth: Required (Bearer)
- Path params:
    - `spotId`: `string`
    - `voteId`: `string`
- Query params: none
- Request body: `CastSpotVoteRequest`
- Response body (200): `ApiResponse<SpotVote>`
- Referenced schemas: `SpotVote`

**Request**

```json
{ "optionIds": ["opt-01"] }
```

---

### GET /spots/{spotId}/checklist

- Purpose: Get checklist.
- Auth: Optional (Bearer if available)
- Path params: `spotId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<SpotChecklist | null>`
- Referenced schemas: `SpotChecklist`, `ChecklistItem`

**Response 200**

```json
{
    "data": {
        "spotId": "spot-001",
        "items": [
            {
                "id": "item-01",
                "text": "원두 준비하기",
                "completed": true,
                "assigneeId": "user-healthy",
                "assigneeNickname": "건강한삶"
            },
            { "id": "item-02", "text": "드리퍼 챙기기", "completed": false }
        ]
    }
}
```

---

### PUT /spots/{spotId}/checklist

- Purpose: Upsert checklist items.
- Auth: Required (Bearer)
- Path params: `spotId: string`
- Query params: none
- Request body: `UpsertSpotChecklistRequest`
- Response body (200): `ApiResponse<SpotChecklist>`
- Referenced schemas: `SpotChecklist`, `ChecklistItem`

**Request**

```json
{
    "items": [
        {
            "id": "item-01",
            "text": "원두 준비하기",
            "completed": true,
            "assigneeId": "user-healthy",
            "assigneeNickname": "건강한삶"
        },
        { "id": "item-02", "text": "드리퍼 챙기기", "completed": false }
    ]
}
```

---

### GET /spots/{spotId}/files

- Purpose: List shared files.
- Auth: Optional (Bearer if available)
- Path params: `spotId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<SharedFile[]>`
- Referenced schemas: `SharedFile`

**Response 200**

```json
{
    "data": [
        {
            "id": "file-001",
            "spotId": "spot-001",
            "uploaderNickname": "건강한삶",
            "name": "커피레시피.pdf",
            "url": "https://cdn.example.com/files/recipe.pdf",
            "sizeBytes": 204800,
            "uploadedAt": "2026-04-05T10:00:00Z"
        }
    ]
}
```

---

### POST /spots/{spotId}/files

- Purpose: Upload shared files. Delegates to `POST /uploads/batch` for the actual upload, then associates returned URLs with the spot.
- Auth: Required (Bearer)
- Path params: `spotId: string`
- Query params: none
- Request body: `UploadSpotFilesRequest` (multipart)
- Response body (200): `ApiResponse<SharedFile[]>`
- Referenced schemas: `SharedFile`, `BatchUploadRequest`, `BatchUploadResponse`

Current repo status: UI contract only. `src/features/spot/api/spot-api.ts` currently implements only file list and delete.

**Request** (`multipart/form-data`)

```
files[]: <binary>
```

---

### DELETE /spots/{spotId}/files/{fileId}

- Purpose: Delete a shared file.
- Auth: Required (Bearer)
- Path params:
    - `spotId`: `string`
    - `fileId`: `string`
- Query params: none
- Request body: none
- Response body (204): empty
- Referenced schemas: none

---

### GET /spots/{spotId}/notes

- Purpose: List progress notes.
- Auth: Optional (Bearer if available)
- Path params: `spotId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<ProgressNote[]>`
- Referenced schemas: `ProgressNote`

**Response 200**

```json
{
    "data": [
        {
            "id": "note-001",
            "spotId": "spot-001",
            "authorNickname": "건강한삶",
            "content": "오늘 원두 시음 완료. 에티오피아 게이샤 강추!",
            "createdAt": "2026-04-07T15:00:00Z"
        }
    ]
}
```

---

### POST /spots/{spotId}/notes

- Purpose: Create progress note.
- Auth: Required (Bearer)
- Path params: `spotId: string`
- Query params: none
- Request body: `CreateSpotNoteRequest`
- Response body (200): `ApiResponse<ProgressNote>`
- Referenced schemas: `ProgressNote`

**Request**

```json
{ "content": "오늘 원두 시음 완료. 에티오피아 게이샤 강추!" }
```

---

### GET /spots/{spotId}/reviews

- Purpose: List reviews.
- Auth: Optional (Bearer if available)
- Path params: `spotId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<SpotReview[]>`
- Referenced schemas: `SpotReview`

**Response 200**

```json
{
    "data": [
        {
            "id": "review-001",
            "spotId": "spot-001",
            "reviewerNickname": "커피향기",
            "targetNickname": "건강한삶",
            "rating": 5,
            "comment": "정말 유익한 시간이었어요. 강추!",
            "createdAt": "2026-04-08T18:00:00Z"
        }
    ]
}
```

---

### POST /spots/{spotId}/reviews

- Purpose: Submit a review.
- Auth: Required (Bearer)
- Path params: `spotId: string`
- Query params: none
- Request body: `CreateSpotReviewRequest`
- Response body (200): `ApiResponse<SpotReview>`
- Referenced schemas: `SpotReview`

**Request**

```json
{
    "targetNickname": "건강한삶",
    "rating": 5,
    "comment": "정말 유익한 시간이었어요. 강추!"
}
```

---

## My and User

Wired via `src/features/my/api/my-api.ts`.

### GET /users/me

- Purpose: Get my profile.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<UserProfile>`
- Referenced schemas: `UserProfile`

**Response 200**

```json
{
    "data": {
        "id": "user-abc123",
        "nickname": "건강한삶",
        "email": "user@example.com",
        "phone": "010-1234-5678",
        "avatarUrl": "https://cdn.example.com/avatars/user-abc123.jpg",
        "pointBalance": 42000,
        "joinedAt": "2025-11-01T09:00:00Z"
    }
}
```

---

### PATCH /users/me

- Purpose: Update my profile fields.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `UpdateMyProfileRequest`
- Response body (200): `ApiResponse<UserProfile>`
- Referenced schemas: `UserProfile`

**Request**

```json
{
    "nickname": "새닉네임",
    "avatarUrl": "https://cdn.example.com/avatars/new.jpg",
    "phone": "010-9999-8888"
}
```

---

### PATCH /users/me/password

- Purpose: Change password.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `PasswordChangePayload`
- Response body (204): empty
- Referenced schemas: `PasswordChangePayload`

**Request**

```json
{
    "currentPassword": "oldSecret123",
    "newPassword": "newSecret456",
    "confirmPassword": "newSecret456"
}
```

---

### GET /users/me/notification-settings

- Purpose: Get my notification settings.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<NotificationSettings>`
- Referenced schemas: `NotificationSettings`

**Response 200**

```json
{
    "data": {
        "serviceNoticeEnabled": true,
        "activityEnabled": true,
        "pushEnabled": false,
        "emailEnabled": true,
        "updatedAt": "2026-03-15T10:00:00Z"
    }
}
```

---

### PUT /users/me/notification-settings

- Purpose: Update my notification settings.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `UpdateNotificationSettingsRequest`
- Response body (200): `ApiResponse<NotificationSettings>`
- Referenced schemas: `NotificationSettings`

**Request**

```json
{
    "serviceNoticeEnabled": true,
    "activityEnabled": false,
    "pushEnabled": true,
    "emailEnabled": true
}
```

---

### GET /users/me/supporter-registration

- Purpose: Get supporter verification registration.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<SupporterRegistration>`
- Referenced schemas: `SupporterRegistration`

**Response 200**

```json
{
    "data": {
        "field": "요리",
        "mediaUrls": ["https://cdn.example.com/media/cert-001.jpg"],
        "career": "홈베이킹 강사 3년",
        "bio": "건강한 식재료로 맛있는 요리를 만들어요.",
        "verificationStatus": "VERIFIED",
        "verificationNotes": "서류 확인 완료",
        "extraNotes": "",
        "updatedAt": "2026-02-10T12:00:00Z"
    }
}
```

---

### PUT /users/me/supporter-registration

- Purpose: Update supporter registration.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `UpdateSupporterRegistrationRequest`
- Response body (200): `ApiResponse<SupporterRegistration>`
- Referenced schemas: `SupporterRegistration`

**Request**

```json
{
    "field": "요리",
    "mediaUrls": ["https://cdn.example.com/media/cert-002.jpg"],
    "career": "홈베이킹 강사 4년",
    "bio": "건강한 식재료로 맛있는 요리를 만들어요."
}
```

---

### GET /users/me/supporter-profile

- Purpose: Get my supporter profile.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<SupporterProfile>`
- Referenced schemas: `SupporterProfile`

**Response 200**

```json
{
    "data": {
        "id": "user-abc123",
        "profileType": "SUPPORTER",
        "nickname": "건강한삶",
        "avatarUrl": "https://cdn.example.com/avatars/user-abc123.jpg",
        "field": "요리",
        "mediaUrls": ["https://cdn.example.com/media/work-001.jpg"],
        "career": "홈베이킹 강사 4년",
        "bio": "건강한 식재료로 맛있는 요리를 만들어요.",
        "avgRating": 4.8,
        "reviewCount": 23,
        "reviews": [
            {
                "id": "review-001",
                "reviewerNickname": "커피향기",
                "rating": 5,
                "comment": "정말 유익한 시간이었어요!",
                "spotTitle": "홈카페 클래스",
                "createdAt": "2026-04-08T18:00:00Z"
            }
        ],
        "history": [
            {
                "spotId": "spot-001",
                "spotTitle": "홈카페 클래스",
                "spotType": "OFFER",
                "completedAt": "2026-04-08T17:00:00Z",
                "reviewCount": 5,
                "avgRating": 4.8
            }
        ]
    }
}
```

---

### PUT /users/me/supporter-profile

- Purpose: Update my supporter profile.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `UpdateSupporterProfileRequest`
- Response body (200): `ApiResponse<SupporterProfile>`
- Referenced schemas: `SupporterProfile`

**Request**

```json
{
    "field": "요리",
    "mediaUrls": ["https://cdn.example.com/media/work-002.jpg"],
    "career": "홈베이킹 강사 4년, 쿠킹클래스 운영",
    "bio": "건강하고 맛있는 요리를 함께 만들어요."
}
```

---

### GET /users/me/spots

- Purpose: List spots related to the current user for the My Spot dashboard card list.
- Auth: Required (Bearer)
- Path params: none
- Query params:
    - `role?`: `ParticipantRole` (`AUTHOR` or `PARTICIPANT`; omit to return both)
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `PagedResponse<MySpot>`
- Referenced schemas: `MySpot`, `PagedResponse`, `SpotType`, `SpotStatus`, `ParticipantRole`

Semantics:

- `role=AUTHOR`: only spots authored by the authenticated user. In each item, `authorId` is the authenticated user's id and `joinedAt` is omitted.
- `role=PARTICIPANT`: only spots joined by the authenticated user but authored by another user. In each item, `joinedAt` is present.
- This endpoint is a spot-card list for the My Spot dashboard. `GET /users/me/participations` remains a lighter participation/activity summary list.

**Response 200**

```json
{
    "data": [
        {
            "id": "spot-001",
            "type": "OFFER",
            "status": "MATCHED",
            "title": "홈카페 클래스",
            "description": "원두 샘플 증정, 초보 환영",
            "pointCost": 25000,
            "authorId": "user-abc123",
            "authorNickname": "건강한삶",
            "role": "AUTHOR",
            "createdAt": "2026-04-01T09:00:00Z",
            "updatedAt": "2026-04-06T08:00:00Z"
        },
        {
            "id": "spot-002",
            "type": "REQUEST",
            "status": "OPEN",
            "title": "필라테스 소모임",
            "description": "초보 환영. 코어·자세교정 위주.",
            "pointCost": 15000,
            "authorId": "user-other-01",
            "authorNickname": "위스키러버",
            "role": "PARTICIPANT",
            "joinedAt": "2026-04-05T09:30:00Z",
            "createdAt": "2026-04-04T10:00:00Z",
            "updatedAt": "2026-04-05T09:30:00Z"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 2, "hasNext": false }
}
```

---

### GET /users/me/participations

- Purpose: List my spot participation/activity summaries.
- Auth: Required (Bearer)
- Path params: none
- Query params:
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `PagedResponse<Participation>`
- Referenced schemas: `Participation`, `PagedResponse`, `SpotType`, `SpotStatus`

Semantics:

- This endpoint remains a compact participation/history list.
- It may include both spots I authored and spots I joined, represented as `role=AUTHOR | PARTICIPANT`.
- Use `GET /users/me/spots` when the client needs full My Spot dashboard card data.

**Response 200**

```json
{
    "data": [
        {
            "spotId": "spot-001",
            "spotTitle": "홈카페 클래스",
            "spotType": "OFFER",
            "role": "PARTICIPANT",
            "status": "CLOSED",
            "joinedAt": "2026-04-03T14:30:00Z"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 5, "hasNext": false }
}
```

---

### GET /users/me/favorites

- Purpose: List my favorites.
- Auth: Required (Bearer)
- Path params: none
- Query params:
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `PagedResponse<MyFavoriteItem>`
- Referenced schemas: `MyFavoriteItem`, `SpotType`, `SpotStatus`

**Response 200**

```json
{
    "data": [
        {
            "id": "fav-001",
            "targetId": "spot-002",
            "title": "필라테스 소모임",
            "description": "초보 환영. 코어·자세교정 위주.",
            "type": "OFFER",
            "savedAt": "2026-04-05T09:00:00Z",
            "pointCost": 15000,
            "authorNickname": "위스키러버",
            "status": "OPEN"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 3, "hasNext": false }
}
```

---

### DELETE /users/me/favorites/{favoriteId}

- Purpose: Remove a favorite.
- Auth: Required (Bearer)
- Path params:
    - `favoriteId`: `string`
- Query params: none
- Request body: none
- Response body (204): empty
- Referenced schemas: none

---

### GET /users/me/recent-views

- Purpose: List my recently viewed items.
- Auth: Required (Bearer)
- Path params: none
- Query params:
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `PagedResponse<MyRecentViewItem>`
- Referenced schemas: `MyRecentViewItem`, `SpotType`, `SpotStatus`

**Response 200**

```json
{
    "data": [
        {
            "id": "rv-001",
            "targetId": "spot-001",
            "title": "홈카페 클래스",
            "description": "원두 샘플 증정, 초보 환영",
            "type": "OFFER",
            "viewedAt": "2026-04-08T11:30:00Z",
            "pointCost": 25000,
            "authorNickname": "건강한삶",
            "status": "MATCHED"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 12, "hasNext": false }
}
```

---

### DELETE /users/me/recent-views/{recentViewId}

- Purpose: Remove a single recent view.
- Auth: Required (Bearer)
- Path params:
    - `recentViewId`: `string`
- Query params: none
- Request body: none
- Response body (204): empty
- Referenced schemas: none

---

### DELETE /users/me/recent-views

- Purpose: Clear all recent views.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: none
- Response body (204): empty
- Referenced schemas: none

---

### GET /users/me/support-activity-summary

- Purpose: Get summary stats for support activity.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<MySupportActivitySummary>`
- Referenced schemas: `MySupportActivitySummary`, `ProfileReview`

**Response 200**

```json
{
    "data": {
        "avgRating": 4.8,
        "reviewCount": 23,
        "completedCount": 18,
        "latestReview": {
            "id": "review-001",
            "reviewerNickname": "커피향기",
            "rating": 5,
            "comment": "정말 유익한 시간이었어요!",
            "spotTitle": "홈카페 클래스",
            "createdAt": "2026-04-08T18:00:00Z"
        }
    }
}
```

---

### GET /users/{userId}/profile

- Purpose: Get a user profile (supporter or partner).
- Auth: Optional (Bearer if available)
- Path params:
    - `userId`: `string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<SupporterProfile | PartnerProfile>`
- Referenced schemas: `SupporterProfile`, `PartnerProfile`

Current repo status: UI contract only. The public user profile route is currently mock-backed.

**Response 200 — SUPPORTER**

```json
{
    "data": {
        "id": "user-abc123",
        "profileType": "SUPPORTER",
        "nickname": "건강한삶",
        "avatarUrl": "https://cdn.example.com/avatars/user-abc123.jpg",
        "field": "요리",
        "mediaUrls": ["https://cdn.example.com/media/work-001.jpg"],
        "career": "홈베이킹 강사 4년",
        "bio": "건강하고 맛있는 요리를 함께 만들어요.",
        "avgRating": 4.8,
        "reviewCount": 23,
        "reviews": [],
        "history": []
    }
}
```

**Response 200 — PARTNER**

```json
{
    "data": {
        "id": "user-xyz789",
        "profileType": "PARTNER",
        "nickname": "맑은하늘123",
        "avatarUrl": "https://cdn.example.com/avatars/user-xyz789.jpg",
        "interestCategories": ["요리", "운동"],
        "isFriend": false
    }
}
```

### POST /users/{userId}/follow

- Purpose: Follow a user (add as friend).
- Auth: Required (Bearer)
- Path params: `userId: string`
- Query params: none
- Request body: none
- Response body: empty (204)
- Referenced schemas: none

---

### DELETE /users/{userId}/follow

- Purpose: Unfollow a user (remove from friends).
- Auth: Required (Bearer)
- Path params: `userId: string`
- Query params: none
- Request body: none
- Response body: empty (204)
- Referenced schemas: none

---

### GET /users/me/feed-applications

- Purpose: Get the authenticated user's feed application history.
- Auth: Required (Bearer)
- Path params: none
- Query params:
    - `status?`: `FeedApplicationStatus`
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `PagedResponse<FeedApplication>`
- Referenced schemas: `FeedApplication`, `FeedApplicationStatus`

**Response 200**

```json
{
    "data": [
        {
            "id": "apply-001",
            "feedId": "feed-001",
            "userId": "user-me",
            "proposal": "저는 공예 경험이 5년 있습니다.",
            "status": "ACCEPTED",
            "createdAt": "2026-04-11T10:00:00Z"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 3, "hasNext": false }
}
```

---

## Pay

Wired via `src/features/pay/api/pay-api.ts`.

### GET /points/balance

- Purpose: Get point balance.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<PointBalance>`
- Referenced schemas: `PointBalance`

**Response 200**

```json
{
    "data": {
        "balance": 42000,
        "updatedAt": "2026-04-08T10:00:00Z"
    }
}
```

---

### GET /points/account

- Purpose: Get linked bank account.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<LinkedBankAccount | null>`
- Referenced schemas: `LinkedBankAccount`

**Response 200**

```json
{
    "data": {
        "bankName": "카카오뱅크",
        "accountNumber": "3333-01-1234567",
        "accountHolder": "홍길동",
        "updatedAt": "2026-03-01T09:00:00Z"
    }
}
```

**Response 200 (미등록)**

```json
{ "data": null }
```

---

### PUT /points/account

- Purpose: Link or update bank account.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `LinkBankAccountRequest`
- Response body (200): `ApiResponse<LinkedBankAccount>`
- Referenced schemas: `LinkedBankAccount`

**Request**

```json
{
    "bankName": "카카오뱅크",
    "accountNumber": "3333-01-1234567",
    "accountHolder": "홍길동"
}
```

---

### GET /points/withdrawals

- Purpose: List point withdrawals.
- Auth: Required (Bearer)
- Path params: none
- Query params:
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `ApiResponse<PointWithdrawal[]>`
- Referenced schemas: `PointWithdrawal`

**Response 200**

```json
{
    "data": [
        {
            "id": "wd-001",
            "amount": 20000,
            "status": "COMPLETED",
            "requestedAt": "2026-04-01T10:00:00Z"
        },
        {
            "id": "wd-002",
            "amount": 10000,
            "status": "PENDING",
            "requestedAt": "2026-04-08T09:00:00Z"
        }
    ]
}
```

---

### GET /points/history

- Purpose: List point transaction history.
- Auth: Required (Bearer)
- Path params: none
- Query params:
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `PagedResponse<PointTransaction>`
- Referenced schemas: `PointTransaction`, `PagedResponse`

**Response 200**

```json
{
    "data": [
        {
            "id": "tx-001",
            "type": "USE",
            "amount": -25000,
            "balanceAfter": 42000,
            "description": "홈카페 클래스 참여",
            "createdAt": "2026-04-03T14:30:00Z"
        },
        {
            "id": "tx-002",
            "type": "CHARGE",
            "amount": 50000,
            "balanceAfter": 67000,
            "description": "포인트 충전",
            "createdAt": "2026-04-01T10:00:00Z"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 15, "hasNext": false }
}
```

---

### POST /points/charge

- Purpose: Charge points.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `ChargePointsRequest`
- Response body (200): `ApiResponse<PointBalance>`
- Referenced schemas: `PointBalance`

**Request**

```json
{ "amount": 50000 }
```

**Response 200**

```json
{
    "data": {
        "balance": 92000,
        "updatedAt": "2026-04-09T10:00:00Z"
    }
}
```

---

### POST /points/withdraw

- Purpose: Withdraw points.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `WithdrawPointsRequest`
- Response body (200): `ApiResponse<PointBalance>`
- Referenced schemas: `PointBalance`

**Request**

```json
{ "amount": 20000 }
```

**Response 200**

```json
{
    "data": {
        "balance": 22000,
        "updatedAt": "2026-04-09T11:00:00Z"
    }
}
```

---

## Feed (UI contract)

Not currently wired in this repo, but the UI expects these endpoints and payloads.

### GET /feeds

- Purpose: List feed items.
- Auth: Optional (Bearer)
- Path params: none
- Query params: `FeedListQuery`
    - `type?`: `FeedItemType`
    - `status?`: `FeedItemStatus`
    - `category?`: `FeedCategory`
    - `tab?`: `FeedTabType`
    - `sort?`: `string`
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `PagedResponse<FeedItem>`
- Referenced schemas: `FeedItem`, `FeedAuthorProfile`, `FeedParticipantProfile`, `FeedTabType`, `FeedItemType`, `FeedItemStatus`, `FeedCategory`

**Response 200**

```json
{
    "data": [
        {
            "id": "feed-001",
            "title": "이케아 라탄 2인 소파 공동구매 같이 하실 분 모집합니다",
            "description": "주문 수량 맞추면 정가 대비 30% 할인. 수령 장소는 강남구 역삼동 기준.",
            "location": "강남구 역삼동",
            "authorNickname": "초록잎사귀",
            "authorProfile": {
                "id": "user-chorok",
                "nickname": "초록잎사귀",
                "avatarUrl": "https://cdn.example.com/avatars/chorok.jpg",
                "role": "SUPPORTER",
                "rating": 4.7,
                "field": "공예"
            },
            "price": 150000,
            "type": "OFFER",
            "status": "OPEN",
            "progressPercent": 56,
            "imageUrl": "https://cdn.example.com/feed/feed-001.jpg",
            "views": 142,
            "likes": 38,
            "partnerCount": 3,
            "applicantCount": 7,
            "maxParticipants": 5,
            "confirmedPartnerProfiles": [
                {
                    "id": "p-a1",
                    "nickname": "햇살가득",
                    "avatarUrl": "https://cdn.example.com/avatars/p-a1.jpg"
                },
                {
                    "id": "p-a2",
                    "nickname": "달빛산책",
                    "avatarUrl": "https://cdn.example.com/avatars/p-a2.jpg"
                },
                {
                    "id": "p-a3",
                    "nickname": "봄바람",
                    "avatarUrl": "https://cdn.example.com/avatars/p-a3.jpg"
                }
            ],
            "category": "공예",
            "deadline": "2026-04-10",
            "isBookmarked": true
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 84, "hasNext": true }
}
```

---

### GET /feeds/{feedId}

- Purpose: Fetch feed detail.
- Auth: Optional (Bearer)
- Path params: `feedId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<FeedItem>`
- Referenced schemas: `FeedItem`, `FeedAuthorProfile`

**Response 200**

```json
{
    "data": {
        "id": "feed-001",
        "title": "이케아 라탄 2인 소파 공동구매 같이 하실 분 모집합니다",
        "description": "주문 수량 맞추면 정가 대비 30% 할인. 수령 장소는 강남구 역삼동 기준.",
        "location": "강남구 역삼동",
        "authorNickname": "초록잎사귀",
        "authorProfile": {
            "id": "user-chorok",
            "nickname": "초록잎사귀",
            "avatarUrl": "https://cdn.example.com/avatars/chorok.jpg",
            "role": "SUPPORTER",
            "rating": 4.7,
            "field": "공예"
        },
        "price": 150000,
        "type": "OFFER",
        "status": "OPEN",
        "progressPercent": 56,
        "imageUrl": "https://cdn.example.com/feed/feed-001.jpg",
        "views": 142,
        "likes": 38,
        "partnerCount": 3,
        "applicantCount": 7,
        "maxParticipants": 5,
        "confirmedPartnerProfiles": [
            {
                "id": "p-a1",
                "nickname": "햇살가득",
                "avatarUrl": "https://cdn.example.com/avatars/p-a1.jpg"
            }
        ],
        "category": "공예",
        "deadline": "2026-04-10",
        "isBookmarked": true
    }
}
```

---

### POST /feeds/{feedId}/bookmark

- Purpose: Bookmark feed item.
- Auth: Required (Bearer)
- Path params: `feedId: string`
- Query params: none
- Request body: none
- Response body: empty (204)
- Referenced schemas: none

---

### DELETE /feeds/{feedId}/bookmark

- Purpose: Remove feed bookmark.
- Auth: Required (Bearer)
- Path params: `feedId: string`
- Query params: none
- Request body: none
- Response body: empty (204)
- Referenced schemas: none

---

### POST /feeds/{feedId}/apply

- Purpose: Apply to participate in a feed item (supporter → partner's feed, or partner → supporter's feed).
- Auth: Required (Bearer)
- Path params: `feedId: string`
- Query params: none
- Request body: `FeedApplyRequest`
- Response body (200): `ApiResponse<FeedApplication>`
- Referenced schemas: `FeedApplication`, `FeedApplicationStatus`

**Request**

```json
{
    "proposal": "저는 공예 경험이 5년 있고, 이 활동에 꼭 참여하고 싶습니다."
}
```

**Response 200**

```json
{
    "data": {
        "id": "apply-001",
        "feedId": "feed-001",
        "userId": "user-me",
        "proposal": "저는 공예 경험이 5년 있고, 이 활동에 꼭 참여하고 싶습니다.",
        "status": "APPLIED",
        "createdAt": "2026-04-11T10:00:00Z"
    }
}
```

---

### DELETE /feeds/{feedId}/apply

- Purpose: Cancel a pending application. Only allowed when `status` is `APPLIED`.
- Auth: Required (Bearer)
- Path params: `feedId: string`
- Query params: none
- Request body: none
- Response body: empty (204)
- Referenced schemas: none

---

### GET /feeds/{feedId}/management-flow

- Purpose: Fetch management flow for a feed item (host only).
- Auth: Required (Bearer)
- Path params: `feedId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<FeedManagementFlow>`
- Referenced schemas: `FeedManagementFlow`, `FeedDemandSnapshot`, `SupporterApplication`, `FeedCompetitionInsight`

**Response 200**

```json
{
    "data": {
        "feedId": "feed-001",
        "stageLabel": "모집 중",
        "demand": {
            "fundingGoal": 750000,
            "fundedAmount": 420000,
            "requiredPartners": 5,
            "confirmedPartners": 3,
            "confirmedPartnerProfiles": [
                {
                    "id": "p-a1",
                    "nickname": "햇살가득",
                    "avatarUrl": "https://cdn.example.com/avatars/p-a1.jpg"
                },
                {
                    "id": "p-a2",
                    "nickname": "달빛산책",
                    "avatarUrl": "https://cdn.example.com/avatars/p-a2.jpg"
                },
                {
                    "id": "p-a3",
                    "nickname": "봄바람",
                    "avatarUrl": "https://cdn.example.com/avatars/p-a3.jpg"
                }
            ],
            "partnerSlotLabels": ["디자이너", "개발자", "기획자"],
            "deadlineLabel": "D-2",
            "hostNote": "빠르게 마감될 예정이니 서둘러 신청해주세요.",
            "currentAmountLabel": "42만원",
            "targetAmountLabel": "75만원",
            "progressLabel": "56%"
        },
        "applications": [
            {
                "id": "app-001",
                "nickname": "파란하늘",
                "avatarUrl": "https://cdn.example.com/avatars/blue.jpg",
                "category": "공예",
                "tagline": "손재주 하나는 자신 있어요",
                "tags": ["공방", "DIY", "소품"],
                "completedCount": 12,
                "rating": 4.5,
                "location": "강남구",
                "proposal": "소파 어셈블리 경험 있습니다. 같이 해요!",
                "competitionScore": 87,
                "status": "LEADING"
            }
        ],
        "insights": [
            { "label": "경쟁률", "value": "1.8:1", "tone": "brand" },
            { "label": "평균 완료율", "value": "91%", "tone": "neutral" }
        ]
    }
}
```

---

### PATCH /feeds/{feedId}/applications/{applicationId}/accept

- Purpose: Host accepts a supporter's application. Transitions status to `ACCEPTED`.
- Auth: Required (Bearer)
- Path params: `feedId: string`, `applicationId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<FeedApplication>`
- Referenced schemas: `FeedApplication`, `FeedApplicationStatus`

**Response 200**

```json
{
    "data": {
        "id": "apply-001",
        "feedId": "feed-001",
        "userId": "user-me",
        "proposal": "저는 공예 경험이 5년 있습니다.",
        "status": "ACCEPTED",
        "createdAt": "2026-04-11T10:00:00Z"
    }
}
```

---

### PATCH /feeds/{feedId}/applications/{applicationId}/reject

- Purpose: Host rejects a supporter's application. Transitions status to `REJECTED`.
- Auth: Required (Bearer)
- Path params: `feedId: string`, `applicationId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<FeedApplication>`
- Referenced schemas: `FeedApplication`, `FeedApplicationStatus`

**Response 200**

```json
{
    "data": {
        "id": "apply-001",
        "feedId": "feed-001",
        "userId": "user-me",
        "proposal": "저는 공예 경험이 5년 있습니다.",
        "status": "REJECTED",
        "createdAt": "2026-04-11T10:00:00Z"
    }
}
```

---

### POST /feeds/{feedId}/like

- Purpose: Add a like to a feed item.
- Auth: Required (Bearer)
- Path params: `feedId: string`
- Query params: none
- Request body: none
- Response body: empty (204)
- Referenced schemas: none

---

### DELETE /feeds/{feedId}/like

- Purpose: Remove a like from a feed item.
- Auth: Required (Bearer)
- Path params: `feedId: string`
- Query params: none
- Request body: none
- Response body: empty (204)
- Referenced schemas: none

---

## Post (UI contract)

Not currently wired in this repo. The UI expects these endpoints.

### POST /posts/offer

- Purpose: Create an offer post.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `CreateOfferPostRequest`
- Response body (200): `ApiResponse<PostCompletion>`
- Referenced schemas: `PostCompletion`

**Request**

```json
{
    "type": "OFFER",
    "spotName": "건강한삶의 홈카페",
    "title": "홈카페 클래스 — 핸드드립부터 라떼아트까지",
    "content": "원두 선택부터 추출까지, 커피의 모든 것을 알려드려요.",
    "categories": ["음식·요리"],
    "photoUrls": ["https://cdn.example.com/uploads/cafe-01.jpg"],
    "pointCost": 25000,
    "location": "마포구 합정동",
    "deadline": "2026-04-15",
    "detailDescription": "핸드드립, 에스프레소, 라떼아트 순서로 진행. 원두 샘플 증정.",
    "supporterPhotoUrl": "https://cdn.example.com/uploads/supporter-01.jpg",
    "qualifications": "커피에 관심 있거나 카페 경험이 있는 분 환영해요.",
    "desiredPrice": 75000,
    "maxPartnerCount": 3,
    "autoClose": true
}
```

**Response 200**

```json
{
    "data": {
        "id": "post-001",
        "type": "OFFER",
        "title": "홈카페 클래스 — 핸드드립부터 라떼아트까지",
        "redirectUrl": "/feed/post-001"
    }
}
```

---

### POST /posts/request

- Purpose: Create a request post.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: `CreateRequestPostRequest`
- Response body (200): `ApiResponse<PostCompletion>`
- Referenced schemas: `PostCompletion`

**Request**

```json
{
    "type": "REQUEST",
    "spotName": "맑은하늘의 다이슨 공구",
    "title": "다이슨 공기청정기 공동구매 참여자 모집",
    "content": "4명 이상 모이면 개당 15만원대 가능합니다.",
    "categories": ["공동구매"],
    "photoUrls": ["https://cdn.example.com/uploads/dyson-01.jpg"],
    "pointCost": 70000,
    "location": "서초구 방배동",
    "deadline": "2026-04-20",
    "detailDescription": "정품 인증 채널 통해 구매. 서초구 방배동 픽업.",
    "serviceStylePhotoUrl": "https://cdn.example.com/uploads/style-01.jpg",
    "preferredSchedule": "주말 오전 가능해요.",
    "maxPartnerCount": 4,
    "priceCapPerPerson": 150000
}
```

**Response 200**

```json
{
    "data": {
        "id": "post-002",
        "type": "REQUEST",
        "title": "다이슨 공기청정기 공동구매 참여자 모집",
        "redirectUrl": "/feed/post-002"
    }
}
```

> File uploads for post creation use the shared `POST /uploads` endpoint (see Shared section).

---

## Chat (UI contract)

Not currently wired in this repo, but types are defined in `src/features/chat/model/types.ts` and the UI expects these endpoints.

### GET /chat/rooms

- Purpose: List chat rooms.
- Auth: TBD (expected Bearer)
- Path params: none
- Query params: `ChatRoomsQuery`
- Request body: none
- Response body (200): `ApiResponse<(PersonalChatRoom | SpotChatRoom)[]>`
- Referenced schemas: `ChatRoom`, `PersonalChatRoom`, `SpotChatRoom`

**Response 200**

```json
{
    "data": [
        {
            "id": "room-001",
            "category": "personal",
            "currentUserId": "user-abc123",
            "currentUserName": "건강한삶",
            "title": "맑은하늘123 님과의 대화",
            "subtitle": "다이슨 공구 관련",
            "description": "파트너와 1:1 채팅",
            "metaLabel": "오늘 오전 11:30",
            "updatedAt": "2026-04-09T11:30:00Z",
            "messages": [],
            "partnerId": "user-xyz789",
            "partnerName": "맑은하늘123",
            "presenceLabel": "온라인",
            "unreadCount": 2,
            "counterpartRole": "PARTNER"
        }
    ]
}
```

---

### POST /chat/rooms

- Purpose: Create a chat room (personal or spot).
- Auth: TBD (expected Bearer)
- Path params: none
- Query params: none
- Request body: `CreateChatRoomRequest`
- Response body (200): `ApiResponse<PersonalChatRoom | SpotChatRoom>`
- Referenced schemas: `ChatRoom`

**Request (personal)**

```json
{
    "category": "personal",
    "userId": "user-xyz789"
}
```

**Request (spot)**

```json
{
    "category": "spot",
    "spotId": "spot-001"
}
```

---

### GET /chat/rooms/{roomId}

- Purpose: Get a chat room with full message history.
- Auth: TBD (expected Bearer)
- Path params: `roomId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<PersonalChatRoom | SpotChatRoom>`
- Referenced schemas: `ChatRoom`

**Response 200**

```json
{
    "data": {
        "id": "room-001",
        "category": "personal",
        "currentUserId": "user-abc123",
        "currentUserName": "건강한삶",
        "title": "맑은하늘123 님과의 대화",
        "subtitle": "다이슨 공구 관련",
        "description": "파트너와 1:1 채팅",
        "metaLabel": "오늘 오전 11:30",
        "updatedAt": "2026-04-09T11:30:00Z",
        "messages": [
            {
                "id": "msg-001",
                "kind": "message",
                "createdAt": "2026-04-09T11:00:00Z",
                "authorId": "user-xyz789",
                "authorName": "맑은하늘123",
                "content": "안녕하세요! 공구 참여하고 싶어요."
            },
            {
                "id": "msg-002",
                "kind": "message",
                "createdAt": "2026-04-09T11:30:00Z",
                "authorId": "user-abc123",
                "authorName": "건강한삶",
                "content": "반갑습니다. 자세한 내용 공유드릴게요!"
            }
        ],
        "partnerId": "user-xyz789",
        "partnerName": "맑은하늘123",
        "presenceLabel": "온라인",
        "unreadCount": 0,
        "counterpartRole": "PARTNER"
    }
}
```

---

### GET /chat/rooms/{roomId}/messages

- Purpose: List messages for a room (cursor-based pagination).
- Auth: TBD (expected Bearer)
- Path params: `roomId: string`
- Query params:
    - `before?`: `string` — message id cursor
    - `size?`: `number`
- Request body: none
- Response body (200): `ApiResponse<ChatMessage[]>`
- Referenced schemas: `ChatMessage` (all variants)

**Response 200**

```json
{
    "data": [
        {
            "id": "msg-001",
            "kind": "message",
            "createdAt": "2026-04-09T11:00:00Z",
            "authorId": "user-xyz789",
            "authorName": "맑은하늘123",
            "content": "안녕하세요! 공구 참여하고 싶어요."
        },
        {
            "id": "msg-sys-001",
            "kind": "system",
            "createdAt": "2026-04-09T10:00:00Z",
            "content": "채팅방이 개설되었습니다."
        }
    ]
}
```

---

### POST /chat/rooms/{roomId}/messages

- Purpose: Send a message.
- Auth: TBD (expected Bearer)
- Path params: `roomId: string`
- Query params: none
- Request body: `SendChatMessageRequest`
- Response body (200): `ApiResponse<ChatMessage>`
- Referenced schemas: `ChatMessage` (all variants)

**Request (텍스트)**

```json
{
    "kind": "message",
    "content": "반갑습니다. 자세한 내용 공유드릴게요!"
}
```

**Request (제안)**

```json
{
    "kind": "proposal",
    "proposal": {
        "suggestedAmount": 25000,
        "amountRange": { "min": 20000, "max": 30000 },
        "availableDates": ["2026-04-12", "2026-04-13"],
        "description": "이 날짜 중 편하신 날로 잡아요."
    }
}
```

**Request (역제안)**

```json
{
    "kind": "reverse-offer",
    "reverseOffer": {
        "id": "ro-001",
        "spotId": "spot-001",
        "status": "PARTNER_REVIEW",
        "approvedPartnerCount": 1,
        "totalPartnerCount": 3,
        "priorAgreementReachedInChat": true,
        "createdAt": "2026-04-09T12:00:00Z",
        "updatedAt": "2026-04-09T12:00:00Z"
    }
}
```

**Response 200**

```json
{
    "data": {
        "id": "msg-003",
        "kind": "message",
        "createdAt": "2026-04-09T12:00:00Z",
        "authorId": "user-abc123",
        "authorName": "건강한삶",
        "content": "반갑습니다. 자세한 내용 공유드릴게요!"
    }
}
```

---

### POST /chat/rooms/{roomId}/read

- Purpose: Mark room as read.
- Auth: TBD (expected Bearer)
- Path params: `roomId: string`
- Query params: none
- Request body: none
- Response body (204): empty
- Referenced schemas: none

---

### GET /chat/rooms/by-spot/{spotId}

- Purpose: Resolve room for a spot.
- Auth: TBD (expected Bearer)
- Path params: `spotId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<SpotChatRoom>`
- Referenced schemas: `ChatRoom`

**Response 200**

```json
{
    "data": {
        "id": "room-spot-001",
        "category": "spot",
        "currentUserId": "user-abc123",
        "currentUserName": "건강한삶",
        "title": "홈카페 클래스 협의방",
        "subtitle": "역제안 검토 중",
        "description": "스팟 진행용 그룹 채팅",
        "metaLabel": "오늘 오후 12:00",
        "updatedAt": "2026-04-09T12:00:00Z",
        "messages": [
            {
                "id": "msg-ro-001",
                "kind": "reverse-offer",
                "createdAt": "2026-04-09T12:00:00Z",
                "authorId": "user-abc123",
                "authorName": "건강한삶",
                "reverseOffer": {
                    "id": "ro-001",
                    "spotId": "spot-001",
                    "status": "PARTNER_REVIEW",
                    "approvedPartnerCount": 1,
                    "totalPartnerCount": 3,
                    "priorAgreementReachedInChat": true,
                    "createdAt": "2026-04-09T12:00:00Z",
                    "updatedAt": "2026-04-09T12:00:00Z"
                }
            }
        ],
        "spot": {
            "id": "spot-001",
            "type": "OFFER",
            "status": "MATCHED",
            "title": "홈카페 클래스 — 핸드드립부터 라떼아트까지",
            "description": "원두 샘플 증정, 초보 환영",
            "pointCost": 25000,
            "authorId": "user-healthy",
            "authorNickname": "건강한삶",
            "createdAt": "2026-04-01T09:00:00Z",
            "updatedAt": "2026-04-09T12:00:00Z",
            "timeline": [],
            "participants": [],
            "votes": [],
            "files": [],
            "notes": [],
            "reviews": []
        },
        "reverseOffer": {
            "id": "ro-001",
            "spotId": "spot-001",
            "status": "PARTNER_REVIEW",
            "approvedPartnerCount": 1,
            "totalPartnerCount": 3,
            "priorAgreementReachedInChat": true,
            "createdAt": "2026-04-09T12:00:00Z",
            "updatedAt": "2026-04-09T12:00:00Z"
        },
        "sourceFeedId": "feed-001",
        "participationRole": "SUPPORTER"
    }
}
```

---

### GET /chat/rooms/by-user/{userId}

- Purpose: Resolve personal room for a user.
- Auth: TBD (expected Bearer)
- Path params: `userId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<PersonalChatRoom>`
- Referenced schemas: `ChatRoom`

---

### GET /chat/connect

- Purpose: Open a Server-Sent Events (SSE) stream for real-time chat events — new messages, read receipts, and typing indicators.
- Auth: Required (Bearer)
- Path params: none
- Query params:
    - `roomId?`: `string` — filter events to a single room; omit for all joined rooms
- Request body: none
- Response: `text/event-stream` — each event is a `ChatSSEEvent`
- Note: Sending messages continues to use `POST /chat/rooms/{roomId}/messages` (unchanged).
- Referenced schemas: `ChatSSEEvent`, `ChatSSEEventType`

**SSE 이벤트 예시 (raw stream)**

```
data: {"type":"message","data":{"id":"msg-004","kind":"message","createdAt":"2026-04-09T12:05:00Z","authorId":"user-xyz789","authorName":"맑은하늘123","content":"감사해요!"}}

data: {"type":"read","data":{"roomId":"room-001","userId":"user-xyz789"}}

data: {"type":"typing","data":{"roomId":"room-001","userId":"user-xyz789"}}
```

---

## Search (UI contract)

The search UI is implemented for spot results (`useSpotSearch`), but the backend contract covers spot, post, and user tabs.

Query params shared across search endpoints (`SearchQuery`):

- `q`: `string` — search keyword
- `page?`: `number`
- `size?`: `number`

### GET /search/spots

- Purpose: Search spots.
- Auth: Optional (Bearer)
- Path params: none
- Query params: `SearchQuery`
- Request body: none
- Response body (200): `PagedResponse<SpotSearchResult>`
- Referenced schemas: `SpotSearchResult`

**Response 200**

```json
{
    "data": [
        {
            "id": "spot-001",
            "type": "OFFER",
            "status": "OPEN",
            "title": "홈카페 클래스 — 핸드드립부터 라떼아트까지",
            "description": "원두 샘플 증정, 초보 환영",
            "pointCost": 25000,
            "authorId": "user-healthy",
            "authorNickname": "건강한삶",
            "createdAt": "2026-04-01T09:00:00Z",
            "updatedAt": "2026-04-05T12:00:00Z"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 7, "hasNext": false }
}
```

---

### GET /search/posts

- Purpose: Search posts.
- Auth: Optional (Bearer)
- Path params: none
- Query params: `SearchQuery`
- Request body: none
- Response body (200): `PagedResponse<PostSearchResult>`
- Referenced schemas: `PostSearchResult`

**Response 200**

```json
{
    "data": [
        {
            "id": "post-001",
            "type": "OFFER",
            "title": "홈카페 클래스 — 핸드드립부터 라떼아트까지",
            "content": "원두 선택부터 추출까지, 커피의 모든 것을 알려드려요.",
            "categories": ["음식·요리"],
            "pointCost": 25000,
            "authorNickname": "건강한삶"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 3, "hasNext": false }
}
```

---

### GET /search/users

- Purpose: Search users.
- Auth: Optional (Bearer)
- Path params: none
- Query params: `SearchQuery`
- Request body: none
- Response body (200): `PagedResponse<UserSearchResult>`
- Referenced schemas: `UserSearchResult`

**Response 200**

```json
{
    "data": [
        {
            "id": "user-abc123",
            "profileType": "SUPPORTER",
            "nickname": "건강한삶",
            "avatarUrl": "https://cdn.example.com/avatars/user-abc123.jpg",
            "field": "요리",
            "rating": 4.8,
            "location": "마포구 합정동"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 2, "hasNext": false }
}
```

---

## Bookmarks (UI contract)

### GET /bookmarks

- Purpose: List bookmarks.
- Auth: Required (Bearer)
- Path params: none
- Query params: `BookmarkListQuery`
    - `type?`: `BookmarkTargetType` (`post` | `spot`)
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `PagedResponse<BookmarkItem>`
- Referenced schemas: `BookmarkItem`

**Response 200**

```json
{
    "data": [
        {
            "id": "bm-001",
            "targetId": "spot-001",
            "targetType": "spot",
            "title": "홈카페 클래스",
            "summary": "원두 샘플 증정, 초보 환영",
            "thumbnailUrl": "https://cdn.example.com/feed/feed-003.jpg",
            "authorNickname": "건강한삶",
            "savedAt": "2026-04-05T09:00:00Z",
            "popularity": 203,
            "deadline": "2026-04-07",
            "status": "OPEN"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 5, "hasNext": false }
}
```

---

## Notifications (UI contract)

### GET /notifications

- Purpose: List notifications.
- Auth: Required (Bearer)
- Path params: none
- Query params: `NotificationListQuery`
    - `filter?`: `string`
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `PagedResponse<Notification>`
- Referenced schemas: `Notification`

**Response 200**

```json
{
    "data": [
        {
            "id": "notif-001",
            "type": "invite",
            "title": "스팟 초대",
            "body": "건강한삶 님이 홈카페 클래스에 초대했습니다.",
            "createdAt": "2026-04-09T10:00:00Z",
            "isRead": false,
            "deepLink": "/spots/spot-001"
        },
        {
            "id": "notif-002",
            "type": "like",
            "title": "좋아요",
            "body": "맑은하늘123 님이 회원님의 피드를 좋아합니다.",
            "createdAt": "2026-04-08T18:30:00Z",
            "isRead": true,
            "deepLink": "/feed/feed-001"
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 8, "hasNext": false }
}
```

---

### POST /notifications/{notificationId}/read

- Purpose: Mark one notification as read.
- Auth: Required (Bearer)
- Path params: `notificationId: string`
- Query params: none
- Request body: none
- Response body (204): empty
- Referenced schemas: none

---

### POST /notifications/read-all

- Purpose: Mark all notifications as read.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: none
- Response body (204): empty
- Referenced schemas: none

---

### DELETE /notifications

- Purpose: Clear all notifications.
- Auth: Required (Bearer)
- Path params: none
- Query params: none
- Request body: none
- Response body (204): empty
- Referenced schemas: none

---

### DELETE /notifications/{notificationId}

- Purpose: Delete a single notification.
- Auth: Required (Bearer)
- Path params: `notificationId: string`
- Query params: none
- Request body: none
- Response body: empty (204)
- Referenced schemas: none

---

## Admin Post (UI contract)

Types are defined in `src/features/admin-post/model/types.ts`.

### GET /admin-posts

- Purpose: List admin posts.
- Auth: Optional (Bearer)
- Path params: none
- Query params: `AdminPostListQuery`
    - `type?`: `AdminPostType`
    - `isNotice?`: `boolean`
    - `page?`: `number`
    - `size?`: `number`
- Request body: none
- Response body (200): `PagedResponse<AdminPost>`
- Referenced schemas: `AdminPost`

**Response 200**

```json
{
    "data": [
        {
            "id": "admin-001",
            "type": "curation",
            "isNotice": false,
            "title": "4월의 인기 서포터를 소개합니다",
            "summary": "이달의 서포터 TOP 5",
            "teaser": "요리, 음악, 운동 분야 서포터들이 활발히 활동 중이에요.",
            "authorName": "에이투지체 편집팀",
            "publishedAt": "2026-04-01T09:00:00Z",
            "introTitle": "4월의 서포터",
            "introBody": "다양한 분야에서 활약 중인 서포터를 만나보세요.",
            "body": [
                "첫 번째 서포터는 요리 분야의 건강한삶 님입니다.",
                "두 번째 서포터는 음악 분야의 차한잔 님입니다."
            ],
            "hotSpot": {
                "category": "요리",
                "title": "홈카페 클래스",
                "subtitle": "핸드드립부터 라떼아트까지",
                "imageUrl": "https://cdn.example.com/admin/hotspot-001.jpg"
            },
            "relatedFeedIds": ["feed-001", "feed-003"]
        }
    ],
    "meta": { "page": 1, "size": 20, "total": 12, "hasNext": false }
}
```

---

### GET /admin-posts/{adminPostId}

- Purpose: Get admin post detail.
- Auth: Optional (Bearer)
- Path params: `adminPostId: string`
- Query params: none
- Request body: none
- Response body (200): `ApiResponse<AdminPost>`
- Referenced schemas: `AdminPost`

**Response 200**

```json
{
    "data": {
        "id": "admin-001",
        "type": "curation",
        "isNotice": false,
        "title": "4월의 인기 서포터를 소개합니다",
        "summary": "이달의 서포터 TOP 5",
        "teaser": "요리, 음악, 운동 분야 서포터들이 활발히 활동 중이에요.",
        "authorName": "에이투지체 편집팀",
        "publishedAt": "2026-04-01T09:00:00Z",
        "introTitle": "4월의 서포터",
        "introBody": "다양한 분야에서 활약 중인 서포터를 만나보세요.",
        "body": [
            "첫 번째 서포터는 요리 분야의 건강한삶 님입니다.",
            "두 번째 서포터는 음악 분야의 차한잔 님입니다."
        ],
        "hotSpot": {
            "category": "요리",
            "title": "홈카페 클래스",
            "subtitle": "핸드드립부터 라떼아트까지",
            "imageUrl": "https://cdn.example.com/admin/hotspot-001.jpg"
        },
        "relatedFeedIds": ["feed-001", "feed-003"]
    }
}
```

## Spot 취소/정산 확장 (2026-04 추가)

### GET /spots/{spotId}/workflow

- Purpose: 스팟의 워크플로우 스냅샷(투표 요약, 최종 승인, 정산 승인) 조회.
- Path params: `spotId`
- Response 200: `ApiResponse<SpotWorkflow>`

### POST /spots/{spotId}/settlement

- Purpose: 호스트(AUTHOR)가 정산 line items와 summary를 제출. `spot.status === 'CLOSED'` 이고 `settlementApproval.status !== 'APPROVED'`일 때만 허용.
- Request body: `SubmitSettlementRequest`
- Response 200: `ApiResponse<SpotSettlementApproval>` (`status = 'PENDING'`)
- Side effect: `SETTLEMENT_REQUESTED` 타임라인 이벤트 추가.

### POST /spots/{spotId}/settlement/approve

- Purpose: 참여자(PARTICIPANT)가 PENDING 상태의 정산을 승인.
- Response 200: `ApiResponse<SpotSettlementApproval>` (`status = 'APPROVED'`, `approvedAmount = requestedAmount + forfeitPool.toPool`)
- Side effect: `SETTLEMENT_APPROVED` 타임라인 이벤트 추가.

### DELETE /feeds/{feedId}/apply (side effect 명시)

- 기존 엔드포인트. 서버가 본 요청 처리 시 환불/몰수 정책에 따라 `PointTransaction.type = 'REFUND'`을 즉시 발행하고, 연결된 Spot이 있으면 `spot.forfeitPool`을 업데이트한다. 규칙은 BACKEND_HANDOFF_SCHEMAS.md의 "Deposit refund/forfeit policy" 참조.

## Simulation (contextBuilder, 2026-04 추가)

> contextBuilder 시뮬레이션 결과 소비 엔드포인트. 모든 경로는 `${NEXT_PUBLIC_API_BASE_URL}` 기준이며, 프론트는 클라이언트 계산 없이 응답을 그대로 렌더한다.

### GET /api/v1/map/spots

- Purpose: 맵에 표시할 SpotCard 리스트 조회. `mode` 쿼리로 virtual/real/mixed 필터.
- Auth: Optional (Bearer). 로그인된 파트너/서포터는 `person_fitness_score`가 본인 archetype 기준으로 산출된다.
- Query params:
    - `mode?`: `"virtual" | "real" | "mixed"` — 생략 시 전체.
- Request body: none
- Response body (200): `ApiResponse<SpotCard[]>`
- Referenced schemas: `SpotCard`

**Response 200**

```json
{
    "data": [
        {
            "spot_id": "spot-v-001",
            "provenance": "virtual",
            "title": "연무동 저녁 라떼아트 실습",
            "skill_topic": "바리스타",
            "teach_mode": "small_group",
            "venue_type": "cafe",
            "fee_per_partner": 18000,
            "location": { "lat": 37.2636, "lng": 127.0286 },
            "host_preview": "5년차 바리스타 민지의 핸드드립+라떼아트 2시간 클래스",
            "person_fitness_score": 0.82,
            "attractiveness_score": 0.74
        }
    ]
}
```

### GET /api/v1/simulation/runs/{run_id}/timeline/stream

- Purpose: 시뮬레이션 실행의 틱별 `TimelineFrame`을 SSE로 실시간 송출.
- Auth: Optional (Bearer)
- Path params: `run_id: string`
- Query params: none
- Protocol: `text/event-stream` (SSE). 프론트는 `EventSource`로 구독.
- Event format:
    - 각 틱마다 `message` 이벤트 1건. `data:` 필드에 `TimelineFrame` JSON 문자열.
    - keep-alive는 주석 라인(`: keepalive\n\n`)으로만 송출.
- Response body: 아래와 같은 프레임이 반복된다.

```
data: {"tick":0,"day_of_week":"SAT","time_slot":"09:00","active_agents":[...],"active_spots":[...],"events_this_tick":[...]}

data: {"tick":1,"day_of_week":"SAT","time_slot":"09:30", ...}
```

- Referenced schemas: `TimelineFrame`, `AgentMarker`, `SpotMarker`, `LiveEvent`

### GET /api/v1/simulation/runs/{run_id}/highlights

- Purpose: 시뮬레이션 실행의 내러티브 하이라이트 클립 리스트.
- Auth: Optional (Bearer)
- Path params: `run_id: string`
- Query params: none
- Response body (200): `ApiResponse<HighlightClip[]>`
- Referenced schemas: `HighlightClip`

**Response 200**

```json
{
    "data": [
        {
            "clip_id": "clip-001",
            "title": "첫 매칭 성사: 라떼아트 클래스",
            "category": "first_success",
            "start_tick": 0,
            "end_tick": 3,
            "involved_agents": ["A_11504", "A_80381"],
            "narrative": "호스트 지훈이 연무동 카페에서 라떼아트 클래스를 열자 탐험형 민지가 바로 합류해 첫 매칭이 성사됐다."
        }
    ]
}
```

### GET /api/v1/feed/{feed_id}/attractiveness

- Purpose: 특정 피드의 Attractiveness 점수/시그널/개선 힌트 조회 (서포터 대시보드).
- Auth: Required (Bearer) — 피드 소유 서포터만 호출 가능.
- Path params: `feed_id: string`
- Query params: none
- Response body (200): `ApiResponse<AttractivenessReport>`
- Referenced schemas: `AttractivenessReport`, `AttractivenessSignal`

### GET /api/v1/feed/{feed_id}/conversion-hints

- Purpose: 가상 스팟 → 실제 스팟 전환 가이드 (가격/플랜/수요 예측). 피드 작성 보조용.
- Auth: Required (Bearer)
- Path params: `feed_id: string`
- Query params: none
- Response body (200): `ApiResponse<ConversionHints>`
- Referenced schemas: `ConversionHints`
