import ky, { HTTPError } from 'ky';
import { env } from '@/shared/lib/env';

export type ApiErrorBody = {
    code: string;
    message: string;
    status: number;
};

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly code: string,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Token accessor — replaced by the auth store when it initializes
let getToken: () => string | null = () => null;

export const setTokenAccessor = (fn: () => string | null) => {
    getToken = fn;
};

export const apiClient = ky.create({
    prefixUrl: env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10_000,
    retry: {
        limit: 2,
        methods: ['get'],
        statusCodes: [408, 429, 500, 502, 503, 504],
        backoffLimit: 3_000,
    },
    hooks: {
        beforeRequest: [
            (request) => {
                const token = getToken();
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            },
        ],
        beforeError: [
            async (error) => {
                const { response } = error;
                if (response) {
                    try {
                        const body = await response.clone().json();
                        (error as unknown as { apiError: ApiError }).apiError =
                            new ApiError(
                                response.status,
                                body.code ?? 'UNKNOWN',
                                body.message ?? 'An error occurred',
                            );
                    } catch {
                        (error as unknown as { apiError: ApiError }).apiError =
                            new ApiError(
                                response.status,
                                'PARSE_ERROR',
                                'Failed to parse error response',
                            );
                    }
                }
                return error;
            },
        ],
    },
});

export function extractApiError(err: unknown): ApiError | null {
    if (err instanceof HTTPError) {
        return (err as unknown as { apiError?: ApiError }).apiError ?? null;
    }
    return null;
}
