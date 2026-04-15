export type OAuthProvider = 'kakao' | 'google';

export interface LoginRequest {
    email: string;
    password: string;
    next?: string;
}

export interface LoginResult {
    accessToken: string;
    refreshToken: string;
    userId: string;
    redirectTo: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface TokenRefreshResult {
    accessToken: string;
}
