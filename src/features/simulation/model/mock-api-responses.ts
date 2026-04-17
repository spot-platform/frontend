// contextBuilder 응답 shape을 유지한 목업 데이터. 축약/변형 금지.

import type {
    AttractivenessReport,
    ConversionHints,
    HighlightClip,
    SpotCard,
    TimelineFrame,
} from '@/entities/spot/simulation-types';

export const MOCK_SPOT_CARDS: SpotCard[] = [
    {
        spot_id: 'spot-v-001',
        provenance: 'virtual',
        title: '연무동 저녁 라떼아트 실습',
        skill_topic: '바리스타',
        teach_mode: 'small_group',
        venue_type: 'cafe',
        fee_per_partner: 18000,
        location: { lat: 37.2636, lng: 127.0286 },
        host_preview: '5년차 바리스타 민지의 핸드드립+라떼아트 2시간 클래스',
        person_fitness_score: 0.82,
        attractiveness_score: 0.74,
    },
    {
        spot_id: 'spot-r-002',
        provenance: 'real',
        title: '장안문 근처 주말 요가 입문',
        skill_topic: '요가',
        teach_mode: '1:1',
        venue_type: 'studio',
        fee_per_partner: 35000,
        location: { lat: 37.301, lng: 127.01 },
        host_preview: '요가 지도자 과정 수료 지훈, 초보자 자세 교정 중심',
        person_fitness_score: 0.61,
        attractiveness_score: 0.88,
    },
    {
        spot_id: 'spot-m-003',
        provenance: 'mixed',
        title: '신촌 수채화 원데이 워크숍',
        skill_topic: '수채화',
        teach_mode: 'workshop',
        venue_type: 'atelier',
        fee_per_partner: 42000,
        location: { lat: 37.286, lng: 127.015 },
        host_preview: '서연 작가의 수채화 기초 3시간, 재료비 포함',
        person_fitness_score: 0.55,
        attractiveness_score: 0.69,
    },
    {
        spot_id: 'spot-v-004',
        provenance: 'virtual',
        title: '연무동 코딩 입문 스터디',
        skill_topic: '코딩',
        teach_mode: 'small_group',
        venue_type: 'studyroom',
        fee_per_partner: 15000,
        location: { lat: 37.268, lng: 127.025 },
        host_preview: '현우가 주도하는 Python 입문 4회차 스터디',
        person_fitness_score: 0.77,
        attractiveness_score: 0.58,
    },
    {
        spot_id: 'spot-r-005',
        provenance: 'real',
        title: '수원천 새벽 볼더링 크루',
        skill_topic: '볼더링',
        teach_mode: 'small_group',
        venue_type: 'gym',
        fee_per_partner: 22000,
        location: { lat: 37.278, lng: 127.04 },
        host_preview: '수빈이 안내하는 V2~V4 루트 중심 새벽 크루 훈련',
        person_fitness_score: 0.48,
        attractiveness_score: 0.81,
    },
];

export const MOCK_TIMELINE_FRAMES: TimelineFrame[] = [
    {
        tick: 0,
        day_of_week: 'SAT',
        time_slot: '09:00',
        active_agents: [
            {
                agent_id: 'A_80381',
                location: { lat: 37.268, lng: 127.025 },
                archetype: 'explorer',
            },
            {
                agent_id: 'A_11504',
                location: { lat: 37.295, lng: 127.01 },
                archetype: 'helper',
            },
        ],
        active_spots: [
            {
                spot_id: 'spot-v-001',
                location: { lat: 37.2636, lng: 127.0286 },
                provenance: 'virtual',
                status: 'OPEN',
            },
        ],
        events_this_tick: [
            {
                event_id: 'evt-0-1',
                event_type: 'CREATE_TEACH_SPOT',
                payload: {
                    agent_id: 'A_11504',
                    spot_id: 'spot-v-001',
                    skill: '바리스타',
                },
            },
        ],
    },
    {
        tick: 1,
        day_of_week: 'SAT',
        time_slot: '09:30',
        active_agents: [
            {
                agent_id: 'A_80381',
                location: { lat: 37.2665, lng: 127.0265 },
                archetype: 'explorer',
            },
            {
                agent_id: 'A_11504',
                location: { lat: 37.2636, lng: 127.0286 },
                archetype: 'helper',
            },
            {
                agent_id: 'A_83000',
                location: { lat: 37.278, lng: 127.04 },
                archetype: 'creator',
            },
        ],
        active_spots: [
            {
                spot_id: 'spot-v-001',
                location: { lat: 37.2636, lng: 127.0286 },
                provenance: 'virtual',
                status: 'OPEN',
            },
        ],
        events_this_tick: [
            {
                event_id: 'evt-1-1',
                event_type: 'SUPPORTER_RESPONDED',
                payload: {
                    agent_id: 'A_80381',
                    spot_id: 'spot-v-001',
                },
            },
        ],
    },
    {
        tick: 2,
        day_of_week: 'SAT',
        time_slot: '10:00',
        active_agents: [
            {
                agent_id: 'A_80381',
                location: { lat: 37.2636, lng: 127.0286 },
                archetype: 'explorer',
            },
            {
                agent_id: 'A_83000',
                location: { lat: 37.282, lng: 127.037 },
                archetype: 'creator',
            },
        ],
        active_spots: [
            {
                spot_id: 'spot-v-001',
                location: { lat: 37.2636, lng: 127.0286 },
                provenance: 'virtual',
                status: 'OPEN',
            },
            {
                spot_id: 'spot-m-003',
                location: { lat: 37.286, lng: 127.015 },
                provenance: 'mixed',
                status: 'OPEN',
            },
        ],
        events_this_tick: [
            {
                event_id: 'evt-2-1',
                event_type: 'JOIN_TEACH_SPOT',
                payload: {
                    agent_id: 'A_80381',
                    spot_id: 'spot-v-001',
                },
            },
            {
                event_id: 'evt-2-2',
                event_type: 'CREATE_SKILL_REQUEST',
                payload: {
                    agent_id: 'A_83000',
                    spot_id: 'spot-m-003',
                    skill: '수채화 기초',
                },
            },
        ],
    },
    {
        tick: 3,
        day_of_week: 'SAT',
        time_slot: '10:30',
        active_agents: [
            {
                agent_id: 'A_97841',
                location: { lat: 37.305, lng: 127.02 },
                archetype: 'connector',
            },
            {
                agent_id: 'A_44522',
                location: { lat: 37.26, lng: 127.035 },
                archetype: 'learner',
            },
        ],
        active_spots: [
            {
                spot_id: 'spot-v-001',
                location: { lat: 37.2636, lng: 127.0286 },
                provenance: 'virtual',
                status: 'MATCHED',
            },
            {
                spot_id: 'spot-m-003',
                location: { lat: 37.286, lng: 127.015 },
                provenance: 'mixed',
                status: 'OPEN',
            },
        ],
        events_this_tick: [
            {
                event_id: 'evt-3-1',
                event_type: 'SPOT_MATCHED',
                payload: {
                    spot_id: 'spot-v-001',
                },
            },
        ],
    },
    {
        tick: 4,
        day_of_week: 'SAT',
        time_slot: '11:00',
        active_agents: [
            {
                agent_id: 'A_97841',
                location: { lat: 37.3, lng: 127.016 },
                archetype: 'connector',
            },
            {
                agent_id: 'A_44522',
                location: { lat: 37.268, lng: 127.037 },
                archetype: 'learner',
            },
            {
                agent_id: 'A_11504',
                location: { lat: 37.2636, lng: 127.0286 },
                archetype: 'helper',
            },
        ],
        active_spots: [
            {
                spot_id: 'spot-m-003',
                location: { lat: 37.286, lng: 127.015 },
                provenance: 'mixed',
                status: 'OPEN',
            },
            {
                spot_id: 'spot-r-005',
                location: { lat: 37.278, lng: 127.04 },
                provenance: 'real',
                status: 'OPEN',
            },
        ],
        events_this_tick: [
            {
                event_id: 'evt-4-1',
                event_type: 'CHECK_IN',
                payload: {
                    agent_id: 'A_44522',
                    spot_id: 'spot-r-005',
                },
            },
            {
                event_id: 'evt-4-2',
                event_type: 'JOIN_TEACH_SPOT',
                payload: {
                    agent_id: 'A_97841',
                    spot_id: 'spot-m-003',
                },
            },
        ],
    },
    {
        tick: 5,
        day_of_week: 'SAT',
        time_slot: '11:30',
        active_agents: [
            {
                agent_id: 'A_44522',
                location: { lat: 37.278, lng: 127.04 },
                archetype: 'learner',
            },
            {
                agent_id: 'A_97841',
                location: { lat: 37.286, lng: 127.015 },
                archetype: 'connector',
            },
        ],
        active_spots: [
            {
                spot_id: 'spot-m-003',
                location: { lat: 37.286, lng: 127.015 },
                provenance: 'mixed',
                status: 'MATCHED',
            },
            {
                spot_id: 'spot-r-005',
                location: { lat: 37.278, lng: 127.04 },
                provenance: 'real',
                status: 'OPEN',
            },
        ],
        events_this_tick: [
            {
                event_id: 'evt-5-1',
                event_type: 'SPOT_MATCHED',
                payload: {
                    spot_id: 'spot-m-003',
                },
            },
        ],
    },
];

export const MOCK_HIGHLIGHTS: HighlightClip[] = [
    {
        clip_id: 'clip-001',
        title: '첫 매칭 성사: 라떼아트 클래스',
        category: 'first_success',
        start_tick: 0,
        end_tick: 3,
        involved_agents: ['A_11504', 'A_80381'],
        narrative:
            '호스트 지훈이 연무동 카페에서 라떼아트 클래스를 열자 탐험형 민지가 바로 합류해 첫 매칭이 성사됐다.',
    },
    {
        clip_id: 'clip-002',
        title: '수채화 워크숍, 예상 밖의 만남',
        category: 'unexpected_match',
        start_tick: 2,
        end_tick: 5,
        involved_agents: ['A_83000', 'A_97841'],
        narrative:
            '수채화 기초를 요청한 서연과, 연결형 현우가 우연히 같은 시간대 신촌 아틀리에에 들러 매칭으로 이어졌다.',
    },
    {
        clip_id: 'clip-003',
        title: '볼더링 크루 반복 합류',
        category: 'bond_upgrade',
        start_tick: 4,
        end_tick: 5,
        involved_agents: ['A_44522'],
        narrative:
            '학습형 수빈이 3주 연속 같은 새벽 크루에 체크인하며 단골 관계로 업그레이드됐다.',
    },
];

export const MOCK_ATTRACTIVENESS_REPORT: AttractivenessReport = {
    composite_score: 0.74,
    signals: {
        title_hookiness: 0.82,
        price_reasonableness: 0.68,
        venue_accessibility: 0.77,
        host_reputation_fit: 0.71,
        time_slot_demand: 0.62,
        skill_rarity_bonus: 0.55,
        narrative_authenticity: 0.88,
        bonded_repeat_potential: 0.79,
    },
    improvement_hints: [
        '제목에 "2시간" 같은 러닝타임을 넣으면 클릭률이 오릅니다.',
        '현재 가격은 p50보다 살짝 높습니다. 재료비를 분리 표기해 체감 가격을 낮춰보세요.',
        '토요일 오전 슬롯 수요가 평일 저녁보다 30% 낮습니다. 평일 저녁도 병행 제안 권장.',
    ],
    price_benchmark: {
        p25: 12000,
        p50: 16000,
        p75: 22000,
        p90: 30000,
        verdict: 'slightly_above_p50',
    },
};

export const MOCK_CONVERSION_HINTS: ConversionHints = {
    source_virtual_spot_id: 'spot-v-001',
    placeholder: {
        title: '연무동 저녁 라떼아트 2시간 실습',
        intro: '카페에서 바로 해보는 핸드드립 + 라떼아트. 원두와 우유 재료 포함.',
        skill_topic: '바리스타',
    },
    pricing_suggestion: {
        fee_breakdown: {
            tuition: 12000,
            materials: 4000,
            venue_share: 2000,
        },
        rationale:
            '비슷한 워크숍 p50(16,000원) 대비 경쟁력 있는 세팅. 재료비를 분리 표기해 신뢰도 확보.',
    },
    plan_help: {
        warmup_block: '원두 소개와 추출 원리 5분 데모 (0–15분)',
        main_block: '핸드드립 2회 + 라떼아트 하트/로제타 각 3회 (15–90분)',
        closing_block: '각자 메뉴 한 잔 완성 + 피드백 (90–120분)',
        host_tips: [
            '재료는 인원수+1 분량 준비',
            '초보자 카메라 각도 교정 스크립트 미리 준비',
            '파트너에게 완성 컷 공유할 핸드폰 스탠드 세팅',
        ],
    },
    expected_demand: {
        forecast_join_count_p50: 3,
        forecast_join_count_p90: 6,
    },
};
