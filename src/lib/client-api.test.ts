import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clientApiFetch } from './client-api';

const originalLocation = window.location;

describe('clientApiFetch auth recovery', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                pathname: '/map',
                search: '?layer=feed',
                assign: vi.fn(),
            },
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation,
        });
    });

    it('refreshes once and retries the original request before redirecting to login', async () => {
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(
                Response.json({ message: 'expired' }, { status: 401 }),
            )
            .mockResolvedValueOnce(Response.json({ accessToken: 'new-access' }))
            .mockResolvedValueOnce(
                Response.json({
                    data: {
                        id: 'feed-1',
                    },
                }),
            );
        vi.stubGlobal('fetch', fetchMock);

        await expect(clientApiFetch('/feeds/1')).resolves.toEqual({
            id: 'feed-1',
        });

        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            '/api/backend/v1/feeds/1',
            expect.objectContaining({ cache: 'no-store' }),
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            '/api/auth/refresh',
            expect.objectContaining({ method: 'POST', cache: 'no-store' }),
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            3,
            '/api/backend/v1/feeds/1',
            expect.objectContaining({ cache: 'no-store' }),
        );
        expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('clears auth state through logout before redirecting when refresh fails', async () => {
        window.localStorage.setItem('spot-auth', 'persisted-auth');
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(
                Response.json({ message: 'expired' }, { status: 401 }),
            )
            .mockResolvedValueOnce(
                Response.json({ message: 'refresh expired' }, { status: 401 }),
            )
            .mockResolvedValueOnce(Response.json({ ok: true }));
        vi.stubGlobal('fetch', fetchMock);

        await expect(clientApiFetch('/feeds/1')).rejects.toThrow('expired');

        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            '/api/auth/refresh',
            expect.objectContaining({ method: 'POST', cache: 'no-store' }),
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            3,
            '/api/auth/logout',
            expect.objectContaining({ method: 'POST', cache: 'no-store' }),
        );
        expect(window.localStorage.getItem('spot-auth')).toBeNull();
        expect(window.location.assign).toHaveBeenCalledWith(
            '/login?next=%2Fmap%3Flayer%3Dfeed',
        );
    });

    it('cleans up and redirects when refresh request fails at network level', async () => {
        window.localStorage.setItem('spot-auth', 'persisted-auth');
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(
                Response.json({ message: 'expired' }, { status: 401 }),
            )
            .mockRejectedValueOnce(new TypeError('network failed'))
            .mockResolvedValueOnce(Response.json({ ok: true }));
        vi.stubGlobal('fetch', fetchMock);

        await expect(clientApiFetch('/feeds/1')).rejects.toThrow('expired');

        expect(fetchMock).toHaveBeenNthCalledWith(
            3,
            '/api/auth/logout',
            expect.objectContaining({ method: 'POST', cache: 'no-store' }),
        );
        expect(window.localStorage.getItem('spot-auth')).toBeNull();
        expect(window.location.assign).toHaveBeenCalledWith(
            '/login?next=%2Fmap%3Flayer%3Dfeed',
        );
    });

    it('refreshes public requests without redirecting to login', async () => {
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(
                Response.json({ message: 'expired' }, { status: 401 }),
            )
            .mockResolvedValueOnce(Response.json({ accessToken: 'new-access' }))
            .mockResolvedValueOnce(Response.json({ data: [{ id: 'feed-1' }] }));
        vi.stubGlobal('fetch', fetchMock);

        await expect(
            clientApiFetch('/feeds', { redirectOnUnauthorized: false }),
        ).resolves.toEqual([{ id: 'feed-1' }]);

        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            '/api/auth/refresh',
            expect.objectContaining({ method: 'POST', cache: 'no-store' }),
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            3,
            '/api/backend/v1/feeds',
            expect.objectContaining({ cache: 'no-store' }),
        );
        expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('retries public requests as anonymous when refresh fails', async () => {
        window.localStorage.setItem('spot-auth', 'persisted-auth');
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(
                Response.json({ message: 'expired' }, { status: 401 }),
            )
            .mockResolvedValueOnce(
                Response.json({ message: 'refresh expired' }, { status: 401 }),
            )
            .mockResolvedValueOnce(Response.json({ ok: true }))
            .mockResolvedValueOnce(Response.json({ data: [{ id: 'feed-1' }] }));
        vi.stubGlobal('fetch', fetchMock);

        await expect(
            clientApiFetch('/feeds', {
                redirectOnUnauthorized: false,
                retryUnauthenticatedOnUnauthorized: true,
            }),
        ).resolves.toEqual([{ id: 'feed-1' }]);

        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            '/api/auth/refresh',
            expect.objectContaining({ method: 'POST', cache: 'no-store' }),
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            3,
            '/api/auth/logout',
            expect.objectContaining({ method: 'POST', cache: 'no-store' }),
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            4,
            '/api/backend/v1/feeds',
            expect.objectContaining({ cache: 'no-store' }),
        );
        expect(window.localStorage.getItem('spot-auth')).toBeNull();
        expect(window.location.assign).not.toHaveBeenCalled();
    });
});
