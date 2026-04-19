# UI Backend Spec

> **2026-04 map-v3 리디자인 (UI-only):** `Persona` 타입에 UI 파생 필드(`category`, `intent`, `interestItemIds`) 추가. BE 계약 변경 없음. 클러스터링은 FE 파생 연산.

## Shared

### Entities

| Entity              | Fields           |
| ------------------- | ---------------- |
| UploadFileRequest   | file (binary)    |
| UploadFileResponse  | url              |
| BatchUploadRequest  | files[] (binary) |
| BatchUploadResponse | urls[]           |

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

| Name         | Method | Route                        | Request DTO         | Response DTO       |
| ------------ | ------ | ---------------------------- | ------------------- | ------------------ |
| Login        | POST   | /auth/login                  | LoginRequest        | LoginResult        |
| RefreshToken | POST   | /auth/refresh                | RefreshTokenRequest | TokenRefreshResult |
| OAuthStart   | GET    | /auth/oauth/{provider}/start | OAuthStartQuery     | -                  |
| Logout       | POST   | /auth/logout                 | LogoutRequest       | LogoutResult       |

## Feed

### Entities

| Entity                 | Fields                                                                                                                                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FeedAuthorProfile      | id, nickname, avatarUrl?, role ('SUPPORTER'\|'PARTNER'), rating? (SUPPORTER only), field? (SUPPORTER only)                                                                                                                                                       |
| FeedItem               | id, title, description?, location, authorNickname, authorProfile?, price, type, status, progressPercent?, imageUrl?, views, likes, partnerCount? (OFFER), applicantCount? (REQUEST), category?, deadline?, maxParticipants?, isBookmarked?, myApplicationStatus? |
| SupporterItem          | id, nickname, avatarUrl?, category, tagline, tags[], completedCount, rating, location, relatedOfferId?                                                                                                                                                           |
| SupporterApplication   | id, nickname, avatarUrl?, category, tagline, tags[], completedCount, rating, location, relatedOfferId?, relatedRequestId?, proposal, competitionScore, status                                                                                                    |
| FeedParticipantProfile | id, nickname, avatarUrl?                                                                                                                                                                                                                                         |
| FeedDemandSnapshot     | fundingGoal, fundedAmount, requiredPartners, confirmedPartners, confirmedPartnerProfiles[], partnerSlotLabels?, deadlineLabel, hostNote, currentAmountLabel?, targetAmountLabel?, progressLabel?                                                                 |
| FeedCompetitionInsight | label, value, tone?                                                                                                                                                                                                                                              |
| FeedManagementFlow     | feedId, stageLabel, demand, applications[], insights[]                                                                                                                                                                                                           |

### Request DTO

| DTO                      | Fields                                               |
| ------------------------ | ---------------------------------------------------- |
| FeedListQuery            | tab?, type?, status?, category?, sort?, page?, size? |
| FeedBookmarkRequest      | -                                                    |
| FeedApplyRequest         | proposal                                             |
| FeedApplicationListQuery | status?, page?, size?                                |
| FeedManagementFlowQuery  | -                                                    |

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
| AcceptFeedApplication | PATCH  | /feeds/{feedId}/applications/{applicationId}/accept | -                        | FeedApplyResponse           |
| RejectFeedApplication | PATCH  | /feeds/{feedId}/applications/{applicationId}/reject | -                        | FeedApplyResponse           |
| AddFeedLike           | POST   | /feeds/{feedId}/like                                | -                        | -                           |
| RemoveFeedLike        | DELETE | /feeds/{feedId}/like                                | -                        | -                           |
| GetMyFeedApplications | GET    | /users/me/feed-applications                         | FeedApplicationListQuery | FeedApplicationListResponse |
| GetFeedManagementFlow | GET    | /feeds/{feedId}/management-flow                     | FeedManagementFlowQuery  | FeedManagementFlowResponse  |

## Spot

> **Frontend loading note:** On SpotDetail page entry, votes, checklist, files, and notes are fetched in parallel via `Promise.all`. Each section handles its own loading/skeleton state independently. The `GET /spots/{spotId}` response intentionally excludes these sub-resources.

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
| SpotWorkflow           | spotId, progressLabel, voteSummary?, finalApproval?, settlementApproval?                                            |
| SpotSettlementApproval | status, requestedAmount, approvedAmount, summary, lineItems[], submittedBy?, submittedAt?, approvedBy?, approvedAt? |
| SpotSettlementLineItem | label, amount                                                                                                       |

### Request DTO

| DTO                     | Fields                                       |
| ----------------------- | -------------------------------------------- |
| SpotListQuery           | type?, status?, participating?, page?, size? |
| CreateSpotRequest       | type, title, description, pointCost          |
| UpsertScheduleRequest   | slots[]                                      |
| CreateVoteRequest       | question, options[], multiSelect?            |
| CastVoteRequest         | optionIds[]                                  |
| UpsertChecklistRequest  | items[]                                      |
| UploadSpotFilesRequest  | files[]                                      |
| CreateNoteRequest       | content                                      |
| CreateReviewRequest     | targetNickname, rating, comment?             |
| SubmitSettlementRequest | lineItems[], summary                         |

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
| SpotWorkflowResponse     | data                                   |
| SpotSettlementResponse   | data                                   |

### Queries

| Name                  | Method | Route                               | Request DTO             | Response DTO             |
| --------------------- | ------ | ----------------------------------- | ----------------------- | ------------------------ | ---------------------------------- |
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
| UploadSpotFiles       | POST   | /spots/{spotId}/files               | UploadSpotFilesRequest  | SpotFileUploadResponse   | delegates to `POST /uploads/batch` |
| DeleteSpotFile        | DELETE | /spots/{spotId}/files/{fileId}      | -                       | -                        |
| GetSpotNotes          | GET    | /spots/{spotId}/notes               | -                       | SpotNotesResponse        |
| CreateSpotNote        | POST   | /spots/{spotId}/notes               | CreateNoteRequest       | SpotNoteResponse         |
| GetSpotReviews        | GET    | /spots/{spotId}/reviews             | -                       | SpotReviewsResponse      |
| CreateSpotReview      | POST   | /spots/{spotId}/reviews             | CreateReviewRequest     | SpotReviewResponse       |
| GetSpotWorkflow       | GET    | /spots/{spotId}/workflow            | -                       | SpotWorkflowResponse     |
| SubmitSpotSettlement  | POST   | /spots/{spotId}/settlement          | SubmitSettlementRequest | SpotSettlementResponse   |
| ApproveSpotSettlement | POST   | /spots/{spotId}/settlement/approve  | -                       | SpotSettlementResponse   |

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
| ChatSSEEvent                      | type ('message'\|'read'\|'typing'), data                                                                                                                                                                   |

### Request DTO

| DTO                    | Fields                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| ChatRoomsQuery         | category?, filter?, page?, size?                                                                   |
| ChatMessagesQuery      | beforeId?, size?                                                                                   |
| CreateChatRoomRequest  | category, userId?, spotId?                                                                         |
| SendChatMessageRequest | kind (includes 'reverse-offer'), content?, voteId?, scheduleId?, fileId?, proposal?, reverseOffer? |
| MarkChatReadRequest    | -                                                                                                  |

### Response DTO

| DTO                  | Fields |
| -------------------- | ------ |
| ChatRoomsResponse    | data[] |
| ChatRoomResponse     | data   |
| ChatMessagesResponse | data[] |
| ChatMessageResponse  | data   |

### Queries

| Name              | Method | Route                         | Request DTO            | Response DTO         |
| ----------------- | ------ | ----------------------------- | ---------------------- | -------------------- |
| GetChatRooms      | GET    | /chat/rooms                   | ChatRoomsQuery         | ChatRoomsResponse    |
| CreateChatRoom    | POST   | /chat/rooms                   | CreateChatRoomRequest  | ChatRoomResponse     |
| GetChatRoom       | GET    | /chat/rooms/{roomId}          | -                      | ChatRoomResponse     |
| GetChatMessages   | GET    | /chat/rooms/{roomId}/messages | ChatMessagesQuery      | ChatMessagesResponse |
| SendChatMessage   | POST   | /chat/rooms/{roomId}/messages | SendChatMessageRequest | ChatMessageResponse  |
| MarkChatRoomRead  | POST   | /chat/rooms/{roomId}/read     | MarkChatReadRequest    | -                    |
| GetChatRoomBySpot | GET    | /chat/rooms/by-spot/{spotId}  | -                      | ChatRoomResponse     |
| GetChatRoomByUser | GET    | /chat/rooms/by-user/{userId}  | -                      | ChatRoomResponse     |
| ConnectChatSSE    | GET    | /chat/connect                 | { roomId? }            | SSE: ChatSSEEvent    |

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

## Simulation (contextBuilder)

> contextBuilder 시뮬레이션 출력을 맵/피드/대시보드에서 소비. 모든 응답은 `ApiResponse<T>` 또는 `PagedResponse<T>` 봉투를 사용한다 (단, SSE 스트림은 봉투 없이 프레임 JSON을 직접 송출).

### Entities

| Entity               | Fields                                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SpotCard             | spot_id, provenance, title, skill_topic, teach_mode, venue_type, fee_per_partner, location, host_preview, person_fitness_score, attractiveness_score                                 |
| AttractivenessReport | composite_score, signals (Record<AttractivenessSignal, number>), improvement_hints[], price_benchmark                                                                                |
| AttractivenessSignal | title_hookiness \| price_reasonableness \| venue_accessibility \| host_reputation_fit \| time_slot_demand \| skill_rarity_bonus \| narrative_authenticity \| bonded_repeat_potential |
| AgentMarker          | agent_id, location, archetype?                                                                                                                                                       |
| SpotMarker           | spot_id, location, provenance, status (OPEN \| MATCHED \| CLOSED)                                                                                                                    |
| LiveEvent            | event_id, event_type, payload                                                                                                                                                        |
| TimelineFrame        | tick, day_of_week, time_slot, active_agents[], active_spots[], events_this_tick[]                                                                                                    |
| HighlightClip        | clip_id, title, category, start_tick, end_tick, involved_agents[], narrative                                                                                                         |
| ConversionHints      | source_virtual_spot_id, placeholder, pricing_suggestion, plan_help, expected_demand                                                                                                  |

### Request DTO

| DTO                 | Fields                                 |
| ------------------- | -------------------------------------- |
| MapSpotsQuery       | mode? ('virtual' \| 'real' \| 'mixed') |
| TimelineStreamQuery | -                                      |

### Response DTO

| DTO                          | Fields                      |
| ---------------------------- | --------------------------- |
| MapSpotsResponse             | data (SpotCard[])           |
| HighlightClipsResponse       | data (HighlightClip[])      |
| AttractivenessReportResponse | data (AttractivenessReport) |
| ConversionHintsResponse      | data (ConversionHints)      |

### Queries

| Name                     | Method | Route                                            | Request DTO         | Response DTO                 |
| ------------------------ | ------ | ------------------------------------------------ | ------------------- | ---------------------------- |
| GetMapSpots              | GET    | /api/v1/map/spots                                | MapSpotsQuery       | MapSpotsResponse             |
| StreamSimulationTimeline | GET    | /api/v1/simulation/runs/{run_id}/timeline/stream | TimelineStreamQuery | SSE: TimelineFrame           |
| GetSimulationHighlights  | GET    | /api/v1/simulation/runs/{run_id}/highlights      | -                   | HighlightClipsResponse       |
| GetFeedAttractiveness    | GET    | /api/v1/feed/{feed_id}/attractiveness            | -                   | AttractivenessReportResponse |
| GetFeedConversionHints   | GET    | /api/v1/feed/{feed_id}/conversion-hints          | -                   | ConversionHintsResponse      |

> `StreamSimulationTimeline`은 `text/event-stream`으로 `TimelineFrame` JSON을 프레임 단위 송출. 연결 유지 ping은 주석 라인(`: keepalive`)으로만 보내고 데이터 프레임에는 포함하지 않는다.

## Map Personas (live stream)

> **2026-04 신규:** 맵의 AI 페르소나를 실시간으로 표시하고 위치 이동 시 클러스터 생성/소멸을 시각화하기 위한 엔드포인트. FE 는 viewport bbox 기반 스냅샷 1회 + SSE 델타 스트림 구독을 조합해 `Map<personaId, coord>` 를 유지한다. 클러스터링은 FE 파생 연산(`useActivityClusters`, 100m radius + category/intent 그룹핑).

### Entities

| Entity                | Fields                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MapPersona            | id, name, emoji, archetype (explorer\|helper\|creator\|connector\|learner), category (SpotCategory), intent (offer\|request), location (GeoCoord), interestItemIds? |
| MapPersonaBbox        | swLat, swLng, neLat, neLng                                                                                                                                          |
| MapPersonaStreamEvent | discriminated union: `persona.join` \| `persona.leave` \| `persona.move`                                                                                            |
| MapPersonaJoinEvent   | type='persona.join', persona (MapPersona)                                                                                                                           |
| MapPersonaLeaveEvent  | type='persona.leave', personaId                                                                                                                                     |
| MapPersonaMoveEvent   | type='persona.move', personaId, location (GeoCoord)                                                                                                                 |

### Request DTO

| DTO                      | Fields                     |
| ------------------------ | -------------------------- |
| MapPersonasSnapshotQuery | swLat, swLng, neLat, neLng |
| MapPersonasStreamQuery   | swLat, swLng, neLat, neLng |

### Response DTO

| DTO                         | Fields              |
| --------------------------- | ------------------- |
| MapPersonasSnapshotResponse | data (MapPersona[]) |

### Queries

| Name                   | Method | Route                       | Request DTO              | Response DTO                |
| ---------------------- | ------ | --------------------------- | ------------------------ | --------------------------- |
| GetMapPersonasSnapshot | GET    | /api/v1/map/personas        | MapPersonasSnapshotQuery | MapPersonasSnapshotResponse |
| StreamMapPersonas      | GET    | /api/v1/map/personas/stream | MapPersonasStreamQuery   | SSE: MapPersonaStreamEvent  |

### 동작 요구사항 (BE 구현 시 반드시 준수)

1. **Bbox 서버 필터링** — 요청한 bbox 밖 페르소나는 스냅샷/스트림 어디에서도 송출하지 않는다. FE 에서 필터링하지 않음을 전제로 한다 (오프스크린 페르소나가 많을수록 클러스터링 비용이 선형 증가).
2. **Delta-only 스트림** — `StreamMapPersonas` 는 전체 스냅샷을 주기적으로 재전송하지 말 것. 변경된 개체만 `persona.join`/`persona.leave`/`persona.move` 이벤트로 송출한다. 초기 상태는 `GetMapPersonasSnapshot` 으로만 받는다.
3. **Move 이벤트 throttle** — 개별 페르소나당 최대 1 Hz (초당 1 이벤트) 를 권장. FE 는 `useAnimatedCoords` 로 2.4초 보간하여 부드럽게 렌더링한다. 초당 10+ 이벤트는 대역폭 낭비 + 클러스터 재계산 과다.
4. **Id 안정성** — `MapPersona.id` 는 동일 페르소나의 leave→join 사이클 내에서 동일해야 한다 (FE 캐시·팔로우 상태와 연결됨). 매 session 마다 id 재생성 금지.
5. **Bbox 변경 계약** — 클라이언트가 pan/zoom 으로 bbox 를 바꾸면 기존 stream 을 끊고 새 snapshot + 새 stream 을 재구독한다. BE 는 단일 연결에서 bbox 가 바뀌는 경우는 가정하지 않아도 된다.
6. **연결 유지** — SSE ping 은 주석 라인(`: keepalive`) 으로만 보낸다. 15~30초 간격 권장.
7. **Leave 이벤트 필수** — 페르소나가 bbox 를 떠났거나 세션 종료된 경우, 반드시 `persona.leave` 를 송출한다. FE 는 누락 시 마커가 영구히 남아 pulse 애니가 계속 돌게 됨.

### 이벤트 페이로드 예시

```json
// GET /api/v1/map/personas?swLat=37.25&swLng=127.01&neLat=37.28&neLng=127.04
{
    "status": 200,
    "data": [
        {
            "id": "persona-001",
            "name": "민지",
            "emoji": "🧘",
            "archetype": "helper",
            "category": "요가",
            "intent": "offer",
            "location": { "lat": 37.2636, "lng": 127.0286 }
        }
    ]
}
```

```
// SSE: /api/v1/map/personas/stream?swLat=...

event: persona.join
data: {"type":"persona.join","persona":{"id":"persona-042",...}}

event: persona.move
data: {"type":"persona.move","personaId":"persona-001","location":{"lat":37.2640,"lng":127.0291}}

event: persona.leave
data: {"type":"persona.leave","personaId":"persona-042"}

: keepalive
```

> FE 참고: `src/features/simulation/model/use-mock-persona-swarm.ts` 가 위 계약을 그대로 mock 으로 구현한다 (join/leave/move 를 setInterval 로 생성). BE 연동 시 이 훅을 `useMapPersonaStream` 으로 교체하면 나머지 로직은 그대로 재사용.
