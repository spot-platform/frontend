'use client';

import { useCallback, useState } from 'react';
import { IconHelpCircle, IconNavigation, IconList } from '@tabler/icons-react';
import { useFilterStore } from '@/features/map/model/use-filter-store';
import {
    LAYER_LABEL,
    useLayerStore,
} from '@/features/layer/model/use-layer-store';

type MapFooterProps = {
    onCenterToUser?: (coord: { lat: number; lng: number }) => void;
    onToggleListView?: () => void;
    onOpenHelp?: () => void;
    hidden?: boolean;
};

export function MapFooter({
    onCenterToUser,
    onToggleListView,
    onOpenHelp,
    hidden = false,
}: MapFooterProps) {
    const [locating, setLocating] = useState(false);
    const feedType = useFilterStore((s) => s.feedType);
    const setFeedType = useFilterStore((s) => s.setFeedType);
    const activeLayer = useLayerStore((s) => s.activeLayer);
    const toggleMapLayer = useLayerStore((s) => s.toggleMapLayer);

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

    const btnBase =
        'flex h-10 w-10 items-center justify-center rounded-full shadow-md active:scale-95 transition-transform text-[11px] font-semibold';
    const btnIdle = 'bg-white text-foreground';
    const btnActive = 'bg-foreground text-background';

    const intentLabel =
        feedType === 'offer'
            ? '해볼래'
            : feedType === 'request'
              ? '알려줘'
              : '전체';
    const layerLabel = LAYER_LABEL[activeLayer];

    return (
        <div
            aria-hidden={hidden}
            className="pointer-events-auto fixed z-20 flex flex-col gap-2 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
                top: 'calc(env(safe-area-inset-top) + 8.75rem)',
                right: 'calc(env(safe-area-inset-right) + 1rem)',
                transform: hidden
                    ? 'translateX(calc(100% + 1rem))'
                    : 'translateX(0)',
                pointerEvents: hidden ? 'none' : 'auto',
            }}
        >
            <button
                type="button"
                onClick={() => onOpenHelp?.()}
                className={`${btnBase} ${btnIdle}`}
                aria-label="맵 도움말 다시 보기"
            >
                <IconHelpCircle
                    size={18}
                    stroke={1.8}
                    className="text-foreground"
                />
            </button>

            <button
                type="button"
                onClick={() => {
                    // store 의 setFeedType 은 같은 값이면 'all' 로 리셋.
                    // all → offer → request → all 순환.
                    if (feedType === 'all') setFeedType('offer');
                    else if (feedType === 'offer') setFeedType('request');
                    else setFeedType('request');
                }}
                className={`${btnBase} ${
                    feedType === 'all' ? btnIdle : btnActive
                }`}
                aria-label="해볼래/알려줘 전환"
            >
                {intentLabel}
            </button>

            <button
                type="button"
                onClick={handleMyLocation}
                disabled={locating}
                className={`${btnBase} ${btnIdle}`}
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
                className={`${btnBase} ${btnIdle}`}
                aria-label="리스트뷰"
            >
                <IconList size={18} stroke={1.8} className="text-foreground" />
            </button>

            <button
                type="button"
                onClick={toggleMapLayer}
                className={`${btnBase} ${
                    activeLayer === 'real' ? btnActive : btnIdle
                }`}
                aria-label="레이어 전환"
            >
                {layerLabel}
            </button>
        </div>
    );
}
