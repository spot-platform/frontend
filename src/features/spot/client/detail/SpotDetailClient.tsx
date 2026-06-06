'use client';

import { toast } from '@frontend/design-system';
import { AnimatePresence } from 'framer-motion';
import { ScheduleModal } from '../../ui/detail/schedule/ScheduleModal';
import { VoteModal } from '../../ui/detail/vote/VoteModal';
import { ChecklistModal } from '../../ui/detail/checklist/ChecklistModal';
import { FileShareModal } from '../../ui/detail/files/FileShareModal';
import { ProgressNoteModal } from '../../ui/detail/notes/ProgressNoteModal';
import { ReviewModal } from '../../ui/detail/review/ReviewModal';
import { ActionBar } from '../../ui/detail/ActionBar';
import {
    useMatchSpot,
    useCancelSpot,
    useCompleteSpot,
} from '../../model/use-spot';
import { useSpotDetailStore } from '../../model/spot-detail-store';
import type {
    Spot,
    SpotSchedule,
    SpotParticipant,
} from '@/entities/spot/types';

interface SpotDetailClientProps {
    spot: Spot;
    currentUserId: string;
    schedule?: SpotSchedule | null;
    participants: SpotParticipant[];
}

export function SpotDetailClient({
    spot,
    currentUserId,
    schedule,
    participants,
}: SpotDetailClientProps) {
    const { activeModal, selectedVoteId, closeModal } = useSpotDetailStore();

    const { mutate: matchSpot, isPending: isMatching } = useMatchSpot();
    const { mutate: cancelSpot, isPending: isCancelling } = useCancelSpot();
    const { mutate: completeSpot, isPending: isCompleting } = useCompleteSpot();

    const participantRole = participants.find(
        (participant) => participant.userId === currentUserId,
    )?.role;
    const canManageSpot =
        spot.authorId === currentUserId || participantRole === 'SUPPORTER';

    const partnerNickname =
        participants.find((p) => p.userId !== currentUserId)?.nickname ?? '';

    return (
        <>
            <ActionBar
                spot={spot}
                currentUserId={currentUserId}
                canManageSpot={canManageSpot}
                isBusy={isMatching || isCancelling || isCompleting}
                onMatch={() =>
                    matchSpot(spot.id, {
                        onSuccess: () =>
                            toast.success('스팟 매칭을 시작했어요.'),
                        onError: () => toast.error('스팟 매칭에 실패했어요.'),
                    })
                }
                onCancel={() =>
                    cancelSpot(spot.id, {
                        onSuccess: () => toast.success('스팟을 취소했어요.'),
                        onError: () => toast.error('스팟 취소에 실패했어요.'),
                    })
                }
                onComplete={() =>
                    completeSpot(spot.id, {
                        onSuccess: () =>
                            toast.success('스팟 완료를 요청했어요.'),
                        onError: () =>
                            toast.error('스팟 완료 처리에 실패했어요.'),
                    })
                }
            />

            <AnimatePresence>
                {activeModal === 'schedule' && (
                    <ScheduleModal
                        key="schedule"
                        open
                        onClose={closeModal}
                        spotId={spot.id}
                        schedule={schedule ?? undefined}
                        currentUserId={currentUserId}
                    />
                )}
                {activeModal === 'vote-create' && (
                    <VoteModal
                        key="vote-create"
                        mode="create"
                        open
                        onClose={closeModal}
                        spotId={spot.id}
                    />
                )}
                {activeModal === 'vote-cast' && selectedVoteId && (
                    <VoteModal
                        key="vote-cast"
                        mode="cast"
                        open
                        onClose={closeModal}
                        spotId={spot.id}
                        voteId={selectedVoteId}
                        currentUserId={currentUserId}
                    />
                )}
                {activeModal === 'checklist' && (
                    <ChecklistModal
                        key="checklist"
                        open
                        onClose={closeModal}
                        spotId={spot.id}
                    />
                )}
                {activeModal === 'files' && (
                    <FileShareModal
                        key="files"
                        open
                        onClose={closeModal}
                        spotId={spot.id}
                    />
                )}
                {activeModal === 'note' && (
                    <ProgressNoteModal
                        key="note"
                        open
                        onClose={closeModal}
                        spotId={spot.id}
                    />
                )}
                {activeModal === 'review' && (
                    <ReviewModal
                        key="review"
                        open
                        onClose={closeModal}
                        spotId={spot.id}
                        targetNickname={partnerNickname}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
