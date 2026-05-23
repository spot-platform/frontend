import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { serverApiFetch } from '@/lib/server-api';

vi.mock('@/lib/server-api', () => ({
    serverApiFetch: vi.fn(),
}));

const mockServerApiFetch = vi.mocked(serverApiFetch);

function createRefreshRequest(cookie: string) {
    return new NextRequest('https://spot.local/api/auth/refresh', {
        method: 'POST',
        headers: { cookie },
    });
}

describe('/api/auth/refresh route', () => {
    beforeEach(() => {
        mockServerApiFetch.mockReset();
    });

    it('rotates the access token cookie without exposing the token in JSON', async () => {
        mockServerApiFetch.mockResolvedValue(
            Response.json({ data: { accessToken: 'new-access-token' } }),
        );

        const response = await POST(
            createRefreshRequest('refreshToken=refresh-token'),
        );
        const body = await response.json();
        const setCookie = response.headers.get('set-cookie') ?? '';

        expect(response.status).toBe(200);
        expect(body).toEqual({ refreshed: true });
        expect(JSON.stringify(body)).not.toContain('new-access-token');
        expect(setCookie).toContain('spot-auth-token=new-access-token');
        expect(setCookie).toContain('HttpOnly');
        expect(mockServerApiFetch).toHaveBeenCalledWith('/auth/refresh', {
            method: 'POST',
            headers: { Cookie: 'refreshToken=refresh-token' },
        });
    });
});
