import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { serverApiFetch } from '@/lib/server-api';

vi.mock('@/lib/server-api', () => ({
    serverApiFetch: vi.fn(),
}));

const mockServerApiFetch = vi.mocked(serverApiFetch);

function createLogoutRequest(cookie: string) {
    return new NextRequest('https://spot.local/api/auth/logout', {
        method: 'POST',
        headers: { cookie },
    });
}

describe('/api/auth/logout route', () => {
    beforeEach(() => {
        mockServerApiFetch.mockReset();
    });

    it('forwards browser cookies so backend can invalidate refresh session', async () => {
        mockServerApiFetch.mockResolvedValue(
            Response.json({ ok: true }, { status: 200 }),
        );

        await POST(
            createLogoutRequest(
                'spot-auth-token=access-token; refreshToken=refresh-token',
            ),
        );

        expect(mockServerApiFetch).toHaveBeenCalledWith('/auth/logout', {
            method: 'POST',
            accessToken: 'access-token',
            headers: {
                Cookie: 'spot-auth-token=access-token; refreshToken=refresh-token',
            },
        });
    });

    it('clears access and likely refresh cookies at the BFF boundary', async () => {
        mockServerApiFetch.mockResolvedValue(
            new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: {
                    'set-cookie':
                        'backend-refresh-token=; Path=/; Max-Age=0; HttpOnly',
                },
            }),
        );

        const response = await POST(
            createLogoutRequest(
                'spot-auth-token=access-token; refreshToken=refresh-token',
            ),
        );
        const setCookie = response.headers.get('set-cookie') ?? '';

        expect(setCookie).toContain('spot-auth-token=');
        expect(setCookie).toContain('refreshToken=');
        expect(setCookie).toContain('refresh-token=');
        expect(setCookie).toContain('refresh_token=');
        expect(setCookie).toContain('Max-Age=0');
    });
});
