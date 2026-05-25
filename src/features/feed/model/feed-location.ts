import type { GeoCoord } from '@/entities/spot/types';
import type { FeedItem } from './types';

type CoordinateLike = {
    lat?: unknown;
    lng?: unknown;
};

type FeedCoordinateSource = Pick<FeedItem, 'coord' | 'primaryPin'> &
    CoordinateLike & {
        coordinate?: CoordinateLike | null;
    };

function toFiniteCoord(lat: unknown, lng: unknown): GeoCoord | null {
    const numericLat = typeof lat === 'number' ? lat : Number(lat);
    const numericLng = typeof lng === 'number' ? lng : Number(lng);

    if (
        !Number.isFinite(numericLat) ||
        !Number.isFinite(numericLng) ||
        numericLat < -90 ||
        numericLat > 90 ||
        numericLng < -180 ||
        numericLng > 180
    ) {
        return null;
    }

    return { lat: numericLat, lng: numericLng };
}

export function resolveFeedCoordinate(
    item: FeedCoordinateSource,
): GeoCoord | null {
    const coord = item.coord ?? item.coordinate ?? null;
    if (coord) {
        const resolved = toFiniteCoord(coord.lat, coord.lng);
        if (resolved) return resolved;
    }

    const topLevel = toFiniteCoord(item.lat, item.lng);
    if (topLevel) return topLevel;

    if (item.primaryPin) {
        const primaryPin = toFiniteCoord(
            item.primaryPin.lat,
            item.primaryPin.lng,
        );
        if (primaryPin) return primaryPin;
    }

    return null;
}
