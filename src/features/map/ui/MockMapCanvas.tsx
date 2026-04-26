'use client';

import { useCallback, useMemo } from 'react';
type MockMapCanvasProps = {
    center?: { lat: number; lng: number };
    level?: number;
    children?: React.ReactNode;
    onMapClick?: (lat: number, lng: number) => void;
    className?: string;
};

const BOUNDS = {
    minLat: 37.24,
    maxLat: 37.32,
    minLng: 126.98,
    maxLng: 127.08,
};

function latLngToPercent(lat: number, lng: number) {
    const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
    const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
    return {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
    };
}

export type MockOverlayProps = {
    position: { lat: number; lng: number };
    children?: React.ReactNode;
};

function MockOverlay({ position, children }: MockOverlayProps) {
    const { x, y } = latLngToPercent(position.lat, position.lng);
    return (
        <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
        >
            {children}
        </div>
    );
}

export function MockMapCanvas({
    center,
    children,
    onMapClick,
    className,
}: MockMapCanvasProps) {
    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!onMapClick) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const xPct = ((e.clientX - rect.left) / rect.width) * 100;
            const yPct = ((e.clientY - rect.top) / rect.height) * 100;
            const lat =
                BOUNDS.maxLat - (yPct / 100) * (BOUNDS.maxLat - BOUNDS.minLat);
            const lng =
                BOUNDS.minLng + (xPct / 100) * (BOUNDS.maxLng - BOUNDS.minLng);
            onMapClick(lat, lng);
        },
        [onMapClick],
    );

    const gridLines = useMemo(() => {
        const lines: React.ReactNode[] = [];
        for (let i = 1; i < 10; i++) {
            lines.push(
                <div
                    key={`h-${i}`}
                    className="absolute left-0 w-full border-t border-gray-300/30"
                    style={{ top: `${i * 10}%` }}
                />,
                <div
                    key={`v-${i}`}
                    className="absolute top-0 h-full border-l border-gray-300/30"
                    style={{ left: `${i * 10}%` }}
                />,
            );
        }
        return lines;
    }, []);

    return (
        <div
            className={`relative h-full w-full overflow-hidden bg-gray-200 ${className ?? ''}`}
            onClick={handleClick}
        >
            {gridLines}

            <div className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                MockMap · {center?.lat.toFixed(4)}, {center?.lng.toFixed(4)}
            </div>

            {children}
        </div>
    );
}

MockMapCanvas.Overlay = MockOverlay;
