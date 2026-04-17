// contextBuilder simulation 응답 타입 계약. BE 계약이므로 이름/union 값 변경 금지.

import type { GeoCoord } from './types';
import type { PersonaArchetype } from '@/entities/persona/types';

export type SpotCard = {
    spot_id: string;
    provenance: 'virtual' | 'real' | 'mixed';
    title: string;
    skill_topic: string;
    teach_mode: '1:1' | 'small_group' | 'workshop';
    venue_type: string;
    fee_per_partner: number;
    location: GeoCoord;
    host_preview: string;
    person_fitness_score: number;
    attractiveness_score: number;
};

export type AttractivenessSignal =
    | 'title_hookiness'
    | 'price_reasonableness'
    | 'venue_accessibility'
    | 'host_reputation_fit'
    | 'time_slot_demand'
    | 'skill_rarity_bonus'
    | 'narrative_authenticity'
    | 'bonded_repeat_potential';

export type AttractivenessReport = {
    composite_score: number;
    signals: Record<AttractivenessSignal, number>;
    improvement_hints: string[];
    price_benchmark: {
        p25: number;
        p50: number;
        p75: number;
        p90: number;
        verdict: string;
    };
};

export type AgentMarker = {
    agent_id: string;
    location: GeoCoord;
    archetype?: PersonaArchetype;
};

export type SpotMarker = {
    spot_id: string;
    location: GeoCoord;
    provenance: 'virtual' | 'real' | 'mixed';
    status: 'OPEN' | 'MATCHED' | 'CLOSED';
};

export type LiveEvent = {
    event_id: string;
    event_type: string;
    payload: Record<string, unknown>;
};

export type TimelineFrame = {
    tick: number;
    day_of_week: string;
    time_slot: string;
    active_agents: AgentMarker[];
    active_spots: SpotMarker[];
    events_this_tick: LiveEvent[];
};

export type HighlightClip = {
    clip_id: string;
    title: string;
    category:
        | 'first_success'
        | 'bond_upgrade'
        | 'counter_offer'
        | 'referral'
        | 'unexpected_match';
    start_tick: number;
    end_tick: number;
    involved_agents: string[];
    narrative: string;
};

export type ConversionHints = {
    source_virtual_spot_id: string;
    placeholder: {
        title: string;
        intro: string;
        skill_topic: string;
    };
    pricing_suggestion: {
        fee_breakdown: unknown;
        rationale: string;
    };
    plan_help: {
        warmup_block: string;
        main_block: string;
        closing_block: string;
        host_tips: string[];
    };
    expected_demand: {
        forecast_join_count_p50: number;
        forecast_join_count_p90: number;
    };
};
