import type { GeoCoord } from '@/entities/spot/types';
import type {
    ActivityCluster,
    ClusterInput,
    ClusterOptions,
    PersonaRef,
} from './types';

const DEFAULT_RADIUS_METERS = 80;
const EARTH_RADIUS_METERS = 6371000;

function toRadians(deg: number): number {
    return (deg * Math.PI) / 180;
}

function haversineMeters(a: GeoCoord, b: GeoCoord): number {
    const dLat = toRadians(b.lat - a.lat);
    const dLng = toRadians(b.lng - a.lng);
    const lat1 = toRadians(a.lat);
    const lat2 = toRadians(b.lat);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

function averageCoord(coords: GeoCoord[]): GeoCoord {
    const n = coords.length;
    let latSum = 0;
    let lngSum = 0;
    for (const c of coords) {
        latSum += c.lat;
        lngSum += c.lng;
    }
    return { lat: latSum / n, lng: lngSum / n };
}

function groupKey(input: Pick<ClusterInput, 'category' | 'intent'>): string {
    return `${input.category}::${input.intent}`;
}

export function clusterPersonas(
    input: ClusterInput[],
    options?: ClusterOptions,
): ActivityCluster[] {
    const radiusMeters = options?.radiusMeters ?? DEFAULT_RADIUS_METERS;
    if (input.length === 0) return [];

    const groups = new Map<string, ClusterInput[]>();
    for (const item of input) {
        const key = groupKey(item);
        const list = groups.get(key);
        if (list) {
            list.push(item);
        } else {
            groups.set(key, [item]);
        }
    }

    const result: ActivityCluster[] = [];

    for (const [, members] of groups) {
        const assigned = new Set<string>();

        for (let i = 0; i < members.length; i += 1) {
            const seed = members[i];
            if (assigned.has(seed.id)) continue;

            const bucket: ClusterInput[] = [seed];
            assigned.add(seed.id);

            // Transitive expansion: if any newly added member pulls in more
            // members within radius, keep expanding until stable.
            for (let cursor = 0; cursor < bucket.length; cursor += 1) {
                const current = bucket[cursor];
                for (let j = 0; j < members.length; j += 1) {
                    const candidate = members[j];
                    if (assigned.has(candidate.id)) continue;
                    const distance = haversineMeters(
                        current.coord,
                        candidate.coord,
                    );
                    if (distance <= radiusMeters) {
                        bucket.push(candidate);
                        assigned.add(candidate.id);
                    }
                }
            }

            if (bucket.length < 2) continue;

            const centerCoord = averageCoord(bucket.map((m) => m.coord));
            const personas: PersonaRef[] = bucket.map((m) => ({
                id: m.id,
                emoji: m.emoji,
                name: m.name,
            }));

            // 100m grid quantization: 센트로이드가 소폭 이동해도 id 유지 → 깜빡임 방지.
            const id = `${seed.category}-${seed.intent}-${centerCoord.lat.toFixed(3)}-${centerCoord.lng.toFixed(3)}`;

            result.push({
                id,
                centerCoord,
                category: seed.category,
                intent: seed.intent,
                personas,
            });
        }
    }

    return result;
}
