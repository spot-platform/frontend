import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DetailHeader } from './DetailHeader';

const mockBack = vi.fn();
const mockPathname = vi.fn(() => '/spot/123');

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        back: mockBack,
    }),
    usePathname: () => mockPathname(),
}));

afterEach(() => {
    cleanup();
    mockBack.mockReset();
    mockPathname.mockReset();
    mockPathname.mockReturnValue('/spot/123');
    vi.restoreAllMocks();
});

beforeEach(() => {
    document.title = '기본 문서 제목';
});

describe('DetailHeader', () => {
    it('calls a provided onShare handler before using the default share flow', async () => {
        const onShare = vi.fn();
        const navigatorShare = vi.fn();
        const clipboardWriteText = vi.fn();

        Object.defineProperty(window.navigator, 'share', {
            configurable: true,
            value: navigatorShare,
        });
        Object.defineProperty(window.navigator, 'clipboard', {
            configurable: true,
            value: { writeText: clipboardWriteText },
        });

        render(<DetailHeader showShare onShare={onShare} />);

        fireEvent.click(screen.getByRole('button', { name: '공유' }));

        await waitFor(() => {
            expect(onShare).toHaveBeenCalledTimes(1);
        });
        expect(navigatorShare).not.toHaveBeenCalled();
        expect(clipboardWriteText).not.toHaveBeenCalled();
    });

    it('uses navigator.share when the browser supports native sharing', async () => {
        const navigatorShare = vi.fn().mockResolvedValue(undefined);

        Object.defineProperty(window.navigator, 'share', {
            configurable: true,
            value: navigatorShare,
        });
        Object.defineProperty(window.navigator, 'clipboard', {
            configurable: true,
            value: { writeText: vi.fn() },
        });

        render(<DetailHeader title="스팟 상세" showShare />);

        fireEvent.click(screen.getByRole('button', { name: '공유' }));

        await waitFor(() => {
            expect(navigatorShare).toHaveBeenCalledWith({
                title: '스팟 상세',
                url: 'http://localhost:3000/spot/123',
            });
        });
    });

    it('copies the current detail URL when navigator.share is unavailable', async () => {
        const clipboardWriteText = vi.fn().mockResolvedValue(undefined);

        Object.defineProperty(window.navigator, 'share', {
            configurable: true,
            value: undefined,
        });
        Object.defineProperty(window.navigator, 'clipboard', {
            configurable: true,
            value: { writeText: clipboardWriteText },
        });

        render(<DetailHeader showShare />);

        fireEvent.click(screen.getByRole('button', { name: '공유' }));

        await waitFor(() => {
            expect(clipboardWriteText).toHaveBeenCalledWith(
                'http://localhost:3000/spot/123',
            );
        });
    });

    it('ignores a cancelled native share sheet', async () => {
        const navigatorShare = vi
            .fn()
            .mockRejectedValue(
                new DOMException('The user aborted a request.', 'AbortError'),
            );

        Object.defineProperty(window.navigator, 'share', {
            configurable: true,
            value: navigatorShare,
        });

        render(<DetailHeader showShare />);

        fireEvent.click(screen.getByRole('button', { name: '공유' }));

        await waitFor(() => {
            expect(navigatorShare).toHaveBeenCalledWith({
                title: '기본 문서 제목',
                url: 'http://localhost:3000/spot/123',
            });
        });
    });
});
