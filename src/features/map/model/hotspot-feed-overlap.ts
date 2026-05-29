import type { FeedMarkerGroup } from '@/features/feed/model/feed-marker-group';
import { getDistanceMeters } from '@/features/feed/model/feed-marker-group';
import type { ActivityCluster } from '@/features/map/model/types';

const DEFAULT_HOTSPOT_FEED_OVERLAP_THRESHOLD_METERS = 18;

function isHotspotCluster(cluster: ActivityCluster) {
    return !cluster.variant || cluster.variant === 'discovery';
}

export function filterHotspotsOverlappingFeedMarkers(
    clusters: ActivityCluster[],
    feedMarkerGroups: FeedMarkerGroup[],
    options: { thresholdMeters?: number } = {},
): ActivityCluster[] {
    if (clusters.length === 0 || feedMarkerGroups.length === 0) return clusters;

    const thresholdMeters =
        options.thresholdMeters ??
        DEFAULT_HOTSPOT_FEED_OVERLAP_THRESHOLD_METERS;

    return clusters.filter((cluster) => {
        if (!isHotspotCluster(cluster)) return true;

        return !feedMarkerGroups.some(
            (group) =>
                getDistanceMeters(cluster.centerCoord, group.coord) <=
                thresholdMeters,
        );
    });
}
