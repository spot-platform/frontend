// contextBuilder 응답 shape을 유지한 목업 데이터. 축약/변형 금지.
//
// 2026-04-27 contextBuilder 출력 디테일 강화 반영:
//   - SpotCard 에 primary_pin/venue_anchors/summary_line 샘플 첨부
//   - SimulationSpotDetail (plan/price_breakdown/preparation) 목업 추가
//   - ConversionHints.session_context, fee_breakdown 신규 스키마로 정정

import type {
    AttractivenessReport,
    ConversionHints,
    HighlightClip,
    SimulationSpotDetail,
    SpotCard,
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
        primary_pin: {
            place_id: 27440700,
            name: '아롬',
            primary_category: 'cafe',
            role: 'main',
            lat: 37.2636,
            lng: 127.0286,
            address: '경기 수원시 장안구 창훈로40번길 9',
            road_address: '경기 수원시 장안구 창훈로40번길 9',
            confidence: 1.0,
        },
        venue_anchors: [
            {
                place_id: 27440700,
                name: '아롬',
                primary_category: 'cafe',
                role: 'meetup',
                lat: 37.2636,
                lng: 127.0286,
                address: '경기 수원시 장안구 창훈로40번길 9',
                confidence: 1.0,
            },
            {
                place_id: 935519117,
                name: '커피있는하루',
                primary_category: 'cafe',
                role: 'wrapup',
                lat: 37.2641,
                lng: 127.0292,
                address: '경기 수원시 장안구 창훈로46번길 5-10',
                confidence: 1.0,
            },
        ],
        summary_line:
            '참가비 18,000원에 핸드드립 + 라떼아트 가이드 포함, 우유·원두는 정액 추가입니다.',
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
        primary_pin: {
            place_id: 31204881,
            name: '플로우 요가스튜디오 장안문점',
            primary_category: 'studio',
            role: 'main',
            lat: 37.301,
            lng: 127.01,
            address: '경기 수원시 장안구 정조로 905',
            road_address: '경기 수원시 장안구 정조로 905',
            confidence: 1.0,
        },
        venue_anchors: [
            {
                place_id: 31204881,
                name: '플로우 요가스튜디오 장안문점',
                primary_category: 'studio',
                role: 'main',
                lat: 37.301,
                lng: 127.01,
                address: '경기 수원시 장안구 정조로 905',
                confidence: 1.0,
            },
            {
                place_id: 71223441,
                name: '장안 베이커리',
                primary_category: 'cafe',
                role: 'wrapup',
                lat: 37.3014,
                lng: 127.0107,
                address: '경기 수원시 장안구 정조로 901',
                confidence: 0.95,
            },
        ],
        summary_line:
            '참가비 35,000원에 1:1 자세 교정과 매트·블록 대여 포함, 도복 대여만 정액 추가입니다.',
    },
    {
        spot_id: 'spot-m-003',
        provenance: 'mixed',
        title: '신촌 수채화 원데이 워크숍',
        skill_topic: '수채화',
        teach_mode: 'workshop',
        // 2026-04-24 enum 확정으로 atelier → studio 정규화 (FE handoff §SpotVenueType).
        venue_type: 'studio',
        fee_per_partner: 42000,
        location: { lat: 37.286, lng: 127.015 },
        host_preview: '서연 작가의 수채화 기초 3시간, 재료비 포함',
        person_fitness_score: 0.55,
        attractiveness_score: 0.69,
        primary_pin: {
            place_id: 51842901,
            name: '서연 아틀리에',
            primary_category: 'studio',
            role: 'main',
            lat: 37.286,
            lng: 127.015,
            address: '경기 수원시 팔달구 매산로1가 11',
            road_address: '경기 수원시 팔달구 매산로 64',
            confidence: 1.0,
        },
        venue_anchors: [
            {
                place_id: 88471322,
                name: '오후 다섯시',
                primary_category: 'cafe',
                role: 'meetup',
                lat: 37.2856,
                lng: 127.0146,
                address: '경기 수원시 팔달구 매산로 60',
                confidence: 0.92,
            },
            {
                place_id: 51842901,
                name: '서연 아틀리에',
                primary_category: 'studio',
                role: 'main',
                lat: 37.286,
                lng: 127.015,
                address: '경기 수원시 팔달구 매산로 64',
                confidence: 1.0,
            },
        ],
        summary_line:
            '참가비 42,000원에 종이·물감·붓 등 수채화 키트 일체 포함, 추가 결제 없는 원데이 워크숍이에요.',
    },
    {
        spot_id: 'spot-v-004',
        provenance: 'virtual',
        title: '연무동 코딩 입문 스터디',
        skill_topic: '코딩',
        teach_mode: 'small_group',
        // 'studyroom' 은 5종 enum 에 없어 가장 가까운 'studio' 로 정규화.
        venue_type: 'studio',
        fee_per_partner: 15000,
        location: { lat: 37.268, lng: 127.025 },
        host_preview: '현우가 주도하는 Python 입문 4회차 스터디',
        person_fitness_score: 0.77,
        attractiveness_score: 0.58,
        primary_pin: {
            place_id: 64528177,
            name: '연무 스터디카페 1호점',
            primary_category: 'studio',
            role: 'main',
            lat: 37.268,
            lng: 127.025,
            address: '경기 수원시 팔달구 연무로 22',
            road_address: '경기 수원시 팔달구 연무로 22',
            confidence: 0.97,
        },
        venue_anchors: [
            {
                place_id: 935519117,
                name: '커피있는하루',
                primary_category: 'cafe',
                role: 'meetup',
                lat: 37.2683,
                lng: 127.0258,
                address: '경기 수원시 장안구 창훈로46번길 5-10',
                confidence: 1.0,
            },
            {
                place_id: 64528177,
                name: '연무 스터디카페 1호점',
                primary_category: 'studio',
                role: 'main',
                lat: 37.268,
                lng: 127.025,
                address: '경기 수원시 팔달구 연무로 22',
                confidence: 0.97,
            },
        ],
        summary_line:
            '참가비 15,000원에 Python 입문 가이드와 스터디룸 1회차 사용료 포함, 음료는 각자 결제예요.',
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
        primary_pin: {
            place_id: 47002331,
            name: '클라임웍스 수원천점',
            primary_category: 'gym',
            role: 'main',
            lat: 37.278,
            lng: 127.04,
            address: '경기 수원시 팔달구 수원천로 200',
            road_address: '경기 수원시 팔달구 수원천로 200',
            confidence: 1.0,
        },
        venue_anchors: [
            {
                place_id: 47002331,
                name: '클라임웍스 수원천점',
                primary_category: 'gym',
                role: 'main',
                lat: 37.278,
                lng: 127.04,
                address: '경기 수원시 팔달구 수원천로 200',
                confidence: 1.0,
            },
            {
                place_id: 71991480,
                name: '수원천 모닝베이글',
                primary_category: 'cafe',
                role: 'wrapup',
                lat: 37.2786,
                lng: 127.0408,
                address: '경기 수원시 팔달구 수원천로 188',
                confidence: 0.93,
            },
        ],
        summary_line:
            '참가비 22,000원에 V2~V4 루트 분석과 새벽 크루 진행 포함, 신발 대여만 실비 분담이에요.',
    },
];

export const MOCK_SIMULATION_SPOT_DETAILS: Record<
    string,
    SimulationSpotDetail
> = {
    'spot-v-001': {
        spot_id: 'spot-v-001',
        provenance: 'virtual',
        title: '연무동 저녁 라떼아트 실습',
        description:
            '연무동 카페에서 핸드드립과 라떼아트를 가볍게 배워보는 2시간 클래스예요. 처음이신 분도 천천히 따라올 수 있도록 도구와 추출 원리를 먼저 살펴보고, 한 잔씩 직접 내려봅니다.',
        skill_topic: '바리스타',
        teach_mode: 'small_group',
        venue_type: 'cafe',
        location: { lat: 37.2636, lng: 127.0286 },
        primary_pin: {
            place_id: 27440700,
            name: '아롬',
            primary_category: 'cafe',
            role: 'main',
            lat: 37.2636,
            lng: 127.0286,
            address: '경기 수원시 장안구 창훈로40번길 9',
            road_address: '경기 수원시 장안구 창훈로40번길 9',
            confidence: 1.0,
        },
        venue_anchors: [
            {
                place_id: 27440700,
                name: '아롬',
                primary_category: 'cafe',
                role: 'meetup',
                lat: 37.2636,
                lng: 127.0286,
                address: '경기 수원시 장안구 창훈로40번길 9',
                confidence: 1.0,
            },
            {
                place_id: 935519117,
                name: '커피있는하루',
                primary_category: 'cafe',
                role: 'wrapup',
                lat: 37.2641,
                lng: 127.0292,
                address: '경기 수원시 장안구 창훈로46번길 5-10',
                confidence: 1.0,
            },
        ],
        plan: {
            steps: [
                {
                    time: '19:00',
                    activity: '아롬에서 인사하고 원두/추출 원리 5분 데모',
                    place_id: 27440700,
                    intent: '저녁 시간이라 가볍게 인사부터, 도구 친숙해지는 데 5분만 써요',
                },
                {
                    time: '19:15',
                    activity: '핸드드립 2회 + 라떼아트 하트/로제타 각 3회',
                    place_id: 27440700,
                    intent: '본격 실습. 한 잔씩 직접 내리며 자세/우유 결을 같이 잡아봐요',
                },
                {
                    time: '20:30',
                    activity: '커피있는하루로 이동해 후기 한 줄씩 마무리',
                    place_id: 935519117,
                    intent: '마지막 30분은 자리 옮겨 담백하게 후기 나누고 끝',
                },
            ],
            total_duration_minutes: 120,
        },
        price_breakdown: {
            base_fee: 18000,
            included_items: [
                {
                    name: '가이드/진행',
                    value: '호스트 시간과 라떼아트 진행 포함',
                },
                { name: '연습 원두', value: '인원수+1 분량 원두' },
            ],
            optional_addons: [
                {
                    name: '우유 추가',
                    price: 3000,
                    mechanism: 'fixed',
                    explanation:
                        '대체 우유(오트밀크 등) 원하시면 정액 +3,000원이에요.',
                },
                {
                    name: '잔 1개 가져가기',
                    price: 6000,
                    mechanism: 'realcost',
                    explanation:
                        '직접 만든 잔을 가져가고 싶은 분만 실비로 정산해요.',
                },
            ],
            refund_policy: {
                cutoff_hours: 48,
                full_refund_until: '활동 2일 전까지',
                note: '활동 2일 전까지는 전액 환불 가능해요.',
            },
            summary_line:
                '참가비 18,000원에 가이드와 원두 포함, 대체 우유·잔 가져가기는 선택입니다.',
        },
        preparation: {
            host_provides: [
                '에스프레소 머신·드리퍼·저울',
                '연습 원두',
                '시연용 우유',
            ],
            partner_brings: ['앞치마는 옵션', '필기할 작은 노트'],
            weather_contingency: null,
            safety_notes: [
                '뜨거운 물·스팀완드 다룰 때 호스트 안내 따라 천천히 진행해 주세요.',
            ],
            host_tip:
                '스팀 잡기 어려우시면 우유 결 자리잡힐 때까지 같은 동작 반복해 보셔도 좋아요.',
        },
        materials: ['앞치마는 옵션', '필기할 작은 노트'],
        target_audience:
            '핸드드립이 처음이거나 라떼아트 자세를 잡아보고 싶은 또래',
        activity_purpose:
            '연무동 또래끼리 카페에서 가볍게 커피를 같이 만들어보며 취미 친구를 만들 수 있어요.',
        progress_style:
            '작은 그룹으로 한 명씩 추출/스팀을 해보고, 호스트가 옆에서 자세·각도를 잡아주는 방식이에요.',
        host_intro:
            '5년차 바리스타 민지예요. 평소 카페에서 또래에게 라떼아트 잡아주는 걸 좋아해요.',
        policy_notes:
            '참가비는 1인 기준이며, 대체 우유·잔 가져가기는 옵션입니다.',
    },
    'spot-r-002': {
        spot_id: 'spot-r-002',
        provenance: 'real',
        title: '장안문 근처 주말 요가 입문',
        description:
            '요가 처음이신 분도 부담 없이 따라올 수 있는 1:1 입문 클래스예요. 호흡과 기본 자세부터 천천히 잡아드리고, 평소 자세에서 자주 어긋나는 포인트를 같이 살펴봐요.',
        skill_topic: '요가',
        teach_mode: '1:1',
        venue_type: 'studio',
        location: { lat: 37.301, lng: 127.01 },
        primary_pin: {
            place_id: 31204881,
            name: '플로우 요가스튜디오 장안문점',
            primary_category: 'studio',
            role: 'main',
            lat: 37.301,
            lng: 127.01,
            address: '경기 수원시 장안구 정조로 905',
            road_address: '경기 수원시 장안구 정조로 905',
            confidence: 1.0,
        },
        venue_anchors: [
            {
                place_id: 31204881,
                name: '플로우 요가스튜디오 장안문점',
                primary_category: 'studio',
                role: 'main',
                lat: 37.301,
                lng: 127.01,
                address: '경기 수원시 장안구 정조로 905',
                confidence: 1.0,
            },
            {
                place_id: 71223441,
                name: '장안 베이커리',
                primary_category: 'cafe',
                role: 'wrapup',
                lat: 37.3014,
                lng: 127.0107,
                address: '경기 수원시 장안구 정조로 901',
                confidence: 0.95,
            },
        ],
        plan: {
            steps: [
                {
                    time: '10:00',
                    activity: '스튜디오 도착 후 컨디션·호흡 체크',
                    place_id: 31204881,
                    intent: '시작 전에 호흡 상태와 컨디션을 같이 살펴 무리 없이 진행하려고요',
                },
                {
                    time: '10:15',
                    activity: '기본 정렬 자세 5종 + 자세 교정 1:1',
                    place_id: 31204881,
                    intent: '입문 핵심 자세를 천천히 따라하며 매번 어긋나는 부분을 잡아드려요',
                },
                {
                    time: '11:30',
                    activity: '장안 베이커리에서 따뜻한 차 한 잔으로 정리',
                    place_id: 71223441,
                    intent: '마무리는 가까운 베이커리에서 호흡 가라앉히며 가볍게 정리해요',
                },
            ],
            total_duration_minutes: 105,
        },
        price_breakdown: {
            base_fee: 35000,
            included_items: [
                {
                    name: '1:1 자세 교정',
                    value: '호스트의 시간과 1:1 코칭 포함',
                },
                {
                    name: '매트·블록 대여',
                    value: '스튜디오 매트·요가블록 1세트 무료',
                },
            ],
            optional_addons: [
                {
                    name: '도복 대여',
                    price: 5000,
                    mechanism: 'fixed',
                    explanation:
                        '편한 옷을 못 챙겨오신 경우 정액 +5,000원으로 도복 빌릴 수 있어요.',
                },
            ],
            refund_policy: {
                cutoff_hours: 24,
                full_refund_until: '활동 1일 전까지',
                note: '활동 24시간 전까지는 전액 환불 가능해요.',
            },
            summary_line:
                '참가비 35,000원에 1:1 코칭과 매트·블록 대여 포함, 도복 대여만 정액 추가입니다.',
        },
        preparation: {
            host_provides: ['요가 매트', '요가 블록', '스트랩'],
            partner_brings: ['활동 편한 옷', '수건', '미리 가벼운 식사'],
            weather_contingency: null,
            safety_notes: [
                '식후 1시간 이내에는 무리한 후굴 자세를 피해주세요.',
                '허리·무릎 통증이 있으면 시작 전에 호스트에게 알려주세요.',
            ],
            host_tip: '처음에는 자세 깊이보다 호흡 흐름을 먼저 잡는 게 편해요.',
        },
        materials: ['활동 편한 옷', '수건'],
        target_audience: '요가가 처음이거나 자세 교정을 받아보고 싶은 또래',
        activity_purpose:
            '주말 오전을 가볍게 시작하면서, 1:1로 자세 기초를 다지고 싶은 또래에게 맞춰요.',
        progress_style:
            '1:1로 진행되어 모든 자세를 옆에서 같이 보면서 작은 정렬까지 잡아드려요.',
        host_intro:
            '요가 지도자 과정 수료 후 3년째 강사로 활동 중인 지훈입니다. 입문자분들 자세 잡아드리는 걸 가장 좋아해요.',
        policy_notes:
            '활동 24시간 전까지 전액 환불 가능, 이후에는 다음 회차 이월로 처리해요.',
    },
    'spot-m-003': {
        spot_id: 'spot-m-003',
        provenance: 'mixed',
        title: '신촌 수채화 원데이 워크숍',
        description:
            '수채화를 처음 잡아보는 또래끼리 한나절을 함께 그려보는 워크숍이에요. 종이 결과 물감 농도부터 익히고, 마지막엔 각자 한 장씩 작은 풍경화를 완성해요.',
        skill_topic: '수채화',
        teach_mode: 'workshop',
        venue_type: 'studio',
        location: { lat: 37.286, lng: 127.015 },
        primary_pin: {
            place_id: 51842901,
            name: '서연 아틀리에',
            primary_category: 'studio',
            role: 'main',
            lat: 37.286,
            lng: 127.015,
            address: '경기 수원시 팔달구 매산로1가 11',
            road_address: '경기 수원시 팔달구 매산로 64',
            confidence: 1.0,
        },
        venue_anchors: [
            {
                place_id: 88471322,
                name: '오후 다섯시',
                primary_category: 'cafe',
                role: 'meetup',
                lat: 37.2856,
                lng: 127.0146,
                address: '경기 수원시 팔달구 매산로 60',
                confidence: 0.92,
            },
            {
                place_id: 51842901,
                name: '서연 아틀리에',
                primary_category: 'studio',
                role: 'main',
                lat: 37.286,
                lng: 127.015,
                address: '경기 수원시 팔달구 매산로 64',
                confidence: 1.0,
            },
        ],
        plan: {
            steps: [
                {
                    time: '14:00',
                    activity:
                        '오후 다섯시에서 인사하고 오늘 그릴 풍경 톤 정하기',
                    place_id: 88471322,
                    intent: '바로 작업실 들어가기 전에 카페에서 한 잔 하며 오늘 분위기와 톤을 같이 잡아요',
                },
                {
                    time: '14:30',
                    activity: '수채화 도구 소개 + 종이 결·번짐 데모 30분',
                    place_id: 51842901,
                    intent: '재료 친숙해지는 시간을 충분히 확보해 처음이신 분도 막히지 않게 시작해요',
                },
                {
                    time: '15:00',
                    activity: '작은 풍경화 한 장 직접 완성',
                    place_id: 51842901,
                    intent: '본 작업. 옆에서 농도·번짐 잡아드리며 한 장 완성까지 가요',
                },
                {
                    time: '17:00',
                    activity: '완성작 같이 보고 한 줄씩 짧게 후기',
                    place_id: 51842901,
                    intent: '마무리에 서로 그림을 보며 좋았던 부분과 다음에 해보고 싶은 점 짧게 나눠요',
                },
            ],
            total_duration_minutes: 180,
        },
        price_breakdown: {
            base_fee: 42000,
            included_items: [
                {
                    name: '수채화 키트',
                    value: '아르쉬 종이 1장, 물감 12색, 붓 3종 포함',
                },
                {
                    name: '아틀리에 사용료',
                    value: '3시간 작업실 사용 + 작품 건조 포함',
                },
                { name: '진행', value: '서연 작가의 1:N 진행 포함' },
            ],
            optional_addons: [],
            refund_policy: {
                cutoff_hours: 72,
                full_refund_until: '활동 3일 전까지',
                note: '재료를 미리 준비하기 때문에 3일 전까지만 전액 환불 가능해요.',
            },
            summary_line:
                '참가비 42,000원에 수채화 키트와 아틀리에 사용까지 모두 포함, 추가 결제 없는 원데이 워크숍이에요.',
        },
        preparation: {
            host_provides: [
                '아르쉬 수채화 종이',
                '12색 물감 세트',
                '둥근붓·평붓·세필',
                '팔레트',
            ],
            partner_brings: ['오염되어도 괜찮은 옷', '앞치마는 옵션'],
            weather_contingency: null,
            safety_notes: [
                '물감이 옷에 묻을 수 있으니 밝은 색 옷은 피해주세요.',
            ],
            host_tip:
                '시작할 때 종이 한 장에 농도 테스트만 5분 해보면 본 작업이 훨씬 편해져요.',
        },
        materials: ['오염되어도 괜찮은 옷', '앞치마는 옵션'],
        target_audience:
            '수채화를 처음 잡아보거나 한나절 깊게 그려보고 싶은 또래',
        activity_purpose:
            '주말 오후를 천천히 그리면서 보내고 싶은 또래에게 짧게 한 장 완성하는 경험을 주려고 열어요.',
        progress_style:
            '워크숍 형태로 다 같이 같은 풍경을 그리되, 농도·구도는 1:1로 옆에서 잡아드려요.',
        host_intro:
            '수채화 작가 서연이에요. 평소 작업실에서 또래분들과 같이 그리는 시간을 자주 가져요.',
        policy_notes: '재료 사전 준비로 인해 3일 전까지만 전액 환불 가능해요.',
    },
    'spot-v-004': {
        spot_id: 'spot-v-004',
        provenance: 'virtual',
        title: '연무동 코딩 입문 스터디',
        description:
            'Python 처음 시작하는 또래 4명이 모여 4회차로 천천히 기초를 잡는 스터디예요. 매 회차 작은 과제를 같이 풀어보고, 막히는 부분은 서로 의견 주며 해결해요.',
        skill_topic: '코딩',
        teach_mode: 'small_group',
        venue_type: 'studio',
        location: { lat: 37.268, lng: 127.025 },
        primary_pin: {
            place_id: 64528177,
            name: '연무 스터디카페 1호점',
            primary_category: 'studio',
            role: 'main',
            lat: 37.268,
            lng: 127.025,
            address: '경기 수원시 팔달구 연무로 22',
            road_address: '경기 수원시 팔달구 연무로 22',
            confidence: 0.97,
        },
        venue_anchors: [
            {
                place_id: 935519117,
                name: '커피있는하루',
                primary_category: 'cafe',
                role: 'meetup',
                lat: 37.2683,
                lng: 127.0258,
                address: '경기 수원시 장안구 창훈로46번길 5-10',
                confidence: 1.0,
            },
            {
                place_id: 64528177,
                name: '연무 스터디카페 1호점',
                primary_category: 'studio',
                role: 'main',
                lat: 37.268,
                lng: 127.025,
                address: '경기 수원시 팔달구 연무로 22',
                confidence: 0.97,
            },
        ],
        plan: {
            steps: [
                {
                    time: '19:00',
                    activity: '커피있는하루에서 가볍게 인사하고 오늘 진도 공유',
                    place_id: 935519117,
                    intent: '바로 책상에 앉기 전에 카페에서 가볍게 만나 오늘 무엇까지 할지 같이 잡아요',
                },
                {
                    time: '19:20',
                    activity:
                        '스터디카페 이동, Python 변수·조건문 핵심 정리 30분',
                    place_id: 64528177,
                    intent: '회차 핵심 개념을 짧게 정리해 모두 같은 페이지에서 시작하려고요',
                },
                {
                    time: '19:50',
                    activity: '실습 과제 2개 같이 풀고 서로 코드 리뷰',
                    place_id: 64528177,
                    intent: '본 작업. 막히는 부분은 같이 보면서 풀고, 끝나면 짧게 코드 리뷰까지 해봐요',
                },
                {
                    time: '21:00',
                    activity: '다음 회차 과제 정하고 마무리',
                    place_id: 64528177,
                    intent: '다음 회차에 가져올 작은 과제를 정해 흐름이 끊기지 않게 마무리해요',
                },
            ],
            total_duration_minutes: 130,
        },
        price_breakdown: {
            base_fee: 15000,
            included_items: [
                {
                    name: '진행 가이드',
                    value: '4회차 입문 커리큘럼과 호스트 진행 포함',
                },
                {
                    name: '스터디룸 사용료',
                    value: '연무 스터디카페 1회차분 부스 사용 포함',
                },
            ],
            optional_addons: [
                {
                    name: '음료 펀딩',
                    price: 3000,
                    mechanism: 'funding',
                    explanation:
                        '4명 모이면 다 같이 1/4로 나눠 가는 단체 음료 옵션이에요.',
                },
            ],
            refund_policy: {
                cutoff_hours: 24,
                full_refund_until: '활동 1일 전까지',
                note: '스터디룸 예약 때문에 24시간 전까지만 전액 환불 가능해요.',
            },
            summary_line:
                '참가비 15,000원에 입문 가이드와 스터디룸 사용 포함, 음료는 선택형 펀딩으로 1/4씩 나눠요.',
        },
        preparation: {
            host_provides: ['커리큘럼 자료', '연습 과제', '코드 리뷰 가이드'],
            partner_brings: ['노트북', '충전기', '메모용 노트'],
            weather_contingency: null,
            safety_notes: [],
            host_tip:
                '회차 전에 과제를 절반만 풀어와도 같이 보는 시간이 훨씬 풍부해져요.',
        },
        materials: ['노트북', '충전기'],
        target_audience:
            'Python 입문이 처음이거나 4주 단위로 천천히 따라가고 싶은 또래',
        activity_purpose:
            '혼자 입문서 보며 막히던 분들이 또래와 같이 한 회차씩 채워가도록 열어요.',
        progress_style:
            '4명 소그룹으로 같은 과제를 풀고, 호스트가 막히는 지점에서 옆에 붙어 봐드려요.',
        host_intro:
            '주니어 백엔드 2년차 현우예요. 비전공 친구들 입문 시켜본 경험이 많아 페이스 잡는 데 익숙해요.',
        policy_notes:
            '4회차 전체 신청 시 1회 결석은 다음 기수로 이월 가능해요.',
    },
    'spot-r-005': {
        spot_id: 'spot-r-005',
        provenance: 'real',
        title: '수원천 새벽 볼더링 크루',
        description:
            '새벽 첫 타임에 볼더링 짐을 같이 쓰는 또래 크루예요. V2~V4 루트를 중심으로 한 시간씩 집중해서 풀고, 안 되는 무브는 옆에서 서로 봐드려요.',
        skill_topic: '볼더링',
        teach_mode: 'small_group',
        venue_type: 'gym',
        location: { lat: 37.278, lng: 127.04 },
        primary_pin: {
            place_id: 47002331,
            name: '클라임웍스 수원천점',
            primary_category: 'gym',
            role: 'main',
            lat: 37.278,
            lng: 127.04,
            address: '경기 수원시 팔달구 수원천로 200',
            road_address: '경기 수원시 팔달구 수원천로 200',
            confidence: 1.0,
        },
        venue_anchors: [
            {
                place_id: 47002331,
                name: '클라임웍스 수원천점',
                primary_category: 'gym',
                role: 'main',
                lat: 37.278,
                lng: 127.04,
                address: '경기 수원시 팔달구 수원천로 200',
                confidence: 1.0,
            },
            {
                place_id: 71991480,
                name: '수원천 모닝베이글',
                primary_category: 'cafe',
                role: 'wrapup',
                lat: 37.2786,
                lng: 127.0408,
                address: '경기 수원시 팔달구 수원천로 188',
                confidence: 0.93,
            },
        ],
        plan: {
            steps: [
                {
                    time: '06:00',
                    activity: '짐 도착, 가볍게 워밍업 + 오늘 루트 브리핑',
                    place_id: 47002331,
                    intent: '새벽이라 몸이 굳어 있어, 워밍업과 루트 브리핑을 천천히 같이 해요',
                },
                {
                    time: '06:15',
                    activity: 'V2~V3 루트 4개 풀이, 무브 코칭',
                    place_id: 47002331,
                    intent: '중급 진입 직전 또래에게 맞춘 루트로 무브 패턴을 같이 잡아요',
                },
                {
                    time: '07:00',
                    activity: 'V4 1개 도전 + 영상 분석 짧게',
                    place_id: 47002331,
                    intent: '메인 챌린지. 한 번 영상으로 찍고 같이 보며 디테일 잡아요',
                },
                {
                    time: '07:30',
                    activity: '수원천 모닝베이글에서 가볍게 마무리',
                    place_id: 71991480,
                    intent: '운동 끝나고 잠깐 앉아 베이글 한 입 하며 오늘 컨디션 정리해요',
                },
            ],
            total_duration_minutes: 105,
        },
        price_breakdown: {
            base_fee: 22000,
            included_items: [
                { name: '크루 진행', value: '루트 분석과 무브 코칭 포함' },
                { name: '짐 1회 입장료', value: '클라임웍스 1회 패스 포함' },
            ],
            optional_addons: [
                {
                    name: '클라이밍화 대여',
                    price: 4000,
                    mechanism: 'realcost',
                    explanation:
                        '신발이 없으신 분만 짐 실비로 빌려서 정산해요.',
                },
                {
                    name: '초크 가루 추가',
                    price: 1000,
                    mechanism: 'fixed',
                    explanation:
                        '초크가 부족한 분은 정액 +1,000원으로 보충 가능해요.',
                },
            ],
            refund_policy: {
                cutoff_hours: 12,
                full_refund_until: '활동 12시간 전까지',
                note: '입장 패스가 묶여 있어 12시간 전까지만 전액 환불 가능해요.',
            },
            summary_line:
                '참가비 22,000원에 짐 1회 입장과 무브 코칭 포함, 신발 대여만 실비로 분담해요.',
        },
        preparation: {
            host_provides: ['루트 가이드', '무브 코칭', '체크 카메라'],
            partner_brings: ['편한 운동복', '수건', '물 한 병'],
            weather_contingency: null,
            safety_notes: [
                '벽에서 점프 후 무릎 충격 줄이기 위해 매트 위 정확히 착지하세요.',
                '직전에 식사하지 말고 가벼운 간식만 드세요.',
            ],
            host_tip:
                '워밍업에서 손가락 풀기를 충분히 하면 V4 도전 때 부상 위험이 줄어요.',
        },
        materials: ['운동복', '수건'],
        target_audience: 'V2 정도 풀고 V3~V4 진입을 노리는 또래 클라이머',
        activity_purpose:
            '새벽에 빈 짐을 같이 쓰며 짧고 진하게 운동하고, 또래 크루를 만들고 싶어요.',
        progress_style:
            '4명 소그룹 크루. 각자 풀이 시도 후 옆에서 무브 봐드리고 영상 분석을 짧게 끼워요.',
        host_intro:
            '클라이밍 4년차 수빈입니다. 새벽 첫 타임 자주 들어가는데 또래끼리 같이 풀면 더 재밌어서 열어요.',
        policy_notes: '12시간 전 환불 가능. 이후에는 다음 회차 이월 처리해요.',
    },
};

// 2026-04-30 lifecycle 픽스처 id ↔ contextBuilder mock detail 라운드로빈 alias.
// run-fixtures/demo_run_001.lifecycle.json 의 spot_id 는 'S_0001'... 형태이고
// MOCK_SIMULATION_SPOT_DETAILS 의 정식 키는 BE 계약상 'spot-v-001'... 이므로,
// 지도에서 시뮬 클러스터를 클릭했을 때 디테일이 보이도록 5개 객체를 라운드로빈
// 으로 alias. spot_id 필드는 lifecycle id 로 덮어써서 카드 일관성 확보.
const _DETAIL_ROUND_ROBIN_KEYS = [
    'spot-v-001',
    'spot-r-002',
    'spot-m-003',
    'spot-v-004',
    'spot-r-005',
] as const;

for (let i = 1; i <= 10; i += 1) {
    const aliasId = `S_${String(i).padStart(4, '0')}`;
    const sourceKey =
        _DETAIL_ROUND_ROBIN_KEYS[(i - 1) % _DETAIL_ROUND_ROBIN_KEYS.length];
    MOCK_SIMULATION_SPOT_DETAILS[aliasId] = {
        ...MOCK_SIMULATION_SPOT_DETAILS[sourceKey],
        spot_id: aliasId,
    };
}

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
        // 2026-04-24 AttractivenessVerdict enum 확정 (slightly_above_p50 폐기).
        verdict: 'slightly_high',
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
        // 2026-04-24 FeeBreakdown 스키마 확정 ({ tuition, materials, venue_share } 폐기).
        fee_breakdown: {
            peer_labor_fee: 12000,
            material_cost: 4000,
            venue_rental: 2000,
            equipment_rental: 0,
            total: 18000,
            passthrough_total: 6000,
        },
        rationale:
            '비슷한 워크숍 p50(16,000원) 대비 경쟁력 있는 세팅. 재료비·장소비를 분리 표기해 신뢰도 확보.',
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
    // 2026-04-24 추가 — FE 직접 집계 대체.
    session_context: {
        similar_active_count: 4,
        avg_participants: 2.3,
        typical_lifespan_minutes: 110,
        sample_size: 27,
        scope: 'run',
    },
};
