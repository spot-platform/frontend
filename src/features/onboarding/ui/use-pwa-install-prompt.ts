'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    detectPwaInstallPlatform,
    getPwaInstallGuide,
    isStandaloneDisplay,
} from '../model/pwa-install';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
};

function getBrowserInstallState() {
    if (typeof window === 'undefined') {
        return { isInstalled: false, userAgent: '' };
    }

    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const navigatorStandalone =
        'standalone' in window.navigator &&
        Boolean(
            (window.navigator as Navigator & { standalone?: boolean })
                .standalone,
        );

    return {
        isInstalled: isStandaloneDisplay(
            standalone ? 'standalone' : 'browser',
            navigatorStandalone,
        ),
        userAgent: window.navigator.userAgent,
    };
}

export function usePwaInstallPrompt() {
    const [installPrompt, setInstallPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [{ isInstalled, userAgent }, setBrowserInstallState] = useState(
        getBrowserInstallState,
    );
    const [installState, setInstallState] = useState<
        'idle' | 'prompting' | 'accepted' | 'dismissed' | 'unavailable'
    >('idle');

    useEffect(() => {
        const onBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setInstallPrompt(event as BeforeInstallPromptEvent);
            setInstallState('idle');
        };

        const onAppInstalled = () => {
            setBrowserInstallState((state) => ({
                ...state,
                isInstalled: true,
            }));
            setInstallPrompt(null);
            setInstallState('accepted');
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
        window.addEventListener('appinstalled', onAppInstalled);

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                onBeforeInstallPrompt,
            );
            window.removeEventListener('appinstalled', onAppInstalled);
        };
    }, []);

    const guide = useMemo(
        () => getPwaInstallGuide(detectPwaInstallPlatform(userAgent)),
        [userAgent],
    );

    const canPromptInstall = Boolean(installPrompt) && !isInstalled;

    const promptInstall = useCallback(async () => {
        if (!installPrompt || isInstalled) {
            setInstallState('unavailable');
            return;
        }

        setInstallState('prompting');
        try {
            await installPrompt.prompt();
            const choice = await installPrompt.userChoice;
            setInstallState(choice.outcome);
        } catch {
            setInstallState('idle');
        } finally {
            setInstallPrompt(null);
        }
    }, [installPrompt, isInstalled]);

    return {
        canPromptInstall,
        guide,
        installState,
        isInstalled,
        promptInstall,
    };
}
