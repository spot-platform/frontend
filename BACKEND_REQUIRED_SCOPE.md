# SPOT Backend Required Scope

프론트 `api v3` 연동 후에도 mock fallback 없이 제거하지 못한 범위를 백엔드 전달용으로 정리한 문서입니다.

기준 자료:

- 기존 최상위 handoff 문서 4개
  - `BACKEND_HANDOFF.md`
  - `BACKEND_HANDOFF_SWAGGER.md`
  - `BACKEND_HANDOFF_ENTITIES.md`
  - `BACKEND_HANDOFF_SCHEMAS.md`
- 현재 프론트 구현
  - `src/lib/endpoint.ts`
  - `src/features/pay/api/pay-api.ts`
  - `src/features/my/api/my-api.ts`
  - `src/app/(detail)/users/[id]/page.tsx`
  - `src/features/chat/**`
  - `src/app/(detail)/admin-post/page.tsx`
  - `src/features/simulation/**`
  - `src/features/locality/**`

> 이 문서는 “이미 연동된 API 목록”이 아니라, 프론트에서 아직 mock/local state에 남아 있고 백엔드 계약·구현이 더 있어야 안전하게 제거 가능한 범위만 다룹니다.

---

## 0. 현재 연동 완료 또는 제거 완료된 범위

아래 영역은 이번 프론트 작업에서 backend `/api/v1` 기준으로 이미 연결했거나 mock fallback을 제거했습니다.

| Area | Status | Notes |
| --- | --- | --- |
| Auth | connected | 로그인/회원가입/중복확인/refresh/logout/OAuth start 경로를 v1 계약에 맞춤 |
| Feed list/detail | connected | `/feeds`, `/feeds/{feedId}` 사용. 상세 mock fallback 제거 |
| Feed bookmark/application | connected | bookmark, apply/cancel, application accept/reject API 함수 연결 |
| Post create | connected | OpenAPI 계약 기준 `/feeds/offer`, `/feeds/request` 연결. 숫자 optional field와 context-builder payload 정규화 포함 |
| Notifications | connected | list/read/read-all API 및 알림 페이지 연결 |
| Feed participation local fallback | removed | 신청/취소 시 mock point 차감, fake chat room 생성, local item mutation 제거 |

---

## 1. Pay / Point

### 정책 변경

포인트는 결제/정산 시스템까지 구현하기 어렵기 때문에, MVP에서는 “사용자가 요청하면 충전되는 방식”으로 갑니다.
계좌 등록, 출금, 정산 계좌 연동은 아직 미정입니다. 따라서 이번 백엔드 전달 범위에서는 계좌/출금 API를 필수 구현 요구사항에서 제외합니다.

### 왜 백엔드 작업이 더 필요한가

현재 `src/features/pay/api/pay-api.ts`는 전부 `src/features/pay/model/mock.ts`에 의존합니다.
다만 실제 구현 범위는 포인트 잔액 조회, 거래 내역 조회, 요청 기반 충전까지만 둡니다. 신청/참여 플로우에서 포인트가 차감되거나 보증금이 필요한 경우에도 서버가 최종 잔액과 거래 내역을 authoritative source로 관리해야 합니다.

### 현재 프론트 mock 의존

| Frontend method | Current behavior | MVP backend decision |
| --- | --- | --- |
| `payApi.balance()` | mock point balance 반환 | 실제 API 필요 |
| `payApi.history({ page, size })` | mock transaction history 반환 | 실제 API 필요 |
| `payApi.charge(amount)` | memory point balance 증가 | “요청하면 충전” 방식의 실제 API 필요 |
| `payApi.linkedBankAccount()` | mock linked bank account 반환 | 미정, MVP 필수 제외 |
| `payApi.linkBankAccount(payload)` | memory state에 계좌 저장 | 미정, MVP 필수 제외 |
| `payApi.withdrawals({ page, size })` | mock withdrawal list 반환 | 미정, MVP 필수 제외 |
| `payApi.withdraw(amount)` | memory point balance 감소 + withdrawal 생성 | 미정, MVP 필수 제외 |

### MVP에 필요한 백엔드 API

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/v1/points/balance` | 현재 포인트 잔액 조회 | required |
| `GET` | `/api/v1/points/history` | 포인트 거래 내역 조회 | required |
| `POST` | `/api/v1/points/charge` | 사용자가 요청한 금액만큼 포인트 충전 | required |

### 미정 / MVP 필수 제외 API

아래 API는 기존 handoff에는 있었지만, 계좌·출금 정책이 아직 정해지지 않았기 때문에 지금은 백엔드 필수 범위로 보지 않습니다.

| Method | Path | Reason |
| --- | --- | --- |
| `GET` | `/api/v1/points/account` | 계좌 등록 정책 미정 |
| `PUT` | `/api/v1/points/account` | 계좌 등록 정책 미정 |
| `GET` | `/api/v1/points/withdrawals` | 출금 정책 미정 |
| `POST` | `/api/v1/points/withdraw` | 출금 정책 미정 |

### DTO 제안

```ts
type PointBalance = {
    balance: number;
    updatedAt: string;
};

type PointTransaction = {
    id: string;
    type: 'CHARGE' | 'USE' | 'REFUND' | 'ADJUST';
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
};

type ChargePointsRequest = {
    amount: number;
};
```

### 백엔드 구현 주의점

- MVP 충전은 PG/계좌 연동 없이 “요청하면 충전”으로 처리합니다.
- `POST /points/charge`는 amount validation만 확실히 두면 됩니다. 예: 양수, 최소/최대 충전 금액.
- 잔액 변경 API는 중복 요청 방지 정책이 있으면 좋습니다. 단순 MVP라면 서버에서 거래 row를 생성하고 잔액을 트랜잭션으로 갱신하는 수준이면 충분합니다.
- `POST /feeds/{feedId}/applications` 같은 신청 API에서 포인트/보증금이 연결된다면, 클라이언트가 보낸 금액을 그대로 신뢰하지 말고 서버에서 재계산해야 합니다.
- 계좌번호/출금 관련 응답과 상태값은 정책 확정 전까지 구현하지 않습니다.

---

## 2. My / Profile / Settings / Activity

### 왜 백엔드 작업이 더 필요한가

`src/features/my/api/my-api.ts`에서 `profile`, `updateProfile`, `changePassword`만 실제 endpoint를 사용하고, 나머지는 mock입니다.
마이페이지는 사용자 설정·서포터 등록·활동 내역이 섞여 있어서 부분적으로만 mock을 제거하면 화면 상태가 서로 불일치할 수 있습니다.

### 현재 실제 연결됨

| Frontend method | Endpoint |
| --- | --- |
| `myApi.profile()` | `GET /api/v1/me` |
| `myApi.updateProfile(payload)` | `PATCH /api/v1/me` |
| `myApi.changePassword(payload)` | `PATCH /api/v1/me/password` |

### 아직 mock인 범위

| Frontend method | Needed backend scope |
| --- | --- |
| `notificationSettings()` / `updateNotificationSettings()` | 알림 설정 조회/수정 |
| `supporterRegistration()` / `updateSupporterRegistration()` | 서포터 인증/등록 정보 조회/수정 |
| `supporterProfile()` / `updateSupporterProfile()` | 내 서포터 공개 프로필 조회/수정 |
| `participations()` | 내 참여/활동 이력 목록 |
| `favorites()` / `removeFavorite()` | 즐겨찾기 목록/삭제 |
| `recentViews()` / `removeRecentView()` / `clearRecentViews()` | 최근 본 항목 목록/삭제/전체삭제 |
| `supportActivitySummary()` | 서포터 활동 요약 |

### 필요한 백엔드 API

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/v1/me/notification-settings` | 내 알림 설정 조회 | required |
| `PUT` | `/api/v1/me/notification-settings` | 내 알림 설정 수정 | required |
| `GET` | `/api/v1/me/supporter-registration` | 서포터 등록/검증 정보 조회 | required |
| `PUT` | `/api/v1/me/supporter-registration` | 서포터 등록/검증 정보 수정 | required |
| `GET` | `/api/v1/me/supporter-profile` | 내 서포터 프로필 조회 | required |
| `PUT` | `/api/v1/me/supporter-profile` | 내 서포터 프로필 수정 | required |
| `GET` | `/api/v1/me/participations` | 내 참여/활동 이력 조회 | required |
| `GET` | `/api/v1/me/favorites` | 내 즐겨찾기 조회 | required |
| `DELETE` | `/api/v1/me/favorites/{favoriteId}` | 즐겨찾기 삭제 | required |
| `GET` | `/api/v1/me/recent-views` | 최근 본 항목 조회 | required |
| `DELETE` | `/api/v1/me/recent-views/{recentViewId}` | 최근 본 항목 단건 삭제 | required |
| `DELETE` | `/api/v1/me/recent-views` | 최근 본 항목 전체 삭제 | required |
| `GET` | `/api/v1/me/support-activity-summary` | 서포터 활동 요약 | required |

### 백엔드 구현 주의점

- 기존 handoff에는 `/users/me/*` 경로가 섞여 있었지만, 현재 프론트 v1 endpoint map은 `/me/*` 계열을 사용합니다. 백엔드와 최종 경로를 하나로 맞춰야 합니다.
- favorite/recent-view 대상은 feed/post/spot/user 중 어떤 리소스를 지원할지 명확히 해야 합니다.
- 서포터 등록 상태(`verificationStatus`)와 공개 프로필 노출 가능 상태를 분리해야 합니다.

---

## 3. Public User Profile Detail

### 왜 백엔드 작업이 더 필요한가

`src/app/(detail)/users/[id]/page.tsx`는 아직 `getMockUserProfile(id)`를 사용합니다.
공개 유저 상세는 SUPPORTER와 PARTNER 응답 shape가 다르고, 리뷰/히스토리/친구 여부 같은 파생 데이터가 필요해서 정확한 계약 없이 바로 연결하면 런타임 분기 오류가 날 수 있습니다.

### 필요한 백엔드 API

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/v1/users/{userId}/profile` | 공개 사용자 프로필 조회 | optional |
| `POST` | `/api/v1/users/{userId}/follow` | 사용자 팔로우/친구 추가 | required |
| `DELETE` | `/api/v1/users/{userId}/follow` | 사용자 팔로우/친구 해제 | required |

### 응답 shape 요구

```ts
type PublicSupporterProfile = {
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

type PublicPartnerProfile = {
    id: string;
    profileType: 'PARTNER';
    nickname: string;
    avatarUrl?: string;
    interestCategories: string[];
    isFriend: boolean;
};
```

### 백엔드 구현 주의점

- 같은 endpoint에서 `profileType` discriminator를 반드시 내려줘야 합니다.
- SUPPORTER 응답에는 `reviews`, `history`가 빈 배열이라도 포함되면 프론트 처리가 단순해집니다.
- 비로그인 접근 시 `isFriend` 같은 viewer-relative field는 `false` 또는 omitted 정책을 정해야 합니다.

---

## 4. Feed Host Management / Application Review

### 왜 백엔드 작업이 더 필요한가

이번 작업에서 피드 상세의 `FeedManagementPanel` mock fallback 렌더링을 제거했습니다.
신청 목록, 수요/달성 현황, 경쟁률 insight, 신청 수락/거절 상태를 backend에서 내려주지 않으면 host용 관리 UI를 안전하게 복구할 수 없습니다.

### 필요한 백엔드 API

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/v1/feeds/{feedId}/applications` | 피드 신청자 목록 조회 | required, host only |
| `GET` | `/api/v1/feeds/{feedId}/applications/me` | 내 신청 상태 조회 | required |
| `PATCH` | `/api/v1/feeds/{feedId}/applications/{applicationId}/accept` | 신청 수락 | required, host only |
| `PATCH` | `/api/v1/feeds/{feedId}/applications/{applicationId}/reject` | 신청 거절 | required, host only |
| `GET` | `/api/v1/feeds/{feedId}/management-flow` | host 관리 화면 통합 데이터 | required, host only |

### 필요한 응답 데이터

```ts
type FeedManagementFlow = {
    feedId: string;
    stageLabel: string;
    demand: FeedDemandSnapshot;
    applications: SupporterApplication[];
    insights: FeedCompetitionInsight[];
};
```

### 백엔드 구현 주의점

- 신청 승인 시 feed status/progress/applicantCount/confirmed partner 목록이 함께 갱신되어야 합니다.
- 거절·승인 권한은 feed author 또는 host 권한으로 제한해야 합니다.
- 신청 상태 enum은 프론트와 맞춰야 합니다: `APPLIED`, `ACCEPTED`, `REJECTED`, `CANCELLED` 계열.

---

## 5. Chat Rooms / Messages / Feed Participation 연결

### 왜 백엔드 작업이 더 필요한가

채팅은 현재 local seed store와 mock room 생성에 많이 의존합니다.
이번 feed participation에서는 fake chat room 생성을 제거하고 `/chat?tab=team&spotId=...`로만 이동하게 했습니다. 실제로 신청/수락 이후 팀 채팅방을 열려면 backend가 spot/feed와 연결된 채팅방 조회·생성 규칙을 제공해야 합니다.

### 필요한 백엔드 API

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/v1/chat/rooms` | 채팅방 목록 조회 | required |
| `POST` | `/api/v1/chat/rooms` | 개인/spot 채팅방 생성 또는 재사용 | required |
| `GET` | `/api/v1/chat/rooms/{roomId}` | 채팅방 상세 조회 | required |
| `GET` | `/api/v1/chat/rooms/{roomId}/messages` | 메시지 목록 조회 | required |
| `POST` | `/api/v1/chat/rooms/{roomId}/messages` | 메시지 전송 | required |
| `POST` | `/api/v1/chat/rooms/{roomId}/read` | 읽음 처리 | required |
| `GET` | `/api/v1/chat/rooms/by-spot/{spotId}` | spot/team 채팅방 조회 | required |
| `GET` | `/api/v1/chat/rooms/by-user/{userId}` | 개인 채팅방 조회 | required |
| `GET` | `/api/v1/chat/rooms/{roomId}/stream` | 실시간 메시지 스트림 | required |

### 백엔드 구현 주의점

- feed application이 accept될 때 spot/team room이 생성되는지, 사용자가 진입할 때 lazy create되는지 정책이 필요합니다.
- `sourceFeedId`, `spotId`, `participationRole` 관계를 응답에 포함해야 feed/detail/chat 간 이동이 끊기지 않습니다.
- vote/schedule/file/proposal/reverse-offer 메시지 타입은 일반 text 메시지와 다른 payload를 가집니다.

---

## 6. Admin Post / FAQ / Curation

### 왜 백엔드 작업이 더 필요한가

`src/app/(detail)/admin-post/page.tsx`는 FAQ와 큐레이션성 콘텐츠를 mock constant로 렌더링합니다.
운영자가 수정 가능한 공지/FAQ/큐레이션 콘텐츠라면 정적 mock이 아니라 CMS 또는 admin backend가 필요합니다.

### 필요한 백엔드 API

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin-posts` | 공지/큐레이션 목록 조회 | optional |
| `GET` | `/api/v1/admin-posts/{adminPostId}` | 공지/큐레이션 상세 조회 | optional |
| `GET` | `/api/v1/faqs` | FAQ 목록 조회 | optional |

### 백엔드 구현 주의점

- 이름은 `admin-posts`보다 public-facing이면 `contents`, `notices`, `faqs`로 분리하는 것도 가능합니다.
- FE는 현재 읽기 전용 화면이므로 MVP에서는 public read API만 있어도 mock 제거가 가능합니다.

---

## 7. Upload / Durable Image URL

### 왜 백엔드 작업이 더 필요한가

Post 작성 플로우에서 사용자가 선택한 이미지가 아직 durable upload URL로 확정되지 않으면, `URL.createObjectURL(...)` 형태의 브라우저 임시 URL이 payload에 섞일 수 있습니다.
백엔드 post create는 실제 접근 가능한 CDN/object storage URL을 받아야 합니다.

### 필요한 백엔드 API

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/v1/uploads` | 단일 파일 업로드 | required |
| `POST` | `/api/v1/uploads/batch` | 다중 파일 업로드 | required |

### 백엔드 구현 주의점

- 응답은 최소 `{ url: string }` 또는 `{ urls: string[] }`를 내려줘야 합니다.
- signed upload를 쓸 경우, `presignedUrl` 발급과 upload complete API를 별도 계약으로 정해야 합니다.
- post create API는 blob/object URL을 거부하고 durable URL만 허용하는 validation이 있으면 안전합니다.

---

## 8. Simulation / Locality / Dashboard 계열

### 왜 백엔드 작업이 더 필요한가

`src/features/simulation/**`, `src/features/locality/**`는 mock fixture와 story/demo 성격이 강합니다.
기존 handoff에서도 일부는 “제거/폐기 범위”로 분류되어 있었고, 현재 실제 서비스 API와 바로 치환하기 어렵습니다.

### 필요한 결정

| Area | Decision needed |
| --- | --- |
| Simulation run/manifest/movements/lifecycle | 실서비스 기능인지, 데모/스토리 전용인지 결정 |
| Locality region fixture | 제품에서 지역 줌아웃 기능을 유지할지 결정 |
| Dashboard/analytics mock | 운영자용 지표인지, 사용자용 화면인지 결정 |

### 백엔드 구현 주의점

- 제품 범위에서 제외한다면 backend API를 만들지 않고 FE mock/story 파일을 별도 demo 영역으로 격리하는 편이 낫습니다.
- 제품 범위로 살린다면 데이터 생성 주기, 저장 단위, 조회 필터를 먼저 정의해야 합니다.

---

## 9. 우선순위 제안

| Priority | Scope | Reason |
| --- | --- | --- |
| P0 | Pay/Point, Feed management, Chat by spot | 신청/수락/참여 후 핵심 사용자 흐름이 끊기지 않게 하는 범위 |
| P1 | My/Profile/Settings, Public user profile | 마이페이지·프로필 신뢰도와 연결되는 범위 |
| P1 | Upload durable URL | post create 이미지 payload 안정성 |
| P2 | Admin/FAQ/Curation | 읽기 전용 콘텐츠라 MVP 후순위 가능 |
| P3 | Simulation/Locality/Dashboard | 제품 유지 여부 결정이 먼저 필요 |

---

## 10. 프론트 연동 시 완료 기준

백엔드에서 위 API가 준비되면 프론트에서는 다음 기준으로 mock 제거를 완료할 수 있습니다.

- `src/features/**/api/*`에서 mock import 제거
- `src/features/**/model/mock.ts`가 runtime path에서 import되지 않음
- endpoint는 `src/lib/endpoint.ts`에만 추가
- fallback 없이 실패 시 error/empty 상태를 명확히 렌더링
- `pnpm lint`, `pnpm build`, `pnpm test -- --run` 통과
