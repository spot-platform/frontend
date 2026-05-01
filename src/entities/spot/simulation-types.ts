// contextBuilder simulation 응답 타입 계약. BE 계약이므로 이름/union 값 변경 금지.
//
// 2026-04-27 contextBuilder 출력 디테일 강화 반영:
//   - POI anchored: ResolvedPlace, primary_pin, venue_anchors
//   - Plan v3: PlanStep[]/PlanV3 (place_id 참조)
//   - Price v1: PriceBreakdown (base_fee + included + addons + refund + summary_line)
//   - Preparation v1: host_provides/partner_brings/weather/safety/host_tip
//
// SpotCard 자체는 카드 표시용이므로 신규 풍부 필드는 SimulationSpotDetail 로 분리.
// 카드에는 기존 필드 + 지도 핀 정밀화에 필요한 primary_pin/venue_anchors/poi_fallback_reason
// 만 optional 로 추가한다 (FE 가 단계적으로 채택 가능).

import type { GeoCoord } from './types';
import type { PersonaArchetype } from '@/entities/persona/types';

// ── Public enums (BACKEND_HANDOFF_ENTITIES.md §Simulation) ──────────────────

export type SpotProvenance = 'virtual' | 'real' | 'mixed';

export type SpotTeachMode = '1:1' | 'small_group' | 'workshop';

/** 2026-04-24 확정. SpotCard.venue_type 전용 5종. */
export type SpotVenueType = 'cafe' | 'home' | 'studio' | 'park' | 'gym';

/** 2026-04-24 확정. AttractivenessReport.price_benchmark.verdict 전용. */
export type AttractivenessVerdict =
    | 'too_cheap'
    | 'competitive'
    | 'slightly_high'
    | 'too_high';

export type SpotStatusLite = 'OPEN' | 'MATCHED' | 'CLOSED';

export type SpotIntent = 'offer' | 'request';

export type LiveEventType =
    | 'CREATE_TEACH_SPOT'
    | 'JOIN_TEACH_SPOT'
    | 'LEAVE_TEACH_SPOT'
    | 'MATCH_TEACH_SPOT'
    | 'COUNTER_OFFER'
    | 'BOND_UPGRADE'
    | 'CLOSE_TEACH_SPOT';

// ── POI anchored entities (2026-04-27 contextBuilder) ─────────────────────

/** spot 동선에서 한 POI 가 맡는 역할. */
export type PlaceRole = 'meetup' | 'main' | 'secondary' | 'wrapup';

/**
 * 실제 POI (place_normalized) 의 카드/디테일 표현.
 * contextBuilder routing 이 결정 → LLM 은 name/address 를 그대로 인용.
 */
export type ResolvedPlace = {
    place_id: number;
    name: string;
    primary_category: string;
    role: PlaceRole;
    lat: number;
    lng: number;
    address: string;
    road_address?: string;
    confidence: number; // 0~1
};

/** POI fallback 사유. region_pool 비어 jitter fallback 으로 갔을 때 사용. */
export type PoiFallbackReason = 'region_empty' | 'no_match' | 'skill_unmapped';

// ── Plan v3 ────────────────────────────────────────────────────────────────

/**
 * 디테일 페이지의 step. time/place/activity/intent 4 축 분해.
 * `place_id` 는 venue_anchors 의 ResolvedPlace.place_id 참조 (없으면 null).
 */
export type PlanStep = {
    /** "HH:MM" 24h 또는 "+10분" 등 상대표기. */
    time: string;
    activity: string;
    place_id: number | null;
    /** 왜 이 시간/이 장소를 골랐는지 1줄. */
    intent: string | null;
};

export type PlanV3 = {
    steps: PlanStep[];
    total_duration_minutes: number;
};

// ── Price v1 ───────────────────────────────────────────────────────────────

/** addon 결제 메커니즘. */
export type AddOnMechanism = 'fixed' | 'funding' | 'realcost';

export type IncludedItem = {
    name: string;
    /** 자연어 OK ("재료비 5000원 포함"). */
    value: string;
};

export type AddOn = {
    name: string;
    price: number;
    mechanism: AddOnMechanism;
    explanation: string | null;
};

export type RefundPolicy = {
    cutoff_hours: number;
    full_refund_until: string | null;
    note: string | null;
};

export type PriceBreakdown = {
    base_fee: number;
    included_items: IncludedItem[];
    optional_addons: AddOn[];
    refund_policy: RefundPolicy | null;
    summary_line: string | null;
};

// ── Preparation v1 ─────────────────────────────────────────────────────────

export type Preparation = {
    host_provides: string[];
    partner_brings: string[];
    weather_contingency: string | null;
    safety_notes: string[];
    host_tip: string | null;
};

// ── FeeBreakdown (2026-04-24, ConversionHints.pricing_suggestion) ─────────

/**
 * 또래 강사 2층 fee 구조.
 * total = peer_labor_fee + material_cost + venue_rental + equipment_rental
 * passthrough_total = material_cost + venue_rental + equipment_rental
 */
export type FeeBreakdown = {
    peer_labor_fee: number;
    material_cost: number;
    venue_rental: number;
    equipment_rental: number;
    total: number;
    passthrough_total: number;
};

// ── SpotCard ──────────────────────────────────────────────────────────────

export type SpotCard = {
    spot_id: string;
    provenance: SpotProvenance;
    title: string;
    skill_topic: string;
    teach_mode: SpotTeachMode;
    venue_type: SpotVenueType;
    fee_per_partner: number;
    location: GeoCoord;
    host_preview: string;
    person_fitness_score: number;
    attractiveness_score: number;
    /**
     * 카드 핀의 정밀 좌표/메타. 2026-04-27 추가.
     * 지정되지 않으면 location 만 사용. role='main' 인 anchor 와 같다.
     */
    primary_pin?: ResolvedPlace;
    /** 이 spot 이 사용하는 실제 POI 3~5 개 (role 별). */
    venue_anchors?: ResolvedPlace[];
    /** POI 매칭 실패 시 fallback 사유. 정상이면 undefined. */
    poi_fallback_reason?: PoiFallbackReason;
    /** 가격 한 줄 요약 (price.summary_line). */
    summary_line?: string;
};

/**
 * 카드보다 한 단계 깊은 디테일. detail/plan/price/preparation 5종을 합쳐 노출.
 * 2026-04-27 contextBuilder 출력 디테일 강화 반영.
 */
export type SimulationSpotDetail = {
    spot_id: string;
    provenance: SpotProvenance;
    title: string;
    description: string;
    skill_topic: string;
    teach_mode: SpotTeachMode;
    venue_type: SpotVenueType;
    /** 카드와 동일 — 디테일에서도 표시. */
    location: GeoCoord;
    primary_pin?: ResolvedPlace;
    venue_anchors: ResolvedPlace[];
    /** Plan v3 (시간/장소/활동/의도). */
    plan: PlanV3;
    /** 가격 분해. */
    price_breakdown: PriceBreakdown;
    /** 준비물/안전. */
    preparation: Preparation;
    /** detail.materials_json — 단순 문자열 리스트. */
    materials?: string[];
    /** detail.target_audience 등 부가 정보. */
    target_audience?: string;
    activity_purpose?: string;
    progress_style?: string;
    host_intro?: string;
    policy_notes?: string;
    poi_fallback_reason?: PoiFallbackReason;
};

// ── Attractiveness ─────────────────────────────────────────────────────────

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
        verdict: AttractivenessVerdict;
    };
};

// ── Map markers ────────────────────────────────────────────────────────────

export type AgentMarker = {
    agent_id: string;
    location: GeoCoord;
    archetype?: PersonaArchetype;
};

export type SpotMarker = {
    spot_id: string;
    location: GeoCoord;
    provenance: SpotProvenance;
    status: SpotStatusLite;
};

// ── Live events / timeline ─────────────────────────────────────────────────

export type LiveEvent = {
    event_id: string;
    event_type: LiveEventType;
    payload: Record<string, unknown>;
};

export type TimelineFrame = {
    tick: number;
    day_of_week: string;
    /** "HH:MM" 24h, KST 고정 (2026-04-24 확정). */
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

// ── Conversion hints ───────────────────────────────────────────────────────

export type ConversionSessionContext = {
    similar_active_count: number;
    avg_participants: number;
    typical_lifespan_minutes: number;
    sample_size: number;
    /** 모수 부족 시 fallback 레벨: run → region → global. */
    scope: 'run' | 'region' | 'global';
};

export type ConversionHints = {
    source_virtual_spot_id: string;
    placeholder: {
        title: string;
        intro: string;
        skill_topic: string;
    };
    pricing_suggestion: {
        fee_breakdown: FeeBreakdown;
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
    /** 2026-04-24 추가 — FE 직접 집계 대체. */
    session_context: ConversionSessionContext;
};
