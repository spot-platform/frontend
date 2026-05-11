import { NextRequest, NextResponse } from 'next/server';
import { serverApiFetch } from '@/lib/server-api';

async function readUpstreamJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({ ok: response.ok }));
}

export async function POST(request: NextRequest) {
    const accessToken = request.cookies.get('spot-auth-token')?.value;
    const upstream = await serverApiFetch('/api/auth/logout', {
        method: 'POST',
        accessToken,
    });
    const payload = await readUpstreamJson(upstream);
    const response = NextResponse.json(payload, { status: upstream.status });

    response.cookies.set('spot-auth-token', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
    });

    return response;
}
