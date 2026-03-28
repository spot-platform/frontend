'use client';

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
            <button
                onClick={reset}
                className="rounded-md bg-brand-500 px-4 py-2 text-white"
            >
                다시 시도
            </button>
        </main>
    );
}
