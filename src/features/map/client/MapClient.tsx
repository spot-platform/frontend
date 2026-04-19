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
import { FilterChipBar } from '@/features/map/ui/FilterChipBar';
import { MapFooter } from '@/features/map/ui/MapFooter';
import { LayerTransition } from '@/features/map/ui/LayerTransition';
import { PostTypeSheet } from '@/features/map/ui/PostTypeSheet';
import { ChatLever } from '@/features/chat/ui/ChatLever';
import { ChatDrawer } from '@/features/chat/ui/ChatDrawer';
import { FeedBottomSheet } from '@/features/feed/ui/FeedBottomSheet';
import { SpotPreviewSheet } from '@/features/feed/ui/SpotPreviewSheet';
import { LayerToggle } from '@/features/layer/ui/LayerToggle';
import { useLayerStore } from '@/features/layer/model/use-layer-store';
import { MOCK_PERSONAS } from '@/features/simulation/model/mock-personas';
import { MOCK_WAYPOINTS } from '@/features/simulation/model/mock-waypoints';
import { MOCK_EVENT_SEQUENCE } from '@/features/simulation/model/mock-event-sequence';
import { MOCK_TIMELINE_FRAMES } from '@/features/simulation/model/mock-api-responses';
import { usePersonaMovement } from '@/features/simulation/model/use-persona-movement';
import { useEventPlayer } from '@/features/simulation/model/use-event-player';
import { useTimelineSimulation } from '@/features/simulation/model/use-timeline-simulation';
import { useAnimatedCoords } from '@/features/simulation/model/use-animated-coords';
import { useMockPersonaSwarm } from '@/features/simulation/model/use-mock-persona-swarm';
import { useMockSpotLifecycles } from '@/features/simulation/model/use-mock-spot-lifecycles';
import {
    saveSimulationConversionContext,
    getSuggestedPriceKrw,
} from '@/features/simulation/model/simulation-conversion-context';
import { useFilterStore } from '@/features/map/model/use-filter-store';
import { useMapUrlState } from '@/features/map/model/use-map-url-state';
import { useActivityClusters } from '@/features/map/model/use-activity-clusters';
import { ClusterBlob } from '@/features/map/ui/ClusterBlob';
import { PersonaDotMarkerBlob } from '@/features/map/ui/PersonaDotMarkerBlob';
import { MapBottomStack } from '@/features/map/ui/MapBottomStack';
import { PersonaInfoCard } from '@/features/map/ui/PersonaInfoCard';
import { SpotInfoCard } from '@/features/map/ui/SpotInfoCard';
import { ARCHETYPE_LABEL } from '@/entities/persona/labels';
import { LiveTicker } from '@/features/map/ui/LiveTicker';
import { ThemeSegment } from '@/features/map/ui/ThemeSegment';
import {
    createTickerAdapter,
    type TickerEvent,
} from '@/features/map/model/ticker-adapter';
import { createSwarmTickerAdapter } from '@/features/map/model/swarm-ticker-adapter';
import { useTheme } from '@/shared/model/use-theme';
import type { BottomSheetSnapPoint } from '@frontend/design-system';
import type { GeoCoord } from '@/entities/spot/types';
import type { Persona } from '@/entities/persona/types';
import type { MapOverlayItem } from '@/features/map/ui/MapCanvas';
import type { ViewportBbox } from '@/features/map/ui/MapV3Canvas';

type SimulationMode = 'sse' | 'legacy' | 'off' | 'swarm';

function resolveSimulationMode(raw: string | null): SimulationMode {
    if (raw === 'off') return 'off';
    if (raw === 'legacy') return 'legacy';
    if (raw === 'swarm') return 'swarm';
    return 'sse';
}

// ?sim=swarm 용 고정 bbox. 수원시 전역 ~약 10km × 10km.
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
        sheet: sheetSnap,
        chat: chatDrawerOpen,
    } = urlState;

    const [center, setCenter] = useState({ lat: 37.2636, lng: 127.0286 });
    const [layerToggleOpen, setLayerToggleOpen] = useState(false);
    const [postTypeSheetOpen, setPostTypeSheetOpen] = useState(false);
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
    const simulationMode = resolveSimulationMode(searchParams.get('sim'));
    const swarmN = (() => {
        const raw = Number(searchParams.get('n') ?? '');
        if (!Number.isFinite(raw) || raw <= 0) return 80;
        return Math.min(SWARM_MAX_N, Math.floor(raw));
    })();

    const { positions } = usePersonaMovement(MOCK_PERSONAS, MOCK_WAYPOINTS);

    const {
        personas: swarmPersonas,
        positionsRef: swarmPositionsRef,
        subscribe: swarmSubscribe,
        setSpotTargets: swarmSetSpotTargets,
    } = useMockPersonaSwarm({
        n: swarmN,
        enabled: simulationMode === 'swarm',
        bbox: SWARM_BBOX,
    });

    const sseSimulation = useTimelineSimulation({
        runId: 'demo',
        enabled: simulationMode === 'sse',
        mockFrames: MOCK_TIMELINE_FRAMES,
        mockIntervalMs: 1500,
    });

    const legacyPlayer = useEventPlayer(
        simulationMode === 'legacy' ? MOCK_EVENT_SEQUENCE : [],
    );

    const nonSwarmTargets =
        simulationMode === 'sse'
            ? sseSimulation.personaTargets
            : legacyPlayer.personaTargets;
    const nonSwarmAnimatedCoords = useAnimatedCoords(nonSwarmTargets, {
        durationMs: simulationMode === 'sse' ? 1300 : 1800,
    });

    const basePersonas =
        simulationMode === 'swarm' ? swarmPersonas : MOCK_PERSONAS;

    const feedType = useFilterStore((s) => s.feedType);
    const categories = useFilterStore((s) => s.categories);
    const searchQuery = useFilterStore((s) => s.searchQuery);

    useEffect(() => {
        if (searchQuery.trim().length > 0 && sheetSnap === 'peek') {
            updateUrl({ sheet: 'half' });
        }
    }, [searchQuery, sheetSnap, updateUrl]);
    const activeLayer = useLayerStore((s) => s.activeLayer);

    const handleMapClick = useCallback(() => {
        updateUrl({ spot: null, persona: null, cluster: null });
        setFollowingPersonaId(null);
    }, [updateUrl]);

    const handleSheetChange = useCallback(
        (snap: BottomSheetSnapPoint) => {
            updateUrl({ sheet: snap });
        },
        [updateUrl],
    );

    const basePersonaCoordMap = useMemo(() => {
        const map = new Map<string, GeoCoord>();
        for (const p of basePersonas) map.set(p.id, p.initialCoord);
        return map;
    }, [basePersonas]);

    const basePersonaLookup = useMemo(
        () => new Map(basePersonas.map((p) => [p.id, p])),
        [basePersonas],
    );

    // 비 swarm 모드에서만 쓰임. swarm 은 ref 기반이라 render 중 접근 대신 subscribe 로 우회.
    const getPersonaCoord = useCallback(
        (personaId: string): GeoCoord => {
            return (
                nonSwarmAnimatedCoords.get(personaId) ??
                positions.get(personaId) ??
                basePersonaCoordMap.get(personaId) ?? { lat: 0, lng: 0 }
            );
        },
        [nonSwarmAnimatedCoords, positions, basePersonaCoordMap],
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

    // 비 swarm 모드 follow: 상태 기반 coord 를 파생해 setCenter.
    const nonSwarmFollowedCoord =
        followingPersonaId && simulationMode !== 'swarm'
            ? (nonSwarmAnimatedCoords.get(followingPersonaId) ??
              positions.get(followingPersonaId))
            : null;
    const followedLat = nonSwarmFollowedCoord?.lat;
    const followedLng = nonSwarmFollowedCoord?.lng;

    useEffect(() => {
        if (followedLat != null && followedLng != null) {
            startTransition(() =>
                setCenter({ lat: followedLat, lng: followedLng }),
            );
        }
    }, [followedLat, followedLng]);

    // swarm follow: subscribe 경유로 ref 에서 실시간 위치 읽어 center 업데이트.
    useEffect(() => {
        if (simulationMode !== 'swarm') return;
        if (!followingPersonaId) return;
        return swarmSubscribe(() => {
            const coord = swarmPositionsRef.current.get(followingPersonaId);
            if (coord) startTransition(() => setCenter(coord));
        });
    }, [simulationMode, followingPersonaId, swarmSubscribe, swarmPositionsRef]);

    const handleToggleListView = useCallback(() => {
        updateUrl({ sheet: sheetSnap === 'peek' ? 'half' : 'peek' });
    }, [sheetSnap, updateUrl]);

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

    // swarm 모드에선 useActivityClusters 를 끔 (lifecycle 기반으로 갈아탐).
    const geometricClusters = useActivityClusters(
        simulationMode === 'swarm' ? [] : filteredPersonas,
        positions,
        { radiusMeters: 80 },
    );

    // swarm 모드 전용: SpotLifecycle 객체 기반 클러스터. 위치는 ref 에서 직접 읽음.
    // 참여자→스팟 assignments 를 swarm.setSpotTargets 로 흘려, 참여자들이 실제로 스팟 좌표로 이동.
    const lifecycleResult = useMockSpotLifecycles({
        enabled: simulationMode === 'swarm',
        personas: filteredPersonas,
        positionsRef: swarmPositionsRef,
        onAssignmentsChangeAction: swarmSetSpotTargets,
    });

    const rawClusters =
        simulationMode === 'swarm'
            ? lifecycleResult.clusters
            : geometricClusters;

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

    // v3 는 spot marker 가 아닌 cluster 중심이라 SpotPreviewSheet 은 null 로 구동한다.
    // selectedSpotId 는 URL 상태 호환성만 유지.
    void selectedSpotId;
    const selectedSpot = null;

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

    // 클러스터에 속한 페르소나 id 집합.
    // swarm 모드에선 "물리적으로 spot 에 도착한" 참여자만 hide (이동 중인 dot 은 보여야 함).
    // 비 swarm 모드에선 기존 로직 유지 (모든 클러스터 멤버 hide).
    const clusteredPersonaIds = useMemo(() => {
        if (simulationMode === 'swarm') {
            return lifecycleResult.arrivedParticipantIds;
        }
        const ids = new Set<string>();
        for (const c of clusters) {
            for (const p of c.personas) ids.add(p.id);
        }
        return ids;
    }, [simulationMode, lifecycleResult.arrivedParticipantIds, clusters]);

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
            if (simulationMode === 'swarm') {
                // rAF 기반 imperative 위치 업데이트. React 리렌더 우회.
                item.positionSubscribe = (cb) =>
                    swarmSubscribe(() => {
                        const c = swarmPositionsRef.current.get(persona.id);
                        if (c) cb(c);
                    });
            }
            result.push(item);
        }
        return result;
    }, [
        filteredPersonas,
        clusteredPersonaIds,
        getPersonaCoord,
        simulationMode,
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

    // Live ticker: SSE mode 일 때 currentFrame 을 어댑터로 흘려 보냄.
    const tickerAdapterRef = useRef(
        createTickerAdapter({
            personaLookup: new Map(
                MOCK_PERSONAS.map((p) => [
                    p.id,
                    { emoji: p.emoji, name: p.name },
                ]),
            ),
        }),
    );
    const [tickerEvent, setTickerEvent] = useState<TickerEvent | null>(null);
    const currentFrame = sseSimulation.currentFrame;
    useEffect(() => {
        if (simulationMode !== 'sse') return;
        if (!currentFrame) return;
        const ev = tickerAdapterRef.current.push(currentFrame);
        if (ev) setTickerEvent(ev);
    }, [currentFrame, simulationMode]);

    const swarmTickerAdapterRef = useRef(createSwarmTickerAdapter());
    const swarmLifecycles = lifecycleResult.lifecycles;
    useEffect(() => {
        if (simulationMode !== 'swarm') return;
        if (swarmLifecycles.length === 0) return;
        const ev = swarmTickerAdapterRef.current.push(
            swarmLifecycles,
            performance.now(),
            basePersonaLookup,
        );
        if (ev) setTickerEvent(ev);
    }, [swarmLifecycles, simulationMode, basePersonaLookup]);

    return (
        <>
            <MapV3Canvas
                center={center}
                theme={theme}
                onMapClickAction={handleMapClick}
                onViewportChangeAction={setViewportBbox}
                overlays={overlays}
            />

            <LayerTransition activeLayer={activeLayer} />

            <MapHeader onCreateClick={() => setPostTypeSheetOpen(true)} />
            <FilterChipBar />
            <MapFooter
                onCenterToUser={setCenter}
                onToggleListView={handleToggleListView}
                onLayerToggle={() => setLayerToggleOpen(true)}
            />

            <FeedBottomSheet
                snapPoint={sheetSnap}
                onSnapChange={handleSheetChange}
                feedType={feedType}
                categories={categories}
            />

            <SpotPreviewSheet
                selectedSpot={selectedSpot}
                sheetSnap={sheetSnap}
            />

            <ChatLever onOpen={() => updateUrl({ chat: true })} />
            <ChatDrawer
                open={chatDrawerOpen}
                onClose={() => updateUrl({ chat: false })}
            />

            <MapBottomStack className="bottom-[20dvh]">
                {tickerEvent && (
                    <LiveTicker
                        key="live-ticker"
                        event={tickerEvent}
                        sseActive={
                            simulationMode === 'sse' ||
                            simulationMode === 'swarm'
                        }
                    />
                )}
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
                    if (simulationMode !== 'swarm') return null;
                    if (!selectedClusterId) return null;
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

            <LayerToggle
                open={layerToggleOpen}
                onClose={() => setLayerToggleOpen(false)}
            >
                <div className="mt-4 flex items-center justify-between rounded-lg border border-border-soft bg-card px-3 py-3">
                    <span className="text-sm font-semibold text-foreground">
                        테마
                    </span>
                    <ThemeSegment />
                </div>
            </LayerToggle>

            <PostTypeSheet
                open={postTypeSheetOpen}
                onClose={() => setPostTypeSheetOpen(false)}
            />
        </>
    );
}
