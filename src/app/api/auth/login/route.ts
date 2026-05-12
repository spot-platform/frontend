import { NextRequest, NextResponse } from 'next/server';
import {
    resolvePostLoginPath,
    sanitizeNextPath,
} from '@/features/auth/model/safe-next';
import { serverApiFetch } from '@/lib/server-api';
import type { LoginResult } from '@/features/auth/model/types';

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

async function readUpstreamJson(response: Response): Promise<JsonRecord> {
    const payload: unknown = await response.json().catch(() => ({}));
    return isRecord(payload) ? payload : {};
}

function appendSetCookieHeaders(response: NextResponse, upstream: Response) {
    const headers = upstream.headers as Headers & {
        getSetCookie?: () => string[];
    };
    const setCookies = headers.getSetCookie?.() ?? [];
    const fallbackCookie = upstream.headers.get('set-cookie');

    if (setCookies.length > 0) {
        setCookies.forEach((cookie) =>
            response.headers.append('set-cookie', cookie),
        );
        return;
    }

    if (fallbackCookie) {
        response.headers.append('set-cookie', fallbackCookie);
    }
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

    const upstream = await serverApiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password,
            next: redirectTo,
        }),
    });

    const payload = await readUpstreamJson(upstream);

    if (!upstream.ok) {
        return NextResponse.json(payload, { status: upstream.status });
    }

    const loginResult = (isRecord(payload.data) ? payload.data : payload) as
        | Partial<LoginResult>
        | undefined;

    if (!loginResult?.accessToken) {
        return NextResponse.json(
            { message: '로그인 응답에 accessToken이 없습니다.' },
            { status: 502 },
        );
    }

    const { accessToken, ...publicLoginResult } = loginResult;

    const response = NextResponse.json({
        ...publicLoginResult,
        redirectTo: resolvePostLoginPath(
            sanitizeNextPath(getString(loginResult.redirectTo)) ?? redirectTo,
        ),
    });

    response.cookies.set('spot-auth-token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });
    appendSetCookieHeaders(response, upstream);

    return response;
}
