import type { GeoCoord } from '@/entities/spot/types';
import type { FeedItem } from '@/features/feed/model/types';
import { resolveFeedCoordinate } from '@/features/feed/model/feed-location';

export type FeedMarkerGroup = {
    id: string;
    coord: GeoCoord;
    items: FeedItem[];
};

const DEFAULT_NEARBY_THRESHOLD_METERS = 18;
const EARTH_RADIUS_METERS = 6_371_000;

function toRad(value: number) {
    return (value * Math.PI) / 180;
}

export function getDistanceMeters(a: GeoCoord, b: GeoCoord) {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

function getAverageCoord(coords: GeoCoord[]): GeoCoord {
    const total = coords.reduce(
        (acc, coord) => ({
            lat: acc.lat + coord.lat,
            lng: acc.lng + coord.lng,
        }),
        { lat: 0, lng: 0 },
    );

    return {
        lat: total.lat / coords.length,
        lng: total.lng / coords.length,
    };
}

function createGroupId(items: FeedItem[]) {
    return `feed-group-${items
        .map((item) => item.id)
        .sort()
        .join('-')}`;
}

export function groupFeedMarkersByProximity(
    items: FeedItem[],
    options: {
        thresholdMeters?: number;
        resolveCoord?: (item: FeedItem) => GeoCoord | null;
    } = {},
): FeedMarkerGroup[] {
    const thresholdMeters =
        options.thresholdMeters ?? DEFAULT_NEARBY_THRESHOLD_METERS;
    const resolveCoord = options.resolveCoord ?? resolveFeedCoordinate;
    const groups: Array<{
        coords: GeoCoord[];
        items: FeedItem[];
        representative: GeoCoord;
    }> = [];

    for (const item of items) {
        const coord = resolveCoord(item);
        if (!coord) continue;

        const group = groups.find(
            ({ representative }) =>
                getDistanceMeters(representative, coord) <= thresholdMeters,
        );

        if (group) {
            group.coords.push(coord);
            group.items.push(item);
            group.representative = getAverageCoord(group.coords);
            continue;
        }

        groups.push({ coords: [coord], items: [item], representative: coord });
    }

    return groups.map((group) => ({
        id:
            group.items.length === 1
                ? `feed-${group.items[0].id}`
                : createGroupId(group.items),
        coord: getAverageCoord(group.coords),
        items: group.items,
    }));
}
