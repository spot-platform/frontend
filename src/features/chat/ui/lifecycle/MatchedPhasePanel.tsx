'use client';

import {
    IconCalendarEvent,
    IconChartBar,
    IconChecklist,
    IconFile,
    IconUsers,
} from '@tabler/icons-react';
import { UserAvatarStatic } from '@/shared/ui';
import type {
    ScheduleSlot,
    SpotChecklist,
    SpotParticipant,
    SpotVote,
    SharedFile,
} from '@/entities/spot/types';
import type { SpotChatRoom } from '../../model/types';

type Props = { room: SpotChatRoom };

function formatSlot(slot: ScheduleSlot): string {
    const date = new Date(slot.date);
    const weekday = new Intl.DateTimeFormat('ko-KR', {
        weekday: 'short',
    }).format(date);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일 (${weekday}) ${slot.hour}시`;
}

function formatFileSize(sizeBytes: number): string {
    if (sizeBytes >= 1024 * 1024)
        return `${(sizeBytes / (1024 * 1024)).toFixed(1)}MB`;
    if (sizeBytes >= 1024) return `${Math.round(sizeBytes / 1024)}KB`;
    return `${sizeBytes}B`;
}

export function MatchedPhasePanel({ room }: Props) {
    const spot = room.spot;

    return (
        <section className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
            <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-brand-800 uppercase">
                    진행 단계
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                    스팟이 진행 중이에요
                </p>
            </div>

            <ScheduleTile schedule={spot.schedule} />
            <ChecklistTile checklist={spot.checklist} />
            <ParticipantsTile participants={spot.participants} />
            <VotesTile votes={spot.votes} />
            <FilesTile files={spot.files} />
        </section>
    );
}

function Tile({
    icon,
    title,
    subtitle,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-brand-100 bg-card p-3">
            <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-800">
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="truncate text-[11px] text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {children && <div className="mt-2">{children}</div>}
        </div>
    );
}

function ScheduleTile({
    schedule,
}: {
    schedule?: { proposedSlots: ScheduleSlot[]; confirmedSlot?: ScheduleSlot };
}) {
    if (!schedule) {
        return (
            <Tile
                icon={<IconCalendarEvent size={14} />}
                title="일정"
                subtitle="아직 제안된 일정이 없어요"
            />
        );
    }
    if (schedule.confirmedSlot) {
        return (
            <Tile
                icon={<IconCalendarEvent size={14} />}
                title="확정 일정"
                subtitle={formatSlot(schedule.confirmedSlot)}
            />
        );
    }
    return (
        <Tile
            icon={<IconCalendarEvent size={14} />}
            title={`제안된 일정 ${schedule.proposedSlots.length}개`}
            subtitle={
                schedule.proposedSlots[0]
                    ? `최근: ${formatSlot(schedule.proposedSlots[0])}`
                    : undefined
            }
        />
    );
}

function ChecklistTile({ checklist }: { checklist?: SpotChecklist }) {
    if (!checklist || checklist.items.length === 0) {
        return (
            <Tile
                icon={<IconChecklist size={14} />}
                title="체크리스트"
                subtitle="아직 준비 항목이 없어요"
            />
        );
    }
    const done = checklist.items.filter((i) => i.completed).length;
    const total = checklist.items.length;
    const percent = Math.round((done / total) * 100);
    return (
        <Tile
            icon={<IconChecklist size={14} />}
            title={`체크리스트 ${done}/${total}`}
            subtitle={`${percent}% 완료`}
        >
            <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-brand-800"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </Tile>
    );
}

function ParticipantsTile({
    participants,
}: {
    participants: SpotParticipant[];
}) {
    const MAX = 6;
    return (
        <Tile
            icon={<IconUsers size={14} />}
            title={`참가자 ${participants.length}명`}
        >
            <div className="flex flex-wrap gap-2">
                {participants.slice(0, MAX).map((p) => (
                    <UserAvatarStatic
                        key={p.userId}
                        userId={p.userId}
                        nickname={p.nickname}
                        size="sm"
                    />
                ))}
                {participants.length > MAX && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                        +{participants.length - MAX}
                    </div>
                )}
            </div>
        </Tile>
    );
}

function VotesTile({ votes }: { votes: SpotVote[] }) {
    const active = votes.filter((v) => !v.closedAt);
    if (active.length === 0) {
        return (
            <Tile
                icon={<IconChartBar size={14} />}
                title="투표"
                subtitle="진행 중인 투표가 없어요"
            />
        );
    }
    const first = active[0];
    const totalVotes = first.options.reduce(
        (sum, o) => sum + o.voterIds.length,
        0,
    );
    return (
        <Tile
            icon={<IconChartBar size={14} />}
            title={first.question}
            subtitle={`${active.length}개 진행 중 · 총 ${totalVotes}표`}
        />
    );
}

function FilesTile({ files }: { files: SharedFile[] }) {
    if (files.length === 0) {
        return (
            <Tile
                icon={<IconFile size={14} />}
                title="공유 파일"
                subtitle="공유된 파일이 없어요"
            />
        );
    }
    const latest = files[0];
    return (
        <Tile
            icon={<IconFile size={14} />}
            title={`공유 파일 ${files.length}개`}
            subtitle={`최근: ${latest.name} · ${formatFileSize(latest.sizeBytes)}`}
        />
    );
}
