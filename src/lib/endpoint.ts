const BACKEND_API_PREFIX = '/api/v1';
const BACKEND_PROXY_PREFIX = '/api/backend';

function normalizePath(path: string): string {
    return path.startsWith('/') ? path : `/${path}`;
}

function stripBackendApiPrefix(path: string): string {
    const normalizedPath = normalizePath(path);

    if (normalizedPath.startsWith(BACKEND_API_PREFIX)) {
        return normalizedPath.slice(BACKEND_API_PREFIX.length) || '/';
    }

    if (normalizedPath.startsWith('/api/')) {
        return normalizedPath.slice('/api'.length) || '/';
    }

    if (normalizedPath.startsWith('/v1/')) {
        return normalizedPath.slice('/v1'.length) || '/';
    }

    return normalizedPath;
}

export function backendEndpoint(path: string): string {
    const resourcePath = stripBackendApiPrefix(path);
    return `${BACKEND_API_PREFIX}${resourcePath}`;
}

export function backendProxyEndpoint(path: string): string {
    const resourcePath = stripBackendApiPrefix(path);
    return `${BACKEND_PROXY_PREFIX}/v1${resourcePath}`;
}

export const endpoints = {
    auth: {
        login: backendEndpoint('/auth/login'),
        refresh: backendEndpoint('/auth/refresh'),
        logout: backendEndpoint('/auth/logout'),
        oauthStart: (provider: string) =>
            backendEndpoint(`/auth/oauth/${provider}/start`),
        jwtExchange: backendEndpoint('/jwt/exchange'),
    },
    me: {
        profile: backendEndpoint('/me'),
        password: backendEndpoint('/me/password'),
        participations: backendEndpoint('/me/participations'),
        involvedFeeds: backendEndpoint('/me/involved-feeds'),
        feedApplications: backendEndpoint('/me/feed-applications'),
    },
    users: {
        root: backendEndpoint('/users'),
        exist: backendEndpoint('/users/exist'),
    },
    spots: {
        root: backendEndpoint('/spots'),
        detail: (spotId: string) => backendEndpoint(`/spots/${spotId}`),
        search: backendEndpoint('/spots/search'),
        map: backendEndpoint('/spots/map'),
        participants: (spotId: string) =>
            backendEndpoint(`/spots/${spotId}/participants`),
        schedule: (spotId: string) =>
            backendEndpoint(`/spots/${spotId}/schedule`),
        votes: (spotId: string) => backendEndpoint(`/spots/${spotId}/votes`),
        voteCast: (spotId: string, voteId: string | number) =>
            backendEndpoint(`/spots/${spotId}/votes/${voteId}/cast`),
        voteMyAnswers: (spotId: string, voteId: string | number) =>
            backendEndpoint(`/spots/${spotId}/votes/${voteId}/my-answers`),
        checklist: (spotId: string) =>
            backendEndpoint(`/spots/${spotId}/checklist`),
        checklistToggle: (spotId: string, itemId: string | number) =>
            backendEndpoint(`/spots/${spotId}/checklist/${itemId}/toggle`),
        checklistAssignee: (spotId: string, itemId: string | number) =>
            backendEndpoint(`/spots/${spotId}/checklist/${itemId}/assignee`),
        files: (spotId: string) => backendEndpoint(`/spots/${spotId}/files`),
        file: (spotId: string, fileId: string | number) =>
            backendEndpoint(`/spots/${spotId}/files/${fileId}`),
        notes: (spotId: string) => backendEndpoint(`/spots/${spotId}/notes`),
        reviews: (spotId: string) =>
            backendEndpoint(`/spots/${spotId}/reviews`),
        match: (spotId: string) => backendEndpoint(`/spots/${spotId}/match`),
        cancel: (spotId: string) => backendEndpoint(`/spots/${spotId}/cancel`),
        complete: (spotId: string) =>
            backendEndpoint(`/spots/${spotId}/complete`),
        settlement: (spotId: string) =>
            backendEndpoint(`/spots/${spotId}/settlement`),
        settlementApprove: (spotId: string) =>
            backendEndpoint(`/spots/${spotId}/settlement/approve`),
    },
    feeds: {
        root: backendEndpoint('/feeds'),
        detail: (feedId: string) => backendEndpoint(`/feeds/${feedId}`),
        offer: backendEndpoint('/feeds/offer'),
        request: backendEndpoint('/feeds/request'),
        bookmark: (feedId: string) =>
            backendEndpoint(`/feeds/${feedId}/bookmark`),
        applications: (feedId: string) =>
            backendEndpoint(`/feeds/${feedId}/applications`),
        myApplication: (feedId: string) =>
            backendEndpoint(`/feeds/${feedId}/applications/me`),
        acceptApplication: (feedId: string, applicationId: string) =>
            backendEndpoint(
                `/feeds/${feedId}/applications/${applicationId}/accept`,
            ),
        rejectApplication: (feedId: string, applicationId: string) =>
            backendEndpoint(
                `/feeds/${feedId}/applications/${applicationId}/reject`,
            ),
        delete: (feedId: string) => backendEndpoint(`/feeds/${feedId}`),
    },
    chat: {
        stream: backendEndpoint('/chat/stream'),
        rooms: backendEndpoint('/chat/rooms'),
        room: (roomId: string | number) =>
            backendEndpoint(`/chat/rooms/${roomId}`),
        roomRead: (roomId: string | number) =>
            backendEndpoint(`/chat/rooms/${roomId}/read`),
        roomTyping: (roomId: string | number) =>
            backendEndpoint(`/chat/rooms/${roomId}/typing`),
        roomLeave: (roomId: string | number) =>
            backendEndpoint(`/chat/rooms/${roomId}/members/me`),
        roomMessages: (roomId: string | number) =>
            backendEndpoint(`/chat/rooms/${roomId}/messages`),
        messageRead: (roomId: string | number, messageId: string | number) =>
            backendEndpoint(`/chat/rooms/${roomId}/messages/${messageId}/read`),
        personalRooms: backendEndpoint('/chat/rooms/personal'),
        roomStream: (roomId: string | number) =>
            backendEndpoint(`/chat/rooms/${roomId}/stream`),
        roomsBySpot: (spotId: string) =>
            backendEndpoint(`/chat/rooms/by-spot/${spotId}`),
        roomsByUser: (userId: string) =>
            backendEndpoint(`/chat/rooms/by-user/${userId}`),
        blocks: backendEndpoint('/chat/blocks'),
        block: (userId: string) => backendEndpoint(`/chat/blocks/${userId}`),
    },
    notifications: {
        root: backendEndpoint('/notifications'),
        subscribe: backendEndpoint('/notifications/subscribe'),
        read: (notificationId: string) =>
            backendEndpoint(`/notifications/${notificationId}/read`),
        readAll: backendEndpoint('/notifications/read-all'),
    },
    sim: {
        manifest: (runId: string) =>
            backendEndpoint(`/sim/runs/${runId}/manifest`),
        movements: (runId: string) =>
            backendEndpoint(`/sim/runs/${runId}/movements`),
        lifecycle: (runId: string) =>
            backendEndpoint(`/sim/runs/${runId}/lifecycle`),
    },
} as const;

export type BackendEndpoint = string;
