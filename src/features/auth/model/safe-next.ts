const INTERNAL_URL_ORIGIN = 'https://spot.local';

export type QueryParamValue = string | string[] | undefined;

export function pickSingleQueryValue(value: QueryParamValue): string | null {
    if (Array.isArray(value)) {
        return typeof value[0] === 'string' ? value[0] : null;
    }

    return typeof value === 'string' ? value : null;
}

export function sanitizeNextPath(
    value: string | null | undefined,
): string | null {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
        return null;
    }

    if (value.includes('\\')) {
        return null;
    }

    try {
        const url = new URL(value, INTERNAL_URL_ORIGIN);

        if (
            url.origin !== INTERNAL_URL_ORIGIN ||
            url.pathname.startsWith('//')
        ) {
            return null;
        }

        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return null;
    }
}

export function resolvePostLoginPath(value: string | null | undefined): string {
    return sanitizeNextPath(value) ?? '/feed';
}
