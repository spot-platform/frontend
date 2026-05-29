import { describe, expect, it } from 'vitest';
import type { FeedMarkerGroup } from '@/features/feed/model/feed-marker-group';
import { filterHotspotsOverlappingFeedMarkers } from '@/features/map/model/hotspot-feed-overlap';
import type { ActivityCluster } from '@/features/map/model/types';

function createCluster(
    id: string,
    lat: number,
    lng: number,
    variant?: ActivityCluster['variant'],
): ActivityCluster {
    return {
        id,
        centerCoord: { lat, lng },
        category: '테니스',
        intent: 'offer',
        personas: [{ id: `${id}-persona`, name: id, emoji: '✨' }],
        variant,
    };
}

function createFeedGroup(
    id: string,
    lat: number,
    lng: number,
): FeedMarkerGroup {
    return {
        id,
        coord: { lat, lng },
        items: [],
    };
}

describe('filterHotspotsOverlappingFeedMarkers', () => {
    it('removes discovery hotspot clusters that overlap feed marker groups', () => {
        const clusters = [
            createCluster('hotspot', 37.2636, 127.0286, 'discovery'),
            createCluster('far-hotspot', 37.2645, 127.0295, 'discovery'),
        ];

        const result = filterHotspotsOverlappingFeedMarkers(clusters, [
            createFeedGroup('feed-a', 37.2636, 127.0286),
        ]);

        expect(result.map((cluster) => cluster.id)).toEqual(['far-hotspot']);
    });

    it('keeps non-hotspot clusters even when they overlap feed marker groups', () => {
        const clusters = [
            createCluster('mine', 37.2636, 127.0286, 'mine'),
            createCluster('ai-feed', 37.2636, 127.0286, 'ai-feed'),
        ];

        const result = filterHotspotsOverlappingFeedMarkers(clusters, [
            createFeedGroup('feed-a', 37.2636, 127.0286),
        ]);

        expect(result.map((cluster) => cluster.id)).toEqual([
            'mine',
            'ai-feed',
        ]);
    });

    it('treats clusters without a variant as legacy discovery hotspots', () => {
        const result = filterHotspotsOverlappingFeedMarkers(
            [createCluster('legacy-hotspot', 37.2636, 127.0286)],
            [createFeedGroup('feed-a', 37.2636, 127.0286)],
        );

        expect(result).toEqual([]);
    });
});
