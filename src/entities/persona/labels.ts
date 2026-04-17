// Korean labels + emoji hints for PersonaArchetype. Kept in entities so features can share without cross-feature imports.

import type { PersonaArchetype } from './types';

export const ARCHETYPE_LABEL: Record<PersonaArchetype, string> = {
    explorer: '탐험가',
    helper: '도우미',
    creator: '만드는 사람',
    connector: '연결자',
    learner: '배우는 사람',
};

export const ARCHETYPE_EMOJI: Record<PersonaArchetype, string> = {
    explorer: '🧭',
    helper: '🤝',
    creator: '🎨',
    connector: '🔗',
    learner: '📚',
};

export const ARCHETYPE_DESCRIPTION: Record<PersonaArchetype, string> = {
    explorer: '새로운 동네와 경험을 찾아다녀요',
    helper: '주변을 도우며 관계를 만들어요',
    creator: '직접 만들고 가르치는 걸 좋아해요',
    connector: '사람과 모임을 연결해요',
    learner: '배우며 성장하는 걸 즐겨요',
};

export const ARCHETYPES: readonly PersonaArchetype[] = [
    'explorer',
    'helper',
    'creator',
    'connector',
    'learner',
] as const;
