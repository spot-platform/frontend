export function SpotDetailSkeleton() {
    return (
        <div className="flex flex-col gap-4 pt-2 animate-pulse">
            {/* Summary card */}
            <div className="mx-4 rounded-2xl bg-muted px-5 py-4 h-32" />
            {/* Status banner */}
            <div className="mx-4 rounded-2xl bg-muted h-20" />
            {/* Participants */}
            <div className="mx-4 rounded-2xl bg-muted h-24" />
            {/* Sections */}
            {[1, 2, 3].map((i) => (
                <div key={i} className="mx-4 rounded-2xl bg-muted h-20" />
            ))}
        </div>
    );
}
