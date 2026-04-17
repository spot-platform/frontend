# UI Backend Spec

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
