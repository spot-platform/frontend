import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { spotServerApi } from '@/features/spot/api/spot-api';
import { SpotSummaryCard } from '@/features/spot/ui/detail/SpotSummaryCard';
import { SpotStatusBanner } from '@/features/spot/ui/detail/SpotStatusBanner';
import { ParticipantList } from '@/features/spot/ui/detail/ParticipantList';
import { ScheduleSection } from '@/features/spot/ui/detail/schedule/ScheduleSection';
import { VoteSection } from '@/features/spot/ui/detail/vote/VoteSection';
import { ChecklistSection } from '@/features/spot/ui/detail/checklist/ChecklistSection';
import { FileShareSection } from '@/features/spot/ui/detail/files/FileShareSection';
import { ProgressNoteSection } from '@/features/spot/ui/detail/notes/ProgressNoteSection';
import { TimelineSection } from '@/features/spot/ui/detail/TimelineSection';
import { ReviewSection } from '@/features/spot/ui/detail/review/ReviewSection';
import { ChatQuickLink } from '@/features/spot/ui/detail/ChatQuickLink';
import { SpotDetailClient } from '@/features/spot/client/detail/SpotDetailClient';
import { SpotSettlementActions } from '@/features/spot/client/detail/SpotSettlementActions';
import { SpotWorkflowSection } from '@/features/spot/ui/detail/SpotWorkflowSection';
import { SpotDetailSkeleton } from '@/features/spot/ui/skeletons/SpotDetailSkeleton';
import { hasMockSpot, MOCK_SPOT_WORKFLOWS } from '@/features/spot/model/mock';
import { DetailHeader, DetailPageShell } from '@/shared/ui';

const MOCK_USER_ID = 'user-me';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const { data: spot } = await spotServerApi.get(id);
        return { title: spot.title };
    } catch {
        return { title: `Spot ${id}` };
    }
}

async function SpotDetailContent({ spotId }: { spotId: string }) {
    const [
        { data: spot },
        { data: participants },
        { data: schedule },
        { data: votes },
        { data: checklist },
        { data: files },
        { data: notes },
        { data: reviews },
    ] = await Promise.all([
        spotServerApi.get(spotId),
        spotServerApi.getParticipants(spotId),
        spotServerApi.getSchedule(spotId),
        spotServerApi.getVotes(spotId),
        spotServerApi.getChecklist(spotId),
        spotServerApi.getFiles(spotId),
        spotServerApi.getNotes(spotId),
        spotServerApi.getReviews(spotId),
    ]);

    const hasActionBar = spot.status === 'OPEN' || spot.status === 'MATCHED';
    const workflow = MOCK_SPOT_WORKFLOWS[spotId];

    return (
        <DetailPageShell
            gap="md"
            topInset="sm"
            bottomInset={hasActionBar ? 'action-bar' : 'lg'}
        >
            <SpotSummaryCard spot={spot} />
            <SpotStatusBanner status={spot.status} />
            <ParticipantList participants={participants} />
            {workflow && (
                <SpotWorkflowSection
                    workflow={workflow}
                    forfeitPool={spot.forfeitPool}
                    actions={
                        <SpotSettlementActions
                            spotId={spotId}
                            spotStatus={spot.status}
                            workflow={workflow}
                            currentUserId={MOCK_USER_ID}
                            authorId={spot.authorId}
                            forfeitPool={spot.forfeitPool}
                        />
                    }
                />
            )}
            {!workflow && spot.status === 'CLOSED' && (
                <SpotWorkflowSection
                    workflow={{
                        spotId: spot.id,
                        progressLabel: '정산 대기',
                    }}
                    forfeitPool={spot.forfeitPool}
                    actions={
                        <SpotSettlementActions
                            spotId={spotId}
                            spotStatus={spot.status}
                            workflow={{
                                spotId: spot.id,
                                progressLabel: '정산 대기',
                            }}
                            currentUserId={MOCK_USER_ID}
                            authorId={spot.authorId}
                            forfeitPool={spot.forfeitPool}
                        />
                    }
                />
            )}
            <ScheduleSection schedule={schedule} />
            <VoteSection votes={votes} />
            <ChecklistSection checklist={checklist} />
            <FileShareSection files={files} />
            <ProgressNoteSection notes={notes} />
            <TimelineSection events={spot.timeline} />
            <ReviewSection
                reviews={reviews}
                spot={spot}
                currentUserId={MOCK_USER_ID}
            />
            <ChatQuickLink spotId={spotId} />
            <SpotDetailClient
                spot={spot}
                currentUserId={MOCK_USER_ID}
                schedule={schedule}
                participants={participants}
            />
        </DetailPageShell>
    );
}

export default async function SpotDetailPage({ params }: Props) {
    const { id } = await params;

    if (!hasMockSpot(id)) {
        notFound();
    }

    return (
        <>
            <DetailHeader showShare />
            <Suspense
                fallback={
                    <DetailPageShell topInset="sm" bottomInset="lg">
                        <SpotDetailSkeleton />
                    </DetailPageShell>
                }
            >
                <SpotDetailContent spotId={id} />
            </Suspense>
        </>
    );
}
