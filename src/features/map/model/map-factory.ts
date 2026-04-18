// map 네이버 지도 팩토리. mount / unmount / applyStyle 3종 API 를 idempotent 하게 제공.
// 현재 사용처 0 — MapV3Canvas 가 자체 SDK loader 를 사용한다. 정리는 별도 PR에서.

import { loadNaverMapSDK, waitForNaverMaps } from '@/features/map/ui/MapCanvas';

export type Theme = 'light' | 'dark';

export type MountOptions = {
    container: HTMLElement;
    center: { lat: number; lng: number };
    zoom?: number;
    theme: Theme;
    onMapClick?: (lat: number, lng: number) => void;
};

const DEFAULT_ZOOM = 15;
const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_KEY ?? '';

type ManagedListeners = { click?: naver.maps.MapEventListener };

// Map 인스턴스별로 우리가 붙인 리스너를 추적. destroy 시 제거 대상.
const listenerRegistry = new WeakMap<naver.maps.Map, ManagedListeners>();

function getStyleId(theme: Theme): string | undefined {
    const light = process.env.NEXT_PUBLIC_NAVER_MAP_STYLE_LIGHT ?? '';
    const dark = process.env.NEXT_PUBLIC_NAVER_MAP_STYLE_DARK ?? '';
    const id = theme === 'dark' ? dark : light;
    return id || undefined;
}

export async function mountMap(
    opts: MountOptions,
): Promise<naver.maps.Map | null> {
    if (!NAVER_CLIENT_ID) {
        // MockMapCanvas 폴백 경로. 호출부가 null 을 신호로 받아서 처리.
        return null;
    }

    await loadNaverMapSDK();
    await waitForNaverMaps();

    const { container, center, zoom, theme, onMapClick } = opts;

    const styleId = getStyleId(theme);
    const mapOptions: naver.maps.MapOptions & {
        gl?: boolean;
        customStyleId?: string;
    } = {
        center: new naver.maps.LatLng(center.lat, center.lng),
        zoom: zoom ?? DEFAULT_ZOOM,
        zoomControl: false,
        scaleControl: false,
        logoControlOptions: {
            position: naver.maps.Position.BOTTOM_LEFT,
        },
    };
    // gl: true 는 customStyleId 와 한 쌍. SDK URL 에 GL 서브모듈이 로드된 환경에서만 동작하며,
    // styleId 없이 gl 만 켜면 빈 캔버스가 나온다. styleId 가 주입된 경우에만 GL 모드로.
    if (styleId) {
        mapOptions.gl = true;
        mapOptions.customStyleId = styleId;
    }

    let instance: naver.maps.Map;
    try {
        instance = new naver.maps.Map(container, mapOptions);
    } catch (err) {
        // customStyleId invalid 등 초기화 실패 → 스타일 없이 재시도.
        if (typeof console !== 'undefined') {
            console.warn(
                '[map] Naver Map init with customStyleId failed. Falling back to default style.',
                err,
            );
        }
        const { customStyleId: _drop, ...fallback } = mapOptions;
        void _drop;
        instance = new naver.maps.Map(container, fallback);
    }

    const managed: ManagedListeners = {};
    if (onMapClick) {
        managed.click = naver.maps.Event.addListener(
            instance,
            'click',
            (e: naver.maps.PointerEvent) => {
                const coord = e.coord as naver.maps.LatLng;
                onMapClick(coord.lat(), coord.lng());
            },
        );
    }
    listenerRegistry.set(instance, managed);

    return instance;
}

export function unmountMap(map: naver.maps.Map | null): void {
    if (!map) return;
    const managed = listenerRegistry.get(map);
    if (managed?.click) {
        try {
            naver.maps.Event.removeListener(managed.click);
        } catch {
            // 이미 떼어진 리스너 재호출 — 안전하게 무시.
        }
    }
    listenerRegistry.delete(map);
    try {
        map.destroy();
    } catch {
        // 이미 destroy 된 인스턴스 재호출 — idempotent 보장을 위해 무시.
    }
}

// live swap 시도. 네이버가 런타임 customStyleId 교체를 지원하면 true, 실패 시 false.
// false 를 받은 호출부는 mountMap 을 재호출해서 인스턴스를 재생성하는 전략으로 폴백.
export function applyStyle(map: naver.maps.Map, theme: Theme): boolean {
    const styleId = getStyleId(theme);
    if (!styleId) {
        // 스타일 ID 가 없으면 기본 지도 유지. "스왑 성공" 으로 간주해 재마운트 유발하지 않음.
        return true;
    }
    try {
        (map.setOptions as (opts: { customStyleId: string }) => void)({
            customStyleId: styleId,
        });
        return true;
    } catch (err) {
        if (typeof console !== 'undefined') {
            console.warn(
                '[map] applyStyle setOptions failed. Caller should remount.',
                err,
            );
        }
        return false;
    }
}
