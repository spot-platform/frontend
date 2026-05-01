// 활동 계획(PlanV3) 섹션 — /feed/[id] 디테일 페이지 본문에서 사용.
// 비어 있을 때(REQUEST + 서포터 미입력)는 안내 문구로 안내.

import type { PlanV3, ResolvedPlace } from '@/entities/spot/simulation-types';

type PlanSectionProps = {
    plan?: PlanV3;
    /** plan 의 place_id 를 이름으로 풀기 위한 venue 목록 (primary_pin + venue_anchors). */
    places?: ResolvedPlace[];
    /** 비었을 때 표시할 빈 상태 hint. */
    emptyHint?: string;
};

export function PlanSection({ plan, places, emptyHint }: PlanSectionProps) {
    if (!plan || plan.steps.length === 0) {
        return (
            <div className="border-b border-gray-200 px-4 py-5">
                <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase mb-3">
                    활동 계획
                </p>
                <p className="text-sm text-gray-500">
                    {emptyHint ?? '아직 등록된 계획이 없어요.'}
                </p>
            </div>
        );
    }

    const placeNameById = new Map<number, string>();
    for (const p of places ?? []) placeNameById.set(p.place_id, p.name);

    return (
        <div className="border-b border-gray-200 px-4 py-5">
            <div className="mb-3 flex items-baseline justify-between">
                <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase">
                    활동 계획
                </p>
                <span className="text-xs text-gray-500">
                    총 {plan.total_duration_minutes}분
                </span>
            </div>
            <ol className="flex flex-col gap-2.5">
                {plan.steps.map((step, idx) => {
                    const placeName =
                        step.place_id !== null
                            ? placeNameById.get(step.place_id)
                            : null;
                    return (
                        <li
                            key={`${idx}-${step.time}`}
                            className="rounded-lg border border-gray-100 px-3 py-2.5"
                        >
                            <div className="flex items-baseline justify-between gap-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="shrink-0 text-sm font-bold tabular-nums text-gray-900">
                                        {step.time}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-800">
                                        {step.activity}
                                    </span>
                                </div>
                                {placeName && (
                                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                                        {placeName}
                                    </span>
                                )}
                            </div>
                            {step.intent && (
                                <p className="mt-1 text-xs italic leading-relaxed text-gray-500">
                                    {step.intent}
                                </p>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
