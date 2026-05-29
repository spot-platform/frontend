import type { GeoCoord } from '@/entities/spot/types';

export type PersonaRef = {
    id: string;
    emoji: string;
    name: string;
};

export type ActivityCluster = {
    id: string;
    centerCoord: GeoCoord;
    category: string;
    intent: 'offer' | 'request';
    personas: PersonaRef[];
    /** 새로 생성된 클러스터 — birth pulse 1회. */
    isPulse?: boolean;
    /** 이번 프레임에 사라진 클러스터 — exit 애니메이션 재생 후 제거. */
    isDying?: boolean;
    /** 물리적으로 spot 에 도착한 참여자 수. 증가 시 ClusterBlob 가 join burst 재생. */
    arrivedCount?: number;
    /**
     * 클러스터 시각 변형.
     * - discovery: 시뮬레이션상 생기는 동네 발견 신호. 상세/리퀘스트 전환보다 배경 발견 역할.
     * - ai-feed: LLM 검증 추천 피드. 상세 진입 가능.
     * - user-feed: 실제 사용자 피드. 가장 높은 우선도.
     * - feed-group: 정확히 같거나 가까운 좌표에 쌓인 여러 피드 묶음.
     * - mine: 유저 본인이 만든 모임.
     */
    variant?: 'discovery' | 'ai-feed' | 'user-feed' | 'feed-group' | 'mine';
    /** 변형에 따른 추가 라벨(예: "내 모임"). */
    variantLabel?: string;
};

export type ClusterInput = {
    id: string;
    coord: GeoCoord;
    category: string;
    intent: 'offer' | 'request';
    emoji: string;
    name: string;
};

export type ClusterOptions = {
    radiusMeters?: number;
};
