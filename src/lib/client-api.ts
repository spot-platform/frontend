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

export async function clientApiFetch<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const headers = new Headers(init.headers);

    if (!headers.has('Content-Type') && init.body) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`/api/backend${path}`, {
        ...init,
        headers,
        cache: init.cache ?? 'no-store',
    });

    if (!response.ok) {
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
