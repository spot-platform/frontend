// map 메인 Canvas. 2026-04-19 map-v3 에서 승격. 기존 MapCanvas 와 동일한 동기적 Map 생성 패턴을 따른다.
// StrictMode double-invoke 시 async mountMap 은 race 가 나서 타일 레이어가 비게 되는 버그가 있음.

'use client';

import { useEffect, useRef, useState } from 'react';
import {
    MapOverlayItem,
    NaverOverlay,
    loadNaverMapSDK,
    waitForNaverMaps,
} from '@/features/map/ui/MapCanvas';
import { MockMapCanvas } from '@/features/map/ui/MockMapCanvas';

export type Theme = 'light' | 'dark';

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_KEY ?? '';
const DEFAULT_CENTER = { lat: 37.2636, lng: 127.0286 };
const DEFAULT_ZOOM = 15;

function getStyleId(theme: Theme): string | undefined {
    const light = process.env.NEXT_PUBLIC_NAVER_MAP_STYLE_LIGHT ?? '';
    const dark = process.env.NEXT_PUBLIC_NAVER_MAP_STYLE_DARK ?? '';
    const id = theme === 'dark' ? dark : light;
    return id || undefined;
}

export type ViewportBbox = {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
};

export type MapV3CanvasProps = {
    center?: { lat: number; lng: number };
    level?: number;
    overlays?: MapOverlayItem[];
    onMapClickAction?: (lat: number, lng: number) => void;
    /** pan/zoom 종료 시 현재 뷰포트 bbox 를 전달. 뷰포트 컬링에 사용. */
    onViewportChangeAction?: (bbox: ViewportBbox) => void;
    className?: string;
    theme: Theme;
};

function useSdkState() {
    const [state, setState] = useState<'loading' | 'ready' | 'error'>(
        typeof window !== 'undefined' && window.naver?.maps?.Map
            ? 'ready'
            : 'loading',
    );
    useEffect(() => {
        if (state === 'ready') return;
        loadNaverMapSDK()
            .then(() => waitForNaverMaps())
            .then(() => setState('ready'))
            .catch(() => setState('error'));
    }, [state]);
    return state;
}

export function MapV3Canvas(props: MapV3CanvasProps) {
    const {
        center = DEFAULT_CENTER,
        level,
        overlays = [],
        onMapClickAction,
        className,
    } = props;

    if (!NAVER_CLIENT_ID) {
        return (
            <MockMapCanvas
                center={center}
                level={level}
                onMapClick={onMapClickAction}
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

    return <NaverMapV3 {...props} />;
}

function NaverMapV3({
    center = DEFAULT_CENTER,
    level,
    overlays = [],
    onMapClickAction,
    onViewportChangeAction,
    className,
    theme,
}: MapV3CanvasProps) {
    const sdkState = useSdkState();
    const containerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<naver.maps.Map | null>(null);
    // theme 변경 시 인스턴스를 재생성하기 위한 key. styleId 가 있어서 live swap 성공하면 bump 하지 않음.
    const [remountKey, setRemountKey] = useState(0);
    const prevThemeRef = useRef<Theme>(theme);

    // SDK 준비 후 동기적으로 Map 생성. remountKey 가 바뀌면 effect 재실행 → 이전 인스턴스 destroy → 새 인스턴스.
    useEffect(() => {
        if (sdkState !== 'ready' || !containerRef.current) return;

        const styleId = getStyleId(theme);
        const options: naver.maps.MapOptions & {
            gl?: boolean;
            customStyleId?: string;
        } = {
            center: new naver.maps.LatLng(center.lat, center.lng),
            zoom: level ? Math.max(1, 20 - level) : DEFAULT_ZOOM,
            zoomControl: false,
            scaleControl: false,
            logoControlOptions: {
                position: naver.maps.Position.BOTTOM_LEFT,
            },
        };
        // gl: true 는 customStyleId 전용 GL 렌더러. styleId 가 있을 때만 활성화.
        if (styleId) {
            options.gl = true;
            options.customStyleId = styleId;
        }

        let instance: naver.maps.Map;
        try {
            instance = new naver.maps.Map(containerRef.current, options);
        } catch (err) {
            if (typeof console !== 'undefined') {
                console.warn(
                    '[map] Naver Map init with customStyleId failed. Falling back to default style.',
                    err,
                );
            }
            const { customStyleId: _drop, gl: _gl, ...fallback } = options;
            void _drop;
            void _gl;
            instance = new naver.maps.Map(containerRef.current, fallback);
        }
        setMap(instance);

        return () => {
            setMap(null);
            try {
                instance.destroy();
            } catch {
                // idempotent
            }
        };
        // mount / remount 이외 prop 변경은 별도 effect 로 반영.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sdkState, remountKey]);

    // theme 변경: live swap 시도. 실패 시 remountKey bump 로 인스턴스 재생성.
    useEffect(() => {
        if (prevThemeRef.current === theme) return;
        prevThemeRef.current = theme;
        if (!map) return;
        const styleId = getStyleId(theme);
        if (!styleId) {
            // styleId 없으면 기본 지도 유지 (swap 필요 없음).
            return;
        }
        try {
            (map.setOptions as (opts: { customStyleId: string }) => void)({
                customStyleId: styleId,
            });
        } catch {
            setRemountKey((k) => k + 1);
        }
    }, [theme, map]);

    // center 변경 반영
    useEffect(() => {
        if (!map) return;
        const cur = map.getCenter() as naver.maps.LatLng;
        if (cur.lat() !== center.lat || cur.lng() !== center.lng) {
            map.setCenter(new naver.maps.LatLng(center.lat, center.lng));
        }
    }, [map, center.lat, center.lng]);

    // zoom 변경 반영
    useEffect(() => {
        if (!map || level == null) return;
        const target = Math.max(1, 20 - level);
        if (map.getZoom() !== target) {
            map.setZoom(target);
        }
    }, [map, level]);

    // 컨테이너 사이즈 변화 시 map.relayout() 호출. 부모 inset 이 동적으로 바뀔 때
    // 타일이 새 영역으로 그려지지 않는 버그 방지. ResizeObserver 로 추적.
    useEffect(() => {
        if (!map || !containerRef.current) return;
        const node = containerRef.current;
        const ro = new ResizeObserver(() => {
            try {
                (
                    map as unknown as { relayout?: () => void }
                ).relayout?.();
            } catch {
                // idempotent
            }
        });
        ro.observe(node);
        return () => ro.disconnect();
    }, [map]);

    // click 리스너 등록. onMapClickAction 참조가 바뀔 때마다 재등록.
    useEffect(() => {
        if (!map || !onMapClickAction) return;
        const listener = naver.maps.Event.addListener(
            map,
            'click',
            (e: naver.maps.PointerEvent) => {
                const coord = e.coord as naver.maps.LatLng;
                onMapClickAction(coord.lat(), coord.lng());
            },
        );
        return () => {
            naver.maps.Event.removeListener(listener);
        };
    }, [map, onMapClickAction]);

    // viewport bbox 변경 리스너. pan/zoom 중엔 bounds_changed 가 연속 발화되므로
    // idle (제스처 종료) + 초기 1회 emit 으로 업데이트.
    useEffect(() => {
        if (!map || !onViewportChangeAction) return;
        const emit = () => {
            const bounds = map.getBounds() as naver.maps.LatLngBounds;
            const sw = bounds.getSW() as naver.maps.LatLng;
            const ne = bounds.getNE() as naver.maps.LatLng;
            onViewportChangeAction({
                swLat: sw.lat(),
                swLng: sw.lng(),
                neLat: ne.lat(),
                neLng: ne.lng(),
            });
        };
        emit();
        const listener = naver.maps.Event.addListener(map, 'idle', emit);
        return () => {
            naver.maps.Event.removeListener(listener);
        };
    }, [map, onViewportChangeAction]);

    if (sdkState === 'error') {
        return (
            <MockMapCanvas
                center={center}
                level={level}
                onMapClick={onMapClickAction}
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

    // containerRef div 는 항상 mount. loading 문구는 오버레이로 얹는다.
    return (
        <div
            className={className}
            style={{ position: 'relative', width: '100%', height: '100%' }}
        >
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
            {sdkState === 'loading' && (
                <div className="bg-surface pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-text-muted text-sm">
                        지도 로딩 중...
                    </div>
                </div>
            )}
            {sdkState === 'ready' &&
                map &&
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
