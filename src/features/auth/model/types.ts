export type OAuthProvider = 'naver' | 'google';

export interface LoginRequest {
    email: string;
    password: string;
    next?: string;
}

export interface LoginResult {
    userId: string;
    redirectTo: string;
}

export interface TokenRefreshResult {
    refreshed: boolean;
}
