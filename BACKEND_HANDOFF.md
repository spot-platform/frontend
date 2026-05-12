# UI Backend Spec

> **2026-04 map-v3 리디자인 (UI-only):** `Persona` 타입에 UI 파생 필드(`category`, `intent`, `interestItemIds`) 추가. BE 계약 변경 없음. 클러스터링은 FE 파생 연산.

## Shared

### Entities

| Entity              | Fields                                                                               |
| ------------------- | ------------------------------------------------------------------------------------ |
| UploadFileRequest   | file (binary)                                                                        |
| UploadFileResponse  | url                                                                                  |
| BatchUploadRequest  | files[] (binary)                                                                     |
| BatchUploadResponse | urls[]                                                                               |
| ResolvedPlace       | place_id, name, primary_category, role, lat, lng, address, road_address?, confidence |
| PlanStep            | time, activity, place_id?, intent?                                                   |
| PlanV3              | steps[], total_duration_minutes                                                      |
| PriceBreakdown      | base_fee, included_items[], optional_addons[], refund_policy?, summary_line?         |
| Preparation         | host_provides[], partner_brings[], weather_contingency?, safety_notes[], host_tip?   |

### Queries

| Name             | Method | Route          | Request DTO        | Response DTO        |
| ---------------- | ------ | -------------- | ------------------ | ------------------- |
| UploadFile       | POST   | /uploads       | UploadFileRequest  | UploadFileResponse  |
| BatchUploadFiles | POST   | /uploads/batch | BatchUploadRequest | BatchUploadResponse |

## Auth

### Entities

| Entity             | Fields                                        |
| ------------------ | --------------------------------------------- |
| LoginRequest       | email, password, next?                        |
| LoginResult        | accessToken, refreshToken, userId, redirectTo |
| TokenRefreshResult | accessToken                                   |
| OAuthProvider      | kakao, google                                 |
| LogoutResult       | ok                                            |

### Request DTO

| DTO                 | Fields                 |
| ------------------- | ---------------------- |
| LoginRequest        | email, password, next? |
| RefreshTokenRequest | refreshToken           |
| OAuthStartQuery     | next?                  |
| LogoutRequest       | -                      |

### Response DTO

| DTO                | Fields                                        |
| ------------------ | --------------------------------------------- |
| LoginResult        | accessToken, refreshToken, userId, redirectTo |
| TokenRefreshResult | accessToken                                   |
| LogoutResult       | ok                                            |

### Queries

| Name         | Method | Route                            | Request DTO         | Response DTO       |
| ------------ | ------ | -------------------------------- | ------------------- | ------------------ |
| Login        | POST   | /api/auth/login                  | LoginRequest        | LoginResult        |
| DummyLogin   | POST   | /api/auth/login/dummy            | { next? }           | LoginResult        |
| RefreshToken | POST   | /api/auth/refresh                | RefreshTokenRequest | TokenRefreshResult |
| OAuthStart   | GET    | /api/auth/oauth/{provider}/start | OAuthStartQuery     | -                  |
| Logout       | POST   | /api/auth/logout                 | LogoutRequest       | LogoutResult       |

> Auth 는 프론트 Next.js BFF 공개 계약이다. FE 는 `/api/auth/*` 를 호출하고, BFF 가 실제 BE auth upstream 을 프록시하거나 mock dev login 을 처리한다. 나머지 도메인 API 는 `NEXT_PUBLIC_API_BASE_URL` 기준 공개 API 로 호출한다.

## Feed

### Entities

| Entity                 | Fields                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FeedAuthorProfile      | id, nickname, avatarUrl?, role ('SUPPORTER'\|'PARTNER'), rating? (SUPPORTER only), field? (SUPPORTER only)                                                                                                                                                                                                                                                                                                                                                   |
| FeedItem               | id, title, description?, location, authorNickname, authorProfile?, price, type, status, progressPercent?, imageUrl?, views, likes, partnerCount? (OFFER), applicantCount? (REQUEST), category?, deadline?, maxParticipants?, isBookmarked?, myApplicationStatus?, isAi? (boolean, 2026-04-30 — AI 합성 피드 마커), plan? (PlanV3, 2026-04-30), priceBreakdown? (2026-04-30), preparation? (2026-04-30), venueAnchors? (2026-04-30), primaryPin? (2026-04-30) |
| SupporterItem          | id, nickname, avatarUrl?, category, tagline, tags[], completedCount, rating, location, relatedOfferId?                                                                                                                                                                                                                                                                                                                                                       |
| SupporterApplication   | id, nickname, avatarUrl?, category, tagline, tags[], completedCount, rating, location, relatedOfferId?, relatedRequestId?, proposal, competitionScore, status                                                                                                                                                                                                                                                                                                |
| FeedApplication        | id, feedId, userId, proposal, status, appliedRole, deposit, createdAt, plan?, preparation?                                                                                                                                                                                                                                                                                                                                                                   |
| FeedParticipantProfile | id, nickname, avatarUrl?                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| FeedDemandSnapshot     | fundingGoal, fundedAmount, requiredPartners, confirmedPartners, confirmedPartnerProfiles[], partnerSlotLabels?, deadlineLabel, hostNote, currentAmountLabel?, targetAmountLabel?, progressLabel?                                                                                                                                                                                                                                                             |
| FeedCompetitionInsight | label, value, tone?                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| FeedManagementFlow     | feedId, stageLabel, demand, applications[], insights[]                                                                                                                                                                                                                                                                                                                                                                                                       |

### Request DTO

| DTO                      | Fields                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| FeedListQuery            | tab?, type?, status?, category?, sort?, page?, size?                |
| FeedBookmarkRequest      | -                                                                   |
| FeedApplyRequest         | proposal, role, deposit, plan? (PlanV3), preparation? (Preparation) |
| UpdateFeedDetailsRequest | plan? (PlanV3), preparation? (Preparation)                          |
| FeedApplicationListQuery | status?, page?, size?                                               |
| FeedManagementFlowQuery  | -                                                                   |

### Response DTO

| DTO                         | Fields                                 |
| --------------------------- | -------------------------------------- |
| FeedListResponse            | data[], page?, size?, total?, hasNext? |
| FeedDetailResponse          | data                                   |
| FeedApplyResponse           | data (FeedApplication)                 |
| FeedApplicationListResponse | data[], meta?                          |
| FeedManagementFlowResponse  | data                                   |

### Queries

| Name                  | Method | Route                                               | Request DTO              | Response DTO                |
| --------------------- | ------ | --------------------------------------------------- | ------------------------ | --------------------------- |
| GetFeedList           | GET    | /feeds                                              | FeedListQuery            | FeedListResponse            |
| GetFeedDetail         | GET    | /feeds/{feedId}                                     | -                        | FeedDetailResponse          |
| AddFeedBookmark       | POST   | /feeds/{feedId}/bookmark                            | FeedBookmarkRequest      | -                           |
| RemoveFeedBookmark    | DELETE | /feeds/{feedId}/bookmark                            | -                        | -                           |
| ApplyFeed             | POST   | /feeds/{feedId}/apply                               | FeedApplyRequest         | FeedApplyResponse           |
| CancelFeedApply       | DELETE | /feeds/{feedId}/apply                               | -                        | -                           |
| UpdateFeedDetails     | PATCH  | /feeds/{feedId}                                     | UpdateFeedDetailsRequest | FeedDetailResponse          |
| AcceptFeedApplication | PATCH  | /feeds/{feedId}/applications/{applicationId}/accept | -                        | FeedApplyResponse           |
| RejectFeedApplication | PATCH  | /feeds/{feedId}/applications/{applicationId}/reject | -                        | FeedApplyResponse           |
| AddFeedLike           | POST   | /feeds/{feedId}/like                                | -                        | -                           |
| RemoveFeedLike        | DELETE | /feeds/{feedId}/like                                | -                        | -                           |
| GetMyFeedApplications | GET    | /users/me/feed-applications                         | FeedApplicationListQuery | FeedApplicationListResponse |
| GetFeedManagementFlow | GET    | /feeds/{feedId}/management-flow                     | FeedManagementFlowQuery  | FeedManagementFlowResponse  |

## Spot

> **Frontend loading note:** On SpotDetail page entry, votes, checklist, files, and notes are fetched in parallel via `Promise.all`. Each section handles its own loading/skeleton state independently. The `GET /spots/{spotId}` response intentionally excludes these sub-resources.
>
> **Mock-to-BE implementation guide (2026-05-01 share):** Treat `src/entities/spot/types.ts` plus `src/features/spot/model/mock.ts` as the latest frontend source of truth. The backend should persist the normalized resources separately (`spots`, `spot_participants`, `spot_schedule_slots`, `spot_votes/options/voters`, `spot_checklist_items`, `spot_files`, `spot_notes`, `spot_reviews`, `spot_settlements`) and expose them through the endpoints below. Response wrappers are `ApiResponse<T>` / `PagedResponse<T>`; `GET /spots/{spotId}` returns `SpotDetail` + `timeline`, while heavy/detail widgets are fetched by their own endpoints.
>
> **2026-04-30 디테일 페이지 통합:** FE 의 `/feed/[id]` 디테일 페이지가 contextBuilder `PlanV3` / `PriceBreakdown` / `Preparation` / `ResolvedPlace[]` 를 그대로 렌더한다. 같은 객체 정의가 `Shared` 의 contextBuilder value object 로 관리되며 `FeedItem` / `CreateSpotRequest` / `FeedApplyRequest` / `UpdateFeedDetailsRequest` 에서 재사용된다. OFFER 는 작성 시 채우는 게 정책, REQUEST 는 비워서 만들 수 있고 매칭된 서포터가 `FeedApplyRequest.plan`/`preparation` 으로 채우거나 작성자/매칭 서포터가 `PATCH /feeds/{feedId}` 로 수정한다.
>
> **현재 FE 신청 계약:** `src/features/feed/api/feed-api.ts` 기준 `POST /feeds/{feedId}/apply` 는 `{ proposal, role, deposit }` 를 필수로 보낸다. `role` 은 신청자가 어떤 역할로 참여하는지 결정하고, `deposit` 은 FE 가 현재 UI 미리보기/포인트 차감에 사용한 보증금이다. BE 는 보안상 deposit 을 신뢰하지 말고 동일 공식으로 재계산·검증한 뒤 authoritative 값을 저장/응답해야 한다. `plan` / `preparation` 은 REQUEST 상세를 신청자가 보강하는 경우에만 optional 로 받는다.

### Entities

| Entity                 | Fields                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Spot                   | id, type, status, title, description, pointCost, authorId, authorNickname, createdAt, updatedAt, forfeitPool?       |
| TimelineEvent          | id, kind, actorId, actorNickname, content?, createdAt                                                               |
| TimelineEventKind      | CREATED \| MATCHED \| COMPLETED \| CANCELLED \| COMMENT \| SETTLEMENT_REQUESTED \| SETTLEMENT_APPROVED              |
| SpotDetail             | id, type, status, title, description, pointCost, authorId, authorNickname, createdAt, updatedAt, timeline[]         |
| SpotParticipant        | userId, nickname, role, joinedAt                                                                                    |
| SpotForfeitPool        | toPool, toPlatformFee                                                                                               |
| ScheduleSlot           | date, hour, availableUserIds[]                                                                                      |
| SpotSchedule           | spotId, proposedSlots[], confirmedSlot?                                                                             |
| VoteOption             | id, label, voterIds[]                                                                                               |
| SpotVote               | id, spotId, question, options[], multiSelect, closedAt?                                                             |
| ChecklistItem          | id, text, completed, assigneeId?, assigneeNickname?                                                                 |
| SpotChecklist          | spotId, items[]                                                                                                     |
| SharedFile             | id, spotId, uploaderNickname, name, url, sizeBytes, uploadedAt                                                      |
| ProgressNote           | id, spotId, authorNickname, content, createdAt                                                                      |
| SpotReview             | id, spotId, reviewerNickname, targetNickname, rating, comment?, createdAt                                           |
| SpotSettlementApproval | status, requestedAmount, approvedAmount, summary, lineItems[], submittedBy?, submittedAt?, approvedBy?, approvedAt? |
| SpotSettlementLineItem | label, amount                                                                                                       |

### Request DTO

| DTO                     | Fields                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| SpotListQuery           | type?, status?, participating?, page?, size?                                                                             |
| CreateSpotRequest       | type, title, description, pointCost, plan? (PlanV3, 2026-04-30), priceBreakdown? (2026-04-30), preparation? (2026-04-30) |
| UpsertScheduleRequest   | slots[]                                                                                                                  |
| CreateVoteRequest       | question, options[], multiSelect?                                                                                        |
| CastVoteRequest         | optionIds[]                                                                                                              |
| UpsertChecklistRequest  | items[]                                                                                                                  |
| UploadSpotFilesRequest  | files[]                                                                                                                  |
| CreateNoteRequest       | content                                                                                                                  |
| CreateReviewRequest     | targetNickname, rating, comment?                                                                                         |
| SubmitSettlementRequest | lineItems[], summary                                                                                                     |

### Response DTO

| DTO                      | Fields                                 |
| ------------------------ | -------------------------------------- |
| SpotListResponse         | data[], page?, size?, total?, hasNext? |
| SpotDetailResponse       | data                                   |
| SpotResponse             | data                                   |
| SpotParticipantsResponse | data[]                                 |
| SpotScheduleResponse     | data                                   |
| SpotVotesResponse        | data[]                                 |
| SpotVoteResponse         | data                                   |
| SpotChecklistResponse    | data                                   |
| SpotFilesResponse        | data[]                                 |
| SpotFileUploadResponse   | data[]                                 |
| SpotNotesResponse        | data[]                                 |
| SpotNoteResponse         | data                                   |
| SpotReviewsResponse      | data[]                                 |
| SpotReviewResponse       | data                                   |
| SpotSettlementResponse   | data                                   |

### Queries

| Name                  | Method | Route                               | Request DTO             | Response DTO             |
| --------------------- | ------ | ----------------------------------- | ----------------------- | ------------------------ |
| GetSpotList           | GET    | /spots                              | SpotListQuery           | SpotListResponse         |
| GetSpotDetail         | GET    | /spots/{spotId}                     | -                       | SpotDetailResponse       |
| CreateSpot            | POST   | /spots                              | CreateSpotRequest       | SpotResponse             |
| MatchSpot             | POST   | /spots/{spotId}/match               | -                       | SpotResponse             |
| CancelSpot            | POST   | /spots/{spotId}/cancel              | -                       | SpotResponse             |
| CompleteSpot          | POST   | /spots/{spotId}/complete            | -                       | SpotResponse             |
| GetSpotParticipants   | GET    | /spots/{spotId}/participants        | -                       | SpotParticipantsResponse |
| GetSpotSchedule       | GET    | /spots/{spotId}/schedule            | -                       | SpotScheduleResponse     |
| UpsertSpotSchedule    | PUT    | /spots/{spotId}/schedule            | UpsertScheduleRequest   | SpotScheduleResponse     |
| GetSpotVotes          | GET    | /spots/{spotId}/votes               | -                       | SpotVotesResponse        |
| CreateSpotVote        | POST   | /spots/{spotId}/votes               | CreateVoteRequest       | SpotVoteResponse         |
| CastSpotVote          | POST   | /spots/{spotId}/votes/{voteId}/cast | CastVoteRequest         | SpotVoteResponse         |
| GetSpotChecklist      | GET    | /spots/{spotId}/checklist           | -                       | SpotChecklistResponse    |
| UpsertSpotChecklist   | PUT    | /spots/{spotId}/checklist           | UpsertChecklistRequest  | SpotChecklistResponse    |
| GetSpotFiles          | GET    | /spots/{spotId}/files               | -                       | SpotFilesResponse        |
| UploadSpotFiles       | POST   | /spots/{spotId}/files               | UploadSpotFilesRequest  | SpotFileUploadResponse   |
| DeleteSpotFile        | DELETE | /spots/{spotId}/files/{fileId}      | -                       | -                        |
| GetSpotNotes          | GET    | /spots/{spotId}/notes               | -                       | SpotNotesResponse        |
| CreateSpotNote        | POST   | /spots/{spotId}/notes               | CreateNoteRequest       | SpotNoteResponse         |
| GetSpotReviews        | GET    | /spots/{spotId}/reviews             | -                       | SpotReviewsResponse      |
| CreateSpotReview      | POST   | /spots/{spotId}/reviews             | CreateReviewRequest     | SpotReviewResponse       |
| SubmitSpotSettlement  | POST   | /spots/{spotId}/settlement          | SubmitSettlementRequest | SpotSettlementResponse   |
| ApproveSpotSettlement | POST   | /spots/{spotId}/settlement/approve  | -                       | SpotSettlementResponse   |

> `UploadSpotFiles` delegates raw upload to `POST /uploads/batch`, then associates the returned URLs with the spot as `SharedFile[]`.

## Post

### Entities

| Entity           | Fields                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Post             | id, type, spotName, title, content, categories[], photoUrls[], pointCost, detailDescription, supporterPhotoUrl?, serviceStylePhotoUrl?, createdAt |
| PostSpotCategory | 음식·요리, BBQ·조개, 공동구매, 교육, 운동, 공예, 음악, 기타                                                                                       |
| PostCompletion   | id, type, title, redirectUrl                                                                                                                      |

### Request DTO

| DTO                      | Fields                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CreateOfferPostRequest   | type, spotName, title, content, categories[], photoUrls[], pointCost, location, deadline, detailDescription, supporterPhotoUrl?, qualifications?, desiredPrice, maxPartnerCount, autoClose |
| CreateRequestPostRequest | type, spotName, title, content, categories[], photoUrls[], pointCost, location, deadline, detailDescription, serviceStylePhotoUrl?, preferredSchedule?, maxPartnerCount, priceCapPerPerson |
| UploadFileRequest        | file                                                                                                                                                                                       |

### Response DTO

| DTO                    | Fields |
| ---------------------- | ------ |
| PostResponse           | data   |
| PostCompletionResponse | data   |
| UploadFileResponse     | url    |

### Queries

| Name              | Method | Route          | Request DTO              | Response DTO           |
| ----------------- | ------ | -------------- | ------------------------ | ---------------------- |
| CreateOfferPost   | POST   | /posts/offer   | CreateOfferPostRequest   | PostCompletionResponse |
| CreateRequestPost | POST   | /posts/request | CreateRequestPostRequest | PostCompletionResponse |

> File uploads use the shared `POST /uploads` and `POST /uploads/batch` endpoints (see Shared section).

## My/User

### Entities

| Entity                   | Fields                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| UserProfile              | id, nickname, email, phone?, avatarUrl?, pointBalance, joinedAt                                                                            |
| UserPersona              | userId, role (SUPPORTER\|PARTNER), archetype (explorer\|helper\|creator\|connector\|learner), interests[] (FeedCategory values), createdAt |
| NotificationSettings     | serviceNoticeEnabled, activityEnabled, pushEnabled, emailEnabled, updatedAt                                                                |
| SupporterRegistration    | field, mediaUrls[], career, bio, verificationStatus, verificationNotes, extraNotes, updatedAt?                                             |
| MySpot                   | id, type, status, title, description, pointCost, authorId, authorNickname, role, joinedAt?, createdAt, updatedAt                           |
| Participation            | spotId, spotTitle, spotType, role, status, joinedAt                                                                                        |
| ProfileReview            | id, reviewerNickname, rating, comment?, spotTitle, createdAt                                                                               |
| ProfileHistory           | spotId, spotTitle, spotType, completedAt, reviewCount, avgRating?                                                                          |
| SupporterProfile         | id, profileType, nickname, avatarUrl?, field, mediaUrls[], career, bio, avgRating, reviewCount, reviews[], history[]                       |
| PartnerProfile           | id, profileType, nickname, avatarUrl?, interestCategories[], isFriend                                                                      |
| MyFavoriteItem           | id, targetId, title, description?, type, savedAt, pointCost?, authorNickname?, status?                                                     |
| MyRecentViewItem         | id, targetId, title, description?, type, viewedAt, pointCost?, authorNickname?, status?                                                    |
| MySupportActivitySummary | avgRating, reviewCount, completedCount, latestReview?                                                                                      |

### Request DTO

| DTO                                | Fields                                                           |
| ---------------------------------- | ---------------------------------------------------------------- |
| PaginationQuery                    | page?, size?                                                     |
| MySpotListQuery                    | role?, page?, size?                                              |
| UpdateProfileRequest               | avatarUrl?, nickname?, email?, phone?                            |
| ChangePasswordRequest              | currentPassword, newPassword, confirmPassword                    |
| UpdateNotificationSettingsRequest  | serviceNoticeEnabled, activityEnabled, pushEnabled, emailEnabled |
| UpdateSupporterRegistrationRequest | field, mediaUrls[], career, bio                                  |
| UpdateSupporterProfileRequest      | field, mediaUrls[], career, bio                                  |

### Response DTO

| DTO                            | Fields                                 |
| ------------------------------ | -------------------------------------- |
| UserProfileResponse            | data                                   |
| NotificationSettingsResponse   | data                                   |
| SupporterRegistrationResponse  | data                                   |
| SupporterProfileResponse       | data                                   |
| PartnerProfileResponse         | data                                   |
| MySpotListResponse             | data[], page?, size?, total?, hasNext? |
| ParticipationListResponse      | data[], page?, size?, total?, hasNext? |
| FavoritesListResponse          | data[], page?, size?, total?, hasNext? |
| RecentViewsListResponse        | data[], page?, size?, total?, hasNext? |
| SupportActivitySummaryResponse | data                                   |

### Queries

| Name                          | Method | Route                                 | Request DTO                        | Response DTO                                      |
| ----------------------------- | ------ | ------------------------------------- | ---------------------------------- | ------------------------------------------------- |
| GetMyProfile                  | GET    | /users/me                             | -                                  | UserProfileResponse                               |
| UpdateMyProfile               | PATCH  | /users/me                             | UpdateProfileRequest               | UserProfileResponse                               |
| ChangeMyPassword              | PATCH  | /users/me/password                    | ChangePasswordRequest              | -                                                 |
| GetMyNotificationSettings     | GET    | /users/me/notification-settings       | -                                  | NotificationSettingsResponse                      |
| UpdateMyNotificationSettings  | PUT    | /users/me/notification-settings       | UpdateNotificationSettingsRequest  | NotificationSettingsResponse                      |
| GetMySupporterRegistration    | GET    | /users/me/supporter-registration      | -                                  | SupporterRegistrationResponse                     |
| UpdateMySupporterRegistration | PUT    | /users/me/supporter-registration      | UpdateSupporterRegistrationRequest | SupporterRegistrationResponse                     |
| GetMySupporterProfile         | GET    | /users/me/supporter-profile           | -                                  | SupporterProfileResponse                          |
| UpdateMySupporterProfile      | PUT    | /users/me/supporter-profile           | UpdateSupporterProfileRequest      | SupporterProfileResponse                          |
| GetMySpots                    | GET    | /users/me/spots                       | MySpotListQuery                    | MySpotListResponse                                |
| GetMyParticipations           | GET    | /users/me/participations              | PaginationQuery                    | ParticipationListResponse                         |
| GetMyFavorites                | GET    | /users/me/favorites                   | PaginationQuery                    | FavoritesListResponse                             |
| DeleteMyFavorite              | DELETE | /users/me/favorites/{favoriteId}      | -                                  | -                                                 |
| GetMyRecentViews              | GET    | /users/me/recent-views                | PaginationQuery                    | RecentViewsListResponse                           |
| DeleteMyRecentView            | DELETE | /users/me/recent-views/{recentViewId} | -                                  | -                                                 |
| ClearMyRecentViews            | DELETE | /users/me/recent-views                | -                                  | -                                                 |
| GetMySupportActivitySummary   | GET    | /users/me/support-activity-summary    | -                                  | SupportActivitySummaryResponse                    |
| GetUserProfile                | GET    | /users/{userId}/profile               | -                                  | SupporterProfileResponse / PartnerProfileResponse |
| FollowUser                    | POST   | /users/{userId}/follow                | -                                  | -                                                 |
| UnfollowUser                  | DELETE | /users/{userId}/follow                | -                                  | -                                                 |

> `GetMySpots` is the My Spot dashboard card list for spots related to the authenticated user. `GetMyParticipations` remains a lighter activity/history list. For `GetMySpots`, `role=AUTHOR` means the authenticated user authored the spot, while `role=PARTICIPANT` means the authenticated user joined another user's spot.

## Pay

### Entities

| Entity            | Fields                                                 |
| ----------------- | ------------------------------------------------------ |
| PointBalance      | balance, updatedAt                                     |
| PointTransaction  | id, type, amount, balanceAfter, description, createdAt |
| LinkedBankAccount | bankName, accountNumber, accountHolder, updatedAt      |
| PointWithdrawal   | id, amount, status, requestedAt                        |

### Request DTO

| DTO                    | Fields                                 |
| ---------------------- | -------------------------------------- |
| PaginationQuery        | page?, size?                           |
| ChargePointsRequest    | amount                                 |
| LinkBankAccountRequest | bankName, accountNumber, accountHolder |
| WithdrawPointsRequest  | amount                                 |

### Response DTO

| DTO                       | Fields                                 |
| ------------------------- | -------------------------------------- |
| PointBalanceResponse      | data                                   |
| LinkedBankAccountResponse | data                                   |
| PointWithdrawalsResponse  | data[]                                 |
| PointHistoryResponse      | data[], page?, size?, total?, hasNext? |

### Queries

| Name                 | Method | Route               | Request DTO            | Response DTO              |
| -------------------- | ------ | ------------------- | ---------------------- | ------------------------- |
| GetPointBalance      | GET    | /points/balance     | -                      | PointBalanceResponse      |
| GetLinkedBankAccount | GET    | /points/account     | -                      | LinkedBankAccountResponse |
| LinkBankAccount      | PUT    | /points/account     | LinkBankAccountRequest | LinkedBankAccountResponse |
| GetPointWithdrawals  | GET    | /points/withdrawals | PaginationQuery        | PointWithdrawalsResponse  |
| GetPointHistory      | GET    | /points/history     | PaginationQuery        | PointHistoryResponse      |
| ChargePoints         | POST   | /points/charge      | ChargePointsRequest    | PointBalanceResponse      |
| WithdrawPoints       | POST   | /points/withdraw    | WithdrawPointsRequest  | PointBalanceResponse      |

## Chat

### Entities

| Entity                            | Fields                                                                                                                                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ChatFriend                        | id, name, role ('SUPPORTER'\|'PARTNER'), presenceLabel                                                                                                                                                     |
| ChatScheduleDraft                 | id, spotId, title, description, metaLabel, createdAt                                                                                                                                                       |
| ChatReverseOfferFinancialSource   | 'management' \| 'estimated'                                                                                                                                                                                |
| ChatReverseOfferFinancialSnapshot | sourceKind, targetAmount, agreedHeadcount, currentHeadcount, agreedPerPersonAmount, agreedRemainder, currentPerPersonAmount, currentRemainder, comparisonNeeded                                            |
| ChatReverseOfferSummary           | id, spotId, status, approvedPartnerCount, totalPartnerCount, priorAgreementReachedInChat, financialSnapshot?, createdAt, updatedAt                                                                         |
| ChatMessageSystem                 | id, kind, content, createdAt                                                                                                                                                                               |
| ChatMessageText                   | id, kind, authorId, authorName, content, createdAt                                                                                                                                                         |
| ChatMessageVote                   | id, kind, authorId, authorName, vote, createdAt                                                                                                                                                            |
| ChatMessageSchedule               | id, kind, authorId, authorName, schedule, createdAt                                                                                                                                                        |
| ChatMessageFile                   | id, kind, authorId, authorName, file, createdAt                                                                                                                                                            |
| ChatMessageShortcut               | id, kind ('shortcut'), authorId, authorName, shortcut { actionKind, actionId, label, title, preview }, createdAt                                                                                           |
| ChatMessageProposal               | id, kind, authorId, authorName, proposal, status, createdAt                                                                                                                                                |
| ChatMessageReverseOffer           | id, kind ('reverse-offer'), authorId, authorName, reverseOffer, createdAt                                                                                                                                  |
| PersonalChatRoom                  | id, category, currentUserId, currentUserName, title, subtitle, description, metaLabel, updatedAt, messages[], partnerId, partnerName, presenceLabel, unreadCount, counterpartRole ('SUPPORTER'\|'PARTNER') |
| SpotChatRoom                      | id, category, currentUserId, currentUserName, title, subtitle, description, metaLabel, updatedAt, messages[], spot, reverseOffer?, sourceFeedId?, participationRole ('SUPPORTER'\|'PARTNER')               |

### Request DTO

| DTO                    | Fields                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ------ | --------------- | --- |
| ChatRoomsQuery         | category?, filter?, page?, size?                                                                   |
| ChatMessagesQuery      | beforeId?, size?                                                                                   |
| CreateChatRoomRequest  | category, userId?, spotId?                                                                         |
| SendChatMessageRequest | kind (includes 'reverse-offer'), content?, voteId?, scheduleId?, fileId?, proposal?, reverseOffer? |
| MarkChatReadRequest    | -                                                                                                  |
| ChatSSEEvent           | type ('message'                                                                                    | 'read' | 'typing'), data |     |

### Response DTO

| DTO                  | Fields |
| -------------------- | ------ |
| ChatRoomsResponse    | data[] |
| ChatRoomResponse     | data   |
| ChatMessagesResponse | data[] |
| ChatMessageResponse  | data   |

### Queries

| Name              | Method          | Route                         | Request DTO            | Response DTO         |
| ----------------- | --------------- | ----------------------------- | ---------------------- | -------------------- |
| GetChatRooms      | GET             | /chat/rooms                   | ChatRoomsQuery         | ChatRoomsResponse    |
| CreateChatRoom    | POST            | /chat/rooms                   | CreateChatRoomRequest  | ChatRoomResponse     |
| GetChatRoom       | GET             | /chat/rooms/{roomId}          | -                      | ChatRoomResponse     |
| GetChatMessages   | GET             | /chat/rooms/{roomId}/messages | ChatMessagesQuery      | ChatMessagesResponse |
| SendChatMessage   | POST            | /chat/rooms/{roomId}/messages | SendChatMessageRequest | ChatMessageResponse  |
| MarkChatRoomRead  | POST            | /chat/rooms/{roomId}/read     | MarkChatReadRequest    | -                    |
| ChatSSEEvent      | type ('message' | 'read'                        | 'typing'), data        |                      |
| GetChatRoomBySpot | GET             | /chat/rooms/by-spot/{spotId}  | -                      | ChatRoomResponse     |
| GetChatRoomByUser | GET             | /chat/rooms/by-user/{userId}  | -                      | ChatRoomResponse     |
| ConnectChatSSE    | GET             | /chat/connect                 | { roomId? }            | SSE: ChatSSEEvent    |

## Future-needed but not current FE MVP

다음 영역은 현재 프론트 구현/연동이 아직 부족할 수 있지만, 최종 서비스에서 필요한 기능이므로 handoff 에서 삭제하지 않는다. 백엔드 구현 우선순위는 v1 필수보다 낮게 두되, 계약은 유지한다.

## Search

### Entities

| Entity           | Fields                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| SearchKeyword    | keyword                                                                                         |
| SearchTab        | spot, post, user                                                                                |
| SpotSearchResult | id, type, status, title, description, pointCost, authorId, authorNickname, createdAt, updatedAt |
| PostSearchResult | id, type, title, content, categories[], pointCost, authorNickname                               |
| UserSearchResult | id, profileType, nickname, avatarUrl?, field?, rating?, location?                               |

### Request DTO

| DTO         | Fields                   |
| ----------- | ------------------------ |
| SearchQuery | query, tab, page?, size? |

### Response DTO

| DTO                | Fields |
| ------------------ | ------ |
| SpotSearchResponse | data[] |
| PostSearchResponse | data[] |
| UserSearchResponse | data[] |

### Queries

| Name        | Method | Route         | Request DTO | Response DTO       |
| ----------- | ------ | ------------- | ----------- | ------------------ |
| SearchSpots | GET    | /search/spots | SearchQuery | SpotSearchResponse |
| SearchPosts | GET    | /search/posts | SearchQuery | PostSearchResponse |
| SearchUsers | GET    | /search/users | SearchQuery | UserSearchResponse |

## Bookmarks

### Entities

| Entity             | Fields                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| BookmarkItem       | id, targetId, targetType, title, summary?, thumbnailUrl?, authorNickname?, savedAt, popularity?, deadline?, status? |
| BookmarkSort       | latest, popular, closingSoon                                                                                        |
| BookmarkTargetType | post, spot                                                                                                          |

### Request DTO

| DTO               | Fields                           |
| ----------------- | -------------------------------- |
| BookmarkListQuery | targetType?, sort?, page?, size? |

### Response DTO

| DTO                  | Fields                                 |
| -------------------- | -------------------------------------- |
| BookmarkListResponse | data[], page?, size?, total?, hasNext? |

### Queries

| Name         | Method | Route      | Request DTO       | Response DTO         |
| ------------ | ------ | ---------- | ----------------- | -------------------- |
| GetBookmarks | GET    | /bookmarks | BookmarkListQuery | BookmarkListResponse |

## Notifications

### Entities

| Entity           | Fields                                              |
| ---------------- | --------------------------------------------------- |
| Notification     | id, type, title, body, createdAt, isRead, deepLink? |
| NotificationType | comment, reply, like, mention, invite               |

### Request DTO

| DTO                         | Fields                |
| --------------------------- | --------------------- |
| NotificationListQuery       | filter?, page?, size? |
| MarkNotificationReadRequest | -                     |

### Response DTO

| DTO                      | Fields                                 |
| ------------------------ | -------------------------------------- |
| NotificationListResponse | data[], page?, size?, total?, hasNext? |

### Queries

| Name                     | Method | Route                                | Request DTO                 | Response DTO             |
| ------------------------ | ------ | ------------------------------------ | --------------------------- | ------------------------ |
| GetNotifications         | GET    | /notifications                       | NotificationListQuery       | NotificationListResponse |
| MarkNotificationRead     | POST   | /notifications/{notificationId}/read | MarkNotificationReadRequest | -                        |
| MarkAllNotificationsRead | POST   | /notifications/read-all              | -                           | -                        |
| DeleteNotification       | DELETE | /notifications/{notificationId}      | -                           | -                        |
| ClearNotifications       | DELETE | /notifications                       | -                           | -                        |

## Admin Post

### Entities

| Entity           | Fields                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| AdminPost        | id, type, isNotice, title, summary, teaser, authorName, publishedAt, introTitle, introBody, body[], hotSpot, relatedFeedIds[] |
| AdminPostHotSpot | category, title, subtitle, imageUrl?                                                                                          |
| AdminPostFaqItem | question, answer                                                                                                              |

### Request DTO

| DTO                | Fields                         |
| ------------------ | ------------------------------ |
| AdminPostListQuery | type?, isNotice?, page?, size? |

### Response DTO

| DTO                   | Fields                                 |
| --------------------- | -------------------------------------- |
| AdminPostListResponse | data[], page?, size?, total?, hasNext? |
| AdminPostResponse     | data                                   |

### Queries

| Name               | Method | Route                      | Request DTO        | Response DTO          |
| ------------------ | ------ | -------------------------- | ------------------ | --------------------- |
| GetAdminPostList   | GET    | /admin-posts               | AdminPostListQuery | AdminPostListResponse |
| GetAdminPostDetail | GET    | /admin-posts/{adminPostId} | -                  | AdminPostResponse     |

## Removed / discarded scope

다음 기능은 “아직 미개발”이 아니라 현재 제품 방향에서 제외/폐기된 범위이므로 백엔드 구현 요구사항에서 제외한다.

| Removed area                                             | Reason                                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Locality / zoom-out region API (`/api/locality/regions`) | 예전 줌아웃 지역 특성 기능. leftover hook/mock/type 만 있고 실제 제품 기능에서 제거됨.                                    |
| Simulation/contextBuilder runtime APIs                   | 현재 spot 백엔드 회의 범위에서 제외. Map persona stream, timeline stream, highlights, sim run/chunk API 등 구현하지 않음. |
| Spot workflow concept/API                                | 예전 prototype workflow UI/API 범위. 별도 workflow 리소스는 구현하지 않고, 필요한 정산은 settlement endpoints 로만 처리.  |
