import { type NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/post', '/pay', '/my'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // proxy reads from httpOnly cookie (set during login).
    // Zustand persists to localStorage (client-only) for API calls.
    const token = request.cookies.get('spot-auth-token')?.value;

    const isProtected = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route),
    );

    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)).*)',
    ],
};
