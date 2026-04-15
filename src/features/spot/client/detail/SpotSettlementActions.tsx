'use client';

import { useState } from 'react';
import { Button, Modal } from '@frontend/design-system';
import type {
    SpotForfeitPool,
    SpotStatus,
    SpotWorkflow,
} from '@/entities/spot/types';
import { useApproveSpotSettlement } from '../../model/use-spot';
import { SettlementSubmitSheet } from './SettlementSubmitSheet';

type Props = {
    spotId: string;
    spotStatus: SpotStatus;
    workflow: SpotWorkflow;
    currentUserId: string;
    authorId: string;
    forfeitPool?: SpotForfeitPool;
};

export function SpotSettlementActions({
    spotId,
    spotStatus,
    workflow,
    currentUserId,
    authorId,
    forfeitPool,
}: Props) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const approve = useApproveSpotSettlement();

    if (spotStatus !== 'CLOSED') {
        return null;
    }

    const settlement = workflow.settlementApproval;
    const isAuthor = currentUserId === authorId;
    const showSubmit = isAuthor && settlement?.status !== 'APPROVED';
    const showApprove = !isAuthor && settlement?.status === 'PENDING';

    if (!showSubmit && !showApprove) {
        return null;
    }

    const handleApprove = async () => {
        await approve.mutateAsync(spotId);
        setApproveOpen(false);
    };

    return (
        <div className="mt-4 flex flex-col gap-2">
            {showSubmit && (
                <Button
                    fullWidth
                    size="lg"
                    className="rounded-full bg-accent"
                    onClick={() => setSheetOpen(true)}
                >
                    {settlement?.status === 'PENDING'
                        ? '정산 수정 제출'
                        : '정산 제출하기'}
                </Button>
            )}
            {showApprove && (
                <Button
                    fullWidth
                    size="lg"
                    className="rounded-full bg-accent"
                    onClick={() => setApproveOpen(true)}
                >
                    정산 승인하기
                </Button>
            )}

            <SettlementSubmitSheet
                spotId={spotId}
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                forfeitPool={forfeitPool}
            />

            <Modal
                open={approveOpen}
                onClose={() => {
                    if (approve.isPending) return;
                    setApproveOpen(false);
                }}
                title="정산을 승인하시겠어요?"
                description="승인 후에는 금액을 변경할 수 없어요."
                size="sm"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            disabled={approve.isPending}
                            onClick={() => setApproveOpen(false)}
                        >
                            닫기
                        </Button>
                        <Button
                            disabled={approve.isPending}
                            onClick={handleApprove}
                            className="bg-accent"
                        >
                            승인 확정
                        </Button>
                    </>
                }
            />
        </div>
    );
}
