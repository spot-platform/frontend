'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MockMapCanvas } from './MockMapCanvas';

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_KEY ?? '';
const DEFAULT_CENTER = { lat: 37.2636, lng: 127.0286 };
const DEFAULT_ZOOM = 15;

export type MapOverlayItem = {
    key: string;
    position: { lat: number; lng: number };
    render: () => React.ReactNode;
    clickable?: boolean;
};

export type MapCanvasProps = {
    center?: { lat: number; lng: number };
    level?: number;
    overlays?: MapOverlayItem[];
    onMapClick?: (lat: number, lng: number) => void;
    className?: string;
};

let loadPromise: Promise<void> | null = null;

export { loadNaverMapSDK, waitForNaverMaps };

function waitForNaverMaps(timeout = 10_000): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.naver?.maps?.Map) {
            resolve();
            return;
        }
        const start = Date.now();
        const id = setInterval(() => {
            if (window.naver?.maps?.Map) {
                clearInterval(id);
                resolve();
            } else if (Date.now() - start > timeout) {
                clearInterval(id);
                reject(new Error('Naver Maps SDK init timeout'));
            }
        }, 50);
    });
}

function loadNaverMapSDK(): Promise<void> {
    if (loadPromise) return loadPromise;
    if (typeof window !== 'undefined' && window.naver?.maps?.Map) {
        return Promise.resolve();
    }
    loadPromise = new Promise<void>((resolve, reject) => {
        // Naver v3 는 메인 스크립트 onload 시점에 Map 생성자가 준비돼 있지만 submodules=gl 은
        // 그 이후 비동기로 로드된다. Map 존재만 기준으로 mount 하면 GL 서브모듈이 덜 로드된 채
        // `new Map({ gl: true, customStyleId })` 가 throw 없이 기본 타일로 fallback 된다
        // (콜드 로드에서 기본 스타일만 뜨다가 새로고침하면 브라우저 캐시로 정상 동작하는 증상).
        // 공식 callback 파라미터는 모든 서브모듈 로드 완료 후에만 실행되므로 동기화 지점으로 사용.
        const callbackName = `__naverMapsReady_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
        const win = window as unknown as Record<string, unknown>;
        win[callbackName] = () => {
            delete win[callbackName];
            resolve();
        };
        const script = document.createElement('script');
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}&submodules=gl&callback=${callbackName}`;
        script.async = true;
        script.onerror = () => {
            delete win[callbackName];
            loadPromise = null;
            reject(new Error('Failed to load Naver Maps SDK'));
        };
        document.head.appendChild(script);
    });
    return loadPromise;
}

function useNaverMapLoader() {
    const [state, setState] = useState<'loading' | 'ready' | 'error'>(
        typeof window !== 'undefined' && window.naver?.maps?.Map
            ? 'ready'
            : 'loading',
    );

    useEffect(() => {
        if (state === 'ready') return;
        loadNaverMapSDK()
            .then(() => setState('ready'))
            .catch(() => setState('error'));
    }, [state]);

    return state;
}

export function MapCanvas({
    center = DEFAULT_CENTER,
    level,
    overlays = [],
    onMapClick,
    className,
}: MapCanvasProps) {
    if (!NAVER_CLIENT_ID) {
        return (
            <MockMapCanvas
                center={center}
                level={level}
                onMapClick={onMapClick}
                className={className}
            >
                {overlays.map((o) => (
                    <MockMapCanvas.Overlay key={o.key} position={o.position}>
                        {o.render()}
                    </MockMapCanvas.Overlay>
                ))}
            </MockMapCanvas>
        );
    }

    return (
        <NaverMapCanvas
            center={center}
            level={level}
            overlays={overlays}
            onMapClick={onMapClick}
            className={className}
        />
    );
}

function NaverMapCanvas({
    center = DEFAULT_CENTER,
    level,
    overlays = [],
    onMapClick,
    className,
}: MapCanvasProps) {
    const sdkState = useNaverMapLoader();
    const containerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<naver.maps.Map | null>(null);

    useEffect(() => {
        if (sdkState !== 'ready' || !containerRef.current) return;

        const instance = new naver.maps.Map(containerRef.current, {
            center: new naver.maps.LatLng(center.lat, center.lng),
            zoom: level ? Math.max(1, 20 - level) : DEFAULT_ZOOM,
            zoomControl: false,
            scaleControl: false,
            logoControlOptions: {
                position: naver.maps.Position.BOTTOM_LEFT,
            },
        });

        setMap(instance);

        return () => {
            setMap(null);
            instance.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sdkState]);

    useEffect(() => {
        if (!map) return;
        const cur = map.getCenter() as naver.maps.LatLng;
        if (cur.lat() !== center.lat || cur.lng() !== center.lng) {
            map.setCenter(new naver.maps.LatLng(center.lat, center.lng));
        }
    }, [map, center.lat, center.lng]);

    useEffect(() => {
        if (!map || level == null) return;
        const target = Math.max(1, 20 - level);
        if (map.getZoom() !== target) {
            map.setZoom(target);
        }
    }, [map, level]);

    useEffect(() => {
        if (!map || !onMapClick) return;
        const listener = naver.maps.Event.addListener(
            map,
            'click',
            (e: naver.maps.PointerEvent) => {
                const coord = e.coord as naver.maps.LatLng;
                onMapClick(coord.lat(), coord.lng());
            },
        );
        return () => {
            naver.maps.Event.removeListener(listener);
        };
    }, [map, onMapClick]);

    if (sdkState === 'loading') {
        return (
            <div
                className={`flex h-[100dvh] w-full items-center justify-center bg-surface ${className ?? ''}`}
            >
                <div className="text-text-muted text-sm">지도 로딩 중...</div>
            </div>
        );
    }

    if (sdkState === 'error') {
        return (
            <MockMapCanvas
                center={center}
                level={level}
                onMapClick={onMapClick}
                className={className}
            >
                {overlays.map((o) => (
                    <MockMapCanvas.Overlay key={o.key} position={o.position}>
                        {o.render()}
                    </MockMapCanvas.Overlay>
                ))}
            </MockMapCanvas>
        );
    }

    return (
        <div className={className} style={{ width: '100%', height: '100dvh' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
            {map &&
                overlays.map((o) => (
                    <NaverOverlay key={o.key} map={map} position={o.position}>
                        {o.render()}
                    </NaverOverlay>
                ))}
        </div>
    );
}

export function NaverOverlay({
    map,
    position,
    children,
}: {
    map: naver.maps.Map;
    position: { lat: number; lng: number };
    children: React.ReactNode;
}) {
    const [container] = useState(() => {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.transform = 'translate(-50%, -50%)';
        return div;
    });
    const overlayRef = useRef<naver.maps.OverlayView | null>(null);
    const positionRef = useRef(position);
    positionRef.current = position;

    useEffect(() => {
        const overlay = new naver.maps.OverlayView();

        overlay.onAdd = function () {
            const panes = this.getPanes();
            panes.overlayLayer.appendChild(container);
        };

        overlay.draw = function () {
            const proj = this.getProjection();
            const point = proj.fromCoordToOffset(
                new naver.maps.LatLng(
                    positionRef.current.lat,
                    positionRef.current.lng,
                ),
            );
            container.style.left = `${point.x}px`;
            container.style.top = `${point.y}px`;
        };

        overlay.onRemove = function () {
            container.parentNode?.removeChild(container);
        };

        overlay.setMap(map);
        overlayRef.current = overlay;

        return () => {
            overlay.setMap(null);
            overlayRef.current = null;
        };
    }, [map, container]);

    useEffect(() => {
        const ov = overlayRef.current;
        if (ov && ov.getMap()) {
            ov.draw();
        }
    }, [position.lat, position.lng]);

    return createPortal(children, container);
}
