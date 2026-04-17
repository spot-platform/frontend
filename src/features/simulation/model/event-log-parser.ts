import type { GeoCoord, SpotMapItem } from '@/entities/spot/types';
import type { TimedMapEvent, MapEvent } from './types';

type RawSimEvent = {
    agent_id: string;
    event_id: number;
    event_type: string;
    payload: Record<string, unknown>;
    region_id: string;
    spot_id: string | null;
    tick: number;
};

const REGION_COORDS: Record<string, GeoCoord> = {
    emd_yeonmu: { lat: 37.2636, lng: 127.0286 },
    emd_jangan: { lat: 37.301, lng: 127.01 },
    emd_sinchon: { lat: 37.286, lng: 127.015 },
};

const SKILL_CATEGORY: Record<string, string> = {
    볼더링: '볼더링',
    '요가 입문': '요가',
    '코딩 입문': '코딩',
    '수채화 기초': '미술',
    '가벼운 등산': '등산',
};

function jitter(coord: GeoCoord): GeoCoord {
    return {
        lat: coord.lat + (Math.random() - 0.5) * 0.008,
        lng: coord.lng + (Math.random() - 0.5) * 0.008,
    };
}

function parseEvent(raw: RawSimEvent, tickMs: number): TimedMapEvent | null {
    const baseCoord = REGION_COORDS[raw.region_id];
    if (!baseCoord) return null;

    const timestampMs = raw.tick * tickMs;

    switch (raw.event_type) {
        case 'CREATE_SKILL_REQUEST':
        case 'CREATE_TEACH_SPOT': {
            const skill = (raw.payload.skill as string) ?? '';
            const spotId =
                raw.spot_id ??
                (raw.payload.request_id as string) ??
                `gen-${raw.event_id}`;
            const spot: SpotMapItem = {
                id: spotId,
                type:
                    raw.event_type === 'CREATE_TEACH_SPOT'
                        ? 'OFFER'
                        : 'REQUEST',
                status: 'OPEN',
                title: skill,
                coord: jitter(baseCoord),
                category: SKILL_CATEGORY[skill] ?? skill,
            };
            const event: MapEvent = { type: 'SPOT_CREATED', spot };
            return { timestampMs, event };
        }

        case 'JOIN_TEACH_SPOT': {
            if (!raw.spot_id) return null;
            const event: MapEvent = {
                type: 'PERSONA_JOIN',
                personaId: raw.agent_id,
                spotId: raw.spot_id,
            };
            return { timestampMs, event };
        }

        case 'SPOT_MATCHED': {
            if (!raw.spot_id) return null;
            const event: MapEvent = {
                type: 'SPOT_MATCHED',
                spotId: raw.spot_id,
            };
            return { timestampMs, event };
        }

        case 'CHECK_IN':
        case 'SUPPORTER_RESPONDED': {
            const event: MapEvent = {
                type: 'PERSONA_MOVE',
                personaId: raw.agent_id,
                targetCoord: jitter(baseCoord),
            };
            return { timestampMs, event };
        }

        default:
            return null;
    }
}

export function parseEventLog(
    jsonlText: string,
    options?: { tickMs?: number; maxEvents?: number },
): TimedMapEvent[] {
    const { tickMs = 2500, maxEvents } = options ?? {};
    const lines = jsonlText.trim().split('\n');
    const events: TimedMapEvent[] = [];

    for (const line of lines) {
        if (maxEvents && events.length >= maxEvents) break;
        try {
            const raw: RawSimEvent = JSON.parse(line);
            const parsed = parseEvent(raw, tickMs);
            if (parsed) events.push(parsed);
        } catch {
            continue;
        }
    }

    return events.sort((a, b) => a.timestampMs - b.timestampMs);
}
