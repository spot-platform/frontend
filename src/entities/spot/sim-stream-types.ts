// Sim run 재생용 데이터 계약. 서버(synthetic-content-pipeline ETL)와 mock-sim-api 가
// 동일하게 따른다. 필드명은 백엔드 snake_case 를 그대로 유지(다른 simulation-types 와 동일 정책).
//
// 데이터 흐름:
//   simulator event_log.jsonl
//     → ETL (publish 된 spot 한정 + JOIN/CHECK_IN 페어링으로 이동시간 추출)
//     → Movement[] / LifecycleEvent[] / SimAgent[] / PlaceGeometry[]
//
// 시뮬 모드("A") 한정. 지역 특성 모드("B") 는 별도 타입.

import type { GeoCoord } from './types';
import type { PersonaArchetype } from '@/entities/persona/types';

// ─── Place ───────────────────────────────────────────────────────────────────

export type PlaceType = 'region' | 'spot';

export type PlaceGeometry = {
    place_id: string;
    place_type: PlaceType;
    lat: number;
    lng: number;
    /** spot 일 때 소속 region. region 자기 자신엔 없음. */
    region_id?: string;
    /** UI 라벨. region 은 "영통동" 같은 한글, spot 은 title 단축형. */
    label?: string;
};

// ─── Agent ───────────────────────────────────────────────────────────────────

/**
 * Sim run 등장 agent. 두 그룹으로 나뉜다.
 * - protagonist: approved spot 에 직접 관여(host/joiner). movement timeline 보유.
 * - background: 같은 region 거주, 화면 채움용. movement 없음, home 좌표 주변에서 wander.
 *
 * `agent_role` 로 구분.
 */
export type SimAgentRole = 'protagonist' | 'background';

export type SimAgent = {
    agent_id: string;
    agent_role: SimAgentRole;
    archetype: PersonaArchetype;
    name: string;
    emoji: string;
    /** 기본 거주 region id. background 는 항상 이 주변에서 wander. */
    home_region_id: string;
};

// ─── Manifest (1회 로드) ─────────────────────────────────────────────────────

export type SimRunFilterKind = 'published_only';

export type SimManifest = {
    run_id: string;
    /** 어느 publish dataset 기준인지(예: 'v3_mvp'). */
    dataset_version: string;
    /** 이 run 의 시각화 대상 spot 수(=protagonist 의 movement 가 향하는 spot). */
    approved_spot_count: number;
    /** 향후 'all' 옵션 대비. 현재는 항상 'published_only'. */
    filter_kind: SimRunFilterKind;
    /** 전체 tick 수(예: 48). 재생 길이 표시용. */
    total_ticks: number;
    /** 클라이언트 디폴트 1 tick 길이. 사용자가 prop 으로 오버라이드 가능. */
    tick_duration_ms_default: number;
    /** prefetch 청크 크기(tick). */
    chunk_size_ticks: number;
    agents: SimAgent[];
    places: PlaceGeometry[];
};

// ─── Movement (청크 단위) ────────────────────────────────────────────────────

export type MovementReason =
    | 'create_spot'
    | 'join_spot'
    | 'go_home'
    | 'wander';

export type Movement = {
    agent_id: string;
    /** 출발 tick. */
    depart_tick: number;
    /** 도착 tick. depart < arrive 보장. */
    arrive_tick: number;
    from_place_id: string;
    to_place_id: string;
    reason: MovementReason;
    /** create_spot / join_spot 일 때만. */
    spot_id?: string;
};

export type MovementChunk = {
    run_id: string;
    /** [from_tick, to_tick) 윈도우. 청크 경계를 넘는 movement 도 포함될 수 있음
     *  (depart < to_tick 이면 청크에 포함). */
    from_tick: number;
    to_tick: number;
    /** depart_tick ASC 정렬 보장. */
    movements: Movement[];
};

// ─── Lifecycle (청크 단위) ───────────────────────────────────────────────────

export type LifecycleEventType =
    | 'SPOT_CREATED'
    | 'SPOT_MATCHED'
    | 'SPOT_CONFIRMED'
    | 'SPOT_STARTED'
    | 'SPOT_COMPLETED'
    | 'NO_SHOW';

export type LifecycleEvent = {
    tick: number;
    event_type: LifecycleEventType;
    spot_id: string;
    /** NO_SHOW 등 agent 가 특정될 때만. */
    agent_id?: string;
};

export type LifecycleChunk = {
    run_id: string;
    from_tick: number;
    to_tick: number;
    /** tick ASC 정렬 보장. */
    events: LifecycleEvent[];
};

// ─── 클라이언트 파생 타입 (서버 응답 아님) ───────────────────────────────────

/** agent_id → 그 agent 의 movement 시간순 배열. activeMovement 이진 탐색에 사용. */
export type AgentTimelineMap = Map<string, Movement[]>;

/** place_id → geometry. positionAt 보간에 사용. */
export type PlaceMap = Map<string, PlaceGeometry>;

export type { GeoCoord };
