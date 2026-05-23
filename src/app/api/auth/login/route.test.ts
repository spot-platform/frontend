import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { serverApiFetch } from '@/lib/server-api';

vi.mock('@/lib/server-api', () => ({
    serverApiFetch: vi.fn(),
}));

const mockServerApiFetch = vi.mocked(serverApiFetch);

function createLoginRequest(body: Record<string, unknown>) {
    return new NextRequest('https://spot.local/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

describe('/api/auth/login route', () => {
    beforeEach(() => {
        mockServerApiFetch.mockReset();
    });

    it('sets the access token as an httpOnly cookie without exposing tokens in JSON', async () => {
        mockServerApiFetch.mockResolvedValue(
            Response.json({
                data: {
                    accessToken: 'access-token',
                    refreshToken: 'refresh-token',
                    userId: 'user-1',
                    redirectTo: '/map',
                },
            }),
        );

        const response = await POST(
            createLoginRequest({
                email: 'user@example.com',
                password: 'password123',
                next: '/map',
            }),
        );
        const body = await response.json();
        const setCookie = response.headers.get('set-cookie') ?? '';

        expect(response.status).toBe(200);
        expect(body).toEqual({ userId: 'user-1', redirectTo: '/map' });
        expect(JSON.stringify(body)).not.toContain('access-token');
        expect(JSON.stringify(body)).not.toContain('refresh-token');
        expect(setCookie).toContain('spot-auth-token=access-token');
        expect(setCookie).toContain('HttpOnly');
    });
});
