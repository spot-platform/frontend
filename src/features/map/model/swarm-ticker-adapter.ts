// SpotLifecycle 상태 전이를 LiveTicker 이벤트로 변환.
// push() 호출마다 이번 프레임에 감지된 전이 중 가장 중요한 1건을 반환.
// 우선순위: matched > joined > created > closed.

import type { Persona } from '@/entities/persona/types';
import type { SpotLifecycle } from '@/features/simulation/model/use-mock-spot-lifecycles';
import type { TickerEvent } from './ticker-adapter';

export type SwarmTickerAdapter = {
    push: (
        lifecycles: SpotLifecycle[],
        now: number,
        personaLookup: Map<string, Persona>,
    ) => TickerEvent | null;
};

/** 최초 감지 이후 재발화 방지를 위한 대상 이벤트 타입. */
type SeenKey = 'created' | 'matched' | 'closed';

function buildSeenKey(spotId: string, kind: SeenKey): string {
    return `${spotId}:${kind}`;
}

function buildJoinKey(spotId: string, personaId: string): string {
    return `${spotId}:joined:${personaId}`;
}

type Candidate = { event: TickerEvent; priority: number };

const PRIORITY = {
    matched: 3,
    joined: 2,
    created: 1,
    closed: 0,
} as const;

export function createSwarmTickerAdapter(): SwarmTickerAdapter {
    const seenSpotKeys = new Set<string>();
    const seenJoinKeys = new Set<string>();
    /** 첫 push 는 워밍업 — 기존 lifecycle 을 모두 "이미 본 것" 으로 등록하고 이벤트 미발화. */
    let warmedUp = false;

    const push: SwarmTickerAdapter['push'] = (
        lifecycles,
        now,
        personaLookup,
    ) => {
        if (!warmedUp) {
            for (const lc of lifecycles) {
                seenSpotKeys.add(buildSeenKey(lc.spotId, 'created'));
                if (lc.matchedAtMs !== null && now >= lc.matchedAtMs) {
                    seenSpotKeys.add(buildSeenKey(lc.spotId, 'matched'));
                }
                if (now >= lc.closedAtMs) {
                    seenSpotKeys.add(buildSeenKey(lc.spotId, 'closed'));
                }
                for (const p of lc.participants) {
                    if (p.joinedAtMs <= now) {
                        seenJoinKeys.add(buildJoinKey(lc.spotId, p.personaId));
                    }
                }
            }
            warmedUp = true;
            return null;
        }

        let best: Candidate | null = null;

        const consider = (priority: number, build: () => TickerEvent): void => {
            if (best && best.priority >= priority) return;
            best = { event: build(), priority };
        };

        for (const lc of lifecycles) {
            // created
            const createdKey = buildSeenKey(lc.spotId, 'created');
            if (!seenSpotKeys.has(createdKey) && now >= lc.createdAtMs) {
                seenSpotKeys.add(createdKey);
                // host = participants[0] 로 정의 (use-mock-spot-lifecycles 계약).
                const hostId = lc.participants[0]?.personaId;
                const host = hostId ? personaLookup.get(hostId) : undefined;
                consider(PRIORITY.created, () => ({
                    id: `${lc.spotId}-created`,
                    personaEmoji: host?.emoji ?? '📍',
                    personaName: host?.name ?? '누군가',
                    predicate: `${lc.category} 모임을 시작했어요`,
                    timestamp: Date.now(),
                }));
            }

            // matched
            const matchedKey = buildSeenKey(lc.spotId, 'matched');
            if (
                !seenSpotKeys.has(matchedKey) &&
                lc.matchedAtMs !== null &&
                now >= lc.matchedAtMs &&
                now < lc.closedAtMs
            ) {
                seenSpotKeys.add(matchedKey);
                const hostId = lc.participants[0]?.personaId;
                const host = hostId ? personaLookup.get(hostId) : undefined;
                consider(PRIORITY.matched, () => ({
                    id: `${lc.spotId}-matched`,
                    personaEmoji: host?.emoji ?? '✨',
                    personaName: host?.name ?? lc.category,
                    predicate: `${lc.category} 모임이 매칭됐어요`,
                    timestamp: Date.now(),
                }));
            }

            // participant joined (host 제외, 1번 이상 인덱스)
            for (let i = 1; i < lc.participants.length; i += 1) {
                const p = lc.participants[i];
                if (p.joinedAtMs > now) continue;
                const joinKey = buildJoinKey(lc.spotId, p.personaId);
                if (seenJoinKeys.has(joinKey)) continue;
                seenJoinKeys.add(joinKey);
                const persona = personaLookup.get(p.personaId);
                consider(PRIORITY.joined, () => ({
                    id: `${lc.spotId}-joined-${p.personaId}`,
                    personaEmoji: persona?.emoji ?? '👋',
                    personaName: persona?.name ?? '누군가',
                    predicate: `${lc.category} 모임에 참여했어요`,
                    timestamp: Date.now(),
                }));
            }

            // closed
            const closedKey = buildSeenKey(lc.spotId, 'closed');
            if (!seenSpotKeys.has(closedKey) && now >= lc.closedAtMs) {
                seenSpotKeys.add(closedKey);
                consider(PRIORITY.closed, () => ({
                    id: `${lc.spotId}-closed`,
                    personaEmoji: '🏁',
                    personaName: lc.category,
                    predicate: `모임이 종료됐어요`,
                    timestamp: Date.now(),
                }));
            }
        }

        return best ? (best as Candidate).event : null;
    };

    return { push };
}
