// 가격 분해(PriceBreakdown) 섹션 — /feed/[id] 디테일 페이지 본문에서 사용.

import type {
    AddOnMechanism,
    PriceBreakdown,
} from '@/entities/spot/simulation-types';

type PriceSectionProps = {
    priceBreakdown?: PriceBreakdown;
    /** 가격 분해가 없을 때 fallback 으로 보여줄 단일 가격 (피드 카드의 price). */
    fallbackPrice?: number;
    emptyHint?: string;
};

const ADDON_MECHANISM_LABEL: Record<AddOnMechanism, string> = {
    fixed: '정액 추가',
    funding: 'N분의1 펀딩',
    realcost: '실비 분담',
};

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export function PriceSection({
    priceBreakdown,
    fallbackPrice,
    emptyHint,
}: PriceSectionProps) {
    if (!priceBreakdown) {
        return (
            <div className="border-b border-gray-200 px-4 py-5">
                <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase mb-3">
                    가격 안내
                </p>
                {fallbackPrice !== undefined ? (
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                            {won(fallbackPrice)}
                        </span>
                        <span className="text-xs text-gray-500">
                            세부 가격은 매칭 후 협의해요
                        </span>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        {emptyHint ?? '아직 가격이 정해지지 않았어요.'}
                    </p>
                )}
            </div>
        );
    }

    const {
        base_fee,
        included_items,
        optional_addons,
        refund_policy,
        summary_line,
    } = priceBreakdown;

    return (
        <div className="border-b border-gray-200 px-4 py-5">
            <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase mb-3">
                가격 안내
            </p>
            {summary_line && (
                <p className="mb-3 text-sm leading-relaxed text-gray-700">
                    {summary_line}
                </p>
            )}
            <div className="rounded-lg bg-gray-50 px-3 py-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                        참가비
                    </span>
                    <span className="text-base font-bold tabular-nums text-gray-900">
                        {won(base_fee)}
                    </span>
                </div>
                {included_items.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1">
                        {included_items.map((it, idx) => (
                            <li
                                key={`${idx}-${it.name}`}
                                className="flex items-baseline justify-between gap-2 text-xs"
                            >
                                <span className="text-gray-500">
                                    포함 · {it.name}
                                </span>
                                <span className="text-right text-gray-600">
                                    {it.value}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                {optional_addons.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1.5 border-t border-gray-200 pt-2">
                        {optional_addons.map((a, idx) => (
                            <li
                                key={`${idx}-${a.name}`}
                                className="text-xs leading-relaxed"
                            >
                                <div className="flex items-baseline justify-between gap-2">
                                    <span className="text-gray-500">
                                        {a.name} ·{' '}
                                        {ADDON_MECHANISM_LABEL[a.mechanism]}
                                    </span>
                                    <span className="font-semibold tabular-nums text-gray-700">
                                        +{won(a.price)}
                                    </span>
                                </div>
                                {a.explanation && (
                                    <p className="mt-0.5 text-[11px] leading-snug text-gray-400">
                                        {a.explanation}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {refund_policy && (
                    <p className="mt-2 text-[11px] leading-snug text-gray-500">
                        환불 ·{' '}
                        {refund_policy.note ??
                            `${refund_policy.cutoff_hours}시간 전까지 환불 가능`}
                    </p>
                )}
            </div>
        </div>
    );
}
