import { NextRequest, NextResponse } from 'next/server';
import {
    resolvePostLoginPath,
    sanitizeNextPath,
} from '@/features/auth/model/safe-next';
import { authenticateMockLogin } from '@/features/auth/model/mock';

type JsonRecord = Record<string, unknown>;

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
    const body = await readJsonBody(request);
    const email = getString(body?.email)?.trim();
    const password = getString(body?.password);
    const redirectTo = resolvePostLoginPath(
        sanitizeNextPath(getString(body?.next)),
    );

    if (!email || !password) {
        return NextResponse.json(
            { message: '이메일과 비밀번호를 모두 입력해 주세요.' },
            { status: 400 },
        );
    }

    const loginResult = authenticateMockLogin({
        email,
        password,
        next: redirectTo,
    });

    const response = NextResponse.json({
        ...loginResult,
    });

    response.cookies.set('spot-auth-token', loginResult.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });

    return response;
}
