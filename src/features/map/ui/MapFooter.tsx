'use client';

import { useCallback, useState } from 'react';
import { IconWorld, IconNavigation, IconList } from '@tabler/icons-react';

type MapFooterProps = {
    onCenterToUser?: (coord: { lat: number; lng: number }) => void;
    onToggleListView?: () => void;
    onLayerToggle?: () => void;
};

export function MapFooter({
    onCenterToUser,
    onToggleListView,
    onLayerToggle,
}: MapFooterProps) {
    const [locating, setLocating] = useState(false);

    const handleMyLocation = useCallback(() => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                onCenterToUser?.({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
                setLocating(false);
            },
            () => setLocating(false),
            { enableHighAccuracy: true, timeout: 5000 },
        );
    }, [onCenterToUser]);

    const btnClass =
        'flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md active:scale-95 transition-transform';

    return (
        <div className="pointer-events-auto fixed right-4 top-[calc(env(safe-area-inset-top)+7.5rem)] z-20 flex flex-col gap-2">
            <button
                type="button"
                onClick={() => onLayerToggle?.()}
                className={btnClass}
                aria-label="레이어"
            >
                <IconWorld size={18} stroke={1.8} className="text-foreground" />
            </button>

            <button
                type="button"
                onClick={handleMyLocation}
                disabled={locating}
                className={btnClass}
                aria-label="내 위치"
            >
                <IconNavigation
                    size={18}
                    stroke={1.8}
                    className={
                        locating
                            ? 'animate-pulse text-primary'
                            : 'text-foreground'
                    }
                />
            </button>

            <button
                type="button"
                onClick={() => onToggleListView?.()}
                className={btnClass}
                aria-label="리스트뷰"
            >
                <IconList size={18} stroke={1.8} className="text-foreground" />
            </button>
        </div>
    );
}
