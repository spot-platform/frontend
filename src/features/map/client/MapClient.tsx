// /map 메인 클라이언트. 2026-04-19 map-v3 에서 승격.
'use client';

import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapHeader } from '@/features/map/ui/MapHeader';
import { MapFooter } from '@/features/map/ui/MapFooter';
import { LayerTransition } from '@/features/map/ui/LayerTransition';
import { PostTypeSheet } from '@/features/map/ui/PostTypeSheet';
import { ChatLever } from '@/features/chat/ui/ChatLever';
import { ChatDrawer } from '@/features/chat/ui/ChatDrawer';
import {
    MapFeedCardPager,
    type FeedCardPagerSnap,
} from '@/features/feed/ui/MapFeedCardPager';
import { FeedBottomSheet } from '@/features/feed/ui/FeedBottomSheet';
import type { BottomSheetSnapPoint } from '@frontend/design-system';
import { useLayerStore } from '@/features/layer/model/use-layer-store';
import { useMockPersonaSwarm } from '@/features/simulation/model/use-mock-persona-swarm';
import { useMockSpotLifecycles } from '@/features/simulation/model/use-mock-spot-lifecycles';
import { useMySpotsStore } from '@/features/spot/model/my-spots-store';
import {
    saveSimulationConversionContext,
    getSuggestedPriceKrw,
} from '@/features/simulation/model/simulation-conversion-context';
import { useFilterStore } from '@/features/map/model/use-filter-store';
import { useMapUrlState } from '@/features/map/model/use-map-url-state';
import { ClusterBlob } from '@/features/map/ui/ClusterBlob';
import { PersonaDotMarkerBlob } from '@/features/map/ui/PersonaDotMarkerBlob';
import { MapBottomStack } from '@/features/map/ui/MapBottomStack';
import { PersonaInfoCard } from '@/features/map/ui/PersonaInfoCard';
import { SpotInfoCard } from '@/features/map/ui/SpotInfoCard';
import { MySpotInfoCard } from '@/features/map/ui/MySpotInfoCard';
import { ARCHETYPE_LABEL } from '@/entities/persona/labels';
import { LiveTicker } from '@/features/map/ui/LiveTicker';
import type { TickerEvent } from '@/features/map/model/ticker-adapter';
import { createSwarmTickerAdapter } from '@/features/map/model/swarm-ticker-adapter';
import { useTheme } from '@/shared/model/use-theme';
import type { GeoCoord } from '@/entities/spot/types';
import type { Persona } from '@/entities/persona/types';
import type { ActivityCluster } from '@/features/map/model/types';
import type { MapOverlayItem } from '@/features/map/ui/MapCanvas';
import type { ViewportBbox } from '@/features/map/ui/MapV3Canvas';

// Swarm 시뮬레이션 고정 bbox (수원시 전역 ~10km×10km). 모드 분기 없이 항상 swarm.
const SWARM_BBOX = {
    swLat: 37.22,
    swLng: 126.97,
    neLat: 37.31,
    neLng: 127.08,
};
const SWARM_MAX_N = 1000;

const MapV3Canvas = dynamic(
    () => import('@/features/map/ui/MapV3Canvas').then((m) => m.MapV3Canvas),
    { ssr: false },
);

export function MapClient() {
    const router = useRouter();
    const [urlState, updateUrl] = useMapUrlState();
    const {
        spot: selectedSpotId,
        persona: selectedPersonaId,
        cluster: selectedClusterId,
        chat: chatDrawerOpen,
    } = urlState;

    const [center, setCenter] = useState({ lat: 37.2636, lng: 127.0286 });
    const [postTypeSheetOpen, setPostTypeSheetOpen] = useState(false);
    const [feedListOpen, setFeedListOpen] = useState(false);
    const [feedListSnap, setFeedListSnap] =
        useState<BottomSheetSnapPoint>('half');
    const [pagerSnap, setPagerSnap] = useState<FeedCardPagerSnap>('peek');
    const [pagerPromotedCount, setPagerPromotedCount] = useState(0);
    // 카드 페이저는 더 이상 맵/다른 UI 에 영향 주지 않음. expanded 는 뭉치 살짝 커지는 정도.
    const isStackExpanded = false;
    void pagerSnap;
    const [viewportBbox, setViewportBbox] = useState<ViewportBbox | null>(null);
    const [followingPersonaId, setFollowingPersonaId] = useState<string | null>(
        null,
    );

    // next-themes 의 resolvedTheme 은 초기 렌더에서 undefined — 이 상태로 MapV3Canvas 가 mount 되면
    // customStyleId 가 잘못 지정되어 기본 스타일로 뜬 뒤 live swap 되며 깜빡인다.
    // <html class="dark"> 는 next-themes inline 스크립트가 React 수화 전에 동기적으로 세팅하므로,
    // DOM 에서 바로 읽어 map 생성 전에 theme 을 확정한다.
    const { resolvedTheme } = useTheme();
    const [initialDomTheme] = useState<'light' | 'dark'>(() =>
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light',
    );
    const theme: 'light' | 'dark' =
        resolvedTheme === 'dark' || resolvedTheme === 'light'
            ? resolvedTheme
            : initialDomTheme;

    const searchParams = useSearchParams();
    const swarmN = (() => {
        const raw = Number(searchParams.get('n') ?? '');
        if (!Number.isFinite(raw) || raw <= 0) return 80;
        return Math.min(SWARM_MAX_N, Math.floor(raw));
    })();

    const {
        personas: swarmPersonas,
        positionsRef: swarmPositionsRef,
        subscribe: swarmSubscribe,
        setSpotTargets: swarmSetSpotTargets,
    } = useMockPersonaSwarm({
        n: swarmN,
        enabled: true,
        bbox: SWARM_BBOX,
    });

    const basePersonas = swarmPersonas;

    const feedType = useFilterStore((s) => s.feedType);
    const categories = useFilterStore((s) => s.categories);
    const searchQuery = useFilterStore((s) => s.searchQuery);

    const activeLayer = useLayerStore((s) => s.activeLayer);

    const handleMapClick = useCallback(() => {
        updateUrl({ spot: null, persona: null, cluster: null });
        setFollowingPersonaId(null);
        // 맵 클릭은 카드 페이저도 peek 으로 리셋 — promote 모두 흡수.
        setPagerSnap('peek');
        setPagerPromotedCount(0);
    }, [updateUrl]);

    const basePersonaCoordMap = useMemo(() => {
        const map = new Map<string, GeoCoord>();
        for (const p of basePersonas) map.set(p.id, p.initialCoord);
        return map;
    }, [basePersonas]);

    const basePersonaLookup = useMemo(
        () => new Map(basePersonas.map((p) => [p.id, p])),
        [basePersonas],
    );

    // 페르소나 overlay 초기 position 용 (좌표의 첫 값). 이후 live 위치는 subscribe 경유.
    const getPersonaCoord = useCallback(
        (personaId: string): GeoCoord => {
            return basePersonaCoordMap.get(personaId) ?? { lat: 0, lng: 0 };
        },
        [basePersonaCoordMap],
    );

    const handleFollow = useCallback(
        (personaId: string) => {
            setFollowingPersonaId(personaId);
            updateUrl({ persona: null });
            const coord = getPersonaCoord(personaId);
            setCenter(coord);
        },
        [getPersonaCoord, updateUrl],
    );

    // swarm follow: subscribe 경유로 ref 에서 실시간 위치 읽어 center 업데이트.
    useEffect(() => {
        if (!followingPersonaId) return;
        return swarmSubscribe(() => {
            const coord = swarmPositionsRef.current.get(followingPersonaId);
            if (coord) startTransition(() => setCenter(coord));
        });
    }, [followingPersonaId, swarmSubscribe, swarmPositionsRef]);

    const handleToggleListView = useCallback(() => {
        setFeedListOpen((open) => {
            const next = !open;
            if (next) setFeedListSnap('half');
            return next;
        });
    }, []);

    // 필터 통과한 페르소나만 클러스터링 입력으로 사용.
    const filteredPersonas = useMemo<Persona[]>(() => {
        const q = searchQuery.trim().toLowerCase();
        return basePersonas.filter((p) => {
            if (feedType === 'offer' && p.intent !== 'offer') return false;
            if (feedType === 'request' && p.intent !== 'request') return false;
            if (
                categories.length > 0 &&
                !(categories as readonly string[]).includes(p.category)
            ) {
                return false;
            }
            if (q.length > 0) {
                const haystack = `${p.name} ${p.category}`.toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });
    }, [basePersonas, feedType, categories, searchQuery]);

    // SpotLifecycle 객체 기반 클러스터. 위치는 swarm ref 에서 직접 읽음.
    // 참여자→스팟 assignments 를 swarm.setSpotTargets 로 흘려, 참여자들이 실제로 스팟 좌표로 이동.
    const lifecycleResult = useMockSpotLifecycles({
        enabled: true,
        personas: filteredPersonas,
        positionsRef: swarmPositionsRef,
        onAssignmentsChangeAction: swarmSetSpotTargets,
    });

    // 사용자 본인이 생성한 spot → 시각적으로 primary 톤 클러스터로 병합.
    const mySpots = useMySpotsStore((s) => s.spots);
    const mySpotClusters = useMemo<ActivityCluster[]>(
        () =>
            mySpots.map((spot) => ({
                id: `mine-${spot.id}`,
                centerCoord: spot.location,
                category: spot.category,
                intent: spot.intent,
                personas: spot.participants,
                variant: 'mine',
                variantLabel: '내 모임',
            })),
        [mySpots],
    );

    const rawClusters = useMemo<ActivityCluster[]>(
        () => [...mySpotClusters, ...lifecycleResult.clusters],
        [mySpotClusters, lifecycleResult.clusters],
    );

    // FilterChipBar 토글 시 이미 활성화된 클러스터도 즉시 반영되도록 display-side filter 적용.
    // swarm 모드에선 `filteredPersonas` 가 신규 스팟 풀만 제한하므로, 여기서 카테고리/intent 로 한 번 더 거름.
    const clusters = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (feedType === 'all' && categories.length === 0 && q.length === 0) {
            return rawClusters;
        }
        return rawClusters.filter((c) => {
            if (feedType === 'offer' && c.intent !== 'offer') return false;
            if (feedType === 'request' && c.intent !== 'request') return false;
            if (
                categories.length > 0 &&
                !(categories as readonly string[]).includes(c.category)
            ) {
                return false;
            }
            if (q.length > 0) {
                if (!c.category.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [rawClusters, feedType, categories, searchQuery]);

    const handleClusterSelect = useCallback(
        (clusterId: string) => {
            updateUrl({ cluster: clusterId });
        },
        [updateUrl],
    );

    // v3 는 spot marker 가 아닌 cluster 중심이라 SpotPreviewSheet 은 사용하지 않음.
    void selectedSpotId;

    const showSpots = activeLayer === 'mixed' || activeLayer === 'real';
    const showPersonas = activeLayer === 'mixed' || activeLayer === 'virtual';

    // 뷰포트 컬링: bbox 밖은 렌더 스킵. pad 는 panning 중 깜빡임 방지용 여유.
    const inViewport = useCallback(
        (coord: GeoCoord): boolean => {
            if (!viewportBbox) return true;
            const padLat = (viewportBbox.neLat - viewportBbox.swLat) * 0.1;
            const padLng = (viewportBbox.neLng - viewportBbox.swLng) * 0.1;
            return (
                coord.lat >= viewportBbox.swLat - padLat &&
                coord.lat <= viewportBbox.neLat + padLat &&
                coord.lng >= viewportBbox.swLng - padLng &&
                coord.lng <= viewportBbox.neLng + padLng
            );
        },
        [viewportBbox],
    );

    // cluster overlays (layer=mixed|real)
    const clusterOverlays: MapOverlayItem[] = useMemo(() => {
        if (!showSpots) return [];
        return clusters
            .filter((cluster) => inViewport(cluster.centerCoord))
            .map((cluster) => ({
                key: `cluster-${cluster.id}`,
                position: cluster.centerCoord,
                clickable: true,
                render: () => (
                    <ClusterBlob
                        cluster={cluster}
                        selected={selectedClusterId === cluster.id}
                        onSelectAction={handleClusterSelect}
                    />
                ),
            }));
    }, [
        clusters,
        selectedClusterId,
        handleClusterSelect,
        showSpots,
        inViewport,
    ]);

    // 클러스터에 속한 페르소나 id 집합 — "물리적으로 spot 에 도착한" 참여자만 hide.
    // 이동 중인 참여자 dot 은 맵에 보이게 두어 "이동 중" 감각 유지.
    const clusteredPersonaIds = lifecycleResult.arrivedParticipantIds;

    // 단독 페르소나만 dot 으로 렌더
    const personaOverlays: MapOverlayItem[] = useMemo(() => {
        if (!showPersonas) return [];
        const result: MapOverlayItem[] = [];
        for (const persona of filteredPersonas) {
            if (clusteredPersonaIds.has(persona.id)) continue;
            const coord = getPersonaCoord(persona.id);
            if (!inViewport(coord)) continue;
            const item: MapOverlayItem = {
                key: `persona-${persona.id}`,
                position: coord,
                clickable: true,
                render: () => (
                    <PersonaDotMarkerBlob
                        name={persona.name}
                        variant="ai"
                        emoji={persona.emoji}
                        moving
                        expanded={selectedPersonaId === persona.id}
                        onSelectAction={() =>
                            updateUrl({ persona: persona.id })
                        }
                    />
                ),
            };
            // rAF 기반 imperative 위치 업데이트. React 리렌더 우회.
            item.positionSubscribe = (cb) =>
                swarmSubscribe(() => {
                    const c = swarmPositionsRef.current.get(persona.id);
                    if (c) cb(c);
                });
            result.push(item);
        }
        return result;
    }, [
        filteredPersonas,
        clusteredPersonaIds,
        getPersonaCoord,
        swarmSubscribe,
        swarmPositionsRef,
        showPersonas,
        selectedPersonaId,
        updateUrl,
        inViewport,
    ]);

    const overlays: MapOverlayItem[] = useMemo(
        () => [...clusterOverlays, ...personaOverlays],
        [clusterOverlays, personaOverlays],
    );

    const [tickerEvent, setTickerEvent] = useState<TickerEvent | null>(null);
    const swarmTickerAdapterRef = useRef(createSwarmTickerAdapter());
    const swarmLifecycles = lifecycleResult.lifecycles;
    useEffect(() => {
        if (swarmLifecycles.length === 0) return;
        const ev = swarmTickerAdapterRef.current.push(
            swarmLifecycles,
            performance.now(),
            basePersonaLookup,
        );
        if (ev) setTickerEvent(ev);
    }, [swarmLifecycles, basePersonaLookup]);

    return (
        <>
            <div
                className="pointer-events-none fixed left-2 right-2 top-2 z-0 overflow-hidden rounded-3xl bg-card shadow-[0_8px_32px_-12px_rgba(0,0,0,0.18)] ring-1 ring-border-soft/60 transition-[bottom] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{
                    bottom: isStackExpanded ? 'calc(72dvh + 0.5rem)' : '0.5rem',
                }}
            >
                <div className="pointer-events-auto absolute inset-0">
                    <MapV3Canvas
                        center={center}
                        theme={theme}
                        onMapClickAction={handleMapClick}
                        onViewportChangeAction={setViewportBbox}
                        overlays={overlays}
                    />
                </div>
                <LayerTransition activeLayer={activeLayer} />
            </div>

            <MapHeader
                onCreateClick={() => setPostTypeSheetOpen(true)}
                hidden={isStackExpanded}
            />
            <MapFooter
                onCenterToUser={setCenter}
                onToggleListView={handleToggleListView}
                hidden={isStackExpanded}
            />
            <ChatLever
                onOpen={() => updateUrl({ chat: true })}
                hidden={isStackExpanded}
            />

            <ChatDrawer
                open={chatDrawerOpen}
                onClose={() => updateUrl({ chat: false })}
            />

            <MapFeedCardPager
                snap={pagerSnap}
                onSnapChange={setPagerSnap}
                promotedCount={pagerPromotedCount}
                onPromotedCountChange={setPagerPromotedCount}
                onBookmark={(item) => {
                    // TODO: 다음 PR에서 useAddFavorite mutation 연결
                    console.info('[bookmark]', item.id, item.title);
                }}
            />

            {feedListOpen && (
                <FeedBottomSheet
                    snapPoint={feedListSnap}
                    onSnapChange={(s) => {
                        if (s === 'peek') {
                            setFeedListOpen(false);
                        } else {
                            setFeedListSnap(s);
                        }
                    }}
                    feedType={feedType}
                    categories={categories}
                />
            )}

            {tickerEvent && (
                <div
                    aria-hidden={isStackExpanded}
                    className="pointer-events-auto fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    style={{
                        paddingTop: 'env(safe-area-inset-top)',
                        transform: isStackExpanded
                            ? 'translateY(-100%)'
                            : 'translateY(0)',
                        pointerEvents: isStackExpanded ? 'none' : 'auto',
                    }}
                >
                    <LiveTicker event={tickerEvent} sseActive />
                </div>
            )}

            <MapBottomStack className="bottom-[40dvh]">
                {(() => {
                    const selectedPersona =
                        basePersonas.find((p) => p.id === selectedPersonaId) ??
                        null;
                    if (!selectedPersona) return null;
                    return (
                        <PersonaInfoCard
                            key={`persona-${selectedPersona.id}`}
                            name={selectedPersona.name}
                            variant="ai"
                            emoji={selectedPersona.emoji}
                            role={
                                ARCHETYPE_LABEL[selectedPersona.archetype] ??
                                selectedPersona.archetype
                            }
                            tags={[selectedPersona.category]}
                            onCloseAction={() => updateUrl({ persona: null })}
                            onFollowAction={() =>
                                handleFollow(selectedPersona.id)
                            }
                        />
                    );
                })()}
                {(() => {
                    if (!selectedClusterId) return null;

                    // 내 모임 클러스터 — 전용 카드 분기.
                    if (selectedClusterId.startsWith('mine-')) {
                        const mySpotId = selectedClusterId.slice(
                            'mine-'.length,
                        );
                        const mySpot = mySpots.find((s) => s.id === mySpotId);
                        if (!mySpot) return null;
                        return (
                            <MySpotInfoCard
                                key={`myspot-${mySpot.id}`}
                                spot={mySpot}
                                personaLookup={basePersonaLookup}
                                onCloseAction={() =>
                                    updateUrl({ cluster: null })
                                }
                            />
                        );
                    }

                    // 시뮬 lifecycle 기반 클러스터.
                    const selectedLifecycle = lifecycleResult.lifecycles.find(
                        (lc) => lc.spotId === selectedClusterId,
                    );
                    if (!selectedLifecycle) return null;
                    return (
                        <SpotInfoCard
                            key={`spot-${selectedLifecycle.spotId}`}
                            lifecycle={selectedLifecycle}
                            personaLookup={basePersonaLookup}
                            onCloseAction={() => updateUrl({ cluster: null })}
                            onCreateSimilarAction={() => {
                                // 시뮬 → post 전환: prefill + insight 컨텍스트 둘 다 전달.
                                // 단순 prefill(URL 쿼리) 로는 담기 힘든 분석 지표(평균 참여자,
                                // 가격 벤치마크 등) 는 sessionStorage 에 JSON 으로 저장해
                                // post 폼 쪽 SimulationInsightCard 가 읽어 '적용' 제안으로 노출.
                                const sameCategory =
                                    lifecycleResult.lifecycles.filter(
                                        (l) =>
                                            l.category ===
                                            selectedLifecycle.category,
                                    );
                                const nowMs = performance.now();
                                const similarActive = sameCategory.filter(
                                    (l) => nowMs < l.closedAtMs,
                                ).length;
                                const avgParticipants =
                                    sameCategory.length > 0
                                        ? Math.max(
                                              2,
                                              Math.round(
                                                  sameCategory.reduce(
                                                      (s, l) =>
                                                          s +
                                                          l.participants.length,
                                                      0,
                                                  ) / sameCategory.length,
                                              ),
                                          )
                                        : selectedLifecycle.participants.length;
                                saveSimulationConversionContext({
                                    sourceSpotId: selectedLifecycle.spotId,
                                    category: selectedLifecycle.category,
                                    intent: selectedLifecycle.intent,
                                    title: selectedLifecycle.title,
                                    similarActiveCount: similarActive,
                                    avgParticipants,
                                    suggestedPriceKrw: getSuggestedPriceKrw(
                                        selectedLifecycle.category,
                                    ),
                                    typicalLifespanMs:
                                        selectedLifecycle.closedAtMs -
                                        selectedLifecycle.createdAtMs,
                                    spotLocation: selectedLifecycle.location,
                                });

                                const qs = new URLSearchParams();
                                qs.set('title', selectedLifecycle.title);
                                qs.set('category', selectedLifecycle.category);
                                qs.set('fromSpot', selectedLifecycle.spotId);
                                const path =
                                    selectedLifecycle.intent === 'offer'
                                        ? '/post/offer'
                                        : '/post/request';
                                router.push(`${path}?${qs.toString()}`);
                            }}
                        />
                    );
                })()}
            </MapBottomStack>

            <PostTypeSheet
                open={postTypeSheetOpen}
                onClose={() => setPostTypeSheetOpen(false)}
            />
        </>
    );
}
