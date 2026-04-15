import { SpotCardSkeleton } from '@/features/spot';

export default function SpotLoading() {
    return (
        <div className="flex flex-col gap-3 pt-4">
            <div className="mx-4 h-9 w-full rounded-xl bg-gray-100 animate-pulse" />
            <SpotCardSkeleton />
            <SpotCardSkeleton />
            <SpotCardSkeleton />
        </div>
    );
}
