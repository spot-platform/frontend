type ServerApiOptions = RequestInit & {
    accessToken?: string | null;
};

function getBackendUrl(): string {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
        throw new Error('BACKEND_URL is not configured.');
    }

    return backendUrl.replace(/\/$/, '');
}

export function getBackendApiUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${getBackendUrl()}${normalizedPath}`;
}

export async function serverApiFetch(
    path: string,
    { accessToken, headers, ...init }: ServerApiOptions = {},
): Promise<Response> {
    const requestHeaders = new Headers(headers);

    if (!requestHeaders.has('Content-Type') && init.body) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    if (accessToken) {
        requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    }

    return fetch(getBackendApiUrl(path), {
        ...init,
        headers: requestHeaders,
        cache: init.cache ?? 'no-store',
    });
}
