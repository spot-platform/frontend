import { describe, expect, it } from 'vitest';

import type {
    Movement,
    PlaceMap,
    SimAgent,
} from '@/entities/spot/sim-stream-types';

import {
    buildAgentTimelines,
    findNextMovement,
    resolveAgentPosition,
} from './sim-clock';

function movement(agentId: string): Movement {
    return {
        agent_id: agentId,
        depart_tick: 0,
        arrive_tick: 6,
        from_place_id: 'home',
        to_place_id: 'spot',
        reason: 'join_spot',
        spot_id: 'spot',
    };
}

describe('sim-clock visual pacing', () => {
    it('keeps raw movement ticks unless visual staggering is requested', () => {
        const timelines = buildAgentTimelines([
            movement('A_1'),
            movement('A_2'),
            movement('A_3'),
            movement('A_4'),
        ]);

        expect(timelines.get('A_1')?.[0].depart_tick).toBe(0);
        expect(timelines.get('A_1')?.[0].arrive_tick).toBe(6);
    });

    it('spreads crowded same-tick starts only in the rendered timeline', () => {
        const rawMovements = [
            movement('A_1'),
            movement('A_2'),
            movement('A_3'),
            movement('A_4'),
        ];
        const timelines = buildAgentTimelines(rawMovements, undefined, {
            staggerCrowdedStarts: true,
            minCrowdSize: 4,
            maxStaggerTicks: 4,
        });

        const renderedStarts = rawMovements.map(
            (m) => timelines.get(m.agent_id)?.[0].depart_tick ?? 0,
        );

        expect(rawMovements.every((m) => m.depart_tick === 0)).toBe(true);
        expect(renderedStarts.some((tick) => tick > 0)).toBe(true);
        expect(renderedStarts.every((tick) => tick >= 0 && tick <= 4)).toBe(
            true,
        );
    });

    it('can find the next future movement for quiet-gap skipping', () => {
        const timeline = [
            { ...movement('A_1'), depart_tick: 4, arrive_tick: 8 },
            { ...movement('A_1'), depart_tick: 20, arrive_tick: 24 },
        ];

        expect(findNextMovement(timeline, 8)?.depart_tick).toBe(20);
        expect(findNextMovement(timeline, 20)).toBeNull();
    });

    it('scatters region departures per agent without changing the arrival point', () => {
        const places: PlaceMap = new Map([
            [
                'home',
                {
                    place_id: 'home',
                    place_type: 'region',
                    lat: 37,
                    lng: 127,
                },
            ],
            [
                'spot',
                {
                    place_id: 'spot',
                    place_type: 'spot',
                    lat: 37.01,
                    lng: 127.01,
                },
            ],
        ]);
        const agent: SimAgent = {
            agent_id: 'A_1',
            agent_role: 'protagonist',
            archetype: 'explorer',
            name: 'A',
            emoji: '🙂',
            home_region_id: 'home',
            category: '운동',
            intent: 'offer',
        };
        const timelines = buildAgentTimelines([movement(agent.agent_id)]);

        const start = resolveAgentPosition(agent, timelines, 0, places, {
            spawnScatterM: 180,
        });
        const arrival = resolveAgentPosition(agent, timelines, 6, places, {
            spawnScatterM: 180,
        });

        expect(start).not.toEqual({ lat: 37, lng: 127 });
        expect(arrival).toEqual({ lat: 37.01, lng: 127.01 });
    });
});
