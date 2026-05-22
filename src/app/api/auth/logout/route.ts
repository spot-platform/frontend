import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '@/lib/server-api';

const AUTH_COOKIE_NAMES_TO_CLEAR = [
    'spot-auth-token',
    'refreshToken',
    'refresh-token',
    'refresh_token',
];

async function readUpstreamJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({ ok: response.ok }));
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

function clearAuthCookies(response: NextResponse) {
    AUTH_COOKIE_NAMES_TO_CLEAR.forEach((name) => {
        response.cookies.set(name, '', {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 0,
        });
    });
}

export async function POST(request: NextRequest) {
    const accessToken = request.cookies.get('spot-auth-token')?.value;
    const cookie = request.headers.get('cookie');
    const upstream = await serverApiFetch('/auth/logout', {
        method: 'POST',
        accessToken,
        headers: cookie ? { Cookie: cookie } : undefined,
    });
    const payload = await readUpstreamJson(upstream);
    const response = NextResponse.json(payload, { status: upstream.status });

    appendSetCookieHeaders(response, upstream);
    clearAuthCookies(response);

    return response;
}
