import { NextRequest, NextResponse } from 'next/server';
import {
    pickSingleQueryValue,
    sanitizeNextPath,
} from '@/features/auth/model/safe-next';
import { authenticateMockOAuth } from '@/features/auth/model/mock';
import type { OAuthProvider } from '@/features/auth/model/types';

function isOAuthProvider(value: string): value is OAuthProvider {
    return value === 'kakao' || value === 'google';
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ provider: string }> },
) {
    const { provider } = await context.params;

    if (!isOAuthProvider(provider)) {
        return NextResponse.json(
            { message: '지원하지 않는 소셜 로그인 제공자예요.' },
            { status: 404 },
        );
    }

    const nextPath = sanitizeNextPath(
        pickSingleQueryValue(request.nextUrl.searchParams.getAll('next')),
    );
    const loginResult = authenticateMockOAuth(provider, nextPath);
    const redirectUrl = new URL(loginResult.redirectTo, request.url);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set('spot-auth-token', loginResult.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });

    return response;
}
