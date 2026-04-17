'use client';

import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { SpotMarker } from '@/features/map/ui/SpotMarker';
import { MapHeader } from '@/features/map/ui/MapHeader';
import { FilterChipBar } from '@/features/map/ui/FilterChipBar';
import { MapFooter } from '@/features/map/ui/MapFooter';
import { LayerTransition } from '@/features/map/ui/LayerTransition';
import { PostTypeSheet } from '@/features/map/ui/PostTypeSheet';
import { PersonaAvatar } from '@/features/simulation/ui/PersonaAvatar';
import { PersonaProfileCard } from '@/features/simulation/ui/PersonaProfileCard';
import { ChatLever } from '@/features/chat/ui/ChatLever';
import { ChatDrawer } from '@/features/chat/ui/ChatDrawer';
import { FeedBottomSheet } from '@/features/feed/ui/FeedBottomSheet';
import { SpotPreviewSheet } from '@/features/feed/ui/SpotPreviewSheet';
import { LayerToggle } from '@/features/layer/ui/LayerToggle';
import { useLayerStore } from '@/features/layer/model/use-layer-store';
import { MOCK_SPOTS } from '@/features/map/model/mock-spots';
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
import type { BottomSheetSnapPoint } from '@frontend/design-system';
import type { GeoCoord, SpotMapItem } from '@/entities/spot/types';
import type { MapOverlayItem } from '@/features/map/ui/MapCanvas';

type SimulationMode = 'sse' | 'legacy' | 'off';

function resolveSimulationMode(raw: string | null): SimulationMode {
    if (raw === 'off') return 'off';
    if (raw === 'legacy') return 'legacy';
    return 'sse';
}

const MapCanvas = dynamic(
    () => import('@/features/map/ui/MapCanvas').then((m) => m.MapCanvas),
    { ssr: false },
);

export function MapPageClient() {
    const [urlState, updateUrl] = useMapUrlState();
    const {
        spot: selectedSpotId,
        persona: selectedPersonaId,
        sheet: sheetSnap,
        chat: chatDrawerOpen,
    } = urlState;

    const [center, setCenter] = useState({ lat: 37.2636, lng: 127.0286 });
    const [layerToggleOpen, setLayerToggleOpen] = useState(false);
    const [postTypeSheetOpen, setPostTypeSheetOpen] = useState(false);
    const [followingPersonaId, setFollowingPersonaId] = useState<string | null>(
        null,
    );

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

    const eventSpots =
        simulationMode === 'sse' ? sseSimulation.spots : legacyPlayer.spots;
    const personaTargets =
        simulationMode === 'sse'
            ? sseSimulation.personaTargets
            : legacyPlayer.personaTargets;
    const animatedPersonaCoords = useAnimatedCoords(personaTargets, {
        durationMs: simulationMode === 'sse' ? 1300 : 1800,
    });
    const spotStatuses =
        simulationMode === 'sse'
            ? sseSimulation.spotStatuses
            : legacyPlayer.spotStatuses;

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
        updateUrl({ spot: null, persona: null });
        setFollowingPersonaId(null);
    }, [updateUrl]);

    const handlePersonaClick = useCallback(
        (personaId: string) => {
            updateUrl({ persona: personaId, spot: null });
        },
        [updateUrl],
    );

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

    const allSpots = useMemo(() => {
        const byId = new Map<string, SpotMapItem>();
        for (const spot of MOCK_SPOTS) byId.set(spot.id, spot);
        for (const spot of eventSpots) byId.set(spot.id, spot);
        return Array.from(byId.values());
    }, [eventSpots]);

    const handleSpotSelect = useCallback(
        (spotId: string) => {
            const spot = allSpots.find((s) => s.id === spotId);
            if (spot) setCenter(spot.coord);
            updateUrl({ spot: spotId, sheet: 'peek' });
        },
        [allSpots, updateUrl],
    );

    const handleToggleListView = useCallback(() => {
        updateUrl({ sheet: sheetSnap === 'peek' ? 'half' : 'peek' });
    }, [sheetSnap, updateUrl]);

    const getSpotStatus = useCallback(
        (spot: SpotMapItem) => spotStatuses.get(spot.id) ?? spot.status,
        [spotStatuses],
    );

    const filteredSpots = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return allSpots.filter((spot) => {
            if (feedType === 'offer' && spot.type !== 'OFFER') return false;
            if (feedType === 'request' && spot.type !== 'REQUEST') return false;
            if (
                categories.length > 0 &&
                !(categories as readonly string[]).includes(spot.category)
            )
                return false;
            if (q.length > 0) {
                const haystack = `${spot.title} ${spot.category}`.toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });
    }, [allSpots, feedType, categories, searchQuery]);

    const selectedSpot = useMemo(
        () => allSpots.find((s) => s.id === selectedSpotId) ?? null,
        [allSpots, selectedSpotId],
    );

    const selectedSpotLat = selectedSpot?.coord.lat;
    const selectedSpotLng = selectedSpot?.coord.lng;
    useEffect(() => {
        if (selectedSpotLat == null || selectedSpotLng == null) return;
        startTransition(() =>
            setCenter({ lat: selectedSpotLat, lng: selectedSpotLng }),
        );
    }, [selectedSpotLat, selectedSpotLng]);

    const showSpots = activeLayer === 'mixed' || activeLayer === 'real';
    const showPersonas = activeLayer === 'mixed' || activeLayer === 'virtual';

    const spotOverlays: MapOverlayItem[] = useMemo(() => {
        if (!showSpots) return [];
        return filteredSpots.map((spot) => ({
            key: `spot-${spot.id}`,
            position: spot.coord,
            clickable: true,
            render: () => (
                <SpotMarker
                    spot={{ ...spot, status: getSpotStatus(spot) }}
                    isSelected={selectedSpotId === spot.id}
                    onSelect={handleSpotSelect}
                />
            ),
        }));
    }, [
        filteredSpots,
        selectedSpotId,
        getSpotStatus,
        handleSpotSelect,
        showSpots,
    ]);

    const personaOverlays: MapOverlayItem[] = useMemo(() => {
        if (!showPersonas) return [];
        return MOCK_PERSONAS.map((persona) => {
            const coord = getPersonaCoord(persona.id);
            return {
                key: `persona-${persona.id}`,
                position: coord,
                render: () => (
                    <PersonaAvatar
                        persona={persona}
                        coord={coord}
                        onClick={handlePersonaClick}
                        isFollowing={followingPersonaId === persona.id}
                    />
                ),
            };
        });
    }, [getPersonaCoord, handlePersonaClick, showPersonas, followingPersonaId]);

    const overlays: MapOverlayItem[] = useMemo(
        () => [...spotOverlays, ...personaOverlays],
        [spotOverlays, personaOverlays],
    );

    return (
        <>
            <MapCanvas
                center={center}
                onMapClick={handleMapClick}
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
            />

            <PostTypeSheet
                open={postTypeSheetOpen}
                onClose={() => setPostTypeSheetOpen(false)}
            />
        </>
    );
}
