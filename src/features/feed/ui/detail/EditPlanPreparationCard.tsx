'use client';

// 디테일 페이지에서 작성자/매칭된 서포터가 plan/preparation 을 수정/추가할 수 있는
// inline 카드. 보기 모드는 server-rendered Section 들이 담당하고, 이 카드는 "수정"
// 진입점 역할만 한다.

import { useState } from 'react';
import { Modal, Button } from '@frontend/design-system';
import type { PlanV3, Preparation } from '@/entities/spot/simulation-types';
import { PlanInputSection } from '@/features/post/ui/post-form/PlanInputSection';
import { PreparationInputSection } from '@/features/post/ui/post-form/PreparationInputSection';
import { updateMockFeedDetails } from '../../model/mock';

type Props = {
    feedId: string;
    initialPlan?: PlanV3;
    initialPreparation?: Preparation;
};

export function EditPlanPreparationCard({
    feedId,
    initialPlan,
    initialPreparation,
}: Props) {
    const [open, setOpen] = useState(false);
    const [plan, setPlan] = useState<PlanV3 | undefined>(initialPlan);
    const [preparation, setPreparation] = useState<Preparation | undefined>(
        initialPreparation,
    );
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        try {
            updateMockFeedDetails(feedId, { plan, preparation });
            setOpen(false);
            // server component 재호출 위한 새로고침
            if (typeof window !== 'undefined') window.location.reload();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="border-b border-gray-200 px-4 py-3">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="text-xs font-semibold text-accent hover:underline"
                >
                    {initialPlan || initialPreparation
                        ? '활동 계획 / 준비물 수정'
                        : '활동 계획 / 준비물 추가'}
                </button>
            </div>

            <Modal
                open={open}
                onClose={() => {
                    if (isSaving) return;
                    setOpen(false);
                }}
                title="활동 계획 / 준비물"
                description="저장하면 디테일 페이지와 매칭된 채팅에 반영돼요."
                size="lg"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            disabled={isSaving}
                            onClick={() => setOpen(false)}
                        >
                            취소
                        </Button>
                        <Button
                            disabled={isSaving}
                            onClick={handleSave}
                            className="bg-accent"
                        >
                            저장
                        </Button>
                    </>
                }
            >
                <div className="flex max-h-[60vh] flex-col gap-6 overflow-y-auto">
                    <PlanInputSection
                        value={plan}
                        onChange={setPlan}
                        optional
                    />
                    <PreparationInputSection
                        value={preparation}
                        onChange={setPreparation}
                        optional
                    />
                </div>
            </Modal>
        </>
    );
}
