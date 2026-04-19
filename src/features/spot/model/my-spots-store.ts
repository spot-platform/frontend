// 사용자가 직접 생성한 스팟 로컬 저장소. 실제 BE 가 붙기 전 프로토타입용으로
// localStorage 에 persist. 맵에서 'mine' 변형 클러스터로 렌더하여 유저가 본인 생성물이
// 시뮬레이션과 함께 살아있음을 체감하게 한다.

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SpotCategory } from '@/entities/spot/categories';
import type { GeoCoord } from '@/entities/spot/types';
import type { PersonaRef } from '@/features/map/model/types';

export type MySpot = {
    id: string;
    title: string;
    category: SpotCategory;
    intent: 'offer' | 'request';
    location: GeoCoord;
    createdAtMs: number;
    /** 데모용 초기 참여자 (주로 자기 자신 + AI 더미). */
    participants: PersonaRef[];
};

type MySpotsStore = {
    spots: MySpot[];
    addSpot: (input: Omit<MySpot, 'id' | 'createdAtMs'>) => MySpot;
    removeSpot: (id: string) => void;
    clear: () => void;
};

export const useMySpotsStore = create<MySpotsStore>()(
    persist(
        (set) => ({
            spots: [],
            addSpot: (input) => {
                const newSpot: MySpot = {
                    ...input,
                    id: `my-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    createdAtMs: Date.now(),
                };
                set((s) => ({ spots: [newSpot, ...s.spots] }));
                return newSpot;
            },
            removeSpot: (id) =>
                set((s) => ({
                    spots: s.spots.filter((x) => x.id !== id),
                })),
            clear: () => set({ spots: [] }),
        }),
        {
            name: 'spot-my-spots-store',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
