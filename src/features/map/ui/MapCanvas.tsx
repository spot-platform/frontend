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
    /**
     * 있으면 NaverOverlay 가 이 함수로 구독해 매번 좌표를 업데이트 (imperative).
     * React 리렌더 없이 container.style 만 갱신하므로 수백 개 애니메이션에 적합.
     * position 은 초기 placeholder 로만 사용.
     */
    positionSubscribe?: (
        cb: (coord: { lat: number; lng: number }) => void,
    ) => () => void;
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
                    <NaverOverlay
                        key={o.key}
                        map={map}
                        position={o.position}
                        positionSubscribe={o.positionSubscribe}
                    >
                        {o.render()}
                    </NaverOverlay>
                ))}
        </div>
    );
}

export function NaverOverlay({
    map,
    position,
    positionSubscribe,
    children,
}: {
    map: naver.maps.Map;
    position: { lat: number; lng: number };
    positionSubscribe?: (
        cb: (coord: { lat: number; lng: number }) => void,
    ) => () => void;
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
    // subscribe 경로가 아니면 매 렌더마다 prop 에서 ref 동기화 (기존 동작 유지).
    // subscribe 경로일 땐 subscribe callback 이 ref 의 주인이므로 건드리면 안 됨.
    if (!positionSubscribe) {
        positionRef.current = position;
    }

    useEffect(() => {
        // Naver SDK 가 내부적으로 원본 prototype 의 draw/onAdd/onRemove 를 참조할 수 있기에
        // 인스턴스 속성 덮어쓰기가 아닌, OverlayView 를 상속한 프로토타입 체인을 구성한다.
        // 표준 Naver 커스텀 오버레이 패턴.
        type OV = naver.maps.OverlayView;
        function Overlay(this: OV) {
            // super constructor
        }
        Overlay.prototype = new naver.maps.OverlayView();
        Overlay.prototype.constructor = Overlay;
        (Overlay.prototype as OV).onAdd = function () {
            const panes = this.getPanes();
            panes.overlayLayer.appendChild(container);
        };
        (Overlay.prototype as OV).draw = function () {
            const proj = this.getProjection();
            if (!proj) return;
            const point = proj.fromCoordToOffset(
                new naver.maps.LatLng(
                    positionRef.current.lat,
                    positionRef.current.lng,
                ),
            );
            container.style.left = `${point.x}px`;
            container.style.top = `${point.y}px`;
            // 줌 레벨에 따라 overlay 를 확대/축소할 CSS 변수 주입.
            // 지도가 줌 아웃될 때 cluster 도 함께 축소되어 점이 되는 감각 재현.
            const mapInst = this.getMap() as naver.maps.Map | null;
            if (mapInst) {
                const zoom = mapInst.getZoom();
                // zoom 15 를 기준으로 매 1 단계당 1.3 배. 최소 0.3, 최대 1.5 로 clamp.
                const scale = Math.min(
                    1.5,
                    Math.max(0.3, Math.pow(1.3, zoom - 15)),
                );
                container.style.setProperty(
                    '--overlay-scale',
                    scale.toString(),
                );
            }
        };
        (Overlay.prototype as OV).onRemove = function () {
            container.parentNode?.removeChild(container);
        };

        const overlay = new (Overlay as unknown as { new (): OV })();
        overlay.setMap(map);
        overlayRef.current = overlay;

        return () => {
            overlay.setMap(null);
            overlayRef.current = null;
        };
    }, [map, container]);

    // positionSubscribe 가 있으면 ref 만 업데이트하고 draw() 직접 호출 — React 우회.
    useEffect(() => {
        if (!positionSubscribe) return;
        return positionSubscribe((coord) => {
            positionRef.current = coord;
            const ov = overlayRef.current;
            if (ov && ov.getMap()) ov.draw();
        });
    }, [positionSubscribe]);

    // position prop 변경 시 명시적 redraw (subscribe 경로가 아닐 때만).
    useEffect(() => {
        if (positionSubscribe) return;
        const ov = overlayRef.current;
        if (ov && ov.getMap()) ov.draw();
    }, [position.lat, position.lng, positionSubscribe]);

    // 줌 애니메이션 중·후 모두 redraw 를 강제해 overlay 가 stale pixel 에 남지 않도록.
    // GL 렌더링에선 zoom_changed 가 한 번만 발화될 수 있어 bounds_changed + idle 을 함께 구독.
    // Heartbeat redraw — Naver GL 모드에서 auto-draw 가 누락되는 경우가 있어,
    // subscribe 가 없는 overlay 도 주기적으로 draw 를 호출해 현재 projection 과 동기 유지.
    // positionSubscribe 가 있는 overlay 는 subscribe 자체가 heartbeat 역할이므로 스킵.
    useEffect(() => {
        if (!map || positionSubscribe) return;
        const id = setInterval(() => {
            const ov = overlayRef.current;
            if (ov && ov.getMap()) ov.draw();
        }, 200);
        return () => clearInterval(id);
    }, [map, positionSubscribe]);

    return createPortal(children, container);
}
