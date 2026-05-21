import { clientApiFetch } from '@/lib/client-api';
import { endpoints } from '@/lib/endpoint';
import type { LoginRequest, LoginResult, OAuthProvider } from '../model/types';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function getString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

async function readErrorMessage(response: Response): Promise<string> {
    const payload: unknown = await response.json().catch(() => null);

    if (isRecord(payload)) {
        const message = getString(payload.message);
        if (message) return message;
    }

    return response.statusText || '요청에 실패했어요.';
}

export type SignupPayload = {
    email: string;
    password: string;
    nickname: string;
};

export const authApi = {
    async login(request: LoginRequest & { next?: string | null }) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(await readErrorMessage(response));
        }

        return (await response.json()) as LoginResult;
    },

    async loginDummy(next?: string | null) {
        const response = await fetch('/api/auth/login/dummy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ next }),
        });

        if (!response.ok) {
            throw new Error(await readErrorMessage(response));
        }

        return (await response.json()) as LoginResult;
    },

    async checkEmailExists(email: string): Promise<boolean> {
        return clientApiFetch<boolean>(endpoints.users.exist, {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    async signup(payload: SignupPayload): Promise<void> {
        await clientApiFetch<void>(endpoints.users.root, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    oauthStartPath(provider: OAuthProvider, next?: string | null): string {
        const searchParams = new URLSearchParams();
        if (next) searchParams.set('next', next);
        const query = searchParams.toString();

        return query
            ? `/api/auth/oauth/${provider}/start?${query}`
            : `/api/auth/oauth/${provider}/start`;
    },
};
