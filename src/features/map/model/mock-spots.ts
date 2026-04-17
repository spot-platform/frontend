import type { SpotMapItem } from '@/entities/spot/types';

export const MOCK_SPOTS: SpotMapItem[] = [
    {
        id: 'S_30996',
        type: 'OFFER',
        status: 'OPEN',
        title: '가벼운 등산 함께해요',
        coord: { lat: 37.302, lng: 127.018 },
        category: '등산',
    },
    {
        id: 'S_10094',
        type: 'OFFER',
        status: 'OPEN',
        title: '코딩 입문 함께 해요',
        coord: { lat: 37.286, lng: 127.015 },
        category: '코딩',
    },
    {
        id: 'S_0003',
        type: 'REQUEST',
        status: 'OPEN',
        title: '요가 입문 같이 하실 분',
        coord: { lat: 37.2636, lng: 127.0286 },
        category: '요가',
    },
    {
        id: 'S_0004',
        type: 'REQUEST',
        status: 'OPEN',
        title: '볼더링 파트너 구해요',
        coord: { lat: 37.275, lng: 127.045 },
        category: '볼더링',
    },
    {
        id: 'S_0005',
        type: 'OFFER',
        status: 'MATCHED',
        title: '수채화 원데이 클래스',
        coord: { lat: 37.258, lng: 127.032 },
        category: '미술',
    },
];
