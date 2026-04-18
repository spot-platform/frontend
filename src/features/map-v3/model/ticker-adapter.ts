// TimelineFrame 에서 자연어 티커 이벤트를 파생한다. S3 결정에 따라 persona_moving 만 활성화.

import type { GeoCoord } from '@/entities/spot/types';
import type { TimelineFrame } from '@/entities/spot/simulation-types';

export type TickerEvent = {
    id: string;
    personaEmoji: string;
    personaName: string;
    predicate: string;
    timestamp: number;
};

export type TickerAdapterContext = {
    personaLookup?: Map<string, { emoji: string; name: string }>;
};

export type TickerAdapter = {
    push: (frame: TimelineFrame) => TickerEvent | null;
};

const MOVE_DELTA_DEG = 0.0002;

function distanceDeg(a: GeoCoord, b: GeoCoord): number {
    const dLat = a.lat - b.lat;
    const dLng = a.lng - b.lng;
    return Math.hypot(dLat, dLng);
}

function nearestCategory(
    origin: GeoCoord,
    frame: TimelineFrame,
): string | null {
    // SpotMarker 에 category 필드가 없으므로 최근접 active_spot 의 spot_id 를
    // category 힌트로 쓸 수 없다. 카테고리 unknown 인 경우 null 반환.
    if (frame.active_spots.length === 0) return null;
    let nearest: { dist: number; spotId: string } | null = null;
    for (const spot of frame.active_spots) {
        const dist = distanceDeg(origin, spot.location);
        if (!nearest || dist < nearest.dist) {
            nearest = { dist, spotId: spot.spot_id };
        }
    }
    return nearest ? nearest.spotId : null;
}

export function createTickerAdapter(
    context: TickerAdapterContext = {},
): TickerAdapter {
    const personaLookup = context.personaLookup ?? new Map();
    let lastAgents: Map<string, GeoCoord> | null = null;

    const push = (frame: TimelineFrame): TickerEvent | null => {
        const currentAgents = new Map<string, GeoCoord>();
        for (const agent of frame.active_agents) {
            currentAgents.set(agent.agent_id, agent.location);
        }

        if (!lastAgents) {
            lastAgents = currentAgents;
            return null;
        }

        // persona_moving 파생: 좌표 델타가 임계값 초과인 agent 중 첫 번째.
        let movingAgentId: string | null = null;
        let movingTo: GeoCoord | null = null;
        for (const [agentId, coord] of currentAgents) {
            const prev = lastAgents.get(agentId);
            if (!prev) continue;
            if (distanceDeg(prev, coord) > MOVE_DELTA_DEG) {
                movingAgentId = agentId;
                movingTo = coord;
                break;
            }
        }

        lastAgents = currentAgents;

        if (!movingAgentId || !movingTo) return null;

        const persona = personaLookup.get(movingAgentId);
        const name = persona?.name ?? movingAgentId;
        const emoji = persona?.emoji ?? '📍';

        const nearestSpotId = nearestCategory(movingTo, frame);
        const predicate = nearestSpotId ? '모임으로 이동 중' : '이동 중';

        return {
            id: `${frame.tick}-${movingAgentId}`,
            personaEmoji: emoji,
            personaName: name,
            predicate,
            timestamp: Date.now(),
        };
    };

    return { push };
}
