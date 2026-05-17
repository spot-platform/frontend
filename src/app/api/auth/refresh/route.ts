import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '@/lib/server-api';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null;
}

function getString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
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
    const refreshToken = getString(body?.refreshToken);

    if (!refreshToken) {
        return NextResponse.json(
            { message: 'refreshToken이 필요합니다.' },
            { status: 400 },
        );
    }

    const upstream = await serverApiFetch('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
    });
    const payload = await readUpstreamJson(upstream);

    if (!upstream.ok) {
        return NextResponse.json(payload, { status: upstream.status });
    }

    const tokenResult = isRecord(payload.data) ? payload.data : payload;
    const accessToken = getString(tokenResult.accessToken);

    if (!accessToken) {
        return NextResponse.json(
            { message: '토큰 갱신 응답에 accessToken이 없습니다.' },
            { status: 502 },
        );
    }

    const response = NextResponse.json(tokenResult);

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
