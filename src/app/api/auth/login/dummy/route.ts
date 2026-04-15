import { NextRequest, NextResponse } from 'next/server';
import {
    resolvePostLoginPath,
    sanitizeNextPath,
} from '@/features/auth/model/safe-next';
import { buildMockLoginResult } from '@/features/auth/model/mock';

type JsonRecord = Record<string, unknown>;

function isDevDummyLoginEnabled() {
    return (
        process.env.NODE_ENV !== 'production' &&
        process.env.ENABLE_DEV_DUMMY_LOGIN === 'true'
    );
}

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null;
}

function getString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

async function readJsonBody(request: NextRequest): Promise<JsonRecord | null> {
    const payload: unknown = await request.json().catch(() => null);
    return isRecord(payload) ? payload : null;
}

export async function POST(request: NextRequest) {
    if (!isDevDummyLoginEnabled()) {
        return NextResponse.json(
            { message: '지원하지 않는 로그인 방식이에요.' },
            { status: 404 },
        );
    }

    const body = await readJsonBody(request);
    const redirectTo = resolvePostLoginPath(
        sanitizeNextPath(getString(body?.next)),
    );
    const loginResult = buildMockLoginResult(redirectTo);

    const response = NextResponse.json(loginResult);

    response.cookies.set('spot-auth-token', loginResult.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });

    return response;
}
