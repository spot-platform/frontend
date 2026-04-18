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
import { useSearchParams } from 'next/navigation';
import { MapHeader } from '@/features/map/ui/MapHeader';
import { FilterChipBar } from '@/features/map/ui/FilterChipBar';
import { MapFooter } from '@/features/map/ui/MapFooter';
import { LayerTransition } from '@/features/map/ui/LayerTransition';
import { PostTypeSheet } from '@/features/map/ui/PostTypeSheet';
import { PersonaProfileCard } from '@/features/simulation/ui/PersonaProfileCard';
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
import { useFilterStore } from '@/features/map/model/use-filter-store';
import { useMapUrlState } from '@/features/map/model/use-map-url-state';
import { useActivityClusters } from '@/features/map/model/use-activity-clusters';
import { ClusterMarker } from '@/features/map/ui/ClusterMarker';
import { PersonaDotMarker } from '@/features/map/ui/PersonaDotMarker';
import { ClusterBottomSheetHeader } from '@/features/map/ui/ClusterBottomSheetHeader';
import { LiveTicker } from '@/features/map/ui/LiveTicker';
import { ThemeSegment } from '@/features/map/ui/ThemeSegment';
import {
    createTickerAdapter,
    type TickerEvent,
} from '@/features/map/model/ticker-adapter';
import { useTheme } from '@/shared/model/use-theme';
import type { BottomSheetSnapPoint } from '@frontend/design-system';
import type { GeoCoord } from '@/entities/spot/types';
import type { Persona } from '@/entities/persona/types';
import type { MapOverlayItem } from '@/features/map/ui/MapCanvas';

type SimulationMode = 'sse' | 'legacy' | 'off';

function resolveSimulationMode(raw: string | null): SimulationMode {
    if (raw === 'off') return 'off';
    if (raw === 'legacy') return 'legacy';
    return 'sse';
}

const MapV3Canvas = dynamic(
    () => import('@/features/map/ui/MapV3Canvas').then((m) => m.MapV3Canvas),
    { ssr: false },
);

export function MapClient() {
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
    const [followingPersonaId, setFollowingPersonaId] = useState<string | null>(
        null,
    );

    const { resolvedTheme } = useTheme();
    const theme: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light';

    const searchParams = useSearchParams();
    const simulationMode = resolveSimulationMode(searchParams.get('sim'));

    const { positions } = usePersonaMovement(MOCK_PERSONAS, MOCK_WAYPOINTS);

    const sseSimulation = useTimelineSimulation({
        runId: 'demo',
        enabled: simulationMode === 'sse',
        mockFrames: MOCK_TIMELINE_FRAMES,
        mockIntervalMs: 1500,
    });

    const legacyPlayer = useEventPlayer(
        simulationMode === 'legacy' ? MOCK_EVENT_SEQUENCE : [],
    );

    const personaTargets =
        simulationMode === 'sse'
            ? sseSimulation.personaTargets
            : legacyPlayer.personaTargets;
    const animatedPersonaCoords = useAnimatedCoords(personaTargets, {
        durationMs: simulationMode === 'sse' ? 1300 : 1800,
    });

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

    const getPersonaCoord = useCallback(
        (personaId: string): GeoCoord => {
            return (
                animatedPersonaCoords.get(personaId) ??
                positions.get(personaId) ??
                MOCK_PERSONAS.find((p) => p.id === personaId)!.initialCoord
            );
        },
        [animatedPersonaCoords, positions],
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

    const followedCoord = followingPersonaId
        ? (animatedPersonaCoords.get(followingPersonaId) ??
          positions.get(followingPersonaId))
        : null;

    const followedLat = followedCoord?.lat;
    const followedLng = followedCoord?.lng;

    useEffect(() => {
        if (followedLat != null && followedLng != null) {
            startTransition(() =>
                setCenter({ lat: followedLat, lng: followedLng }),
            );
        }
    }, [followedLat, followedLng]);

    const handleToggleListView = useCallback(() => {
        updateUrl({ sheet: sheetSnap === 'peek' ? 'half' : 'peek' });
    }, [sheetSnap, updateUrl]);

    // 필터 통과한 페르소나만 클러스터링 입력으로 사용.
    const filteredPersonas = useMemo<Persona[]>(() => {
        const q = searchQuery.trim().toLowerCase();
        return MOCK_PERSONAS.filter((p) => {
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
    }, [feedType, categories, searchQuery]);

    const clusters = useActivityClusters(filteredPersonas, positions, {
        radiusMeters: 80,
    });

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

    // cluster overlays (layer=mixed|real)
    const clusterOverlays: MapOverlayItem[] = useMemo(() => {
        if (!showSpots) return [];
        return clusters.map((cluster) => ({
            key: `cluster-${cluster.id}`,
            position: cluster.centerCoord,
            clickable: true,
            render: () => (
                <ClusterMarker
                    cluster={cluster}
                    selected={selectedClusterId === cluster.id}
                    onSelectAction={handleClusterSelect}
                />
            ),
        }));
    }, [clusters, selectedClusterId, handleClusterSelect, showSpots]);

    // 클러스터에 속한 페르소나 id 집합
    const clusteredPersonaIds = useMemo(() => {
        const ids = new Set<string>();
        for (const c of clusters) {
            for (const p of c.personas) ids.add(p.id);
        }
        return ids;
    }, [clusters]);

    // 단독 페르소나만 dot 으로 렌더
    const personaOverlays: MapOverlayItem[] = useMemo(() => {
        if (!showPersonas) return [];
        return filteredPersonas
            .filter((p) => !clusteredPersonaIds.has(p.id))
            .map((persona) => {
                const coord = getPersonaCoord(persona.id);
                return {
                    key: `persona-${persona.id}`,
                    position: coord,
                    render: () => (
                        <PersonaDotMarker
                            persona={{
                                id: persona.id,
                                emoji: persona.emoji,
                                name: persona.name,
                            }}
                            moving
                        />
                    ),
                };
            });
    }, [filteredPersonas, clusteredPersonaIds, getPersonaCoord, showPersonas]);

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

    const clusterCounts = useMemo(
        () => ({
            total: clusters.length,
            offer: clusters.filter((c) => c.intent === 'offer').length,
            request: clusters.filter((c) => c.intent === 'request').length,
        }),
        [clusters],
    );

    return (
        <>
            <MapV3Canvas
                center={center}
                theme={theme}
                onMapClickAction={handleMapClick}
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

            <LiveTicker
                event={tickerEvent}
                sseActive={simulationMode === 'sse'}
            />

            <FeedBottomSheet
                snapPoint={sheetSnap}
                onSnapChange={handleSheetChange}
                feedType={feedType}
                categories={categories}
            />

            {sheetSnap === 'peek' && (
                <ClusterBottomSheetHeader counts={clusterCounts} radiusKm={1} />
            )}

            <SpotPreviewSheet
                selectedSpot={selectedSpot}
                sheetSnap={sheetSnap}
            />

            <ChatLever onOpen={() => updateUrl({ chat: true })} />
            <ChatDrawer
                open={chatDrawerOpen}
                onClose={() => updateUrl({ chat: false })}
            />

            <PersonaProfileCard
                persona={
                    MOCK_PERSONAS.find((p) => p.id === selectedPersonaId) ??
                    null
                }
                onClose={() => updateUrl({ persona: null })}
                onFollow={handleFollow}
            />

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
