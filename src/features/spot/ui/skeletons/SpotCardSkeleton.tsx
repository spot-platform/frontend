export function SpotCardSkeleton() {
    return (
        <div className="mx-4 rounded-xl border border-border-soft border-l-4 border-l-border-soft bg-card px-4 py-3.5 animate-pulse">
            <div className="mb-2 flex gap-1.5">
                <div className="h-4 w-14 rounded-full bg-muted" />
                <div className="h-4 w-12 rounded-full bg-muted" />
            </div>
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="mt-2 flex justify-between">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-3 w-14 rounded bg-muted" />
            </div>
            <div className="mt-2.5 flex gap-1.5">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-3 w-12 rounded bg-muted" />
            </div>
        </div>
    );
}
