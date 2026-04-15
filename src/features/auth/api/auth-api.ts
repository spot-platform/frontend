import type { LoginRequest, LoginResult, OAuthProvider } from '../model/types';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

async function readErrorMessage(response: Response): Promise<string> {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        const payload: unknown = await response.json().catch(() => null);

        if (isRecord(payload) && typeof payload.message === 'string') {
            return payload.message;
        }
    }

    const text = await response.text().catch(() => '로그인에 실패했어요.');
    return text || '로그인에 실패했어요.';
}

export const authApi = {
    async login(payload: LoginRequest): Promise<LoginResult> {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(await readErrorMessage(response));
        }

        return (await response.json()) as LoginResult;
    },

    async loginDummy(next?: string | null): Promise<LoginResult> {
        const response = await fetch('/api/auth/login/dummy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(next ? { next } : {}),
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(await readErrorMessage(response));
        }

        return (await response.json()) as LoginResult;
    },

    oauthStartPath(provider: OAuthProvider, next?: string | null): string {
        const searchParams = new URLSearchParams();

        if (next) {
            searchParams.set('next', next);
        }

        const query = searchParams.toString();
        return query
            ? `/api/auth/oauth/${provider}/start?${query}`
            : `/api/auth/oauth/${provider}/start`;
    },
};
