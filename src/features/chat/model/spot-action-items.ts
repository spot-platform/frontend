import type { SharedFile, SpotSchedule, SpotVote } from '@/entities/spot/types';
import type {
    ChatScheduleDraft,
    ChatActionTarget,
    ChatActionKind,
    ChatReverseOfferSummary,
    SpotActionItem,
    SpotChatRoom,
} from './types';

export function buildScheduleSubtitle(schedule: SpotSchedule): string {
    if (schedule.confirmedSlot) {
        const { date, hour } = schedule.confirmedSlot;
        return `${date} ${hour}:00 확정`;
    }

    const participantCounts = new Map<string, number>();

    for (const slot of schedule.proposedSlots) {
        participantCounts.set(
            slot.date,
            Math.max(
                participantCounts.get(slot.date) ?? 0,
                slot.availableUserIds.length,
            ),
        );
    }

    const bestDate = [...participantCounts.entries()].sort(
        (left, right) => right[1] - left[1],
    )[0];
    const total = schedule.proposedSlots.length;

    return bestDate
        ? `${total}개 후보 · ${bestDate[0]} 유력`
        : `${total}개 후보 수집 중`;
}

function createVoteActionItem(
    room: SpotChatRoom,
    vote: SpotVote,
): SpotActionItem {
    return {
        kind: 'vote',
        id: vote.id,
        roomId: room.id,
        roomTitle: room.title,
        vote,
        updatedAt: room.updatedAt,
    };
}

function createScheduleDraft(room: SpotChatRoom): ChatScheduleDraft | null {
    if (!room.spot.schedule) {
        return null;
    }

    return {
        id: getSpotScheduleActionId(room.id),
        spotId: room.spot.id,
        title: room.spot.schedule.confirmedSlot ? '일정 확정' : '일정 조율 중',
        description: buildScheduleSubtitle(room.spot.schedule),
        metaLabel: room.spot.schedule.confirmedSlot ? '일정 확정' : '조율 중',
        createdAt: room.updatedAt,
    };
}

function createScheduleActionItem(room: SpotChatRoom): SpotActionItem | null {
    const schedule = createScheduleDraft(room);

    if (!schedule) {
        return null;
    }

    return {
        kind: 'schedule',
        id: schedule.id,
        roomId: room.id,
        roomTitle: room.title,
        schedule,
        updatedAt: room.updatedAt,
    };
}

function createFileActionItem(
    room: SpotChatRoom,
    file: SharedFile,
): SpotActionItem {
    return {
        kind: 'file',
        id: file.id,
        roomId: room.id,
        roomTitle: room.title,
        file,
        updatedAt: file.uploadedAt,
    };
}

function createReverseOfferActionItem(
    room: SpotChatRoom,
    reverseOffer: ChatReverseOfferSummary,
): SpotActionItem {
    return {
        kind: 'reverse-offer',
        id: reverseOffer.id,
        roomId: room.id,
        roomTitle: room.title,
        reverseOffer,
        updatedAt: reverseOffer.updatedAt,
    };
}

export function getSpotScheduleActionId(roomId: string): string {
    return `schedule-${roomId}`;
}

export function getSpotActionItems(room: SpotChatRoom): SpotActionItem[] {
    const items: SpotActionItem[] = [];

    if (room.reverseOffer) {
        items.push(createReverseOfferActionItem(room, room.reverseOffer));
    }

    items.push(
        ...room.spot.votes.map((vote) => createVoteActionItem(room, vote)),
    );

    const scheduleItem = createScheduleActionItem(room);

    if (scheduleItem) {
        items.push(scheduleItem);
    }

    items.push(
        ...room.spot.files.map((file) => createFileActionItem(room, file)),
    );

    return items;
}

export function getShareableSpotActionItems(
    room: SpotChatRoom,
): Array<Extract<SpotActionItem, { kind: 'vote' | 'schedule' | 'file' }>> {
    return getSpotActionItems(room).filter(
        (
            item,
        ): item is Extract<
            SpotActionItem,
            { kind: 'vote' | 'schedule' | 'file' }
        > =>
            item.kind === 'vote' ||
            item.kind === 'schedule' ||
            item.kind === 'file',
    );
}

export function findSpotActionItem(
    room: SpotChatRoom,
    target: ChatActionTarget,
): SpotActionItem | null {
    return (
        getSpotActionItems(room).find(
            (item) =>
                item.kind === target.actionKind && item.id === target.actionId,
        ) ?? null
    );
}

export function getChatActionTarget(item: SpotActionItem): ChatActionTarget {
    return {
        actionKind: item.kind,
        actionId: item.id,
    };
}

export function isSupportedChatActionKind(
    value: string,
): value is ChatActionKind {
    return (
        value === 'vote' ||
        value === 'schedule' ||
        value === 'file' ||
        value === 'reverse-offer'
    );
}
