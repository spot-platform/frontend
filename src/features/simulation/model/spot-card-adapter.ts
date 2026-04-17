// SpotCard(BE 계약) ↔ SpotMapItem(앱 내 맵 타입) 변환. 읽기 전용, 값 생성 금지.

import type { SpotCard } from '@/entities/spot/simulation-types';
import type { SpotMapItem } from '@/entities/spot/types';

const SKILL_CATEGORY: Record<string, string> = {
    바리스타: '요리',
    요가: '운동',
    수채화: '공예',
    코딩: '기타',
    볼더링: '운동',
};

function inferType(card: SpotCard): SpotMapItem['type'] {
    return card.teach_mode === '1:1' ? 'REQUEST' : 'OFFER';
}

function inferCategory(card: SpotCard): string {
    return SKILL_CATEGORY[card.skill_topic] ?? card.skill_topic;
}

function inferParticipantCount(card: SpotCard): number {
    // spot_id 해시 기반 안정적 의사 난수 — 카드마다 다른 참여자 수를 보여주기 위한 mock.
    let hash = 0;
    for (let i = 0; i < card.spot_id.length; i += 1) {
        hash = (hash * 31 + card.spot_id.charCodeAt(i)) | 0;
    }
    return (Math.abs(hash) % 9) + 1;
}

export function spotCardToSpotMapItem(card: SpotCard): SpotMapItem {
    return {
        id: card.spot_id,
        type: inferType(card),
        status: 'OPEN',
        title: card.title,
        coord: card.location,
        category: inferCategory(card),
        provenance: card.provenance,
        personFitnessScore: card.person_fitness_score,
        attractivenessScore: card.attractiveness_score,
        participantCount: inferParticipantCount(card),
    };
}

export function spotCardsToSpotMapItems(cards: SpotCard[]): SpotMapItem[] {
    return cards.map(spotCardToSpotMapItem);
}

export function buildSpotCardLookup(cards: SpotCard[]): Map<string, SpotCard> {
    const map = new Map<string, SpotCard>();
    for (const card of cards) {
        map.set(card.spot_id, card);
    }
    return map;
}
