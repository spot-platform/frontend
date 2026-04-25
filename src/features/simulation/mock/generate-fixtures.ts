// Sim run mock fixture 생성 스크립트.
//
// 실행:
//   pnpm tsx src/features/simulation/mock/generate-fixtures.ts
//   (산출물: ./run-fixtures/demo_run_001.{manifest,movements,lifecycle}.json)
//
// 설계 의도:
//   - deterministic seed(고정). 매 실행 동일 산출물 → fixture 를 commit 가능.
//   - 합성 분포는 실제 simulator (수원시 24-tick 첫 청크) 통계에 맞춤:
//       JOIN→CHECK_IN tick 차이 분포 mode=8, 6~15 균등 가중
//       이동시간 평균 ≈ 9 tick
//   - protagonist agents 는 approved spot 에 host/joiner 로 직접 관여(movement 보유).
//   - background agents 는 같은 region 거주, movement 없음 — wander 는 클라이언트가 합성.
//   - tick 길이 48 (= 작은 fixture). 24 청크 두 개 분량.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
    LifecycleEvent,
    Movement,
    PlaceGeometry,
    SimAgent,
    SimManifest,
} from '../../../entities/spot/sim-stream-types';

// ─── seed 고정 RNG ──────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
    let t = seed >>> 0;
    return () => {
        t = (t + 0x6d2b79f5) >>> 0;
        let r = t;
        r = Math.imul(r ^ (r >>> 15), r | 1);
        r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

const rand = mulberry32(0xc0ffee01);
const pickInt = (min: number, max: number) =>
    Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

// ─── 수원시 region 정의 (실측 region_id 사용) ───────────────────────────────

const REGIONS: { id: string; label: string; lat: number; lng: number }[] = [
    { id: 'emd_sinchon', label: '신촌동', lat: 37.262, lng: 127.029 },
    { id: 'emd_jangan', label: '장안동', lat: 37.301, lng: 127.012 },
    { id: 'emd_yeonmu', label: '연무동', lat: 37.286, lng: 127.034 },
];

// ─── 페르소나 풀 ────────────────────────────────────────────────────────────

const ARCHETYPES = ['explorer', 'helper', 'creator', 'connector', 'learner'] as const;
const EMOJIS = ['🏃', '🧘', '💻', '🥾', '🎨', '🎵', '☕', '📚', '🍳', '🧗'] as const;
const NAMES = [
    '민지', '서연', '지훈', '현우', '수빈', '하연', '도윤', '예린',
    '재민', '소연', '준호', '유진', '정우', '채원', '승민', '시은',
    '도하', '예원', '서준', '하린', '주원', '나윤', '건우', '지원',
] as const;

// ─── 분포 헬퍼 ──────────────────────────────────────────────────────────────

/** §9 실측 분포: tick 차이 6~15, mode=8 가중치 ~3, 나머지 1. */
const TRAVEL_DIST = [
    [6, 1], [7, 1], [8, 3], [9, 1], [10, 1],
    [11, 1], [12, 1], [13, 1], [14, 1], [15, 1],
] as const;
const TRAVEL_TOTAL = TRAVEL_DIST.reduce((s, [, w]) => s + w, 0);

function sampleTravelTicks(): number {
    let r = rand() * TRAVEL_TOTAL;
    for (const [tick, w] of TRAVEL_DIST) {
        r -= w;
        if (r <= 0) return tick;
    }
    return 8;
}

/** spot 의 시각적 좌표를 region 중심에서 ±150~400m 반경에 배치. */
function spotCoordIn(region: (typeof REGIONS)[number]): { lat: number; lng: number } {
    const r = 150 + rand() * 250; // meters
    const angle = rand() * Math.PI * 2;
    const dLat = (r * Math.sin(angle)) / 111_320;
    const dLng = (r * Math.cos(angle)) / (111_320 * Math.cos((region.lat * Math.PI) / 180));
    return { lat: region.lat + dLat, lng: region.lng + dLng };
}

// ─── 합성 파라미터 ──────────────────────────────────────────────────────────

const RUN_ID = 'demo_run_001';
const DATASET_VERSION = 'mock_v1';
const TOTAL_TICKS = 48;
const CHUNK_SIZE = 24;
const APPROVED_SPOT_COUNT = 60;
const BACKGROUND_AGENT_COUNT = 200;
const TICK_DURATION_MS_DEFAULT = 1000;

// ─── 빌드 ───────────────────────────────────────────────────────────────────

function makeAgent(
    seq: number,
    role: 'protagonist' | 'background',
    region: (typeof REGIONS)[number],
): SimAgent {
    const name = pick(NAMES);
    const archetype = pick(ARCHETYPES);
    return {
        agent_id: `A_${role[0]}_${seq.toString().padStart(4, '0')}`,
        agent_role: role,
        archetype,
        name,
        emoji: pick(EMOJIS),
        home_region_id: region.id,
    };
}

function build(): {
    manifest: SimManifest;
    movements: Movement[];
    lifecycle: LifecycleEvent[];
} {
    // 1) places: region + spot
    const places: PlaceGeometry[] = REGIONS.map((r) => ({
        place_id: r.id,
        place_type: 'region',
        lat: r.lat,
        lng: r.lng,
        label: r.label,
    }));

    // 2) approved spots — region 분배(균등).
    type SpotMeta = {
        spot_id: string;
        region: (typeof REGIONS)[number];
        host_agent_id: string;
        join_count: number;
        create_tick: number;
        start_tick: number;
        complete_tick: number;
    };
    const spots: SpotMeta[] = [];

    // 3) protagonist agents — 각 spot 의 host 1 + joiner 3~6명. 중복 허용 적게.
    const protagonistAgents: SimAgent[] = [];
    let agentSeq = 0;

    for (let i = 0; i < APPROVED_SPOT_COUNT; i++) {
        const region = REGIONS[i % REGIONS.length];
        const create_tick = pickInt(0, TOTAL_TICKS - 18);
        const start_tick = create_tick + pickInt(10, 16);
        const complete_tick = start_tick + pickInt(2, 5);
        const host = makeAgent(++agentSeq, 'protagonist', region);
        protagonistAgents.push(host);

        spots.push({
            spot_id: `S_${(i + 1).toString().padStart(4, '0')}`,
            region,
            host_agent_id: host.agent_id,
            join_count: pickInt(3, 6),
            create_tick,
            start_tick,
            complete_tick,
        });
    }

    // joiner agent 풀: spot 당 평균 4명 → 약 240명. 일부는 두 spot 참여.
    const joinerPool: SimAgent[] = [];
    for (let i = 0; i < APPROVED_SPOT_COUNT * 4; i++) {
        const region = REGIONS[i % REGIONS.length];
        joinerPool.push(makeAgent(++agentSeq, 'protagonist', region));
    }
    protagonistAgents.push(...joinerPool);

    // 4) background agents
    const backgroundAgents: SimAgent[] = [];
    for (let i = 0; i < BACKGROUND_AGENT_COUNT; i++) {
        const region = REGIONS[i % REGIONS.length];
        backgroundAgents.push(makeAgent(++agentSeq, 'background', region));
    }

    // 5) spot place geometry 추가
    for (const s of spots) {
        const c = spotCoordIn(s.region);
        places.push({
            place_id: s.spot_id,
            place_type: 'spot',
            lat: c.lat,
            lng: c.lng,
            region_id: s.region.id,
            label: s.spot_id,
        });
    }

    // 6) movements + lifecycle 합성
    const movements: Movement[] = [];
    const lifecycle: LifecycleEvent[] = [];

    for (const s of spots) {
        // SPOT_CREATED + host movement
        lifecycle.push({
            tick: s.create_tick,
            event_type: 'SPOT_CREATED',
            spot_id: s.spot_id,
        });

        const hostTravel = Math.min(
            sampleTravelTicks(),
            s.start_tick - s.create_tick - 1,
        );
        movements.push({
            agent_id: s.host_agent_id,
            depart_tick: s.create_tick,
            arrive_tick: s.create_tick + Math.max(1, hostTravel),
            from_place_id: s.region.id,
            to_place_id: s.spot_id,
            reason: 'create_spot',
            spot_id: s.spot_id,
        });

        // joiner movements
        const joiners: SimAgent[] = [];
        for (let j = 0; j < s.join_count; j++) {
            const joiner = pick(joinerPool);
            joiners.push(joiner);
            const joinTick = pickInt(s.create_tick, Math.max(s.create_tick, s.start_tick - 8));
            const travel = sampleTravelTicks();
            const arrive = Math.min(joinTick + travel, s.start_tick - 1);
            const safeArrive = Math.max(arrive, joinTick + 1);
            movements.push({
                agent_id: joiner.agent_id,
                depart_tick: joinTick,
                arrive_tick: safeArrive,
                from_place_id: joiner.home_region_id,
                to_place_id: s.spot_id,
                reason: 'join_spot',
                spot_id: s.spot_id,
            });
        }

        // SPOT_MATCHED → SPOT_CONFIRMED → SPOT_STARTED → SPOT_COMPLETED
        lifecycle.push({
            tick: s.start_tick - 2,
            event_type: 'SPOT_MATCHED',
            spot_id: s.spot_id,
        });
        lifecycle.push({
            tick: s.start_tick - 1,
            event_type: 'SPOT_CONFIRMED',
            spot_id: s.spot_id,
        });
        lifecycle.push({
            tick: s.start_tick,
            event_type: 'SPOT_STARTED',
            spot_id: s.spot_id,
        });
        lifecycle.push({
            tick: s.complete_tick,
            event_type: 'SPOT_COMPLETED',
            spot_id: s.spot_id,
        });

        // 일부(약 8%) NO_SHOW: joiner 한 명이 도착 못 함 — movement 는 안 만들지만 lifecycle 만 발화.
        if (rand() < 0.08 && joiners.length > 0) {
            const ns = joiners[joiners.length - 1];
            lifecycle.push({
                tick: s.start_tick,
                event_type: 'NO_SHOW',
                spot_id: s.spot_id,
                agent_id: ns.agent_id,
            });
        }

        // host + joiner 의 go_home movement (complete 직후)
        const homeDepart = s.complete_tick;
        const homeArrive = Math.min(
            homeDepart + sampleTravelTicks(),
            TOTAL_TICKS - 1,
        );
        if (homeArrive > homeDepart) {
            movements.push({
                agent_id: s.host_agent_id,
                depart_tick: homeDepart,
                arrive_tick: homeArrive,
                from_place_id: s.spot_id,
                to_place_id: s.region.id,
                reason: 'go_home',
            });
            for (const j of joiners) {
                movements.push({
                    agent_id: j.agent_id,
                    depart_tick: homeDepart,
                    arrive_tick: homeArrive,
                    from_place_id: s.spot_id,
                    to_place_id: j.home_region_id,
                    reason: 'go_home',
                });
            }
        }
    }

    // 정렬
    movements.sort((a, b) => a.depart_tick - b.depart_tick);
    lifecycle.sort((a, b) => a.tick - b.tick);

    // dedup protagonist agents (joiner 가 host pool 에 있을 수도)
    const seen = new Set<string>();
    const dedupedProtagonist = protagonistAgents.filter((a) => {
        if (seen.has(a.agent_id)) return false;
        seen.add(a.agent_id);
        return true;
    });

    const manifest: SimManifest = {
        run_id: RUN_ID,
        dataset_version: DATASET_VERSION,
        approved_spot_count: APPROVED_SPOT_COUNT,
        filter_kind: 'published_only',
        total_ticks: TOTAL_TICKS,
        tick_duration_ms_default: TICK_DURATION_MS_DEFAULT,
        chunk_size_ticks: CHUNK_SIZE,
        agents: [...dedupedProtagonist, ...backgroundAgents],
        places,
    };

    return { manifest, movements, lifecycle };
}

// ─── 실행 진입점 ────────────────────────────────────────────────────────────

function main() {
    // 출력 위치 우선순위: --out CLI 인자 > FIXTURES_OUT_DIR env > import.meta.url 기준 ./run-fixtures.
    // 번들러로 실행될 때 import.meta.url 이 의도한 경로를 못 가리킬 수 있어 명시 옵션을 둔다.
    const args = process.argv.slice(2);
    const outArgIdx = args.indexOf('--out');
    let outDir: string;
    if (outArgIdx >= 0 && args[outArgIdx + 1]) {
        outDir = resolve(args[outArgIdx + 1]);
    } else if (process.env.FIXTURES_OUT_DIR) {
        outDir = resolve(process.env.FIXTURES_OUT_DIR);
    } else {
        const here = dirname(fileURLToPath(import.meta.url));
        outDir = resolve(here, 'run-fixtures');
    }
    mkdirSync(outDir, { recursive: true });

    const { manifest, movements, lifecycle } = build();

    writeFileSync(
        resolve(outDir, `${manifest.run_id}.manifest.json`),
        JSON.stringify(manifest, null, 2),
    );
    writeFileSync(
        resolve(outDir, `${manifest.run_id}.movements.json`),
        JSON.stringify(movements),
    );
    writeFileSync(
        resolve(outDir, `${manifest.run_id}.lifecycle.json`),
        JSON.stringify(lifecycle),
    );

    const proCount = manifest.agents.filter((a) => a.agent_role === 'protagonist').length;
    const bgCount = manifest.agents.filter((a) => a.agent_role === 'background').length;
    console.log(`✓ wrote fixtures to ${outDir}`);
    console.log(
        `  agents: ${manifest.agents.length} (protagonist=${proCount}, background=${bgCount})`,
    );
    console.log(`  places: ${manifest.places.length}`);
    console.log(`  movements: ${movements.length}`);
    console.log(`  lifecycle: ${lifecycle.length}`);
    console.log(`  total_ticks: ${manifest.total_ticks}`);
}

main();
