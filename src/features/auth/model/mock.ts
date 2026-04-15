import { resolvePostLoginPath } from './safe-next';
import type { LoginRequest, LoginResult, OAuthProvider } from './types';

const MOCK_AUTH_USER = {
    userId: 'user-me',
    accessToken: 'mock-access-token-user-me',
    refreshToken: 'mock-refresh-token-user-me',
};

export function buildMockLoginResult(next?: string | null): LoginResult {
    return {
        accessToken: MOCK_AUTH_USER.accessToken,
        refreshToken: MOCK_AUTH_USER.refreshToken,
        userId: MOCK_AUTH_USER.userId,
        redirectTo: resolvePostLoginPath(next),
    };
}

export function authenticateMockLogin(payload: LoginRequest): LoginResult {
    const email = payload.email.trim();
    const password = payload.password.trim();

    if (!email || !password) {
        throw new Error('이메일과 비밀번호를 모두 입력해 주세요.');
    }

    return buildMockLoginResult(payload.next);
}

export function authenticateMockOAuth(
    _provider: OAuthProvider,
    next?: string | null,
): LoginResult {
    return buildMockLoginResult(next);
}
