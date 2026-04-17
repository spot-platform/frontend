// TimelineFrame (BE) → 기존 MapEvent 변환. 읽기 전용, side effect 금지.

import type { GeoCoord, SpotMapItem } from '@/entities/spot/types';
import type {
    LiveEvent,
    TimelineFrame,
} from '@/entities/spot/simulation-types';
import type { MapEvent } from './types';

const SKILL_CATEGORY: Record<string, string> = {
    볼더링: '볼더링',
    '요가 입문': '요가',
    '코딩 입문': '코딩',
    '수채화 기초': '미술',
    '가벼운 등산': '등산',
    바리스타: '요리',
};

function pickLocation(
    frame: TimelineFrame,
    event: LiveEvent,
): GeoCoord | undefined {
    const spotId =
        typeof event.payload.spot_id === 'string'
            ? (event.payload.spot_id as string)
            : undefined;
    if (spotId) {
        const spot = frame.active_spots.find((s) => s.spot_id === spotId);
        if (spot) return spot.location;
    }
    const agentId =
        typeof event.payload.agent_id === 'string'
            ? (event.payload.agent_id as string)
            : undefined;
    if (agentId) {
        const agent = frame.active_agents.find((a) => a.agent_id === agentId);
        if (agent) return agent.location;
    }
    return undefined;
}

export function timelineFrameToMapEvents(frame: TimelineFrame): MapEvent[] {
    const events: MapEvent[] = [];

    for (const live of frame.events_this_tick) {
        switch (live.event_type) {
            case 'CREATE_TEACH_SPOT':
            case 'CREATE_SKILL_REQUEST': {
                const spotId =
                    (live.payload.spot_id as string | undefined) ??
                    `gen-${live.event_id}`;
                const coord = pickLocation(frame, live);
                if (!coord) {
                    console.warn(
                        `[timeline-frame-adapter] missing location for spot ${spotId}`,
                    );
                    break;
                }
                const skill = (live.payload.skill as string | undefined) ?? '';
                const spot: SpotMapItem = {
                    id: spotId,
                    type:
                        live.event_type === 'CREATE_TEACH_SPOT'
                            ? 'OFFER'
                            : 'REQUEST',
                    status: 'OPEN',
                    title: skill,
                    coord,
                    category: SKILL_CATEGORY[skill] ?? skill,
                };
                events.push({ type: 'SPOT_CREATED', spot });
                break;
            }

            case 'JOIN_TEACH_SPOT': {
                const agentId = live.payload.agent_id as string | undefined;
                const spotId = live.payload.spot_id as string | undefined;
                if (!agentId || !spotId) {
                    console.warn(
                        '[timeline-frame-adapter] JOIN_TEACH_SPOT missing agent_id/spot_id',
                    );
                    break;
                }
                events.push({
                    type: 'PERSONA_JOIN',
                    personaId: agentId,
                    spotId,
                });
                break;
            }

            case 'SPOT_MATCHED': {
                const spotId = live.payload.spot_id as string | undefined;
                if (!spotId) {
                    console.warn(
                        '[timeline-frame-adapter] SPOT_MATCHED missing spot_id',
                    );
                    break;
                }
                events.push({ type: 'SPOT_MATCHED', spotId });
                break;
            }

            case 'CHECK_IN':
            case 'SUPPORTER_RESPONDED': {
                const agentId = live.payload.agent_id as string | undefined;
                if (!agentId) {
                    console.warn(
                        `[timeline-frame-adapter] ${live.event_type} missing agent_id`,
                    );
                    break;
                }
                const coord = pickLocation(frame, live);
                if (!coord) {
                    console.warn(
                        `[timeline-frame-adapter] ${live.event_type} missing location for agent ${agentId}`,
                    );
                    break;
                }
                events.push({
                    type: 'PERSONA_MOVE',
                    personaId: agentId,
                    targetCoord: coord,
                });
                break;
            }

            default:
                console.warn(
                    `[timeline-frame-adapter] unsupported event_type: ${live.event_type}`,
                );
                break;
        }
    }

    return events;
}
