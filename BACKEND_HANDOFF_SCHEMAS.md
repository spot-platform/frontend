## schemas

## Shared schemas (appendix)

Types are expressed in table form. `optional` means the key may be omitted. `nullable` means the value may be `null`.

### ApiResponseMeta

| Field   | Type    | Required | Notes |
| ------- | ------- | -------- | ----- |
| page    | number  | optional |       |
| size    | number  | optional |       |
| total   | number  | optional |       |
| hasNext | boolean | optional |       |

### ApiResponse<T>

| Field | Type            | Required | Notes               |
| ----- | --------------- | -------- | ------------------- |
| data  | object          | required | Generic payload     |
| meta  | ApiResponseMeta | optional | Pagination metadata |

### PagedResponse<T>

| Field | Type            | Required | Notes                       |
| ----- | --------------- | -------- | --------------------------- |
| data  | object[]        | required | Array payload               |
| meta  | ApiResponseMeta | optional | Pagination metadata wrapper |

### ApiErrorBody

| Field   | Type   | Required | Notes       |
| ------- | ------ | -------- | ----------- |
| code    | string | required |             |
| message | string | required |             |
| status  | number | required | HTTP status |

---

## Auth schemas

### OAuthProvider (enum)

`"kakao" | "google"`

### LoginRequest

| Field    | Type   | Required | Notes         |
| -------- | ------ | -------- | ------------- |
| email    | string | required |               |
| password | string | required |               |
| next     | string | optional | Redirect path |

### LoginResult

| Field        | Type   | Required | Notes                               |
| ------------ | ------ | -------- | ----------------------------------- |
| accessToken  | string | required | Access token                        |
| refreshToken | string | required | Refresh token                       |
| userId       | string | required | Identifier coerced to string by BFF |
| redirectTo   | string | required | Safe in-app path                    |

### RefreshTokenRequest

| Field        | Type   | Required | Notes |
| ------------ | ------ | -------- | ----- |
| refreshToken | string | required |       |

### TokenRefreshResult

| Field       | Type   | Required | Notes |
| ----------- | ------ | -------- | ----- |
| accessToken | string | required |       |

### LogoutResult

| Field | Type    | Required | Notes |
| ----- | ------- | -------- | ----- |
| ok    | boolean | required |       |

---

## Spot schemas

### SpotType (enum)

`"OFFER" | "REQUEST"`

### SpotStatus (enum)

`"OPEN" | "MATCHED" | "CLOSED" | "CANCELLED"`

### ParticipantRole (enum)

`"AUTHOR" | "PARTICIPANT"`

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

`"CREATED" | "MATCHED" | "COMPLETED" | "CANCELLED" | "COMMENT"`

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

| Field    | Type            | Required | Notes                        |
| -------- | --------------- | -------- | ---------------------------- |
| timeline | TimelineEvent[] | required | In addition to `Spot` fields |

### SpotParticipant

| Field    | Type   | Required | Notes                 |
| -------- | ------ | -------- | --------------------- |
| userId   | string | required |                       |
| nickname | string | required |                       |
| role     | enum   | required | AUTHOR or PARTICIPANT |
| joinedAt | string | required | ISO 8601              |

### ScheduleSlot

| Field            | Type     | Required | Notes                 |
| ---------------- | -------- | -------- | --------------------- |
| date             | string   | required | ISO date `YYYY-MM-DD` |
| hour             | number   | required | 0 to 23               |
| availableUserIds | string[] | required |                       |

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

---

## My and User schemas

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

`"NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED"`

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

| Field     | Type       | Required | Notes                 |
| --------- | ---------- | -------- | --------------------- |
| spotId    | string     | required |                       |
| spotTitle | string     | required |                       |
| spotType  | SpotType   | required |                       |
| role      | enum       | required | AUTHOR or PARTICIPANT |
| status    | SpotStatus | required |                       |
| joinedAt  | string     | required | ISO 8601              |

### MySpot

| Field          | Type            | Required | Notes                                  |
| -------------- | --------------- | -------- | -------------------------------------- |
| id             | string          | required |                                        |
| type           | SpotType        | required |                                        |
| status         | SpotStatus      | required |                                        |
| title          | string          | required |                                        |
| description    | string          | required |                                        |
| pointCost      | number          | required |                                        |
| authorId       | string          | required | `role=AUTHOR`이면 인증 사용자 id       |
| authorNickname | string          | required |                                        |
| role           | ParticipantRole | required | Current user's relationship role       |
| joinedAt       | string          | optional | ISO 8601, `role=PARTICIPANT`일 때 포함 |
| createdAt      | string          | required | ISO 8601                               |
| updatedAt      | string          | required | ISO 8601                               |

### MySpotListQuery

| Field | Type            | Required | Notes                                      |
| ----- | --------------- | -------- | ------------------------------------------ |
| role  | ParticipantRole | optional | AUTHOR or PARTICIPANT, omit to return both |
| page  | number          | optional |                                            |
| size  | number          | optional |                                            |

### MySpotListResponse

| Field | Type            | Required | Notes                        |
| ----- | --------------- | -------- | ---------------------------- |
| data  | MySpot[]        | required | My Spot dashboard card items |
| meta  | ApiResponseMeta | optional | Pagination metadata wrapper  |

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

| Field       | Type             | Required | Notes                |
| ----------- | ---------------- | -------- | -------------------- |
| id          | string           | required |                      |
| profileType | string           | required | Always `"SUPPORTER"` |
| nickname    | string           | required |                      |
| avatarUrl   | string           | optional |                      |
| field       | string           | required |                      |
| mediaUrls   | string[]         | required |                      |
| career      | string           | required |                      |
| bio         | string           | required |                      |
| avgRating   | number           | required |                      |
| reviewCount | number           | required |                      |
| reviews     | ProfileReview[]  | required |                      |
| history     | ProfileHistory[] | required |                      |

### PartnerProfile

| Field              | Type     | Required | Notes              |
| ------------------ | -------- | -------- | ------------------ |
| id                 | string   | required |                    |
| profileType        | string   | required | Always `"PARTNER"` |
| nickname           | string   | required |                    |
| avatarUrl          | string   | optional |                    |
| interestCategories | string[] | required |                    |
| isFriend           | boolean  | required |                    |

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

---

## Pay schemas

### PointTransactionType (enum)

`"CHARGE" | "USE" | "REFUND" | "WITHDRAW"`

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

`"PENDING" | "COMPLETED" | "REJECTED"`

### PointWithdrawal

| Field       | Type                  | Required | Notes    |
| ----------- | --------------------- | -------- | -------- |
| id          | string                | required |          |
| amount      | number                | required |          |
| status      | PointWithdrawalStatus | required |          |
| requestedAt | string                | required | ISO 8601 |

---

## Feed schemas (UI contract)

### FeedItemType (enum)

`"OFFER" | "REQUEST"`

### FeedItemStatus (enum)

`"OPEN" | "MATCHED" | "CLOSED"`

### FeedTabType (enum)

`"HOME" | "EXPLORE"`

### FeedCategory (enum)

`"음악" | "요리" | "운동" | "공예" | "언어" | "기타"`

### FeedItem

| Field                    | Type                     | Required | Notes                                      |
| ------------------------ | ------------------------ | -------- | ------------------------------------------ |
| id                       | string                   | required |                                            |
| title                    | string                   | required |                                            |
| description              | string                   | optional |                                            |
| location                 | string                   | required |                                            |
| authorNickname           | string                   | required |                                            |
| authorProfile            | FeedAuthorProfile        | optional |                                            |
| price                    | number                   | required |                                            |
| type                     | FeedItemType             | required |                                            |
| status                   | FeedItemStatus           | required |                                            |
| progressPercent          | number                   | optional | 0 to 100                                   |
| imageUrl                 | string                   | optional |                                            |
| views                    | number                   | required |                                            |
| likes                    | number                   | required |                                            |
| partnerCount             | number                   | optional | OFFER only                                 |
| applicantCount           | number                   | optional | REQUEST only                               |
| maxParticipants          | number                   | optional |                                            |
| confirmedPartnerProfiles | FeedParticipantProfile[] | optional |                                            |
| category                 | FeedCategory             | optional |                                            |
| deadline                 | string                   | optional | ISO date                                   |
| isBookmarked             | boolean                  | optional |                                            |
| myApplicationStatus      | FeedApplicationStatus    | optional | 인증 사용자의 신청 상태, 미신청 시 omitted |

### FeedAuthorProfile

| Field     | Type   | Required | Notes                |
| --------- | ------ | -------- | -------------------- |
| id        | string | required |                      |
| nickname  | string | required |                      |
| avatarUrl | string | optional |                      |
| role      | string | required | SUPPORTER or PARTNER |
| rating    | number | optional | 0 to 5               |
| field     | string | optional |                      |

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

`"APPLIED" | "ACCEPTED" | "REJECTED" | "CANCELLED"`

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

`"LEADING" | "REVIEWING" | "WAITING"`

### SupporterApplication

Includes all fields from `SupporterItem` plus:

| Field            | Type                       | Required | Notes |
| ---------------- | -------------------------- | -------- | ----- |
| proposal         | string                     | required |       |
| competitionScore | number                     | required |       |
| status           | SupporterApplicationStatus | required |       |
| relatedRequestId | string                     | optional |       |

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

`"brand" | "accent" | "neutral"`

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

---

## Post schemas (UI contract)

### PostSpotCategory (enum)

`"음식·요리" | "BBQ·조개" | "공동구매" | "교육" | "운동" | "공예" | "음악" | "기타"`

### CreateOfferPostRequest

| Field             | Type               | Required | Notes                       |
| ----------------- | ------------------ | -------- | --------------------------- |
| type              | string             | required | Always `"OFFER"`            |
| spotName          | string             | required |                             |
| title             | string             | required |                             |
| content           | string             | required |                             |
| categories        | PostSpotCategory[] | required |                             |
| photoUrls         | string[]           | required | Upload first via `/uploads` |
| pointCost         | number             | required |                             |
| location          | string             | required |                             |
| deadline          | string             | required | ISO date                    |
| detailDescription | string             | required |                             |
| supporterPhotoUrl | string             | optional |                             |
| qualifications    | string             | optional |                             |
| desiredPrice      | number             | optional | 희망 가격                   |
| maxPartnerCount   | number             | optional | 최대 파트너 수              |
| autoClose         | boolean            | required |                             |

### CreateRequestPostRequest

| Field                | Type               | Required | Notes                       |
| -------------------- | ------------------ | -------- | --------------------------- |
| type                 | string             | required | Always `"REQUEST"`          |
| spotName             | string             | required |                             |
| title                | string             | required |                             |
| content              | string             | required |                             |
| categories           | PostSpotCategory[] | required |                             |
| photoUrls            | string[]           | required | Upload first via `/uploads` |
| pointCost            | number             | required |                             |
| location             | string             | required |                             |
| deadline             | string             | required | ISO date                    |
| detailDescription    | string             | required |                             |
| serviceStylePhotoUrl | string             | optional |                             |
| preferredSchedule    | string             | optional |                             |
| maxPartnerCount      | number             | optional | 최대 파트너 수              |
| priceCapPerPerson    | number             | optional | 1인당 최대 금액             |

### PostCompletion

| Field       | Type   | Required | Notes            |
| ----------- | ------ | -------- | ---------------- |
| id          | string | required |                  |
| type        | string | required | OFFER or REQUEST |
| title       | string | required |                  |
| redirectUrl | string | required |                  |

### UploadFileRequest

| Field | Type   | Required | Notes                |
| ----- | ------ | -------- | -------------------- |
| file  | binary | required | multipart form field |

### UploadFileResponse

| Field | Type   | Required | Notes |
| ----- | ------ | -------- | ----- |
| url   | string | required |       |

---

## Chat schemas (UI contract)

### ChatRoomCategory (enum)

`"personal" | "spot"`

### PersonalCounterpartRole (enum)

`"SUPPORTER" | "PARTNER"`

### SpotChatParticipationRole (enum)

`"SUPPORTER" | "PARTNER"`

### ChatReverseOfferStatus (enum)

`"PARTNER_REVIEW" | "ADMIN_APPROVAL_PENDING"`

### ChatReverseOfferFinancialSource (enum)

`"management" | "estimated"`

### ChatReverseOfferFinancialSnapshot

| Field                  | Type                            | Required | Notes                              |
| ---------------------- | ------------------------------- | -------- | ---------------------------------- |
| sourceKind             | ChatReverseOfferFinancialSource | required |                                    |
| targetAmount           | number                          | required |                                    |
| agreedHeadcount        | number                          | required |                                    |
| currentHeadcount       | number                          | required |                                    |
| agreedPerPersonAmount  | number                          | required |                                    |
| agreedRemainder        | number                          | required |                                    |
| currentPerPersonAmount | number                          | required |                                    |
| currentRemainder       | number                          | required |                                    |
| comparisonNeeded       | boolean                         | required | 협의 금액 대비 현재 금액 비교 표시 |

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

### ChatMessage (discriminated union)

All message variants share:

- `id: string`
- `kind: enum`
- `createdAt: string`

#### ChatMessageSystem

| Field   | Type   | Required | Notes             |
| ------- | ------ | -------- | ----------------- |
| kind    | string | required | Always `"system"` |
| content | string | required |                   |

#### ChatMessageText

| Field      | Type   | Required | Notes              |
| ---------- | ------ | -------- | ------------------ |
| kind       | string | required | Always `"message"` |
| authorId   | string | required |                    |
| authorName | string | required |                    |
| content    | string | required |                    |

#### ChatMessageVote

| Field      | Type     | Required | Notes                   |
| ---------- | -------- | -------- | ----------------------- |
| kind       | string   | required | Always `"vote"`         |
| authorId   | string   | required |                         |
| authorName | string   | required |                         |
| vote       | SpotVote | required | Full nested vote object |

#### ChatMessageSchedule

| Field      | Type              | Required | Notes               |
| ---------- | ----------------- | -------- | ------------------- |
| kind       | string            | required | Always `"schedule"` |
| authorId   | string            | required |                     |
| authorName | string            | required |                     |
| schedule   | ChatScheduleDraft | required |                     |

#### ChatMessageFile

| Field      | Type       | Required | Notes                            |
| ---------- | ---------- | -------- | -------------------------------- |
| kind       | string     | required | Always `"file"`                  |
| authorId   | string     | required |                                  |
| authorName | string     | required |                                  |
| file       | SharedFile | required | Includes `url`, `sizeBytes`, etc |

#### ChatMessageShortcut

경량 카드 형태로 스팟 액션(투표·일정·파일)을 채팅 스트림에 표시한다. 탭 시 nav 확장 패널을 열어 수정/제출한다.

| Field               | Type   | Required | Notes                                |
| ------------------- | ------ | -------- | ------------------------------------ |
| kind                | string | required | Always `"shortcut"`                  |
| authorId            | string | required |                                      |
| authorName          | string | required |                                      |
| shortcut.actionKind | string | required | `"vote"` \| `"schedule"` \| `"file"` |
| shortcut.actionId   | string | required | 연결된 액션 ID                       |
| shortcut.label      | string | required | 칩 레이블 (예: "투표")               |
| shortcut.title      | string | required | 카드 제목                            |
| shortcut.preview    | string | required | 카드 미리보기 텍스트                 |

#### ChatMessageProposal

| Field      | Type               | Required | Notes               |
| ---------- | ------------------ | -------- | ------------------- |
| kind       | string             | required | Always `"proposal"` |
| authorId   | string             | required |                     |
| authorName | string             | required |                     |
| proposal   | ChatProposal       | required | Nested object       |
| status     | ChatProposalStatus | required |                     |

#### ChatMessageReverseOffer

| Field        | Type                    | Required | Notes                    |
| ------------ | ----------------------- | -------- | ------------------------ |
| kind         | string                  | required | Always `"reverse-offer"` |
| authorId     | string                  | required |                          |
| authorName   | string                  | required |                          |
| reverseOffer | ChatReverseOfferSummary | required | Reverse-offer payload    |

### ChatProposal

| Field           | Type     | Required | Notes                         |
| --------------- | -------- | -------- | ----------------------------- |
| suggestedAmount | number   | required |                               |
| amountRange     | object   | optional | See `ChatProposalAmountRange` |
| availableDates  | string[] | required | ISO dates as strings          |
| description     | string   | required |                               |

### ChatProposalAmountRange

| Field | Type   | Required | Notes |
| ----- | ------ | -------- | ----- |
| min   | number | required |       |
| max   | number | required |       |

### ChatProposalStatus (enum)

`"PENDING" | "ACCEPTED" | "NEGOTIATING" | "DECLINED"`

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

`PersonalChatRoom` extends `ChatRoomBase` and adds:

| Field           | Type                    | Required | Notes               |
| --------------- | ----------------------- | -------- | ------------------- |
| category        | string                  | required | Always `"personal"` |
| partnerId       | string                  | required |                     |
| partnerName     | string                  | required |                     |
| presenceLabel   | string                  | required |                     |
| unreadCount     | number                  | required |                     |
| counterpartRole | PersonalCounterpartRole | required |                     |

### SpotChatRoom

`SpotChatRoom` extends `ChatRoomBase` and adds:

| Field             | Type                      | Required | Notes                                       |
| ----------------- | ------------------------- | -------- | ------------------------------------------- |
| category          | string                    | required | Always `"spot"`                             |
| spot              | SpotDetailFull            | required | Full nested spot model                      |
| reverseOffer      | ChatReverseOfferSummary   | optional | Present when created via reverse-offer flow |
| sourceFeedId      | string                    | optional | Feed id that spawned this room              |
| participationRole | SpotChatParticipationRole | optional | SUPPORTER or PARTNER                        |

### SpotDetailFull

`SpotDetailFull` is a nested shape used in chat.

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

---

## Search schemas (UI contract)

### SearchTab (enum)

`"spot" | "post" | "user"`

### SearchQuery

| Field | Type      | Required | Notes          |
| ----- | --------- | -------- | -------------- |
| query | string    | required | Search keyword |
| tab   | SearchTab | required |                |
| page  | number    | optional |                |
| size  | number    | optional |                |

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

| Field          | Type               | Required | Notes            |
| -------------- | ------------------ | -------- | ---------------- |
| id             | string             | required |                  |
| type           | string             | required | OFFER or REQUEST |
| title          | string             | required |                  |
| content        | string             | required |                  |
| categories     | PostSpotCategory[] | required |                  |
| pointCost      | number             | required |                  |
| authorNickname | string             | required |                  |

### UserSearchResult

| Field       | Type   | Required | Notes                |
| ----------- | ------ | -------- | -------------------- |
| id          | string | required |                      |
| profileType | string | required | SUPPORTER or PARTNER |
| nickname    | string | required |                      |
| avatarUrl   | string | optional |                      |
| field       | string | optional |                      |
| rating      | number | optional |                      |
| location    | string | optional |                      |

---

## Bookmarks schemas (UI contract)

### BookmarkTargetType (enum)

`"post" | "spot"`

### BookmarkSort (enum)

`"latest" | "popular" | "closingSoon"`

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

---

## Notifications schemas (UI contract)

### NotificationType (enum)

`"comment" | "reply" | "like" | "mention" | "invite"`

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

---

## Admin Post schemas (UI contract)

### AdminPostType (enum)

`"curation" | "notice" | "report"`

### AdminPostFaqItem

| Field    | Type   | Required | Notes |
| -------- | ------ | -------- | ----- |
| question | string | required |       |
| answer   | string | required |       |

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

---

## Request and response schemas

### Spot request schemas

#### SpotListParams

| Field         | Type                       | Required | Notes                       |
| ------------- | -------------------------- | -------- | --------------------------- |
| type          | SpotType                   | optional |                             |
| status        | SpotStatus or SpotStatus[] | optional | Single or multiple statuses |
| participating | boolean                    | optional |                             |
| page          | number                     | optional |                             |
| size          | number                     | optional |                             |

#### CreateSpotRequest

| Field       | Type     | Required | Notes |
| ----------- | -------- | -------- | ----- |
| type        | SpotType | required |       |
| title       | string   | required |       |
| description | string   | required |       |
| pointCost   | number   | required |       |

#### UpsertSpotScheduleRequest

| Field | Type           | Required | Notes |
| ----- | -------------- | -------- | ----- |
| slots | ScheduleSlot[] | required |       |

#### CreateSpotVoteRequest

| Field       | Type     | Required | Notes |
| ----------- | -------- | -------- | ----- |
| question    | string   | required |       |
| options     | string[] | required |       |
| multiSelect | boolean  | optional |       |

#### CastSpotVoteRequest

| Field     | Type     | Required | Notes |
| --------- | -------- | -------- | ----- |
| optionIds | string[] | required |       |

#### UpsertSpotChecklistRequest

| Field | Type            | Required | Notes |
| ----- | --------------- | -------- | ----- |
| items | ChecklistItem[] | required |       |

#### UploadSpotFilesRequest

| Field | Type     | Required | Notes                      |
| ----- | -------- | -------- | -------------------------- |
| files | binary[] | required | multipart form-data fields |

#### CreateSpotNoteRequest

| Field   | Type   | Required | Notes |
| ------- | ------ | -------- | ----- |
| content | string | required |       |

#### CreateSpotReviewRequest

| Field          | Type   | Required | Notes  |
| -------------- | ------ | -------- | ------ |
| targetNickname | string | required |        |
| rating         | number | required | 1 to 5 |
| comment        | string | optional |        |

### My and User request schemas

#### UpdateMyProfileRequest

| Field     | Type   | Required | Notes |
| --------- | ------ | -------- | ----- |
| avatarUrl | string | optional |       |
| nickname  | string | optional |       |
| email     | string | optional |       |
| phone     | string | optional |       |

#### UpdateNotificationSettingsRequest

| Field                | Type    | Required | Notes |
| -------------------- | ------- | -------- | ----- |
| serviceNoticeEnabled | boolean | required |       |
| activityEnabled      | boolean | required |       |
| pushEnabled          | boolean | required |       |
| emailEnabled         | boolean | required |       |

#### UpdateSupporterRegistrationRequest

| Field              | Type                        | Required | Notes                                              |
| ------------------ | --------------------------- | -------- | -------------------------------------------------- |
| field              | string                      | required |                                                    |
| mediaUrls          | string[]                    | required |                                                    |
| career             | string                      | required |                                                    |
| bio                | string                      | required |                                                    |
| verificationStatus | SupporterRegistrationStatus | optional | Allowed by current frontend type-level write shape |
| verificationNotes  | string                      | optional | Allowed by current frontend type-level write shape |
| extraNotes         | string                      | optional | Allowed by current frontend type-level write shape |

#### UpdateSupporterProfileRequest

| Field     | Type     | Required | Notes |
| --------- | -------- | -------- | ----- |
| field     | string   | required |       |
| mediaUrls | string[] | required |       |
| career    | string   | required |       |
| bio       | string   | required |       |

### Pay request schemas

#### LinkBankAccountRequest

| Field         | Type   | Required | Notes |
| ------------- | ------ | -------- | ----- |
| bankName      | string | required |       |
| accountNumber | string | required |       |
| accountHolder | string | required |       |

#### ChargePointsRequest

| Field  | Type   | Required | Notes |
| ------ | ------ | -------- | ----- |
| amount | number | required |       |

#### WithdrawPointsRequest

| Field  | Type   | Required | Notes |
| ------ | ------ | -------- | ----- |
| amount | number | required |       |

### Feed request and response schemas

#### FeedListQuery

| Field    | Type           | Required | Notes                    |
| -------- | -------------- | -------- | ------------------------ |
| tab      | FeedTabType    | optional |                          |
| type     | FeedItemType   | optional |                          |
| status   | FeedItemStatus | optional |                          |
| category | FeedCategory   | optional |                          |
| sort     | string         | optional | Backend-defined sort key |
| page     | number         | optional |                          |
| size     | number         | optional |                          |

#### FeedListResponse

| Field | Type            | Required | Notes |
| ----- | --------------- | -------- | ----- |
| data  | FeedItem[]      | required |       |
| meta  | ApiResponseMeta | optional |       |

#### FeedDetailResponse

| Field | Type     | Required | Notes |
| ----- | -------- | -------- | ----- |
| data  | FeedItem | required |       |

#### FeedApplyRequest

| Field    | Type   | Required | Notes       |
| -------- | ------ | -------- | ----------- |
| proposal | string | required | 신청 메시지 |

#### FeedApplyResponse

| Field | Type            | Required | Notes |
| ----- | --------------- | -------- | ----- |
| data  | FeedApplication | required |       |

#### FeedManagementFlowResponse

| Field | Type               | Required | Notes |
| ----- | ------------------ | -------- | ----- |
| data  | FeedManagementFlow | required |       |

### Post response schemas

#### PostCompletionResponse

| Field | Type           | Required | Notes |
| ----- | -------------- | -------- | ----- |
| data  | PostCompletion | required |       |

### Chat request and response schemas

#### ChatRoom

`PersonalChatRoom | SpotChatRoom`

#### ChatRoomsQuery

| Field    | Type   | Required | Notes                |
| -------- | ------ | -------- | -------------------- |
| category | string | optional | `personal` or `spot` |
| filter   | string | optional | UI filter key        |
| page     | number | optional |                      |
| size     | number | optional |                      |

#### CreateChatRoomRequest

| Field    | Type   | Required | Notes                               |
| -------- | ------ | -------- | ----------------------------------- |
| category | string | required | `personal` or `spot`                |
| userId   | string | optional | Required for personal room creation |
| spotId   | string | optional | Required for spot room creation     |

#### ChatMessagesQuery

| Field    | Type   | Required | Notes                   |
| -------- | ------ | -------- | ----------------------- |
| beforeId | string | optional | Cursor-style pagination |
| size     | number | optional |                         |

#### SendChatMessageRequest

| Field        | Type                    | Required | Notes                                                                 |
| ------------ | ----------------------- | -------- | --------------------------------------------------------------------- |
| kind         | string                  | required | `message`, `vote`, `schedule`, `file`, `proposal`, or `reverse-offer` |
| content      | string                  | optional | Used for text messages                                                |
| voteId       | string                  | optional |                                                                       |
| scheduleId   | string                  | optional |                                                                       |
| fileId       | string                  | optional |                                                                       |
| proposal     | ChatProposal            | optional | Used for proposal messages                                            |
| reverseOffer | ChatReverseOfferSummary | optional | Used for reverse-offer messages                                       |

#### ChatRoomsResponse

| Field | Type       | Required | Notes |
| ----- | ---------- | -------- | ----- |
| data  | ChatRoom[] | required |       |

#### ChatRoomResponse

| Field | Type     | Required | Notes |
| ----- | -------- | -------- | ----- |
| data  | ChatRoom | required |       |

#### ChatMessagesResponse

| Field | Type          | Required | Notes |
| ----- | ------------- | -------- | ----- |
| data  | ChatMessage[] | required |       |

#### ChatMessageResponse

| Field | Type        | Required | Notes |
| ----- | ----------- | -------- | ----- |
| data  | ChatMessage | required |       |

### Search response schemas

#### SpotSearchResponse

| Field | Type               | Required | Notes |
| ----- | ------------------ | -------- | ----- |
| data  | SpotSearchResult[] | required |       |

#### PostSearchResponse

| Field | Type               | Required | Notes |
| ----- | ------------------ | -------- | ----- |
| data  | PostSearchResult[] | required |       |

#### UserSearchResponse

| Field | Type               | Required | Notes |
| ----- | ------------------ | -------- | ----- |
| data  | UserSearchResult[] | required |       |

### Bookmark request and response schemas

#### BookmarkListQuery

| Field      | Type               | Required | Notes |
| ---------- | ------------------ | -------- | ----- |
| targetType | BookmarkTargetType | optional |       |
| sort       | BookmarkSort       | optional |       |
| page       | number             | optional |       |
| size       | number             | optional |       |

#### BookmarkListResponse

| Field | Type            | Required | Notes |
| ----- | --------------- | -------- | ----- |
| data  | BookmarkItem[]  | required |       |
| meta  | ApiResponseMeta | optional |       |

### Notification request and response schemas

#### NotificationListQuery

| Field  | Type   | Required | Notes         |
| ------ | ------ | -------- | ------------- |
| filter | string | optional | UI filter key |
| page   | number | optional |               |
| size   | number | optional |               |

#### NotificationListResponse

| Field | Type            | Required | Notes |
| ----- | --------------- | -------- | ----- |
| data  | Notification[]  | required |       |
| meta  | ApiResponseMeta | optional |       |

### Admin Post request and response schemas

#### AdminPostListQuery

| Field    | Type          | Required | Notes |
| -------- | ------------- | -------- | ----- |
| type     | AdminPostType | optional |       |
| isNotice | boolean       | optional |       |
| page     | number        | optional |       |
| size     | number        | optional |       |

#### AdminPostListResponse

| Field | Type            | Required | Notes |
| ----- | --------------- | -------- | ----- |
| data  | AdminPost[]     | required |       |
| meta  | ApiResponseMeta | optional |       |

#### AdminPostResponse

| Field | Type      | Required | Notes |
| ----- | --------- | -------- | ----- |
| data  | AdminPost | required |       |

## Spot 취소/정산 확장 (2026-04 추가)

#### SubmitSettlementRequest

```json
{
    "lineItems": [
        { "label": "재료비", "amount": 28000 },
        { "label": "대관비", "amount": 40000 }
    ],
    "summary": "..."
}
```

#### SpotWorkflowResponse

| Field | Type         | Required |
| ----- | ------------ | -------- |
| data  | SpotWorkflow | required |

#### SpotSettlementResponse

| Field | Type                   | Required |
| ----- | ---------------------- | -------- |
| data  | SpotSettlementApproval | required |

### Deposit refund/forfeit policy

서버는 환불/몰수 정책의 단일 진실공급원이다. 프론트는 동일 규칙으로 preview를 계산한다.

- `SUPPORTER_FEED_CANCEL_REFUND_RATE = 0.3`
- `PLATFORM_FEE_RATE_ON_FORFEIT = 0.2`

| 상태 전이                  | 역할      | 원인                          | 처리                |
| -------------------------- | --------- | ----------------------------- | ------------------- |
| Feed `APPLIED → CANCELLED` | PARTNER   | SELF                          | 100% 환불           |
| Feed `APPLIED → CANCELLED` | SUPPORTER | SELF                          | 30% 환불 / 70% 몰수 |
| Spot `MATCHED → WITHDRAWN` | 양쪽      | SELF                          | 100% 몰수 → 정산 풀 |
| Feed/Spot                  | 양쪽      | HOST_REJECTED, HOST_CANCELLED | 100% 환불           |

몰수분 분할: `toPlatformFee = round(forfeit * 0.2)`, `toPool = forfeit - toPlatformFee` (잔여 계산). Feed 단계에서 발생한 서포터 몰수분은 연결된 Spot이 없으므로 플랫폼 풀에 누적(MVP). Spot 몰수분은 `spot.forfeitPool.toPool`에 누적되며 정산 승인 시 `approvedAmount = requestedAmount + forfeitPool.toPool` 공식으로 합산된다. 환불은 `PointTransaction.type = 'REFUND'`로 즉시 발행한다.

## Simulation schemas (contextBuilder, 2026-04 추가)

### MapSpotsQuery

| Field | Type   | Required | Notes                          |
| ----- | ------ | -------- | ------------------------------ |
| mode  | string | optional | `virtual` \| `real` \| `mixed` |

### MapSpotsResponse

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

### TimelineFrame (SSE frame payload)

단일 SSE `message` 이벤트의 `data` 필드에 아래 JSON을 문자열로 실어 보낸다.

```json
{
    "tick": 2,
    "day_of_week": "SAT",
    "time_slot": "10:00",
    "active_agents": [
        {
            "agent_id": "A_80381",
            "location": { "lat": 37.2636, "lng": 127.0286 },
            "archetype": "explorer"
        }
    ],
    "active_spots": [
        {
            "spot_id": "spot-v-001",
            "location": { "lat": 37.2636, "lng": 127.0286 },
            "provenance": "virtual",
            "status": "OPEN"
        }
    ],
    "events_this_tick": [
        {
            "event_id": "evt-2-1",
            "event_type": "JOIN_TEACH_SPOT",
            "payload": {
                "agent_id": "A_80381",
                "spot_id": "spot-v-001"
            }
        }
    ]
}
```

### HighlightClipsResponse

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

### AttractivenessReportResponse

```json
{
    "data": {
        "composite_score": 0.74,
        "signals": {
            "title_hookiness": 0.82,
            "price_reasonableness": 0.68,
            "venue_accessibility": 0.77,
            "host_reputation_fit": 0.71,
            "time_slot_demand": 0.62,
            "skill_rarity_bonus": 0.55,
            "narrative_authenticity": 0.88,
            "bonded_repeat_potential": 0.79
        },
        "improvement_hints": [
            "제목에 \"2시간\" 같은 러닝타임을 넣으면 클릭률이 오릅니다.",
            "현재 가격은 p50보다 살짝 높습니다. 재료비를 분리 표기해 체감 가격을 낮춰보세요."
        ],
        "price_benchmark": {
            "p25": 12000,
            "p50": 16000,
            "p75": 22000,
            "p90": 30000,
            "verdict": "slightly_above_p50"
        }
    }
}
```

### ConversionHintsResponse

```json
{
    "data": {
        "source_virtual_spot_id": "spot-v-001",
        "placeholder": {
            "title": "연무동 저녁 라떼아트 2시간 실습",
            "intro": "카페에서 바로 해보는 핸드드립 + 라떼아트. 원두와 우유 재료 포함.",
            "skill_topic": "바리스타"
        },
        "pricing_suggestion": {
            "fee_breakdown": {
                "tuition": 12000,
                "materials": 4000,
                "venue_share": 2000
            },
            "rationale": "비슷한 워크숍 p50(16,000원) 대비 경쟁력 있는 세팅. 재료비를 분리 표기해 신뢰도 확보."
        },
        "plan_help": {
            "warmup_block": "원두 소개와 추출 원리 5분 데모 (0–15분)",
            "main_block": "핸드드립 2회 + 라떼아트 하트/로제타 각 3회 (15–90분)",
            "closing_block": "각자 메뉴 한 잔 완성 + 피드백 (90–120분)",
            "host_tips": [
                "재료는 인원수+1 분량 준비",
                "초보자 카메라 각도 교정 스크립트 미리 준비"
            ]
        },
        "expected_demand": {
            "forecast_join_count_p50": 3,
            "forecast_join_count_p90": 6
        }
    }
}
```
