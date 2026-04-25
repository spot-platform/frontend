# Backend Handoff Entities (Schema Only)

## Shared

### UploadFileRequest

| Field | Type   | Required | Notes                |
| ----- | ------ | -------- | -------------------- |
| file  | binary | required | multipart form field |

### UploadFileResponse

| Field | Type   | Required | Notes |
| ----- | ------ | -------- | ----- |
| url   | string | required |       |

### BatchUploadRequest

| Field | Type     | Required | Notes                      |
| ----- | -------- | -------- | -------------------------- |
| files | binary[] | required | multipart form-data fields |

### BatchUploadResponse

| Field | Type     | Required | Notes |
| ----- | -------- | -------- | ----- |
| urls  | string[] | required |       |

## Auth

### LoginRequest

| Field    | Type   | Required | Notes         |
| -------- | ------ | -------- | ------------- |
| email    | string | required |               |
| password | string | required |               |
| next     | string | optional | Redirect path |

### LoginResult

| Field        | Type   | Required | Notes                               |
| ------------ | ------ | -------- | ----------------------------------- |
| accessToken  | string | required | Short-lived JWT                     |
| refreshToken | string | required | Long-lived token for renewal        |
| userId       | string | required | Identifier coerced to string by BFF |
| redirectTo   | string | required | Safe in-app path                    |

### RefreshTokenRequest

| Field        | Type   | Required | Notes |
| ------------ | ------ | -------- | ----- |
| refreshToken | string | required |       |

### TokenRefreshResult

| Field       | Type   | Required | Notes               |
| ----------- | ------ | -------- | ------------------- |
| accessToken | string | required | New short-lived JWT |

### LogoutResult

| Field | Type    | Required | Notes |
| ----- | ------- | -------- | ----- |
| ok    | boolean | required |       |

## Spot

### SpotType (enum)

| Value   | Notes |
| ------- | ----- |
| OFFER   |       |
| REQUEST |       |

### SpotStatus (enum)

| Value     | Notes |
| --------- | ----- |
| OPEN      |       |
| MATCHED   |       |
| CLOSED    |       |
| CANCELLED |       |

### ParticipantRole (enum)

| Value       | Notes |
| ----------- | ----- |
| AUTHOR      |       |
| PARTICIPANT |       |

### Spot

| Field          | Type       | Required | Notes    |
| -------------- | ---------- | -------- | -------- |
| id             | string     | required |          |
| type           | SpotType   | required |          |
| status         | SpotStatus | required |          |
| title          | string     | required |          |
| description    | string     | required |          |
| pointCost      | number     | required |          |
| authorId       | string     | required |          |
| authorNickname | string     | required |          |
| createdAt      | string     | required | ISO 8601 |
| updatedAt      | string     | required | ISO 8601 |

### TimelineEventKind (enum)

| Value     | Notes |
| --------- | ----- |
| CREATED   |       |
| MATCHED   |       |
| COMPLETED |       |
| CANCELLED |       |
| COMMENT   |       |

### TimelineEvent

| Field         | Type              | Required | Notes    |
| ------------- | ----------------- | -------- | -------- |
| id            | string            | required |          |
| kind          | TimelineEventKind | required |          |
| actorId       | string            | required |          |
| actorNickname | string            | required |          |
| content       | string            | optional |          |
| createdAt     | string            | required | ISO 8601 |

### SpotDetail

| Field          | Type            | Required | Notes    |
| -------------- | --------------- | -------- | -------- |
| id             | string          | required |          |
| type           | SpotType        | required |          |
| status         | SpotStatus      | required |          |
| title          | string          | required |          |
| description    | string          | required |          |
| pointCost      | number          | required |          |
| authorId       | string          | required |          |
| authorNickname | string          | required |          |
| createdAt      | string          | required | ISO 8601 |
| updatedAt      | string          | required | ISO 8601 |
| timeline       | TimelineEvent[] | required |          |

### SpotParticipant

| Field    | Type            | Required | Notes    |
| -------- | --------------- | -------- | -------- |
| userId   | string          | required |          |
| nickname | string          | required |          |
| role     | ParticipantRole | required |          |
| joinedAt | string          | required | ISO 8601 |

### ScheduleSlot

| Field            | Type     | Required | Notes               |
| ---------------- | -------- | -------- | ------------------- |
| date             | string   | required | ISO date YYYY-MM-DD |
| hour             | number   | required | 0 to 23             |
| availableUserIds | string[] | required |                     |

### SpotSchedule

| Field         | Type           | Required | Notes |
| ------------- | -------------- | -------- | ----- |
| spotId        | string         | required |       |
| proposedSlots | ScheduleSlot[] | required |       |
| confirmedSlot | ScheduleSlot   | optional |       |

### VoteOption

| Field    | Type     | Required | Notes |
| -------- | -------- | -------- | ----- |
| id       | string   | required |       |
| label    | string   | required |       |
| voterIds | string[] | required |       |

### SpotVote

| Field       | Type         | Required | Notes    |
| ----------- | ------------ | -------- | -------- |
| id          | string       | required |          |
| spotId      | string       | required |          |
| question    | string       | required |          |
| options     | VoteOption[] | required |          |
| multiSelect | boolean      | required |          |
| closedAt    | string       | optional | ISO 8601 |

### ChecklistItem

| Field            | Type    | Required | Notes |
| ---------------- | ------- | -------- | ----- |
| id               | string  | required |       |
| text             | string  | required |       |
| completed        | boolean | required |       |
| assigneeId       | string  | optional |       |
| assigneeNickname | string  | optional |       |

### SpotChecklist

| Field  | Type            | Required | Notes |
| ------ | --------------- | -------- | ----- |
| spotId | string          | required |       |
| items  | ChecklistItem[] | required |       |

### SharedFile

| Field            | Type   | Required | Notes    |
| ---------------- | ------ | -------- | -------- |
| id               | string | required |          |
| spotId           | string | required |          |
| uploaderNickname | string | required |          |
| name             | string | required |          |
| url              | string | required |          |
| sizeBytes        | number | required |          |
| uploadedAt       | string | required | ISO 8601 |

### ProgressNote

| Field          | Type   | Required | Notes    |
| -------------- | ------ | -------- | -------- |
| id             | string | required |          |
| spotId         | string | required |          |
| authorNickname | string | required |          |
| content        | string | required |          |
| createdAt      | string | required | ISO 8601 |

### SpotReview

| Field            | Type   | Required | Notes    |
| ---------------- | ------ | -------- | -------- |
| id               | string | required |          |
| spotId           | string | required |          |
| reviewerNickname | string | required |          |
| targetNickname   | string | required |          |
| rating           | number | required | 1 to 5   |
| comment          | string | optional |          |
| createdAt        | string | required | ISO 8601 |

### CreateSpotRequest

| Field       | Type     | Required | Notes |
| ----------- | -------- | -------- | ----- |
| type        | SpotType | required |       |
| title       | string   | required |       |
| description | string   | required |       |
| pointCost   | number   | required |       |

### UpsertSpotScheduleRequest

| Field | Type           | Required | Notes |
| ----- | -------------- | -------- | ----- |
| slots | ScheduleSlot[] | required |       |

### CreateSpotVoteRequest

| Field       | Type     | Required | Notes |
| ----------- | -------- | -------- | ----- |
| question    | string   | required |       |
| options     | string[] | required |       |
| multiSelect | boolean  | optional |       |

### CastSpotVoteRequest

| Field     | Type     | Required | Notes |
| --------- | -------- | -------- | ----- |
| optionIds | string[] | required |       |

### UpsertSpotChecklistRequest

| Field | Type            | Required | Notes |
| ----- | --------------- | -------- | ----- |
| items | ChecklistItem[] | required |       |

### UploadSpotFilesRequest

| Field | Type     | Required | Notes                      |
| ----- | -------- | -------- | -------------------------- |
| files | binary[] | required | multipart form-data fields |

### CreateSpotNoteRequest

| Field   | Type   | Required | Notes |
| ------- | ------ | -------- | ----- |
| content | string | required |       |

### CreateSpotReviewRequest

| Field          | Type   | Required | Notes  |
| -------------- | ------ | -------- | ------ |
| targetNickname | string | required |        |
| rating         | number | required | 1 to 5 |
| comment        | string | optional |        |

## My and User

### ProfileType (enum)

| Value     | Notes |
| --------- | ----- |
| SUPPORTER |       |
| PARTNER   |       |

### UserProfile

| Field        | Type   | Required | Notes    |
| ------------ | ------ | -------- | -------- |
| id           | string | required |          |
| nickname     | string | required |          |
| email        | string | required |          |
| phone        | string | optional |          |
| avatarUrl    | string | optional |          |
| pointBalance | number | required |          |
| joinedAt     | string | required | ISO 8601 |

### UserPersonaRole (enum)

| Value     | Notes                          |
| --------- | ------------------------------ |
| SUPPORTER | 모임을 여는 역할 (호스트 계열) |
| PARTNER   | 모임에 참여하는 역할           |

> `ProfileType`과 값이 같지만 의미 축이 다르다. `UserPersonaRole`은 온보딩에서 유저가 선택한 페르소나 역할이며 `person_fitness_score` 입력으로 쓰인다.

### UserPersona

> 온보딩 위저드 결과. `PersonaArchetype`은 Simulation 섹션의 동일 enum을 공유한다. `interests`는 Feed 섹션의 `FeedCategory` 값 배열(`"음악" | "요리" | "운동" | "공예" | "언어" | "기타"`)이지만 BE 저장/수신 시 `string[]`로 취급한다.

| Field     | Type             | Required | Notes                                                 |
| --------- | ---------------- | -------- | ----------------------------------------------------- |
| userId    | string           | required |                                                       |
| role      | UserPersonaRole  | required | SUPPORTER \| PARTNER                                  |
| archetype | PersonaArchetype | required | explorer \| helper \| creator \| connector \| learner |
| interests | string[]         | required | FeedCategory 값 배열. 빈 배열 허용.                   |
| createdAt | string           | required | ISO 8601                                              |

### PasswordChangePayload

| Field           | Type   | Required | Notes |
| --------------- | ------ | -------- | ----- |
| currentPassword | string | required |       |
| newPassword     | string | required |       |
| confirmPassword | string | required |       |

### NotificationSettings

| Field                | Type    | Required | Notes    |
| -------------------- | ------- | -------- | -------- |
| serviceNoticeEnabled | boolean | required |          |
| activityEnabled      | boolean | required |          |
| pushEnabled          | boolean | required |          |
| emailEnabled         | boolean | required |          |
| updatedAt            | string  | required | ISO 8601 |

### SupporterRegistrationStatus (enum)

| Value         | Notes |
| ------------- | ----- |
| NOT_SUBMITTED |       |
| PENDING       |       |
| VERIFIED      |       |
| REJECTED      |       |

### SupporterRegistration

| Field              | Type                        | Required | Notes    |
| ------------------ | --------------------------- | -------- | -------- |
| field              | string                      | required |          |
| mediaUrls          | string[]                    | required |          |
| career             | string                      | required |          |
| bio                | string                      | required |          |
| verificationStatus | SupporterRegistrationStatus | required |          |
| verificationNotes  | string                      | required |          |
| extraNotes         | string                      | required |          |
| updatedAt          | string                      | optional | ISO 8601 |

### Participation

| Field     | Type            | Required | Notes    |
| --------- | --------------- | -------- | -------- |
| spotId    | string          | required |          |
| spotTitle | string          | required |          |
| spotType  | SpotType        | required |          |
| role      | ParticipantRole | required |          |
| status    | SpotStatus      | required |          |
| joinedAt  | string          | required | ISO 8601 |

### MySpot

My spot list card entity for the My page. `role=AUTHOR` means the authenticated user authored the spot. `role=PARTICIPANT` means the authenticated user joined a spot authored by another user.

| Field          | Type            | Required | Notes                                     |
| -------------- | --------------- | -------- | ----------------------------------------- |
| id             | string          | required |                                           |
| type           | SpotType        | required |                                           |
| status         | SpotStatus      | required |                                           |
| title          | string          | required |                                           |
| description    | string          | required |                                           |
| pointCost      | number          | required |                                           |
| authorId       | string          | required | `role=AUTHOR`이면 인증 사용자 id          |
| authorNickname | string          | required |                                           |
| role           | ParticipantRole | required | Current user's relationship role          |
| joinedAt       | string          | optional | ISO 8601, present when `role=PARTICIPANT` |
| createdAt      | string          | required | ISO 8601                                  |
| updatedAt      | string          | required | ISO 8601                                  |

### ProfileReview

| Field            | Type   | Required | Notes    |
| ---------------- | ------ | -------- | -------- |
| id               | string | required |          |
| reviewerNickname | string | required |          |
| rating           | number | required | 1 to 5   |
| comment          | string | optional |          |
| spotTitle        | string | required |          |
| createdAt        | string | required | ISO 8601 |

### ProfileHistory

| Field       | Type     | Required | Notes    |
| ----------- | -------- | -------- | -------- |
| spotId      | string   | required |          |
| spotTitle   | string   | required |          |
| spotType    | SpotType | required |          |
| completedAt | string   | required | ISO 8601 |
| reviewCount | number   | required |          |
| avgRating   | number   | optional |          |

### SupporterProfile

| Field       | Type             | Required | Notes     |
| ----------- | ---------------- | -------- | --------- |
| id          | string           | required |           |
| profileType | ProfileType      | required | SUPPORTER |
| nickname    | string           | required |           |
| avatarUrl   | string           | optional |           |
| field       | string           | required |           |
| mediaUrls   | string[]         | required |           |
| career      | string           | required |           |
| bio         | string           | required |           |
| avgRating   | number           | required |           |
| reviewCount | number           | required |           |
| reviews     | ProfileReview[]  | required |           |
| history     | ProfileHistory[] | required |           |

### PartnerProfile

| Field              | Type        | Required | Notes   |
| ------------------ | ----------- | -------- | ------- |
| id                 | string      | required |         |
| profileType        | ProfileType | required | PARTNER |
| nickname           | string      | required |         |
| avatarUrl          | string      | optional |         |
| interestCategories | string[]    | required |         |
| isFriend           | boolean     | required |         |

### MyFavoriteItem

| Field          | Type       | Required | Notes    |
| -------------- | ---------- | -------- | -------- |
| id             | string     | required |          |
| targetId       | string     | required |          |
| title          | string     | required |          |
| description    | string     | optional |          |
| type           | SpotType   | required |          |
| savedAt        | string     | required | ISO 8601 |
| pointCost      | number     | optional |          |
| authorNickname | string     | optional |          |
| status         | SpotStatus | optional |          |

### MyRecentViewItem

| Field          | Type       | Required | Notes    |
| -------------- | ---------- | -------- | -------- |
| id             | string     | required |          |
| targetId       | string     | required |          |
| title          | string     | required |          |
| description    | string     | optional |          |
| type           | SpotType   | required |          |
| viewedAt       | string     | required | ISO 8601 |
| pointCost      | number     | optional |          |
| authorNickname | string     | optional |          |
| status         | SpotStatus | optional |          |

### MySupportActivitySummary

| Field          | Type          | Required | Notes |
| -------------- | ------------- | -------- | ----- |
| avgRating      | number        | required |       |
| reviewCount    | number        | required |       |
| completedCount | number        | required |       |
| latestReview   | ProfileReview | optional |       |

### UpdateMyProfileRequest

| Field     | Type   | Required | Notes |
| --------- | ------ | -------- | ----- |
| avatarUrl | string | optional |       |
| nickname  | string | optional |       |
| email     | string | optional |       |
| phone     | string | optional |       |

### UpdateNotificationSettingsRequest

| Field                | Type    | Required | Notes |
| -------------------- | ------- | -------- | ----- |
| serviceNoticeEnabled | boolean | required |       |
| activityEnabled      | boolean | required |       |
| pushEnabled          | boolean | required |       |
| emailEnabled         | boolean | required |       |

### UpdateSupporterRegistrationRequest

| Field              | Type                        | Required | Notes |
| ------------------ | --------------------------- | -------- | ----- |
| field              | string                      | required |       |
| mediaUrls          | string[]                    | required |       |
| career             | string                      | required |       |
| bio                | string                      | required |       |
| verificationStatus | SupporterRegistrationStatus | optional |       |
| verificationNotes  | string                      | optional |       |
| extraNotes         | string                      | optional |       |

### UpdateSupporterProfileRequest

| Field     | Type     | Required | Notes |
| --------- | -------- | -------- | ----- |
| field     | string   | required |       |
| mediaUrls | string[] | required |       |
| career    | string   | required |       |
| bio       | string   | required |       |

## Pay

### PointTransactionType (enum)

| Value    | Notes |
| -------- | ----- |
| CHARGE   |       |
| USE      |       |
| REFUND   |       |
| WITHDRAW |       |

### PointTransaction

| Field        | Type                 | Required | Notes    |
| ------------ | -------------------- | -------- | -------- |
| id           | string               | required |          |
| type         | PointTransactionType | required |          |
| amount       | number               | required |          |
| balanceAfter | number               | required |          |
| description  | string               | required |          |
| createdAt    | string               | required | ISO 8601 |

### PointBalance

| Field     | Type   | Required | Notes    |
| --------- | ------ | -------- | -------- |
| balance   | number | required |          |
| updatedAt | string | required | ISO 8601 |

### LinkedBankAccount

| Field         | Type   | Required | Notes    |
| ------------- | ------ | -------- | -------- |
| bankName      | string | required |          |
| accountNumber | string | required |          |
| accountHolder | string | required |          |
| updatedAt     | string | required | ISO 8601 |

### PointWithdrawalStatus (enum)

| Value     | Notes |
| --------- | ----- |
| PENDING   |       |
| COMPLETED |       |
| REJECTED  |       |

### PointWithdrawal

| Field       | Type                  | Required | Notes    |
| ----------- | --------------------- | -------- | -------- |
| id          | string                | required |          |
| amount      | number                | required |          |
| status      | PointWithdrawalStatus | required |          |
| requestedAt | string                | required | ISO 8601 |

### LinkBankAccountRequest

| Field         | Type   | Required | Notes |
| ------------- | ------ | -------- | ----- |
| bankName      | string | required |       |
| accountNumber | string | required |       |
| accountHolder | string | required |       |

### ChargePointsRequest

| Field  | Type   | Required | Notes |
| ------ | ------ | -------- | ----- |
| amount | number | required |       |

### WithdrawPointsRequest

| Field  | Type   | Required | Notes |
| ------ | ------ | -------- | ----- |
| amount | number | required |       |

## Feed

### FeedItemType (enum)

| Value   | Notes |
| ------- | ----- |
| OFFER   |       |
| REQUEST |       |

### FeedTabType (enum)

| Value   | Notes |
| ------- | ----- |
| HOME    |       |
| EXPLORE |       |

### FeedItemStatus (enum)

| Value   | Notes |
| ------- | ----- |
| OPEN    |       |
| MATCHED |       |
| CLOSED  |       |

### FeedCategory (enum)

| Value | Notes |
| ----- | ----- |
| 음악  |       |
| 요리  |       |
| 운동  |       |
| 공예  |       |
| 언어  |       |
| 기타  |       |

### FeedAuthorRole (enum)

| Value     | Notes                       |
| --------- | --------------------------- |
| SUPPORTER | Activity organizer/provider |
| PARTNER   | Activity seeker/requester   |

### FeedAuthorProfile

| Field     | Type           | Required | Notes                     |
| --------- | -------------- | -------- | ------------------------- |
| id        | string         | required |                           |
| nickname  | string         | required |                           |
| avatarUrl | string         | optional |                           |
| role      | FeedAuthorRole | required |                           |
| rating    | number         | optional | SUPPORTER only, 0 to 5    |
| field     | string         | optional | SUPPORTER only (category) |

### FeedItem

| Field                    | Type                     | Required | Notes                                          |
| ------------------------ | ------------------------ | -------- | ---------------------------------------------- |
| id                       | string                   | required |                                                |
| title                    | string                   | required |                                                |
| description              | string                   | optional | Card/detail body summary                       |
| location                 | string                   | required |                                                |
| authorNickname           | string                   | required |                                                |
| authorProfile            | FeedAuthorProfile        | optional |                                                |
| price                    | number                   | required |                                                |
| type                     | FeedItemType             | required |                                                |
| status                   | FeedItemStatus           | required |                                                |
| progressPercent          | number                   | optional | OFFER only, 0 to 100                           |
| imageUrl                 | string                   | optional |                                                |
| views                    | number                   | required |                                                |
| likes                    | number                   | required |                                                |
| partnerCount             | number                   | optional | OFFER: confirmed partner count                 |
| applicantCount           | number                   | optional | REQUEST: applicant count                       |
| confirmedPartnerProfiles | FeedParticipantProfile[] | optional | 카드 아바타 스크롤용, 목록 API에서 함께 내려줌 |
| category                 | FeedCategory             | optional |                                                |
| deadline                 | string                   | optional | ISO date                                       |
| maxParticipants          | number                   | optional |                                                |
| isBookmarked             | boolean                  | optional |                                                |
| myApplicationStatus      | FeedApplicationStatus    | optional | 인증된 사용자의 신청 상태. 미신청 시 omitted   |
| spotId                   | string                   | optional | 연결된 Spot id. 있으면 맵 프리뷰/점수 조회 키  |

### SupporterItem

| Field          | Type         | Required | Notes  |
| -------------- | ------------ | -------- | ------ |
| id             | string       | required |        |
| nickname       | string       | required |        |
| avatarUrl      | string       | optional |        |
| category       | FeedCategory | required |        |
| tagline        | string       | required |        |
| tags           | string[]     | required |        |
| completedCount | number       | required |        |
| rating         | number       | required | 0 to 5 |
| location       | string       | required |        |
| relatedOfferId | string       | optional |        |

### FeedApplicationStatus (enum)

| Value     | Notes                          |
| --------- | ------------------------------ |
| APPLIED   | 신청 완료, 호스트 검토 대기 중 |
| ACCEPTED  | 호스트가 수락, 파트너로 확정   |
| REJECTED  | 호스트가 거절                  |
| CANCELLED | 신청자가 직접 취소             |

### FeedApplication

| Field     | Type                  | Required | Notes        |
| --------- | --------------------- | -------- | ------------ |
| id        | string                | required |              |
| feedId    | string                | required |              |
| userId    | string                | required |              |
| proposal  | string                | required | 신청 메시지  |
| status    | FeedApplicationStatus | required |              |
| createdAt | string                | required | ISO datetime |

### SupporterApplicationStatus (enum)

| Value     | Notes |
| --------- | ----- |
| LEADING   |       |
| REVIEWING |       |
| WAITING   |       |

### SupporterApplication

| Field            | Type                       | Required | Notes  |
| ---------------- | -------------------------- | -------- | ------ |
| id               | string                     | required |        |
| nickname         | string                     | required |        |
| avatarUrl        | string                     | optional |        |
| category         | FeedCategory               | required |        |
| tagline          | string                     | required |        |
| tags             | string[]                   | required |        |
| completedCount   | number                     | required |        |
| rating           | number                     | required | 0 to 5 |
| location         | string                     | required |        |
| relatedOfferId   | string                     | optional |        |
| proposal         | string                     | required |        |
| competitionScore | number                     | required |        |
| status           | SupporterApplicationStatus | required |        |
| relatedRequestId | string                     | optional |        |

### FeedParticipantProfile

| Field     | Type   | Required | Notes |
| --------- | ------ | -------- | ----- |
| id        | string | required |       |
| nickname  | string | required |       |
| avatarUrl | string | optional |       |

### FeedDemandSnapshot

| Field                    | Type                     | Required | Notes |
| ------------------------ | ------------------------ | -------- | ----- |
| fundingGoal              | number                   | required |       |
| fundedAmount             | number                   | required |       |
| requiredPartners         | number                   | required |       |
| confirmedPartners        | number                   | required |       |
| confirmedPartnerProfiles | FeedParticipantProfile[] | required |       |
| partnerSlotLabels        | string[]                 | optional |       |
| deadlineLabel            | string                   | required |       |
| hostNote                 | string                   | required |       |
| currentAmountLabel       | string                   | optional |       |
| targetAmountLabel        | string                   | optional |       |
| progressLabel            | string                   | optional |       |

### FeedCompetitionInsightTone (enum)

| Value   | Notes |
| ------- | ----- |
| brand   |       |
| accent  |       |
| neutral |       |

### FeedCompetitionInsight

| Field | Type                       | Required | Notes |
| ----- | -------------------------- | -------- | ----- |
| label | string                     | required |       |
| value | string                     | required |       |
| tone  | FeedCompetitionInsightTone | optional |       |

### FeedManagementFlow

| Field        | Type                     | Required | Notes |
| ------------ | ------------------------ | -------- | ----- |
| feedId       | string                   | required |       |
| stageLabel   | string                   | required |       |
| demand       | FeedDemandSnapshot       | required |       |
| applications | SupporterApplication[]   | required |       |
| insights     | FeedCompetitionInsight[] | required |       |

### FeedApplyRequest

| Field    | Type   | Required | Notes       |
| -------- | ------ | -------- | ----------- |
| proposal | string | required | 신청 메시지 |

### FeedApplyResponse

| Field | Type            | Required | Notes |
| ----- | --------------- | -------- | ----- |
| data  | FeedApplication | required |       |

### FeedAcceptApplicationRequest

No body required.

### FeedRejectApplicationRequest

No body required.

### FeedLikeResponse

No body returned (204).

### FeedApplicationListResponse

| Field | Type              | Required | Notes |
| ----- | ----------------- | -------- | ----- |
| data  | FeedApplication[] | required |       |
| meta  | ApiResponseMeta   | optional |       |

## Post

### PostType (enum)

| Value   | Notes |
| ------- | ----- |
| OFFER   |       |
| REQUEST |       |

### PostSpotCategory (enum)

| Value     | Notes |
| --------- | ----- |
| 음식·요리 |       |
| BBQ·조개  |       |
| 공동구매  |       |
| 교육      |       |
| 운동      |       |
| 공예      |       |
| 음악      |       |
| 기타      |       |

### CreateOfferPostRequest

| Field             | Type               | Required | Notes                             |
| ----------------- | ------------------ | -------- | --------------------------------- |
| type              | PostType           | required | OFFER                             |
| spotName          | string             | required |                                   |
| title             | string             | required |                                   |
| content           | string             | required |                                   |
| categories        | PostSpotCategory[] | required |                                   |
| photoUrls         | string[]           | required |                                   |
| pointCost         | number             | required |                                   |
| location          | string             | required | 활동 위치 (예: 마포구 합정동)     |
| deadline          | string             | required | 모집 마감일 ISO date (YYYY-MM-DD) |
| detailDescription | string             | required |                                   |
| supporterPhotoUrl | string             | optional |                                   |
| qualifications    | string             | optional | 원하는 서포터 자격/조건           |
| desiredPrice      | number             | required | 희망 예산 (원 단위)               |
| maxPartnerCount   | number             | required | 최대 파트너 수 (1 이상)           |
| autoClose         | boolean            | required | 정원 도달 시 자동 마감 여부       |

### CreateRequestPostRequest

| Field                | Type               | Required | Notes                             |
| -------------------- | ------------------ | -------- | --------------------------------- |
| type                 | PostType           | required | REQUEST                           |
| spotName             | string             | required |                                   |
| title                | string             | required |                                   |
| content              | string             | required |                                   |
| categories           | PostSpotCategory[] | required |                                   |
| photoUrls            | string[]           | required |                                   |
| pointCost            | number             | required |                                   |
| location             | string             | required | 활동 위치 (예: 서초구 방배동)     |
| deadline             | string             | required | 모집 마감일 ISO date (YYYY-MM-DD) |
| detailDescription    | string             | required |                                   |
| serviceStylePhotoUrl | string             | optional |                                   |
| preferredSchedule    | string             | optional | 선호 일정 힌트 (예: 주말 오전)    |
| maxPartnerCount      | number             | required | 최대 파트너 수 (1 이상)           |
| priceCapPerPerson    | number             | required | 1인당 최대 금액 (원 단위)         |

### PostCompletion

| Field       | Type     | Required | Notes |
| ----------- | -------- | -------- | ----- |
| id          | string   | required |       |
| type        | PostType | required |       |
| title       | string   | required |       |
| redirectUrl | string   | required |       |

> File upload schemas (`UploadFileRequest`, `UploadFileResponse`, `BatchUploadRequest`, `BatchUploadResponse`) are defined in the **Shared** section above.

## Chat

### ChatRoomCategory (enum)

| Value    | Notes |
| -------- | ----- |
| personal |       |
| spot     |       |

### PersonalCounterpartRole (enum)

| Value     | Notes |
| --------- | ----- |
| SUPPORTER |       |
| PARTNER   |       |

### ChatMessageKind (enum)

| Value         | Notes                                      |
| ------------- | ------------------------------------------ |
| system        |                                            |
| message       |                                            |
| vote          |                                            |
| schedule      |                                            |
| file          |                                            |
| shortcut      | 스팟 액션 경량 카드 (UI-only, 서버 미발행) |
| reverse-offer |                                            |
| proposal      |                                            |

### ChatFriend

| Field         | Type                    | Required | Notes |
| ------------- | ----------------------- | -------- | ----- |
| id            | string                  | required |       |
| name          | string                  | required |       |
| role          | PersonalCounterpartRole | required |       |
| presenceLabel | string                  | required |       |

### ChatScheduleDraft

| Field       | Type   | Required | Notes    |
| ----------- | ------ | -------- | -------- |
| id          | string | required |          |
| spotId      | string | required |          |
| title       | string | required |          |
| description | string | required |          |
| metaLabel   | string | required |          |
| createdAt   | string | required | ISO 8601 |

### ChatProposalAmountRange

| Field | Type   | Required | Notes |
| ----- | ------ | -------- | ----- |
| min   | number | required |       |
| max   | number | required |       |

### ChatProposal

| Field           | Type                    | Required | Notes                |
| --------------- | ----------------------- | -------- | -------------------- |
| suggestedAmount | number                  | required |                      |
| amountRange     | ChatProposalAmountRange | optional |                      |
| availableDates  | string[]                | required | ISO dates as strings |
| description     | string                  | required |                      |

### ChatProposalStatus (enum)

| Value       | Notes |
| ----------- | ----- |
| PENDING     |       |
| ACCEPTED    |       |
| NEGOTIATING |       |
| DECLINED    |       |

### SpotChatParticipationRole (enum)

| Value     | Notes |
| --------- | ----- |
| SUPPORTER |       |
| PARTNER   |       |

### ChatReverseOfferStatus (enum)

| Value                  | Notes |
| ---------------------- | ----- |
| PARTNER_REVIEW         |       |
| ADMIN_APPROVAL_PENDING |       |

### ChatReverseOfferFinancialSource (enum)

| Value      | Notes               |
| ---------- | ------------------- |
| management | 관리 기준 금액 소스 |
| estimated  | 추정 기준 금액 소스 |

### ChatReverseOfferFinancialSnapshot

역제안 금액 정산 스냅샷. 협의된 금액과 현재 금액을 비교한다.

| Field                  | Type                            | Required | Notes                                   |
| ---------------------- | ------------------------------- | -------- | --------------------------------------- |
| sourceKind             | ChatReverseOfferFinancialSource | required |                                         |
| targetAmount           | number                          | required |                                         |
| agreedHeadcount        | number                          | required | 협의 당시 인원                          |
| currentHeadcount       | number                          | required | 현재 확정 인원                          |
| agreedPerPersonAmount  | number                          | required |                                         |
| agreedRemainder        | number                          | required |                                         |
| currentPerPersonAmount | number                          | required |                                         |
| currentRemainder       | number                          | required |                                         |
| comparisonNeeded       | boolean                         | required | 협의 금액 대비 현재 금액 비교 필요 여부 |

### ChatReverseOfferSummary

| Field                       | Type                              | Required | Notes                   |
| --------------------------- | --------------------------------- | -------- | ----------------------- |
| id                          | string                            | required |                         |
| spotId                      | string                            | required |                         |
| status                      | ChatReverseOfferStatus            | required |                         |
| approvedPartnerCount        | number                            | required |                         |
| totalPartnerCount           | number                            | required |                         |
| priorAgreementReachedInChat | boolean                           | required |                         |
| financialSnapshot           | ChatReverseOfferFinancialSnapshot | optional | 역제안 금액 정산 스냅샷 |
| createdAt                   | string                            | required | ISO 8601                |
| updatedAt                   | string                            | required | ISO 8601                |

### ChatMessageSystem

| Field     | Type            | Required | Notes  |
| --------- | --------------- | -------- | ------ |
| id        | string          | required |        |
| kind      | ChatMessageKind | required | system |
| createdAt | string          | required |        |
| content   | string          | required |        |

### ChatMessageText

| Field      | Type            | Required | Notes   |
| ---------- | --------------- | -------- | ------- |
| id         | string          | required |         |
| kind       | ChatMessageKind | required | message |
| createdAt  | string          | required |         |
| authorId   | string          | required |         |
| authorName | string          | required |         |
| content    | string          | required |         |

### ChatMessageVote

| Field      | Type            | Required | Notes                   |
| ---------- | --------------- | -------- | ----------------------- |
| id         | string          | required |                         |
| kind       | ChatMessageKind | required | vote                    |
| createdAt  | string          | required |                         |
| authorId   | string          | required |                         |
| authorName | string          | required |                         |
| vote       | SpotVote        | required | Full nested vote object |

### ChatMessageSchedule

| Field      | Type              | Required | Notes    |
| ---------- | ----------------- | -------- | -------- |
| id         | string            | required |          |
| kind       | ChatMessageKind   | required | schedule |
| createdAt  | string            | required |          |
| authorId   | string            | required |          |
| authorName | string            | required |          |
| schedule   | ChatScheduleDraft | required |          |

### ChatMessageFile

| Field      | Type            | Required | Notes |
| ---------- | --------------- | -------- | ----- |
| id         | string          | required |       |
| kind       | ChatMessageKind | required | file  |
| createdAt  | string          | required |       |
| authorId   | string          | required |       |
| authorName | string          | required |       |
| file       | SharedFile      | required |       |

### ChatMessageShortcut

경량 카드 형태로 스팟 액션(투표·일정·파일)을 채팅 스트림에 표시한다. 탭 시 nav 확장 패널을 열어 수정/제출한다.

| Field               | Type            | Required | Notes                          |
| ------------------- | --------------- | -------- | ------------------------------ |
| id                  | string          | required |                                |
| kind                | ChatMessageKind | required | shortcut                       |
| createdAt           | string          | required |                                |
| authorId            | string          | required |                                |
| authorName          | string          | required |                                |
| shortcut.actionKind | string          | required | `vote` \| `schedule` \| `file` |
| shortcut.actionId   | string          | required | 연결된 액션 ID                 |
| shortcut.label      | string          | required | 칩 레이블 (예: "투표")         |
| shortcut.title      | string          | required | 카드 제목                      |
| shortcut.preview    | string          | required | 카드 미리보기 텍스트           |

### ChatMessageReverseOffer

| Field        | Type                    | Required | Notes         |
| ------------ | ----------------------- | -------- | ------------- |
| id           | string                  | required |               |
| kind         | ChatMessageKind         | required | reverse-offer |
| createdAt    | string                  | required |               |
| authorId     | string                  | required |               |
| authorName   | string                  | required |               |
| reverseOffer | ChatReverseOfferSummary | required |               |

### ChatMessageProposal

| Field      | Type               | Required | Notes    |
| ---------- | ------------------ | -------- | -------- |
| id         | string             | required |          |
| kind       | ChatMessageKind    | required | proposal |
| createdAt  | string             | required |          |
| authorId   | string             | required |          |
| authorName | string             | required |          |
| proposal   | ChatProposal       | required |          |
| status     | ChatProposalStatus | required |          |

### ChatMessage

| Field     | Type            | Required | Notes |
| --------- | --------------- | -------- | ----- |
| id        | string          | required |       |
| kind      | ChatMessageKind | required |       |
| createdAt | string          | required |       |

### ChatRoomBase

| Field           | Type             | Required | Notes                 |
| --------------- | ---------------- | -------- | --------------------- |
| id              | string           | required |                       |
| category        | ChatRoomCategory | required |                       |
| currentUserId   | string           | required |                       |
| currentUserName | string           | required |                       |
| title           | string           | required |                       |
| subtitle        | string           | required |                       |
| description     | string           | required |                       |
| metaLabel       | string           | required |                       |
| updatedAt       | string           | required | ISO 8601              |
| messages        | ChatMessage[]    | required | Includes all variants |

### PersonalChatRoom

| Field           | Type                    | Required | Notes                 |
| --------------- | ----------------------- | -------- | --------------------- |
| id              | string                  | required |                       |
| category        | string                  | required | Always "personal"     |
| currentUserId   | string                  | required |                       |
| currentUserName | string                  | required |                       |
| title           | string                  | required |                       |
| subtitle        | string                  | required |                       |
| description     | string                  | required |                       |
| metaLabel       | string                  | required |                       |
| updatedAt       | string                  | required | ISO 8601              |
| messages        | ChatMessage[]           | required | Includes all variants |
| partnerId       | string                  | required |                       |
| partnerName     | string                  | required |                       |
| presenceLabel   | string                  | required |                       |
| unreadCount     | number                  | required |                       |
| counterpartRole | PersonalCounterpartRole | required |                       |

### SpotChatRoom

| Field             | Type                      | Required | Notes                 |
| ----------------- | ------------------------- | -------- | --------------------- |
| id                | string                    | required |                       |
| category          | string                    | required | Always "spot"         |
| currentUserId     | string                    | required |                       |
| currentUserName   | string                    | required |                       |
| title             | string                    | required |                       |
| subtitle          | string                    | required |                       |
| description       | string                    | required |                       |
| metaLabel         | string                    | required |                       |
| updatedAt         | string                    | required | ISO 8601              |
| messages          | ChatMessage[]             | required | Includes all variants |
| spot              | SpotDetailFull            | required |                       |
| reverseOffer      | ChatReverseOfferSummary   | optional |                       |
| sourceFeedId      | string                    | optional |                       |
| participationRole | SpotChatParticipationRole | optional |                       |

### SpotDetailFull

| Field          | Type              | Required | Notes    |
| -------------- | ----------------- | -------- | -------- |
| id             | string            | required |          |
| type           | SpotType          | required |          |
| status         | SpotStatus        | required |          |
| title          | string            | required |          |
| description    | string            | required |          |
| pointCost      | number            | required |          |
| authorId       | string            | required |          |
| authorNickname | string            | required |          |
| createdAt      | string            | required | ISO 8601 |
| updatedAt      | string            | required | ISO 8601 |
| timeline       | TimelineEvent[]   | required |          |
| participants   | SpotParticipant[] | required |          |
| schedule       | SpotSchedule      | optional |          |
| votes          | SpotVote[]        | required |          |
| checklist      | SpotChecklist     | optional |          |
| files          | SharedFile[]      | required |          |
| notes          | ProgressNote[]    | required |          |
| reviews        | SpotReview[]      | required |          |

### CreateChatRoomRequest

| Field    | Type             | Required | Notes                               |
| -------- | ---------------- | -------- | ----------------------------------- |
| category | ChatRoomCategory | required |                                     |
| userId   | string           | optional | Required for personal room creation |
| spotId   | string           | optional | Required for spot room creation     |

### SendChatMessageRequest

| Field        | Type                    | Required | Notes                           |
| ------------ | ----------------------- | -------- | ------------------------------- |
| kind         | ChatMessageKind         | required |                                 |
| content      | string                  | optional | Used for text messages          |
| voteId       | string                  | optional |                                 |
| scheduleId   | string                  | optional |                                 |
| fileId       | string                  | optional |                                 |
| proposal     | ChatProposal            | optional | Used for proposal messages      |
| reverseOffer | ChatReverseOfferSummary | optional | Used for reverse-offer messages |

### ChatSSEEventType (enum)

| Value   | Notes                            |
| ------- | -------------------------------- |
| message | New chat message received        |
| read    | Read receipt for a room          |
| typing  | Typing indicator for a room/user |

### ChatSSEEvent

| Field | Type             | Required | Notes                                       |
| ----- | ---------------- | -------- | ------------------------------------------- |
| type  | ChatSSEEventType | required |                                             |
| data  | object           | required | Shape varies by type (see ChatSSEEventType) |

- When `type === 'message'`: `data` is `ChatMessage`
- When `type === 'read'`: `data` is `{ roomId: string; userId: string }`
- When `type === 'typing'`: `data` is `{ roomId: string; userId: string }`

## Search

### SpotSearchResult

| Field          | Type       | Required | Notes    |
| -------------- | ---------- | -------- | -------- |
| id             | string     | required |          |
| type           | SpotType   | required |          |
| status         | SpotStatus | required |          |
| title          | string     | required |          |
| description    | string     | required |          |
| pointCost      | number     | required |          |
| authorId       | string     | required |          |
| authorNickname | string     | required |          |
| createdAt      | string     | required | ISO 8601 |
| updatedAt      | string     | required | ISO 8601 |

### PostSearchResult

| Field          | Type               | Required | Notes |
| -------------- | ------------------ | -------- | ----- |
| id             | string             | required |       |
| type           | PostType           | required |       |
| title          | string             | required |       |
| content        | string             | required |       |
| categories     | PostSpotCategory[] | required |       |
| pointCost      | number             | required |       |
| authorNickname | string             | required |       |

### UserSearchResult

| Field       | Type        | Required | Notes |
| ----------- | ----------- | -------- | ----- |
| id          | string      | required |       |
| profileType | ProfileType | required |       |
| nickname    | string      | required |       |
| avatarUrl   | string      | optional |       |
| field       | string      | optional |       |
| rating      | number      | optional |       |
| location    | string      | optional |       |

## Bookmarks

### BookmarkTargetType (enum)

| Value | Notes |
| ----- | ----- |
| post  |       |
| spot  |       |

### BookmarkItem

| Field          | Type               | Required | Notes              |
| -------------- | ------------------ | -------- | ------------------ |
| id             | string             | required |                    |
| targetId       | string             | required |                    |
| targetType     | BookmarkTargetType | required |                    |
| title          | string             | required |                    |
| summary        | string             | optional |                    |
| thumbnailUrl   | string             | optional |                    |
| authorNickname | string             | optional |                    |
| savedAt        | string             | required | ISO 8601           |
| popularity     | number             | optional |                    |
| deadline       | string             | optional | ISO date           |
| status         | string             | optional | For spots or posts |

## Notifications

### NotificationType (enum)

| Value   | Notes |
| ------- | ----- |
| comment |       |
| reply   |       |
| like    |       |
| mention |       |
| invite  |       |

### Notification

| Field     | Type             | Required | Notes       |
| --------- | ---------------- | -------- | ----------- |
| id        | string           | required |             |
| type      | NotificationType | required |             |
| title     | string           | required |             |
| body      | string           | required |             |
| createdAt | string           | required | ISO 8601    |
| isRead    | boolean          | required |             |
| deepLink  | string           | optional | In-app link |

## Admin Post

### AdminPostType (enum)

| Value    | Notes |
| -------- | ----- |
| curation |       |
| notice   |       |
| report   |       |

### AdminPostHotSpot

| Field    | Type   | Required | Notes |
| -------- | ------ | -------- | ----- |
| category | string | required |       |
| title    | string | required |       |
| subtitle | string | required |       |
| imageUrl | string | optional |       |

### AdminPost

| Field          | Type             | Required | Notes            |
| -------------- | ---------------- | -------- | ---------------- |
| id             | string           | required |                  |
| type           | AdminPostType    | required |                  |
| isNotice       | boolean          | required |                  |
| title          | string           | required |                  |
| summary        | string           | required |                  |
| teaser         | string           | required |                  |
| authorName     | string           | required |                  |
| publishedAt    | string           | required | ISO 8601         |
| introTitle     | string           | required |                  |
| introBody      | string           | required |                  |
| body           | string[]         | required | Paragraph blocks |
| hotSpot        | AdminPostHotSpot | required |                  |
| relatedFeedIds | string[]         | required | Feed item ids    |

## Spot 취소/정산 확장 (2026-04 추가)

### SpotForfeitPool

| Field         | Type   | Required | Notes                              |
| ------------- | ------ | -------- | ---------------------------------- |
| toPool        | number | required | 정산 풀로 편입되는 몰수 금액 누적  |
| toPlatformFee | number | required | 플랫폼 수수료로 분기되는 금액 누적 |

### Spot (확장 필드)

| forfeitPool | SpotForfeitPool | optional | 누락 시 `{toPool:0, toPlatformFee:0}`으로 간주 |

### SpotWorkflow

| Field              | Type                   | Required | Notes |
| ------------------ | ---------------------- | -------- | ----- |
| spotId             | string                 | required |       |
| progressLabel      | string                 | required |       |
| voteSummary        | SpotPartnerVoteSummary | optional |       |
| finalApproval      | SpotFinalApproval      | optional |       |
| settlementApproval | SpotSettlementApproval | optional |       |

### SpotSettlementApproval (확장)

| Field           | Type                     | Required | Notes                                          |
| --------------- | ------------------------ | -------- | ---------------------------------------------- |
| status          | WorkflowApprovalStatus   | required | PENDING \| APPROVED                            |
| requestedAmount | number                   | required | 호스트가 제출한 line items의 합                |
| approvedAmount  | number                   | required | 승인 시 `requestedAmount + forfeitPool.toPool` |
| summary         | string                   | required |                                                |
| lineItems       | SpotSettlementLineItem[] | required |                                                |
| submittedBy     | string                   | optional | 호스트 userId                                  |
| submittedAt     | string                   | optional | ISO datetime                                   |
| approvedBy      | string                   | optional | 승인자 userId                                  |
| approvedAt      | string                   | optional | ISO datetime                                   |

### SpotSettlementLineItem

| Field  | Type   | Required |
| ------ | ------ | -------- |
| label  | string | required |
| amount | number | required |

### TimelineEventKind (확장)

`CREATED | MATCHED | COMPLETED | CANCELLED | COMMENT | SETTLEMENT_REQUESTED | SETTLEMENT_APPROVED`

### SubmitSettlementPayload

| Field     | Type                     | Required |
| --------- | ------------------------ | -------- |
| lineItems | SpotSettlementLineItem[] | required |
| summary   | string                   | required |

### FeedItem (확장 필드)

| myApplicationStatus | FeedApplicationStatus | optional | APPLIED \| ACCEPTED \| REJECTED \| CANCELLED |
| myApplicationRole | FeedApplicationRole | optional | PARTNER \| SUPPORTER — 취소 정책 분기에 사용 |
| myApplicationDeposit | number | optional | 환불/몰수 preview 계산용 |

### FeedApplication (확장)

| Field       | Type                  | Required | Notes                                        |
| ----------- | --------------------- | -------- | -------------------------------------------- |
| id          | string                | required |                                              |
| feedId      | string                | required |                                              |
| userId      | string                | required |                                              |
| proposal    | string                | required |                                              |
| status      | FeedApplicationStatus | required | APPLIED \| ACCEPTED \| REJECTED \| CANCELLED |
| appliedRole | FeedApplicationRole   | required | PARTNER \| SUPPORTER                         |
| deposit     | number                | required | 신청 시점의 보증금 스냅샷                    |
| createdAt   | string                | required | ISO datetime                                 |

## Simulation (contextBuilder 응답, 2026-04 추가)

> contextBuilder가 생산하는 시뮬레이션 결과를 프론트가 그대로 소비한다. 프론트 클라이언트 계산 없음 — BE가 산출한 점수/힌트/프레임을 그대로 렌더.

### GeoCoord

| Field | Type   | Required | Notes |
| ----- | ------ | -------- | ----- |
| lat   | number | required |       |
| lng   | number | required |       |

### SpotProvenance (enum)

| Value   | Notes                     |
| ------- | ------------------------- |
| virtual | 시뮬레이션 생성 가상 스팟 |
| real    | 실제 서포터가 게시한 스팟 |
| mixed   | 가상→실제 전환 중인 스팟  |

### SpotTeachMode (enum)

`"1:1" | "small_group" | "workshop"`

### SpotStatusLite (enum)

`"OPEN" | "MATCHED" | "CLOSED"` — `TimelineFrame.SpotMarker.status`에 사용. `CANCELLED`는 포함하지 않음.

### PersonaArchetype (enum)

`"explorer" | "helper" | "creator" | "connector" | "learner"` — 기존 `entities/persona/types.ts`와 동일.

### SpotVenueType (enum, 2026-04-24 확정)

`"cafe" | "home" | "studio" | "park" | "gym"` — `SpotCard.venue_type` 전용.

### AttractivenessVerdict (enum, 2026-04-24 확정)

`"too_cheap" | "competitive" | "slightly_high" | "too_high"` — FE는 4단계 칩 색상으로 매핑.

### LiveEventType (enum, 2026-04-24 확정)

`"CREATE_TEACH_SPOT" | "JOIN_TEACH_SPOT" | "LEAVE_TEACH_SPOT" | "MATCH_TEACH_SPOT" | "COUNTER_OFFER" | "BOND_UPGRADE" | "CLOSE_TEACH_SPOT"`.

### SpotIntent (enum)

`"offer" | "request"` — `SpotLifecycle.intent`에서 사용.

### SpotCard

| Field                | Type           | Required | Notes                          |
| -------------------- | -------------- | -------- | ------------------------------ |
| spot_id              | string         | required |                                |
| provenance           | SpotProvenance | required | virtual \| real \| mixed       |
| title                | string         | required | LLM 생성 제목                  |
| skill_topic          | string         | required | 카테고리/주제 라벨             |
| teach_mode           | SpotTeachMode  | required | 1:1 \| small_group \| workshop |
| venue_type           | SpotVenueType  | required | cafe \| home \| studio \| park \| gym (2026-04-24 enum 확정) |
| fee_per_partner      | number         | required | 파트너 1인당 원화 기준 요금    |
| location             | GeoCoord       | required |                                |
| host_preview         | string         | required | 호스트 소개 한 문장            |
| person_fitness_score | number         | required | 0–1, 파트너 개인 적합도        |
| attractiveness_score | number         | required | 0–1, 피드 품질 종합 점수       |

### AttractivenessSignal (enum)

`"title_hookiness" | "price_reasonableness" | "venue_accessibility" | "host_reputation_fit" | "time_slot_demand" | "skill_rarity_bonus" | "narrative_authenticity" | "bonded_repeat_potential"`

### AttractivenessPriceBenchmark

| Field   | Type   | Required | Notes                                       |
| ------- | ------ | -------- | ------------------------------------------- |
| p25     | number | required |                                             |
| p50     | number | required |                                             |
| p75     | number | required |                                             |
| p90     | number | required |                                             |
| verdict | AttractivenessVerdict | required | too_cheap \| competitive \| slightly_high \| too_high (2026-04-24 확정) |

### AttractivenessReport

| Field             | Type                                 | Required | Notes                           |
| ----------------- | ------------------------------------ | -------- | ------------------------------- |
| composite_score   | number                               | required | 0–1                             |
| signals           | Record<AttractivenessSignal, number> | required | 8개 시그널 모두 0–1 값으로 포함 |
| improvement_hints | string[]                             | required | LLM이 생성한 개선 힌트 문장     |
| price_benchmark   | AttractivenessPriceBenchmark         | required |                                 |

### AgentMarker

| Field     | Type             | Required | Notes                  |
| --------- | ---------------- | -------- | ---------------------- |
| agent_id  | string           | required |                        |
| location  | GeoCoord         | required |                        |
| archetype | PersonaArchetype | optional | 알 수 없으면 생략 가능 |

### SpotMarker (Simulation)

| Field      | Type           | Required | Notes                     |
| ---------- | -------------- | -------- | ------------------------- |
| spot_id    | string         | required |                           |
| location   | GeoCoord       | required |                           |
| provenance | SpotProvenance | required | virtual \| real \| mixed  |
| status     | SpotStatusLite | required | OPEN \| MATCHED \| CLOSED |

> 맵 UI 컴포넌트 이름과 충돌하므로, 프론트 엔티티 파일에서는 `SpotMarker` 타입으로, 맵 컴포넌트는 `SpotMarker` 컴포넌트로 분리 import 한다.

### LiveEvent

| Field      | Type               | Required | Notes                                                       |
| ---------- | ------------------ | -------- | ----------------------------------------------------------- |
| event_id   | string             | required |                                                             |
| event_type | LiveEventType      | required | 2026-04-24 enum 확정 (7종)                                  |
| payload    | LiveEventPayload   | required | `event_type`에 따른 discriminated union. 아래 §LiveEventPayload 참고 |

### LiveEventPayload (discriminated union, 2026-04-24 확정)

`event_type` → payload 스키마 대응:

| event_type          | payload 필드                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| CREATE_TEACH_SPOT   | spot_id, host_persona_id, skill_topic, teach_mode, venue_type, fee_per_partner, location                  |
| JOIN_TEACH_SPOT     | spot_id, persona_id, joined_at_ms                                                                         |
| LEAVE_TEACH_SPOT    | spot_id, persona_id, left_at_ms, reason                                                                   |
| MATCH_TEACH_SPOT    | spot_id, matched_at_ms, arrived_count, participants[] (persona_id, arrived_at_ms)                         |
| COUNTER_OFFER       | spot_id, from_persona_id, new_fee_per_partner, extension_ms                                               |
| BOND_UPGRADE        | spot_id, persona_ids[], new_bond_level                                                                    |
| CLOSE_TEACH_SPOT    | spot_id, closed_at_ms, outcome (MATCHED \| CANCELED \| TIMEOUT)                                           |

### TimelineFrame

| Field            | Type          | Required | Notes                                 |
| ---------------- | ------------- | -------- | ------------------------------------- |
| tick             | number        | required | 0–47 (한 day 내 half-hour 슬롯)       |
| day_of_week      | string        | required | 예: `MON`, `TUE`, … `SUN`             |
| time_slot        | string        | required | `"HH:MM"` 24h, **KST 고정** (2026-04-24) |
| active_agents    | AgentMarker[] | required | 해당 틱에 맵에 렌더할 에이전트 집합   |
| active_spots     | SpotMarker[]  | required | 해당 틱에 활성인 스팟 집합            |
| events_this_tick | LiveEvent[]   | required | 이 틱에 발생한 이벤트. 순서대로 방출. |

### HighlightCategory (enum)

`"first_success" | "bond_upgrade" | "counter_offer" | "referral" | "unexpected_match"`

### HighlightClip

| Field           | Type              | Required | Notes             |
| --------------- | ----------------- | -------- | ----------------- |
| clip_id         | string            | required |                   |
| title           | string            | required |                   |
| category        | HighlightCategory | required |                   |
| start_tick      | number            | required |                   |
| end_tick        | number            | required | inclusive         |
| involved_agents | string[]          | required | agent_id 배열     |
| narrative       | string            | required | LLM 생성 내러티브 |

### ConversionHintsPlaceholder

| Field       | Type   | Required | Notes               |
| ----------- | ------ | -------- | ------------------- |
| title       | string | required | 전환 피드 제목 초안 |
| intro       | string | required | 소개 문구 초안      |
| skill_topic | string | required |                     |

### FeeBreakdown (2026-04-24 확정)

| Field             | Type   | Required | Notes                                  |
| ----------------- | ------ | -------- | -------------------------------------- |
| peer_labor_fee    | number | required | 원화, 파트너 1인당 노동료             |
| material_cost     | number | required | 재료비 1인분                           |
| venue_rental      | number | required | 1인분 안분                             |
| equipment_rental  | number | required | 1인분 안분                             |
| total             | number | required | 위 4개 합계                            |
| passthrough_total | number | required | 플랫폼 수수료 제외 pass-through 합계   |

### ConversionHintsPricing

| Field         | Type          | Required | Notes                                         |
| ------------- | ------------- | -------- | --------------------------------------------- |
| fee_breakdown | FeeBreakdown  | required | 구조 확정 (2026-04-24)                        |
| rationale     | string        | required |                                               |

### ConversionSessionContext (2026-04-24 추가)

> FE가 `simulation-conversion-context.ts`에서 직접 집계하던 통계를 BE가 run 전체 기반으로 산출해 대체.

| Field                    | Type   | Required | Notes                                                     |
| ------------------------ | ------ | -------- | --------------------------------------------------------- |
| similar_active_count     | number | required | 같은 skill_topic의 활성(OPEN/MATCHED) 스팟 수             |
| avg_participants         | number | required | 같은 skill_topic의 평균 참여자 수(종료된 건 포함)         |
| typical_lifespan_minutes | number | required | 중앙값, 분 단위                                           |
| sample_size              | number | required | 집계 모수. FE가 신뢰도 표시에 사용                        |
| scope                    | string | required | `"run" | "region" | "global"` — 모수 부족 시 fallback 레벨 |

### ConversionHintsPlan

| Field         | Type     | Required | Notes |
| ------------- | -------- | -------- | ----- |
| warmup_block  | string   | required |       |
| main_block    | string   | required |       |
| closing_block | string   | required |       |
| host_tips     | string[] | required |       |

### ConversionHintsDemand

| Field                   | Type   | Required | Notes |
| ----------------------- | ------ | -------- | ----- |
| forecast_join_count_p50 | number | required |       |
| forecast_join_count_p90 | number | required |       |

### ConversionHints

| Field                  | Type                       | Required | Notes                                                                                    |
| ---------------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| source_virtual_spot_id | string                     | required | 전환 기반이 되는 가상 spot_id                                                            |
| placeholder            | ConversionHintsPlaceholder | required |                                                                                          |
| pricing_suggestion     | ConversionHintsPricing     | required |                                                                                          |
| plan_help              | ConversionHintsPlan        | required |                                                                                          |
| expected_demand        | ConversionHintsDemand      | required |                                                                                          |
| session_context        | ConversionSessionContext   | required | 2026-04-24 추가. FE가 직접 집계하던 통계 대체                                            |

### SpotLifecycle (2026-04-24 신규)

> `GET /api/v1/map/spots/lifecycles` 스냅샷 + `GET /api/v1/map/spots/stream` 델타의 기반 엔티티.
> FE의 `use-mock-spot-lifecycles.ts` 참조 구현을 실제 계약으로 승격.

| Field                   | Type                          | Required | Notes                                                             |
| ----------------------- | ----------------------------- | -------- | ----------------------------------------------------------------- |
| spot_id                 | string                        | required |                                                                   |
| location                | GeoCoord                      | required |                                                                   |
| category                | string                        | required | `SpotCategory` enum (FE와 공유)                                   |
| intent                  | SpotIntent                    | required | offer \| request                                                  |
| title                   | string                        | required |                                                                   |
| host_persona_id         | string                        | required |                                                                   |
| created_at_ms           | number                        | required | 시뮬 가상시간(ms)                                                 |
| expected_closed_at_ms   | number                        | required | **`spot.created` 시점에 결정론적 예측값 포함** (birth/dying 애니) |
| matched_at_ms           | number                        | optional | null 가능(아직 매칭 전)                                            |
| closed_at_ms            | number                        | optional | null 가능(아직 종료 전)                                            |
| participants            | SpotLifecycleParticipant[]    | required |                                                                   |

### SpotLifecycleParticipant

| Field         | Type   | Required | Notes                                         |
| ------------- | ------ | -------- | --------------------------------------------- |
| persona_id    | string | required |                                               |
| joined_at_ms  | number | required |                                               |
| left_at_ms    | number | optional | null 가능                                     |
| arrived_at_ms | number | optional | BE가 엔진 상태머신으로 판정. FE의 좌표 임계값 제거 |

### SpotLifecycleEventType (enum)

`"spot.created" | "spot.participant_joined" | "spot.participant_left" | "spot.matched" | "spot.closed" | "spot.extended"`

### SpotLifecycleEvent (discriminated union)

| type                      | payload                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| spot.created              | SpotLifecycle (participants=[])                                                                                         |
| spot.participant_joined   | { spot_id, persona_id, joined_at_ms }                                                                                   |
| spot.participant_left     | { spot_id, persona_id, left_at_ms, reason }                                                                             |
| spot.matched              | { spot_id, matched_at_ms, arrived_count, participants (SpotLifecycleParticipant[]) }                                    |
| spot.closed               | { spot_id, closed_at_ms, outcome (MATCHED \| CANCELED \| TIMEOUT) }                                                     |
| spot.extended             | { spot_id, new_expected_closed_at_ms } — counter_offer 등 수명 연장의 **유일한 합법적 변경 경로**                        |

### SimulationRunVariant (enum)

`"baseline" | "high_engagement" | "weekend_peak" | "custom"`

### SimulationRunStatus (enum)

`"queued" | "running" | "completed" | "failed"`

### SimulationRunRegion

| Field    | Type           | Required | Notes                      |
| -------- | -------------- | -------- | -------------------------- |
| center   | GeoCoord       | required | FE `initialCenter`가 파생  |
| bbox     | MapPersonaBbox | required | swLat/swLng/neLat/neLng    |
| timezone | string         | required | 고정 `"Asia/Seoul"`        |

### SimulationRunStreams

| Field          | Type   | Required | Notes                                                        |
| -------------- | ------ | -------- | ------------------------------------------------------------ |
| timeline_url   | string | required | `/api/v1/simulation/runs/{run_id}/timeline/stream`           |
| spots_url      | string | required | `/api/v1/map/spots/stream?run_id={run_id}`                   |
| personas_url   | string | required | `/api/v1/map/personas/stream?run_id={run_id}`                |
| highlights_url | string | required | `/api/v1/simulation/runs/{run_id}/highlights`                |

### SimulationRun (2026-04-24 신규)

| Field          | Type                 | Required | Notes                                                            |
| -------------- | -------------------- | -------- | ---------------------------------------------------------------- |
| run_id         | string               | required |                                                                  |
| variant        | SimulationRunVariant | required |                                                                  |
| status         | SimulationRunStatus  | required |                                                                  |
| started_at     | string (ISO)         | required |                                                                  |
| completed_at   | string (ISO)         | optional | status=completed\|failed 때만                                    |
| total_ticks    | number               | required | 기본 48                                                          |
| current_tick   | number               | optional | status=running 때만                                              |
| region         | SimulationRunRegion  | required |                                                                  |
| agent_count    | number               | required | 기본 500, 범위 50–1000                                           |
| seed           | number               | required | 재현성                                                           |
| user_agent_id  | string               | optional | `POST /runs`에 `user_persona_id`가 주어졌을 때만. FE `followingPersonaId` 기본값 |
| streams        | SimulationRunStreams | required | FE가 구독해야 할 SSE 엔드포인트 모음                             |

### CreateSimulationRunRequest

| Field             | Type                 | Required | Notes                                                      |
| ----------------- | -------------------- | -------- | ---------------------------------------------------------- |
| variant           | SimulationRunVariant | required | `custom`이면 `region_bbox` 필수                            |
| region_bbox       | MapPersonaBbox       | optional | variant 기본값 덮어쓰기                                    |
| duration_ticks    | number               | optional | 기본 48                                                    |
| seed              | number               | optional |                                                            |
| user_persona_id   | string               | optional | 관찰자 모드(미지정)가 기본. 지정 시 에이전트 풀에 주입      |
| agent_count       | number               | optional | 기본 500, 50–1000 범위                                     |

> **제한**: 인증 사용자당 분당 1회, 동시 running 1개. 초과 시 `429`.

## Map Personas (2026-04 추가)

> 맵 실시간 페르소나 스트림. FE 는 `useActivityClusters` 로 클러스터를 파생 계산한다.

### PersonaArchetype (enum)

| Value     | Notes |
| --------- | ----- |
| explorer  |       |
| helper    |       |
| creator   |       |
| connector |       |
| learner   |       |

### PersonaIntent (enum)

| Value   | Notes       |
| ------- | ----------- |
| offer   | 호스트 모집 |
| request | 사용자 영청 |

### MapPersona

| Field           | Type             | Required | Notes                                    |
| --------------- | ---------------- | -------- | ---------------------------------------- |
| id              | string           | required | leave→join 사이클 내에서 안정적이어야 함 |
| name            | string           | required |                                          |
| emoji           | string           | required | 단일 이모지, 페르소나 시각 대표          |
| archetype       | PersonaArchetype | required |                                          |
| category        | SpotCategory     | required | 클러스터 그룹핑 키                       |
| intent          | PersonaIntent    | required | 클러스터 그룹핑 키                       |
| location        | GeoCoord         | required | {lat, lng}                               |
| interestItemIds | string[]         | optional | 관심 아이템 id — 없어도 됨               |

### MapPersonaBbox

| Field | Type   | Required | Notes                |
| ----- | ------ | -------- | -------------------- |
| swLat | number | required | south-west latitude  |
| swLng | number | required | south-west longitude |
| neLat | number | required | north-east latitude  |
| neLng | number | required | north-east longitude |

### MapPersonaStreamEventType (enum)

| Value         | Notes                                 |
| ------------- | ------------------------------------- |
| persona.join  | 새 페르소나가 bbox 안에 등장          |
| persona.leave | 기존 페르소나가 bbox 를 떠나거나 종료 |
| persona.move  | 기존 페르소나 위치 갱신               |

### MapPersonaJoinEvent

| Field   | Type           | Required | Notes |
| ------- | -------------- | -------- | ----- |
| type    | 'persona.join' | required |       |
| persona | MapPersona     | required |       |

### MapPersonaLeaveEvent

| Field     | Type            | Required | Notes |
| --------- | --------------- | -------- | ----- |
| type      | 'persona.leave' | required |       |
| personaId | string          | required |       |

### MapPersonaMoveEvent

| Field     | Type           | Required | Notes                  |
| --------- | -------------- | -------- | ---------------------- |
| type      | 'persona.move' | required |                        |
| personaId | string         | required |                        |
| location  | GeoCoord       | required | 페르소나 당 ≤ 1Hz 권장 |

### MapPersonaStreamEvent

MapPersonaJoinEvent | MapPersonaLeaveEvent | MapPersonaMoveEvent (discriminated union on `type`)
