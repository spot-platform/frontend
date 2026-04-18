'use client';

import { SectionCard } from '../SectionCard';
import { VoteOptionBar } from './VoteOptionBar';
import { useSpotDetailStore } from '../../../model/spot-detail-store';
import type { SpotVote } from '@/entities/spot/types';

interface VoteSectionProps {
    votes: SpotVote[];
}

export function VoteSection({ votes }: VoteSectionProps) {
    const openModal = useSpotDetailStore((s) => s.openModal);
    const activeVotes = votes.filter((v) => !v.closedAt);

    return (
        <SectionCard
            title="투표"
            manageModal="vote-create"
            manageLabel="새 투표"
        >
            {activeVotes.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    진행 중인 투표가 없어요
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    {activeVotes.map((vote) => {
                        const totalVotes = vote.options.reduce(
                            (sum, o) => sum + o.voterIds.length,
                            0,
                        );
                        return (
                            <div key={vote.id}>
                                <p className="mb-2 text-xs font-semibold text-text-secondary">
                                    {vote.question}
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {vote.options.slice(0, 2).map((opt) => (
                                        <VoteOptionBar
                                            key={opt.id}
                                            option={opt}
                                            totalVotes={totalVotes}
                                        />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        openModal('vote-cast', {
                                            voteId: vote.id,
                                        })
                                    }
                                    className="mt-2 text-xs font-semibold text-brand-800"
                                >
                                    투표하기 →
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </SectionCard>
    );
}
