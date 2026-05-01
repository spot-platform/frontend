// Preparation 입력 섹션 — Offer/Request 폼 + 서포터 제안서에서 재사용.

'use client';

import type { Preparation } from '@/entities/spot/simulation-types';

type PreparationInputSectionProps = {
    value?: Preparation;
    onChange: (next: Preparation | undefined) => void;
    optional?: boolean;
};

function ensurePrep(value: Preparation | undefined): Preparation {
    return (
        value ?? {
            host_provides: [],
            partner_brings: [],
            weather_contingency: null,
            safety_notes: [],
            host_tip: null,
        }
    );
}

export function PreparationInputSection({
    value,
    onChange,
    optional = false,
}: PreparationInputSectionProps) {
    const prep = ensurePrep(value);

    const update = (patch: Partial<Preparation>) =>
        onChange({ ...prep, ...patch });

    return (
        <section className="flex flex-col gap-4">
            <header>
                <h3 className="text-sm font-semibold text-gray-800">
                    준비물 / 안전
                    {optional && (
                        <span className="ml-2 text-xs font-normal text-gray-400">
                            (선택)
                        </span>
                    )}
                </h3>
                {optional && (
                    <p className="mt-1 text-xs text-gray-400">
                        비워두면 매칭된 서포터가 정리해 보낼 수 있어요.
                    </p>
                )}
            </header>

            <StringList
                label="호스트가 준비"
                items={prep.host_provides}
                onChange={(items) => update({ host_provides: items })}
                placeholder="예: 핸드드립 키트"
            />
            <StringList
                label="참가자가 준비"
                items={prep.partner_brings}
                onChange={(items) => update({ partner_brings: items })}
                placeholder="예: 편한 옷차림"
            />
            <StringList
                label="안전 안내"
                items={prep.safety_notes}
                onChange={(items) => update({ safety_notes: items })}
                placeholder="예: 뜨거운 도구 주의"
            />

            <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-600">
                    날씨 대비 (선택)
                </span>
                <input
                    type="text"
                    placeholder="우천 시 대처 방법 등"
                    value={prep.weather_contingency ?? ''}
                    onChange={(e) =>
                        update({ weather_contingency: e.target.value || null })
                    }
                    className="rounded-md border border-gray-200 px-2 py-1 text-sm"
                />
            </label>

            <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-600">
                    호스트 팁 (선택)
                </span>
                <textarea
                    rows={2}
                    placeholder="참가자에게 미리 알려주고 싶은 한 줄"
                    value={prep.host_tip ?? ''}
                    onChange={(e) =>
                        update({ host_tip: e.target.value || null })
                    }
                    className="rounded-md border border-gray-200 px-2 py-1 text-sm leading-relaxed"
                />
            </label>
        </section>
    );
}

function StringList({
    label,
    items,
    onChange,
    placeholder,
}: {
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <p className="mb-1.5 text-xs font-semibold text-gray-600">
                {label}
            </p>
            <ul className="flex flex-col gap-1">
                {items.map((it, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={it}
                            onChange={(e) => {
                                const next = [...items];
                                next[idx] = e.target.value;
                                onChange(next);
                            }}
                            className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                onChange(items.filter((_, i) => i !== idx))
                            }
                            className="shrink-0 text-xs text-gray-400 hover:text-gray-700"
                        >
                            삭제
                        </button>
                    </li>
                ))}
            </ul>
            <button
                type="button"
                onClick={() => onChange([...items, ''])}
                className="mt-1.5 rounded-md border border-dashed border-gray-300 px-3 py-1 text-xs font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700"
            >
                + 항목 추가
            </button>
        </div>
    );
}
