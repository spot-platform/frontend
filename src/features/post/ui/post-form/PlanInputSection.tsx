// PlanV3 입력 섹션 — Offer/Request 폼 + 서포터 제안서에서 재사용.

'use client';

import type { PlanStep, PlanV3 } from '@/entities/spot/simulation-types';
import {
    PostAddButton,
    PostRemoveButton,
    PostTextInput,
    PostTextarea,
} from '../FormControls';

type PlanInputSectionProps = {
    value?: PlanV3;
    onChange: (next: PlanV3 | undefined) => void;
    optional?: boolean;
};

const EMPTY_STEP: PlanStep = {
    time: '',
    activity: '',
    place_id: null,
    intent: null,
};

function ensurePlan(value: PlanV3 | undefined): PlanV3 {
    return value ?? { steps: [], total_duration_minutes: 60 };
}

export function PlanInputSection({
    value,
    onChange,
    optional = false,
}: PlanInputSectionProps) {
    const plan = ensurePlan(value);

    const updateStep = (idx: number, patch: Partial<PlanStep>) => {
        const steps = plan.steps.map((s, i) =>
            i === idx ? { ...s, ...patch } : s,
        );
        onChange({ ...plan, steps });
    };

    const removeStep = (idx: number) => {
        const steps = plan.steps.filter((_, i) => i !== idx);
        if (steps.length === 0 && optional) {
            onChange(undefined);
            return;
        }
        onChange({ ...plan, steps });
    };

    const addStep = () => {
        onChange({ ...plan, steps: [...plan.steps, { ...EMPTY_STEP }] });
    };

    return (
        <section className="flex flex-col gap-3">
            <header className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-gray-800">
                    활동 계획
                    {optional && (
                        <span className="ml-2 text-xs font-normal text-gray-400">
                            (선택)
                        </span>
                    )}
                </h3>
                <label className="flex items-center gap-2 text-xs text-gray-500">
                    총 시간(분)
                    <PostTextInput
                        type="number"
                        min={0}
                        variant="compact"
                        align="right"
                        className="w-24"
                        value={plan.total_duration_minutes}
                        onChange={(e) =>
                            onChange({
                                ...plan,
                                total_duration_minutes:
                                    Number(e.target.value) || 0,
                            })
                        }
                    />
                </label>
            </header>

            {optional && (
                <p className="text-xs text-gray-400">
                    비워두면 매칭된 서포터가 함께 채울 수 있어요.
                </p>
            )}

            <ul className="flex flex-col gap-2">
                {plan.steps.map((step, idx) => (
                    <li
                        key={idx}
                        className="flex flex-col gap-2 rounded-2xl bg-gray-50/70 px-3 py-3"
                    >
                        <div className="flex items-center gap-2">
                            <PostTextInput
                                type="text"
                                placeholder="시간 (예: 19:00)"
                                value={step.time}
                                onChange={(e) =>
                                    updateStep(idx, { time: e.target.value })
                                }
                                variant="compact"
                                className="w-28"
                            />
                            <PostTextInput
                                type="text"
                                placeholder="활동 내용"
                                value={step.activity}
                                onChange={(e) =>
                                    updateStep(idx, {
                                        activity: e.target.value,
                                    })
                                }
                                variant="compact"
                                className="min-w-0 flex-1"
                            />
                            <PostRemoveButton onClick={() => removeStep(idx)}>
                                삭제
                            </PostRemoveButton>
                        </div>
                        <PostTextarea
                            placeholder="이 시간을 고른 이유 한 줄 (선택)"
                            value={step.intent ?? ''}
                            onChange={(e) =>
                                updateStep(idx, {
                                    intent: e.target.value || null,
                                })
                            }
                            rows={2}
                            variant="compact"
                        />
                    </li>
                ))}
            </ul>

            <PostAddButton onClick={addStep} className="self-start">
                단계 추가
            </PostAddButton>
        </section>
    );
}
