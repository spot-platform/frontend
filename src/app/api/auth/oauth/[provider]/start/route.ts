import { NextRequest, NextResponse } from 'next/server';
import {
    pickSingleQueryValue,
    sanitizeNextPath,
} from '@/features/auth/model/safe-next';
import { getBackendApiUrl } from '@/lib/server-api';
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
    const upstreamUrl = new URL(
        getBackendApiUrl(`/api/auth/oauth/${provider}/start`),
    );

    if (nextPath) {
        upstreamUrl.searchParams.set('next', nextPath);
    }

    return NextResponse.redirect(upstreamUrl);
}
