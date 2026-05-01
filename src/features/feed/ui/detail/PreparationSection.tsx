// 준비물(Preparation) 섹션 — /feed/[id] 디테일 페이지 본문에서 사용.

import type { Preparation } from '@/entities/spot/simulation-types';

type PreparationSectionProps = {
    preparation?: Preparation;
    emptyHint?: string;
};

export function PreparationSection({
    preparation,
    emptyHint,
}: PreparationSectionProps) {
    if (!preparation) {
        return (
            <div className="border-b border-gray-200 px-4 py-5">
                <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase mb-3">
                    준비물
                </p>
                <p className="text-sm text-gray-500">
                    {emptyHint ?? '아직 등록된 준비물이 없어요.'}
                </p>
            </div>
        );
    }

    const {
        host_provides,
        partner_brings,
        weather_contingency,
        safety_notes,
        host_tip,
    } = preparation;

    const hasContent =
        host_provides.length > 0 ||
        partner_brings.length > 0 ||
        weather_contingency !== null ||
        safety_notes.length > 0 ||
        host_tip !== null;

    if (!hasContent) {
        return (
            <div className="border-b border-gray-200 px-4 py-5">
                <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase mb-3">
                    준비물
                </p>
                <p className="text-sm text-gray-500">
                    {emptyHint ?? '아직 등록된 준비물이 없어요.'}
                </p>
            </div>
        );
    }

    return (
        <div className="border-b border-gray-200 px-4 py-5">
            <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase mb-3">
                준비물
            </p>
            <div className="flex flex-col gap-3">
                {host_provides.length > 0 && (
                    <PrepList label="호스트가 준비" items={host_provides} />
                )}
                {partner_brings.length > 0 && (
                    <PrepList label="참가자 준비" items={partner_brings} />
                )}
                {safety_notes.length > 0 && (
                    <PrepList label="안전 안내" items={safety_notes} />
                )}
                {weather_contingency && (
                    <p className="text-sm leading-relaxed text-gray-600">
                        <span className="font-semibold text-gray-700">
                            날씨 대비 ·{' '}
                        </span>
                        {weather_contingency}
                    </p>
                )}
                {host_tip && (
                    <p className="text-sm leading-relaxed text-gray-600">
                        <span className="font-semibold text-gray-700">
                            호스트 팁 ·{' '}
                        </span>
                        {host_tip}
                    </p>
                )}
            </div>
        </div>
    );
}

function PrepList({ label, items }: { label: string; items: string[] }) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {label}
            </p>
            <ul className="mt-1 flex flex-col gap-1">
                {items.map((it, idx) => (
                    <li
                        key={`${idx}-${it}`}
                        className="flex gap-2 text-sm leading-relaxed text-gray-600"
                    >
                        <span
                            aria-hidden
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400"
                        />
                        <span>{it}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
