import { describe, expect, it } from 'vitest';
import {
    detectPwaInstallPlatform,
    getPwaInstallGuide,
    isStandaloneDisplay,
    PWA_SHORTCUTS,
} from './pwa-install';

describe('PWA install onboarding helpers', () => {
    it('detects iOS Safari style installs separately from Android and desktop', () => {
        expect(
            detectPwaInstallPlatform(
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
            ),
        ).toBe('ios-safari');
        expect(
            detectPwaInstallPlatform(
                'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
            ),
        ).toBe('android-chrome');
        expect(
            detectPwaInstallPlatform(
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/120 Safari/537.36',
            ),
        ).toBe('desktop');
    });

    it('keeps manual install guide copy available when browser prompt is unavailable', () => {
        const guide = getPwaInstallGuide('ios-safari');

        expect(guide.title).toContain('iPhone Safari');
        expect(guide.steps).toEqual(
            expect.arrayContaining(['홈 화면에 추가를 선택해요.']),
        );
    });

    it('exposes map, offer creation, and chat shortcuts for manifest and onboarding copy', () => {
        expect(PWA_SHORTCUTS.map((shortcut) => shortcut.url)).toEqual([
            '/map',
            '/post/offer',
            '/chat',
        ]);
    });

    it('treats display-mode standalone and iOS navigator standalone as installed', () => {
        expect(isStandaloneDisplay('standalone')).toBe(true);
        expect(isStandaloneDisplay('browser', true)).toBe(true);
        expect(isStandaloneDisplay('browser', false)).toBe(false);
    });
});
