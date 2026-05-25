// PriceBreakdown 입력 섹션 — Offer/Request 폼에서 재사용.

'use client';

import type {
    AddOn,
    AddOnMechanism,
    IncludedItem,
    PriceBreakdown,
} from '@/entities/spot/simulation-types';
import {
    PostAddButton,
    PostRemoveButton,
    PostTextInput,
    PostTextarea,
} from '../FormControls';

const MECHANISMS: { value: AddOnMechanism; label: string }[] = [
    { value: 'fixed', label: '정액 추가' },
    { value: 'funding', label: 'N분의1 펀딩' },
    { value: 'realcost', label: '실비 분담' },
];

type PriceInputSectionProps = {
    value?: PriceBreakdown;
    onChange: (next: PriceBreakdown | undefined) => void;
    optional?: boolean;
};

function ensurePrice(value: PriceBreakdown | undefined): PriceBreakdown {
    return (
        value ?? {
            base_fee: 0,
            included_items: [],
            optional_addons: [],
            refund_policy: null,
            summary_line: null,
        }
    );
}

export function PriceInputSection({
    value,
    onChange,
    optional = false,
}: PriceInputSectionProps) {
    const price = ensurePrice(value);

    const update = (patch: Partial<PriceBreakdown>) => {
        onChange({ ...price, ...patch });
    };

    const addIncluded = () =>
        update({
            included_items: [
                ...price.included_items,
                { name: '', value: '' } as IncludedItem,
            ],
        });
    const updateIncluded = (idx: number, patch: Partial<IncludedItem>) =>
        update({
            included_items: price.included_items.map((it, i) =>
                i === idx ? { ...it, ...patch } : it,
            ),
        });
    const removeIncluded = (idx: number) =>
        update({
            included_items: price.included_items.filter((_, i) => i !== idx),
        });

    const addAddon = () =>
        update({
            optional_addons: [
                ...price.optional_addons,
                {
                    name: '',
                    price: 0,
                    mechanism: 'fixed',
                    explanation: null,
                } as AddOn,
            ],
        });
    const updateAddon = (idx: number, patch: Partial<AddOn>) =>
        update({
            optional_addons: price.optional_addons.map((a, i) =>
                i === idx ? { ...a, ...patch } : a,
            ),
        });
    const removeAddon = (idx: number) =>
        update({
            optional_addons: price.optional_addons.filter((_, i) => i !== idx),
        });

    return (
        <section className="flex flex-col gap-5">
            <header>
                <h3 className="text-sm font-semibold text-gray-800">
                    가격 분해
                    {optional && (
                        <span className="ml-2 text-xs font-normal text-gray-400">
                            (선택)
                        </span>
                    )}
                </h3>
                {optional && (
                    <p className="mt-1 text-xs text-gray-400">
                        비워두면 매칭된 서포터가 가격을 제안할 수 있어요.
                    </p>
                )}
            </header>

            <label className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700">참가비 (원)</span>
                <PostTextInput
                    type="number"
                    min={0}
                    value={price.base_fee}
                    onChange={(e) =>
                        update({ base_fee: Number(e.target.value) || 0 })
                    }
                    variant="compact"
                    align="right"
                    className="w-36"
                />
            </label>

            <div>
                <p className="mb-2 text-xs font-semibold text-gray-600">
                    포함 항목
                </p>
                <ul className="flex flex-col gap-2">
                    {price.included_items.map((it, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                            <PostTextInput
                                type="text"
                                placeholder="이름"
                                value={it.name}
                                onChange={(e) =>
                                    updateIncluded(idx, {
                                        name: e.target.value,
                                    })
                                }
                                variant="compact"
                                className="w-32"
                            />
                            <PostTextInput
                                type="text"
                                placeholder="설명"
                                value={it.value}
                                onChange={(e) =>
                                    updateIncluded(idx, {
                                        value: e.target.value,
                                    })
                                }
                                variant="compact"
                                className="min-w-0 flex-1"
                            />
                            <PostRemoveButton
                                onClick={() => removeIncluded(idx)}
                            />
                        </li>
                    ))}
                </ul>
                <PostAddButton onClick={addIncluded} className="mt-2">
                    포함 항목 추가
                </PostAddButton>
            </div>

            <div>
                <p className="mb-2 text-xs font-semibold text-gray-600">
                    선택 옵션 (추가 결제)
                </p>
                <ul className="flex flex-col gap-2">
                    {price.optional_addons.map((a, idx) => (
                        <li
                            key={idx}
                            className="flex flex-col gap-2 rounded-2xl bg-gray-50/70 px-3 py-3"
                        >
                            <div className="flex items-center gap-2">
                                <PostTextInput
                                    type="text"
                                    placeholder="이름"
                                    value={a.name}
                                    onChange={(e) =>
                                        updateAddon(idx, {
                                            name: e.target.value,
                                        })
                                    }
                                    variant="compact"
                                    className="min-w-0 flex-1"
                                />
                                <PostTextInput
                                    type="number"
                                    min={0}
                                    placeholder="가격"
                                    value={a.price}
                                    onChange={(e) =>
                                        updateAddon(idx, {
                                            price: Number(e.target.value) || 0,
                                        })
                                    }
                                    variant="compact"
                                    align="right"
                                    className="w-28"
                                />
                                <select
                                    value={a.mechanism}
                                    onChange={(e) =>
                                        updateAddon(idx, {
                                            mechanism: e.target
                                                .value as AddOnMechanism,
                                        })
                                    }
                                    className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                                >
                                    {MECHANISMS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <PostRemoveButton
                                    onClick={() => removeAddon(idx)}
                                />
                            </div>
                            <PostTextInput
                                type="text"
                                placeholder="설명 (선택)"
                                value={a.explanation ?? ''}
                                onChange={(e) =>
                                    updateAddon(idx, {
                                        explanation: e.target.value || null,
                                    })
                                }
                                variant="compact"
                            />
                        </li>
                    ))}
                </ul>
                <PostAddButton onClick={addAddon} className="mt-2">
                    선택 옵션 추가
                </PostAddButton>
            </div>

            <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-600">환불 정책</p>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                        시간 전까지 전액
                        <PostTextInput
                            type="number"
                            min={0}
                            value={price.refund_policy?.cutoff_hours ?? 24}
                            onChange={(e) =>
                                update({
                                    refund_policy: {
                                        cutoff_hours:
                                            Number(e.target.value) || 0,
                                        full_refund_until:
                                            price.refund_policy
                                                ?.full_refund_until ?? null,
                                        note: price.refund_policy?.note ?? null,
                                    },
                                })
                            }
                            variant="compact"
                            align="right"
                            className="w-20"
                        />
                    </label>
                </div>
                <PostTextInput
                    type="text"
                    placeholder="환불 안내 (선택)"
                    value={price.refund_policy?.note ?? ''}
                    onChange={(e) =>
                        update({
                            refund_policy: {
                                cutoff_hours:
                                    price.refund_policy?.cutoff_hours ?? 24,
                                full_refund_until:
                                    price.refund_policy?.full_refund_until ??
                                    null,
                                note: e.target.value || null,
                            },
                        })
                    }
                    variant="compact"
                />
            </div>

            <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-600">
                    한 줄 요약
                </span>
                <PostTextarea
                    rows={2}
                    placeholder="가격 한 줄 요약 (예: 참가비 25,000원에 원두/우유 포함)"
                    value={price.summary_line ?? ''}
                    onChange={(e) =>
                        update({ summary_line: e.target.value || null })
                    }
                    variant="compact"
                />
            </label>
        </section>
    );
}
