'use client';

import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import dynamic from 'next/dynamic';
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
import { usePersonaMovement } from '@/features/simulation/model/use-persona-movement';
import { useEventPlayer } from '@/features/simulation/model/use-event-player';
import { useFilterStore } from '@/features/map/model/use-filter-store';
import { useMapUrlState } from '@/features/map/model/use-map-url-state';
import type { GeoCoord, SpotMapItem } from '@/entities/spot/types';
import type { MapOverlayItem } from '@/features/map/ui/MapCanvas';

const MapCanvas = dynamic(
    () => import('@/features/map/ui/MapCanvas').then((m) => m.MapCanvas),
    { ssr: false },
);

export function MapPageClient() {
    const [urlState, updateUrl] = useMapUrlState();
    const {
        spot: selectedSpotId,
        persona: selectedPersonaId,
        sheet: feedSheetSnap,
        chat: chatDrawerOpen,
    } = urlState;

    const [center, setCenter] = useState({ lat: 37.2636, lng: 127.0286 });
    const [layerToggleOpen, setLayerToggleOpen] = useState(false);
    const [postTypeSheetOpen, setPostTypeSheetOpen] = useState(false);
    const [followingPersonaId, setFollowingPersonaId] = useState<string | null>(
        null,
    );

    const { positions } = usePersonaMovement(MOCK_PERSONAS, MOCK_WAYPOINTS);
    const {
        spots: eventSpots,
        personaTargets,
        spotStatuses,
    } = useEventPlayer(MOCK_EVENT_SEQUENCE);

    const { feedType, categories } = useFilterStore();
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

    const getPersonaCoord = useCallback(
        (personaId: string): GeoCoord => {
            return (
                personaTargets.get(personaId) ??
                positions.get(personaId) ??
                MOCK_PERSONAS.find((p) => p.id === personaId)!.initialCoord
            );
        },
        [personaTargets, positions],
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
        ? (personaTargets.get(followingPersonaId) ??
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

    const handleSpotSelect = useCallback(
        (spotId: string) => {
            updateUrl({ spot: spotId, sheet: 'peek' });
        },
        [updateUrl],
    );

    const handleToggleListView = useCallback(() => {
        updateUrl({ sheet: feedSheetSnap === 'peek' ? 'half' : 'peek' });
    }, [feedSheetSnap, updateUrl]);

    const handleFeedItemSelect = useCallback(
        (item: { id: string; location?: string }) => {
            const spot = [...MOCK_SPOTS, ...eventSpots].find((s) =>
                s.title.includes(item.location ?? ''),
            );
            if (spot) {
                setCenter(spot.coord);
                updateUrl({ spot: spot.id, sheet: 'peek' });
            } else {
                updateUrl({ sheet: 'peek' });
            }
        },
        [eventSpots, updateUrl],
    );

    const getSpotStatus = useCallback(
        (spot: SpotMapItem) => spotStatuses.get(spot.id) ?? spot.status,
        [spotStatuses],
    );

    const allSpots = useMemo(
        () => [...MOCK_SPOTS, ...eventSpots],
        [eventSpots],
    );

    const filteredSpots = useMemo(() => {
        return allSpots.filter((spot) => {
            if (feedType === 'offer' && spot.type !== 'OFFER') return false;
            if (feedType === 'request' && spot.type !== 'REQUEST') return false;
            if (categories.length > 0 && !categories.includes(spot.category))
                return false;
            return true;
        });
    }, [allSpots, feedType, categories]);

    const selectedSpot = useMemo(
        () => allSpots.find((s) => s.id === selectedSpotId) ?? null,
        [allSpots, selectedSpotId],
    );

    const showSpots = activeLayer === 'mixed' || activeLayer === 'real';
    const showPersonas = activeLayer === 'mixed' || activeLayer === 'virtual';

    const overlays: MapOverlayItem[] = useMemo(() => {
        const spotOverlays: MapOverlayItem[] = showSpots
            ? filteredSpots.map((spot) => ({
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
              }))
            : [];

        const personaOverlays: MapOverlayItem[] = showPersonas
            ? MOCK_PERSONAS.map((persona) => {
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
              })
            : [];

        return [...spotOverlays, ...personaOverlays];
    }, [
        filteredSpots,
        selectedSpotId,
        getSpotStatus,
        handleSpotSelect,
        getPersonaCoord,
        handlePersonaClick,
        showSpots,
        showPersonas,
        followingPersonaId,
    ]);

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
                open={!chatDrawerOpen}
                snapPoint={feedSheetSnap}
                onSnapChange={(snap) => updateUrl({ sheet: snap })}
                feedType={feedType}
                categories={categories}
                onSelectItem={handleFeedItemSelect}
            />

            <SpotPreviewSheet
                selectedSpot={selectedSpot}
                onClose={() => updateUrl({ spot: null })}
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
