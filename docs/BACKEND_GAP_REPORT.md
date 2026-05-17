# SPOT BE OpenAPI ↔ FE Backend Handoff Gap Report

### 1. Summary

- Generated at: 2026-05-07 KST
- Sources used: `BACKEND_HANDOFF.md`, `BACKEND_HANDOFF_ENTITIES.md`, `BACKEND_HANDOFF_SCHEMAS.md`, `BACKEND_HANDOFF_SWAGGER.md`, `docs/openapi.json`
- BE server URL: `http://52.78.149.208:8080`
- Counts: total BE paths 42, total BE schemas 79, total FE-expected queries about 92
- Top-line verdict: FE handoff and BE OpenAPI overlap on the MVP spine (auth login/refresh/logout, feed list/detail/apply, spot CRUD-ish subresources, chat rooms/messages, post create), but most non-auth FE routes are `/api`-prefixed in BE and therefore need client path alignment. My-page, pay, search, notifications, bookmarks, feed bookmark/like/workflow, settlement, and rich chat/message DTOs are not shipped or are much thinner than FE expects.

### 2. Endpoint diff (per domain)

#### Auth

| FE expected (from handoff) | Method | BE actual (from openapi.json) | Method | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Login `/api/auth/login` | POST | `/api/auth/login` | POST | MATCH | Same method/path. |
| DummyLogin `/api/auth/login/dummy` | POST | - | - | MISSING_IN_BE | FE dev BFF only; BE has no dummy login. |
| RefreshToken `/api/auth/refresh` | POST | `/api/auth/refresh` | POST | MATCH | Same method/path. |
| OAuthStart `/api/auth/oauth/{provider}/start` | GET | `/api/auth/oauth/{provider}/start` | GET | MATCH | Same method/path. |
| Logout `/api/auth/logout` | POST | `/api/auth/logout` | POST | MATCH | Same method/path. |
| - | - | `/api/jwt/exchange` | POST | EXTRA_IN_BE | 소셜 로그인 토큰 교환 |
#### User

| FE expected (from handoff) | Method | BE actual (from openapi.json) | Method | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| GetMyFeedApplications `/users/me/feed-applications` | GET | - | - | MISSING_IN_BE | My feed application history absent. |
| GetMyProfile `/users/me` | GET | `/api/users/me` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| UpdateMyProfile `/users/me` | PATCH | `/api/users/me` | PATCH | RENAMED | Same purpose but BE path is /api-prefixed. |
| ChangeMyPassword `/users/me/password` | PATCH | `/api/users/me/password` | PATCH | RENAMED | Same purpose but BE path is /api-prefixed. |
| GetMyNotificationSettings `/users/me/notification-settings` | GET | - | - | MISSING_IN_BE | Notification settings absent. |
| UpdateMyNotificationSettings `/users/me/notification-settings` | PUT | - | - | MISSING_IN_BE | Notification settings absent. |
| GetMySupporterRegistration `/users/me/supporter-registration` | GET | - | - | MISSING_IN_BE | Supporter registration absent. |
| UpdateMySupporterRegistration `/users/me/supporter-registration` | PUT | - | - | MISSING_IN_BE | Supporter registration absent. |
| GetMySupporterProfile `/users/me/supporter-profile` | GET | - | - | MISSING_IN_BE | Supporter profile absent. |
| UpdateMySupporterProfile `/users/me/supporter-profile` | PUT | - | - | MISSING_IN_BE | Supporter profile absent. |
| GetMySpots `/users/me/spots` | GET | - | - | MISSING_IN_BE | My spots dashboard absent. |
| GetMyParticipations `/users/me/participations` | GET | - | - | MISSING_IN_BE | Participations absent. |
| GetMyFavorites `/users/me/favorites` | GET | - | - | MISSING_IN_BE | Favorites absent. |
| DeleteMyFavorite `/users/me/favorites/{favoriteId}` | DELETE | - | - | MISSING_IN_BE | No comparable BE path found. |
| GetMyRecentViews `/users/me/recent-views` | GET | - | - | MISSING_IN_BE | Recent views absent. |
| DeleteMyRecentView `/users/me/recent-views/{recentViewId}` | DELETE | - | - | MISSING_IN_BE | No comparable BE path found. |
| ClearMyRecentViews `/users/me/recent-views` | DELETE | - | - | MISSING_IN_BE | Recent views absent. |
| GetMySupportActivitySummary `/users/me/support-activity-summary` | GET | - | - | MISSING_IN_BE | Support activity summary absent. |
| GetUserProfile `/users/{userId}/profile` | GET | - | - | MISSING_IN_BE | Public supporter/partner profile absent. |
| FollowUser `/users/{userId}/follow` | POST | - | - | MISSING_IN_BE | Follow/friend API absent. |
| UnfollowUser `/users/{userId}/follow` | DELETE | - | - | MISSING_IN_BE | Follow/friend API absent. |
| - | - | `/api/users` | POST | EXTRA_IN_BE | 회원가입 |
| - | - | `/api/users/exist` | POST | EXTRA_IN_BE | 이메일 중복 확인 |
| - | - | `/api/users/me` | DELETE | EXTRA_IN_BE | 회원탈퇴 |
#### Post API

| FE expected (from handoff) | Method | BE actual (from openapi.json) | Method | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| CreateOfferPost `/posts/offer` | POST | `/api/posts/offer` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| CreateRequestPost `/posts/request` | POST | `/api/posts/request` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| - | - | `/api/posts/{postId}` | GET | EXTRA_IN_BE | 게시글 상세 조회 |
| - | - | `/api/posts/{postId}` | DELETE | EXTRA_IN_BE | 게시글 삭제 (소프트 딜리트) |
#### Spot API

| FE expected (from handoff) | Method | BE actual (from openapi.json) | Method | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| GetSpotList `/spots` | GET | `/api/spots` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| GetSpotDetail `/spots/{spotId}` | GET | `/api/spots/{spotId}` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| CreateSpot `/spots` | POST | `/api/spots` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| MatchSpot `/spots/{spotId}/match` | POST | `/api/spots/{spotId}/match` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| CancelSpot `/spots/{spotId}/cancel` | POST | `/api/spots/{spotId}/cancel` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| CompleteSpot `/spots/{spotId}/complete` | POST | `/api/spots/{spotId}/complete` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| GetSpotParticipants `/spots/{spotId}/participants` | GET | `/api/spots/{spotId}/participants` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| GetSpotSchedule `/spots/{spotId}/schedule` | GET | `/api/spots/{spotId}/schedule` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| UpsertSpotSchedule `/spots/{spotId}/schedule` | PUT | `/api/spots/{spotId}/schedule` | PUT | PARTIAL | Same purpose but BE path is /api-prefixed. Shape differs: FE richer body/response than BE schema. |
| GetSpotVotes `/spots/{spotId}/votes` | GET | `/api/spots/{spotId}/votes` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| CreateSpotVote `/spots/{spotId}/votes` | POST | `/api/spots/{spotId}/votes` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| CastSpotVote `/spots/{spotId}/votes/{voteId}/cast` | POST | `/api/spots/{spotId}/votes/{voteId}/cast` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| GetSpotChecklist `/spots/{spotId}/checklist` | GET | `/api/spots/{spotId}/checklist` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| UpsertSpotChecklist `/spots/{spotId}/checklist` | PUT | `/api/spots/{spotId}/checklist` | PUT | PARTIAL | Same purpose but BE path is /api-prefixed. Shape differs: FE richer body/response than BE schema. |
| GetSpotFiles `/spots/{spotId}/files` | GET | `/api/spots/{spotId}/files` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| UploadSpotFiles `/spots/{spotId}/files` | POST | `/api/spots/{spotId}/files` | POST | PARTIAL | Same purpose but BE path is /api-prefixed. Shape differs: FE richer body/response than BE schema. |
| DeleteSpotFile `/spots/{spotId}/files/{fileId}` | DELETE | `/api/spots/{spotId}/files/{fileId}` | DELETE | RENAMED | Same purpose but BE path is /api-prefixed. |
| GetSpotNotes `/spots/{spotId}/notes` | GET | `/api/spots/{spotId}/notes` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| CreateSpotNote `/spots/{spotId}/notes` | POST | `/api/spots/{spotId}/notes` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| GetSpotReviews `/spots/{spotId}/reviews` | GET | `/api/spots/{spotId}/reviews` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| CreateSpotReview `/spots/{spotId}/reviews` | POST | `/api/spots/{spotId}/reviews` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| SubmitSpotSettlement `/spots/{spotId}/settlement` | POST | - | - | MISSING_IN_BE | Settlement mutation absent. |
| ApproveSpotSettlement `/spots/{spotId}/settlement/approve` | POST | - | - | MISSING_IN_BE | Settlement approval absent. |
| - | - | `/api/spots/{spotId}/checklist/{itemId}/toggle` | PATCH | EXTRA_IN_BE | 체크리스트 항목 완료 토글 |
#### Chat API

| FE expected (from handoff) | Method | BE actual (from openapi.json) | Method | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| GetChatRooms `/chat/rooms` | GET | `/api/chat/rooms` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| CreateChatRoom `/chat/rooms` | POST | `/api/chat/rooms` | POST | PARTIAL | Same purpose but BE path is /api-prefixed. Shape differs: FE richer body/response than BE schema. |
| GetChatRoom `/chat/rooms/{roomId}` | GET | `/api/chat/rooms/{roomId}` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| GetChatMessages `/chat/rooms/{roomId}/messages` | GET | `/api/chat/rooms/{roomId}/messages` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| SendChatMessage `/chat/rooms/{roomId}/messages` | POST | `/api/chat/rooms/{roomId}/messages` | POST | PARTIAL | Same purpose but BE path is /api-prefixed. Shape differs: FE richer body/response than BE schema. |
| MarkChatRoomRead `/chat/rooms/{roomId}/read` | POST | `/api/chat/rooms/{roomId}/read` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| GetChatRoomBySpot `/chat/rooms/by-spot/{spotId}` | GET | `/api/chat/rooms/by-spot/{spotId}` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| GetChatRoomByUser `/chat/rooms/by-user/{userId}` | GET | `/api/chat/rooms/by-user/{userId}` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| ConnectChatSSE `/chat/connect` | GET | `/api/chat/connect` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
#### Feed API

| FE expected (from handoff) | Method | BE actual (from openapi.json) | Method | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| GetFeedList `/feeds` | GET | `/api/feeds` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| GetFeedDetail `/feeds/{feedId}` | GET | `/api/feeds/{feedId}` | GET | RENAMED | Same purpose but BE path is /api-prefixed. |
| AddFeedBookmark `/feeds/{feedId}/bookmark` | POST | - | - | MISSING_IN_BE | Bookmark API absent in BE feed surface. |
| RemoveFeedBookmark `/feeds/{feedId}/bookmark` | DELETE | - | - | MISSING_IN_BE | Bookmark API absent in BE feed surface. |
| ApplyFeed `/feeds/{feedId}/apply` | POST | `/api/feeds/{feedId}/apply` | POST | RENAMED | Same purpose but BE path is /api-prefixed. |
| CancelFeedApply `/feeds/{feedId}/apply` | DELETE | `/api/feeds/{feedId}/apply` | DELETE | RENAMED | Same purpose but BE path is /api-prefixed. |
| UpdateFeedDetails `/feeds/{feedId}` | PATCH | - | - | MISSING_IN_BE | FE patch expected; BE has GET/DELETE only. |
| AcceptFeedApplication `/feeds/{feedId}/applications/{applicationId}/accept` | PATCH | `/api/feeds/{feedId}/applications/{applicationId}/accept` | PATCH | RENAMED | Same purpose but BE path is /api-prefixed. |
| RejectFeedApplication `/feeds/{feedId}/applications/{applicationId}/reject` | PATCH | `/api/feeds/{feedId}/applications/{applicationId}/reject` | PATCH | RENAMED | Same purpose but BE path is /api-prefixed. |
| AddFeedLike `/feeds/{feedId}/like` | POST | - | - | MISSING_IN_BE | Like API absent in BE feed surface. |
| RemoveFeedLike `/feeds/{feedId}/like` | DELETE | - | - | MISSING_IN_BE | Like API absent in BE feed surface. |
| GetFeedManagementFlow `/feeds/{feedId}/management-flow` | GET | - | - | MISSING_IN_BE | Management flow/workflow not shipped. |
| - | - | `/api/feeds/{feedId}` | DELETE | EXTRA_IN_BE | 피드 삭제 (소프트 딜리트) |
#### Simulation API

| FE expected (from handoff) | Method | BE actual (from openapi.json) | Method | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| - | - | `/api/sim/runs/{runId}/movements` | GET | EXTRA_IN_BE | 이동 데이터 청크 조회 |
| - | - | `/api/sim/runs/{runId}/manifest` | GET | EXTRA_IN_BE | 시뮬레이션 런 매니페스트 조회 |
| - | - | `/api/sim/runs/{runId}/lifecycle` | GET | EXTRA_IN_BE | 라이프사이클 이벤트 청크 조회 |
#### Other / Shared

| FE expected (from handoff) | Method | BE actual (from openapi.json) | Method | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| UploadFile `/uploads` | POST | - | - | MISSING_IN_BE | Shared upload API absent; BE spot file takes fileUrl. |
| BatchUploadFiles `/uploads/batch` | POST | - | - | MISSING_IN_BE | Batch shared upload absent. |
| GetPointBalance `/points/balance` | GET | - | - | MISSING_IN_BE | Pay/points domain not shipped. |
| GetLinkedBankAccount `/points/account` | GET | - | - | MISSING_IN_BE | Pay/points domain not shipped. |
| LinkBankAccount `/points/account` | PUT | - | - | MISSING_IN_BE | Pay/points domain not shipped. |
| GetPointWithdrawals `/points/withdrawals` | GET | - | - | MISSING_IN_BE | Pay/points domain not shipped. |
| GetPointHistory `/points/history` | GET | - | - | MISSING_IN_BE | Pay/points domain not shipped. |
| ChargePoints `/points/charge` | POST | - | - | MISSING_IN_BE | Pay/points domain not shipped. |
| WithdrawPoints `/points/withdraw` | POST | - | - | MISSING_IN_BE | Pay/points domain not shipped. |
| SearchSpots `/search/spots` | GET | - | - | MISSING_IN_BE | Search domain not shipped. |
| SearchPosts `/search/posts` | GET | - | - | MISSING_IN_BE | Search domain not shipped. |
| SearchUsers `/search/users` | GET | - | - | MISSING_IN_BE | Search domain not shipped. |
| GetBookmarks `/bookmarks` | GET | - | - | MISSING_IN_BE | Bookmarks aggregate not shipped. |
| GetNotifications `/notifications` | GET | - | - | MISSING_IN_BE | Notifications domain not shipped. |
| MarkNotificationRead `/notifications/{notificationId}/read` | POST | - | - | MISSING_IN_BE | Notifications domain not shipped. |
| MarkAllNotificationsRead `/notifications/read-all` | POST | - | - | MISSING_IN_BE | Notifications domain not shipped. |
| DeleteNotification `/notifications/{notificationId}` | DELETE | - | - | MISSING_IN_BE | Notifications domain not shipped. |
| ClearNotifications `/notifications` | DELETE | - | - | MISSING_IN_BE | Notifications domain not shipped. |
| GetAdminPostList `/admin-posts` | GET | - | - | MISSING_IN_BE | Admin post domain not shipped. |
| GetAdminPostDetail `/admin-posts/{adminPostId}` | GET | - | - | MISSING_IN_BE | Admin post domain not shipped. |

### 3. Schema / DTO diff (per domain)

#### Auth

| FE entity / DTO | BE schema | Status | Field deltas |
| --- | --- | --- | --- |
| LoginRequest | LoginRequest | PARTIAL | +next (BE missing) |
| LoginResponse | LoginResultDTO | PARTIAL | +refreshToken (FE expects in some docs, BE login result missing); refresh is separate via RefreshRequestDTO |
| RefreshTokenRequest | RefreshRequestDTO | RENAMED | same refreshToken field, schema name differs |
| AuthUser | JWTResponseDTO / LoginResultDTO | PARTIAL | FE expects cookie+BFF redirect semantics; BE exposes token DTOs only |
| DummyLogin | - | MISSING_IN_BE | FE-only dev route |
| Social token exchange | JWTResponseDTO | EXTRA_IN_BE | BE has /api/jwt/exchange; FE handoff does not model cookie exchange |

#### User

| FE entity / DTO | BE schema | Status | Field deltas |
| --- | --- | --- | --- |
| UserProfile | UserResponseDTO | MATCH | - |
| UpdateProfileRequest | UpdateProfileRequest | MATCH | - |
| ChangePasswordRequest | PasswordChangeRequest | RENAMED | same fields, schema name differs |
| JoinRequest / EmailExistRequest | JoinRequest / EmailExistRequest | EXTRA_IN_BE | BE has join and email duplication check not listed as FE expected handoff queries |
| NotificationSettings | - | MISSING_IN_BE | +serviceNoticeEnabled, +activityEnabled, +pushEnabled, +emailEnabled |
| SupporterRegistration | - | MISSING_IN_BE | +field, +mediaUrls, +career, +bio, +verificationStatus |
| SupporterProfile / PartnerProfile | - | MISSING_IN_BE | +avgRating, +reviews, +history, +interestCategories, +isFriend |
| MySpot / Participation / Favorites / RecentViews | - | MISSING_IN_BE | My-page aggregate DTOs absent |

#### Feed

| FE entity / DTO | BE schema | Status | Field deltas |
| --- | --- | --- | --- |
| FeedListQuery | FeedListQuery | MATCH | - |
| FeedItem | FeedItemResponse | PARTIAL | +description, +authorProfile, +progressPercent, +imageUrl, +partnerCount, +applicantCount, +maxParticipants, +deadline, +isBookmarked (BE missing) |
| FeedListResponse | FeedListResponse | MATCH | - |
| FeedDetailResponse | FeedItemResponse | PARTIAL | BE detail reuses compact item schema; FE expects richer detail shape |
| FeedApplyRequest | FeedApplyRequest | MATCH | - |
| FeedApplication | FeedApplicationResponse | PARTIAL | +applicant profile/payment-ish fields in FE docs; BE has id, feedId, userId, proposal, status, createdAt |
| FeedManagementFlow | - | MISSING_IN_BE | +applications, +timeline, +agreement, +settlement/workflow state |
| Bookmark/Like DTO | - | MISSING_IN_BE | FE expects bookmark/like toggles; BE only exposes views/likes counters |

#### Spot

| FE entity / DTO | BE schema | Status | Field deltas |
| --- | --- | --- | --- |
| Spot | SpotResponse | MATCH | - |
| SpotListResponse | SpotListResponse | MATCH | - |
| CreateSpotRequest | CreateSpotRequest | MATCH | - |
| SpotParticipant | SpotParticipantResponse | PARTIAL | FE participant/profile labels richer; BE has id, userId, role, state, joinedAt |
| SpotSchedule | SpotScheduleResponse | PARTIAL | FE upsert slots/options richer; BE has title, scheduledAt |
| SpotVote | SpotVoteResponse | PARTIAL | FE expects vote kind/status/selectedOption?; BE has question, state, creatorId, options |
| SpotChecklistItem | SpotChecklistResponse | PARTIAL | FE upsert list vs BE create one content and separate toggle endpoint |
| SpotFile | SpotFileResponse | PARTIAL | FE upload flow implies binary/upload IDs; BE uses fileName + fileUrl |
| SpotNote | SpotNoteResponse | PARTIAL | FE progress notes may include authorName/media; BE only authorId/content/createdAt |
| SpotReview | - | PARTIAL | BE endpoints exist but no dedicated review response schema appears in components beyond generic path refs; field shape unclear |
| Settlement | - | MISSING_IN_BE | +settlement submit/approve DTOs absent |

#### Post

| FE entity / DTO | BE schema | Status | Field deltas |
| --- | --- | --- | --- |
| CreateOfferPostRequest | CreateOfferPostRequest | PARTIAL | FE uses image/file detail variants; BE fields include supporterPhotoUrl, desiredPrice, maxPartnerCount |
| CreateRequestPostRequest | CreateRequestPostRequest | PARTIAL | BE fields include serviceStylePhotoUrl, maxPartnerCount, priceCapPerPerson |
| PostCompletionResponse | PostCompletionResponse | MATCH | - |
| PostDetail | PostResponse | EXTRA_IN_BE | BE has GET /api/posts/{postId}; FE handoff only create completion flow |

#### Chat

| FE entity / DTO | BE schema | Status | Field deltas |
| --- | --- | --- | --- |
| ChatRoom | ChatRoomResponse | PARTIAL | +title, +subtitle, +messages, +counterpart/user metadata, +unreadCount (BE missing) |
| CreateChatRoomRequest | CreateChatRoomRequest | PARTIAL | FE category,userId?,spotId?; BE spotId,type only |
| ChatMessage | ChatMessageResponse | PARTIAL | FE union kinds text/vote/schedule/file/proposal/reverse-offer; BE text content only |
| ChatMessagesResponse | ChatMessageListResponse | PARTIAL | FE data[]/beforeId; BE messages,nextCursor,hasMore |
| SendChatMessageRequest | SendMessageRequest | PARTIAL | FE kind/content/voteId/scheduleId/fileId/proposal/reverseOffer; BE content only |
| ChatSSEEvent | SseEmitter | PARTIAL | BE schema only exposes emitter timeout, not event payload contract |

#### Simulation API

Simulation is not in the FE handoff at all. BE-only schemas include SimManifestResponse, MovementChunkResponse, LifecycleChunkResponse and related DTOs for /api/sim/runs/{runId}/*; treat this as unrelated backend surface unless the map/simulation UI plans to consume it.

### 4. Auth & BFF surface

FE handoff describes frontend BFF routes under `/api/auth/*`: Login (`POST /api/auth/login`), DummyLogin (`POST /api/auth/login/dummy`), RefreshToken (`POST /api/auth/refresh`), OAuthStart (`GET /api/auth/oauth/{provider}/start`), and Logout (`POST /api/auth/logout`). BE ships the real auth surface as `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/oauth/{provider}/start`, plus `POST /api/jwt/exchange`; membership creation is under User via `POST /api/users` and email check via `POST /api/users/exist`.

Key gap: FE BFF assumes cookie persistence and optional `next` redirect handling, while BE OpenAPI is token DTO oriented. The social OAuth flow also includes a cookie-based social → header token exchange endpoint, `POST /api/jwt/exchange`, which the FE handoff does not mention. `DummyLogin` is FE-only and should not be wired to BE unless BE intentionally adds a dev-only route.

### 5. Priority list

- **High** — Decide `/api` prefix strategy for FE clients before wiring real requests.
- **High** — Align login/OAuth: BFF cookie semantics vs BE token DTO and `/api/jwt/exchange`.
- **High** — Feed list/detail/apply work, but bookmark/like/workflow/application-history gaps block full feed flow.
- **High** — Chat connect exists, but message payload is text-only versus FE multi-kind contract.
- **Medium** — Spot files use `fileUrl` DTO, while FE expects upload/batch or binary-backed flow.
- **Medium** — Spot schedule/checklist/votes exist but are thinner than FE upsert/rich UI models.
- **Medium** — My-page aggregates, supporter profile/registration, favorites and recent views are absent.
- **Low** — Post detail/delete are BE extras and can remain unused by FE MVP.
- **Low** — Simulation API is BE-only and harmless if excluded from generated FE client.
- **Low** — Schema naming differs (`PasswordChangeRequest`, `LoginResultDTO`) but fields are mostly understandable.

### 6. Open Questions

1. Should FE call BE with `/api/*` directly or keep BFF routes that proxy non-auth paths? Source: FE routes like `/spots` in `BACKEND_HANDOFF.md` vs BE `/api/spots` in `docs/openapi.json`.
2. Is `POST /api/jwt/exchange` required immediately after social OAuth redirect, and what cookie name/lifetime should FE rely on? Source: BE `POST /api/jwt/exchange`.
3. Are feed bookmark/like endpoints intentionally removed, or should they be added to BE? Source: FE `POST/DELETE /feeds/{feedId}/bookmark` and `/like`.
4. What replaces `GET /feeds/{feedId}/management-flow` for host-side application/workflow UI? Source: `BACKEND_HANDOFF_SWAGGER.md` management-flow endpoint.
5. Should chat support vote/schedule/file/proposal/reverse-offer messages, or is v1 limited to text? Source: FE Chat entities vs BE `SendMessageRequest`.
6. Is there a planned upload service for `/uploads` and `/uploads/batch`, or should FE upload elsewhere and send `fileUrl` to `POST /api/spots/{spotId}/files`? Source: Shared handoff upload queries and BE `UploadFileRequest`.
7. Are My/User profile subdomains (supporter registration, favorites, recent views, notification settings) postponed or assigned to another service? Source: My/User queries in `BACKEND_HANDOFF.md`.
8. Should settlement endpoints remain in FE handoff, or has settlement been cut from BE scope? Source: FE `/spots/{spotId}/settlement*` rows absent from `docs/openapi.json`.
