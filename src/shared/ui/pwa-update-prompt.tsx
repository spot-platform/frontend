'use client';

import { useEffect, useState } from 'react';
import { Button } from '@frontend/design-system';

export function PwaUpdatePrompt() {
    const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.ready.then((reg) => {
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (
                        newWorker.state === 'installed' &&
                        navigator.serviceWorker.controller
                    ) {
                        setWaitingSW(newWorker);
                    }
                });
            });
        });
    }, []);

    if (!waitingSW) return null;

    const handleUpdate = () => {
        waitingSW.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
    };

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between rounded-xl bg-black px-4 py-3 text-white shadow-lg">
            <span className="text-sm">새 버전이 있습니다</span>
            <Button
                onClick={handleUpdate}
                variant="ghost"
                size="sm"
                className="ml-4 h-auto rounded-lg bg-white px-3 py-1 text-black hover:bg-gray-100"
            >
                업데이트
            </Button>
        </div>
    );
}
