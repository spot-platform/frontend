import { backendProxyEndpoint } from './endpoint';

type ApiEnvelope<T> = {
    status?: number;
    message?: string;
    data?: T;
};

async function readErrorMessage(response: Response): Promise<string> {
    const payload: unknown = await response.json().catch(() => null);

    if (
        payload &&
        typeof payload === 'object' &&
        'message' in payload &&
        typeof payload.message === 'string'
    ) {
        return payload.message;
    }

    return response.statusText || '요청 처리에 실패했어요.';
}

async function requestBackend(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);

    if (
        !headers.has('Content-Type') &&
        init.body &&
        !(init.body instanceof FormData)
    ) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(backendProxyEndpoint(path), {
        ...init,
        headers,
        cache: init.cache ?? 'no-store',
    });
}

async function refreshAccessToken(): Promise<boolean> {
    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            cache: 'no-store',
        });

        return response.ok;
    } catch {
        return false;
    }
}

async function clearBrowserAuth() {
    window.localStorage.removeItem('spot-auth');

    await fetch('/api/auth/logout', {
        method: 'POST',
        cache: 'no-store',
    }).catch(() => undefined);
}

function redirectToLogin() {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/login?next=${encodeURIComponent(next)}`);
}

type ClientApiFetchOptions = RequestInit & {
    redirectOnUnauthorized?: boolean;
};

export async function clientApiFetch<T>(
    path: string,
    { redirectOnUnauthorized = true, ...init }: ClientApiFetchOptions = {},
): Promise<T> {
    let response = await requestBackend(path, init);

    if (
        redirectOnUnauthorized &&
        response.status === 401 &&
        typeof window !== 'undefined' &&
        (await refreshAccessToken())
    ) {
        response = await requestBackend(path, init);
    }

    if (!response.ok) {
        if (
            redirectOnUnauthorized &&
            response.status === 401 &&
            typeof window !== 'undefined'
        ) {
            await clearBrowserAuth();
            redirectToLogin();
        }

        throw new Error(await readErrorMessage(response));
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const payload = (await response.json()) as ApiEnvelope<T>;
    return (payload.data ?? payload) as T;
}

export function buildQueryString(
    params?: Record<string, string | number | boolean | string[] | undefined>,
): string {
    const searchParams = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value === undefined) return;

        if (Array.isArray(value)) {
            value.forEach((item) => searchParams.append(key, item));
            return;
        }

        searchParams.set(key, String(value));
    });

    const query = searchParams.toString();
    return query ? `?${query}` : '';
}
