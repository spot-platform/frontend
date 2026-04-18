// map-v3 내 위치 마커. primary halo + dot.

'use client';

export function MyLocationMarker() {
    return (
        <div
            className="absolute"
            style={{
                zIndex: 15,
                transform: 'translate(-50%, -50%)',
            }}
            aria-label="내 위치"
        >
            <div
                className="absolute h-11 w-11 rounded-full bg-primary/[0.13]"
                style={{ top: -14, left: -14 }}
            />
            <div className="relative h-4 w-4 rounded-full border-[3px] border-map-bg bg-primary shadow-sm dark:shadow-[0_0_10px_var(--color-primary)]" />
        </div>
    );
}
