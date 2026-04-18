import type { Persona } from '@/entities/persona/types';

// 13명 분포: 클러스터 5개 (운동·요가·코딩·등산·미술) + 단독 3명 (음악·요리·공예)
// 좌표는 수원 안에서 같은 카테고리·intent 페르소나가 80m 이내로 모이도록 설계.
export const MOCK_PERSONAS: Persona[] = [
    // ───────── 클러스터 1: 운동/offer (화서동 부근) ─────────
    {
        id: 'A_80381',
        emoji: '🏃',
        name: '민지',
        archetype: 'explorer',
        initialCoord: { lat: 37.285, lng: 127.005 },
        category: '운동',
        intent: 'offer',
    },
    {
        id: 'A_91234',
        emoji: '🚴',
        name: '동현',
        archetype: 'explorer',
        initialCoord: { lat: 37.2853, lng: 127.0053 },
        category: '운동',
        intent: 'offer',
    },
    {
        id: 'A_91235',
        emoji: '🤸',
        name: '유진',
        archetype: 'explorer',
        initialCoord: { lat: 37.2856, lng: 127.0048 },
        category: '운동',
        intent: 'offer',
    },

    // ───────── 클러스터 2: 요가/offer (인계동 부근) ─────────
    {
        id: 'A_91236',
        emoji: '🧘',
        name: '다은',
        archetype: 'helper',
        initialCoord: { lat: 37.275, lng: 127.03 },
        category: '요가',
        intent: 'offer',
    },
    {
        id: 'A_91237',
        emoji: '🙏',
        name: '진우',
        archetype: 'helper',
        initialCoord: { lat: 37.2754, lng: 127.0298 },
        category: '요가',
        intent: 'offer',
    },
    {
        id: 'A_91238',
        emoji: '🌿',
        name: '현지',
        archetype: 'creator',
        initialCoord: { lat: 37.2748, lng: 127.0303 },
        category: '요가',
        intent: 'offer',
    },

    // ───────── 클러스터 3: 코딩/offer (수원역 부근) ─────────
    {
        id: 'A_11504',
        emoji: '🧑‍🏫',
        name: '지훈',
        archetype: 'helper',
        initialCoord: { lat: 37.295, lng: 127.01 },
        category: '코딩',
        intent: 'offer',
    },
    {
        id: 'A_91239',
        emoji: '💻',
        name: '태양',
        archetype: 'learner',
        initialCoord: { lat: 37.2952, lng: 127.0103 },
        category: '코딩',
        intent: 'offer',
    },

    // ───────── 클러스터 4: 등산/offer (광교 부근) ─────────
    {
        id: 'A_91240',
        emoji: '🥾',
        name: '세준',
        archetype: 'explorer',
        initialCoord: { lat: 37.293, lng: 127.05 },
        category: '등산',
        intent: 'offer',
    },
    {
        id: 'A_91241',
        emoji: '🧗',
        name: '서윤',
        archetype: 'explorer',
        initialCoord: { lat: 37.2933, lng: 127.0497 },
        category: '등산',
        intent: 'offer',
    },

    // ───────── 클러스터 5: 미술/request (정자동 부근) ─────────
    {
        id: 'A_91242',
        emoji: '🎨',
        name: '보라',
        archetype: 'creator',
        initialCoord: { lat: 37.298, lng: 127.025 },
        category: '미술',
        intent: 'request',
    },
    {
        id: 'A_91243',
        emoji: '🖌️',
        name: '은채',
        archetype: 'creator',
        initialCoord: { lat: 37.2983, lng: 127.0252 },
        category: '미술',
        intent: 'request',
    },

    // ───────── 단독 페르소나 3명 (각자 다른 위치) ─────────
    {
        id: 'A_83000',
        emoji: '🪄',
        name: '서연',
        archetype: 'creator',
        initialCoord: { lat: 37.278, lng: 127.04 },
        category: '공예',
        intent: 'request',
    },
    {
        id: 'A_97841',
        emoji: '🎵',
        name: '현우',
        archetype: 'connector',
        initialCoord: { lat: 37.305, lng: 127.02 },
        category: '음악',
        intent: 'offer',
    },
    {
        id: 'A_44522',
        emoji: '🍳',
        name: '수빈',
        archetype: 'learner',
        initialCoord: { lat: 37.26, lng: 127.035 },
        category: '요리',
        intent: 'request',
    },
];
