import type { SpotCategory } from '@/entities/spot/categories';
import type { GeoCoord } from '@/entities/spot/types';

export type PersonaRef = {
    id: string;
    emoji: string;
    name: string;
};

export type ActivityCluster = {
    id: string;
    centerCoord: GeoCoord;
    category: SpotCategory;
    intent: 'offer' | 'request';
    personas: PersonaRef[];
    /** 새로 생성된 클러스터 — birth pulse 1회. */
    isPulse?: boolean;
    /** 이번 프레임에 사라진 클러스터 — exit 애니메이션 재생 후 제거. */
    isDying?: boolean;
    /** 물리적으로 spot 에 도착한 참여자 수. 증가 시 ClusterBlob 가 join burst 재생. */
    arrivedCount?: number;
};

export type ClusterInput = {
    id: string;
    coord: GeoCoord;
    category: SpotCategory;
    intent: 'offer' | 'request';
    emoji: string;
    name: string;
};

export type ClusterOptions = {
    radiusMeters?: number;
};
