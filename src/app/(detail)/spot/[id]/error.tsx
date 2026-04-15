'use client';

import { Button } from '@frontend/design-system';
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-semibold">문제가 발생했어요</h2>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button onClick={reset} size="sm">
                다시 시도
            </Button>
        </main>
    );
}
