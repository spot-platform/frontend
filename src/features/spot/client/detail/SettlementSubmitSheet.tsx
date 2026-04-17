'use client';

import { useMemo, useState } from 'react';
import { BottomSheet, Button, Input, Textarea } from '@frontend/design-system';
import { IconX } from '@tabler/icons-react';
import type { SpotForfeitPool } from '@/entities/spot/types';
import { useSubmitSpotSettlement } from '../../model/use-spot';

type LineItemDraft = {
    id: string;
    label: string;
    amount: string;
};

function emptyLineItem(): LineItemDraft {
    return {
        id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: '',
        amount: '',
    };
}

type Props = {
    spotId: string;
    open: boolean;
    onClose: () => void;
    forfeitPool?: SpotForfeitPool;
};

export function SettlementSubmitSheet({
    spotId,
    open,
    onClose,
    forfeitPool,
}: Props) {
    const [items, setItems] = useState<LineItemDraft[]>([
        emptyLineItem(),
        emptyLineItem(),
    ]);
    const [summary, setSummary] = useState('');
    const submit = useSubmitSpotSettlement();

    const userTotal = useMemo(
        () =>
            items.reduce((total, item) => {
                const parsed = Number.parseInt(item.amount, 10);
                return Number.isFinite(parsed) && parsed > 0
                    ? total + parsed
                    : total;
            }, 0),
        [items],
    );

    const forfeitToPool = forfeitPool?.toPool ?? 0;
    const grandTotal = userTotal + forfeitToPool;

    const canSubmit =
        !submit.isPending &&
        summary.trim().length > 0 &&
        items.some(
            (item) =>
                item.label.trim().length > 0 &&
                Number.parseInt(item.amount, 10) > 0,
        );

    const handleItemChange = (
        id: string,
        patch: Partial<Pick<LineItemDraft, 'label' | 'amount'>>,
    ) => {
        setItems((previous) =>
            previous.map((item) =>
                item.id === id ? { ...item, ...patch } : item,
            ),
        );
    };

    const handleRemove = (id: string) => {
        setItems((previous) =>
            previous.length > 1
                ? previous.filter((item) => item.id !== id)
                : previous,
        );
    };

    const handleAdd = () =>
        setItems((previous) => [...previous, emptyLineItem()]);

    const handleSubmit = async () => {
        if (!canSubmit) return;

        const lineItems = items
            .map((item) => ({
                label: item.label.trim(),
                amount: Number.parseInt(item.amount, 10) || 0,
            }))
            .filter((item) => item.label.length > 0 && item.amount > 0);

        await submit.mutateAsync({
            id: spotId,
            payload: { lineItems, summary: summary.trim() },
        });

        setItems([emptyLineItem(), emptyLineItem()]);
        setSummary('');
        onClose();
    };

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title="정산 제출"
            snapPoint="full"
        >
            <div className="space-y-5 pb-6">
                <section className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">
                        정산 항목
                    </p>
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-2"
                            >
                                <Input
                                    className="flex-1"
                                    placeholder="항목명"
                                    value={item.label}
                                    onChange={(event) =>
                                        handleItemChange(item.id, {
                                            label: event.target.value,
                                        })
                                    }
                                />
                                <Input
                                    className="w-32"
                                    inputMode="numeric"
                                    placeholder="금액"
                                    value={item.amount}
                                    onChange={(event) =>
                                        handleItemChange(item.id, {
                                            amount: event.target.value.replace(
                                                /\D/g,
                                                '',
                                            ),
                                        })
                                    }
                                />
                                <button
                                    type="button"
                                    aria-label="항목 제거"
                                    className="mt-2 rounded-full p-1 text-gray-400 hover:bg-gray-100"
                                    onClick={() => handleRemove(item.id)}
                                >
                                    <IconX className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={handleAdd}
                        className="rounded-full"
                    >
                        + 항목 추가
                    </Button>
                </section>

                {forfeitToPool > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                        <div>
                            <p className="text-xs font-semibold text-gray-400">
                                자동 산입
                            </p>
                            <p className="italic text-gray-500">
                                이탈자 보증금 (정산 풀 편입분)
                            </p>
                        </div>
                        <p className="font-semibold text-gray-700">
                            {forfeitToPool.toLocaleString('ko-KR')}P
                        </p>
                    </div>
                )}

                <section className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                        정산 요약
                    </p>
                    <Textarea
                        value={summary}
                        onChange={(event) => setSummary(event.target.value)}
                        placeholder="예: 재료비, 대관비, 소모품비 등을 포함합니다."
                        rows={4}
                    />
                </section>

                <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm">
                    <span className="text-gray-500">총 승인 예정 금액</span>
                    <span className="font-bold text-gray-900">
                        {grandTotal.toLocaleString('ko-KR')}P
                    </span>
                </div>

                <Button
                    fullWidth
                    size="lg"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    className="rounded-full bg-accent"
                >
                    {submit.isPending ? '제출 중…' : '정산 제출하기'}
                </Button>
            </div>
        </BottomSheet>
    );
}
