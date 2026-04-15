'use client';

import { useRouter } from 'next/navigation';
import { formatReverseOfferApprovalProgress } from '../model/types';
import type { ChatRoom, ChatMessage } from '../model/types';
import { cn } from '@/shared/lib/cn';

interface ChatRoomListProps {
    rooms: ChatRoom[];
}

function getLastMessage(room: ChatRoom): ChatMessage | undefined {
    const msgs = room.messages;
    for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].kind !== 'system') return msgs[i];
    }
    return msgs[msgs.length - 1];
}

function getLastMessageText(room: ChatRoom): string {
    const last = getLastMessage(room);
    if (!last) return '';
    if (last.kind === 'system') return last.content;
    if (last.kind === 'message') return last.content;
    if (last.kind === 'vote') return `투표: ${last.vote.question}`;
    if (last.kind === 'schedule') return `일정: ${last.schedule.title}`;
    if (last.kind === 'reverse-offer') {
        return `역제안: ${formatReverseOfferApprovalProgress(last.reverseOffer)}`;
    }
    if (last.kind === 'proposal')
        return `제안: ${last.proposal.suggestedAmount.toLocaleString('ko-KR')}원`;
    if (last.kind === 'file') return `파일: ${last.file.name}`;
    return '';
}

function formatListTime(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return new Intl.DateTimeFormat('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    }
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
    }).format(date);
}

function RoomAvatar({ room }: { room: ChatRoom }) {
    const initial =
        room.category === 'personal'
            ? room.partnerName.slice(0, 1)
            : room.title.slice(0, 1);

    return (
        <div className="relative shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-base font-bold text-gray-600">
                {initial}
            </div>
            {room.category === 'spot' && (
                <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-800 text-[8px] font-bold text-white">
                    S
                </div>
            )}
        </div>
    );
}

export function ChatRoomList({ rooms }: ChatRoomListProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col divide-y divide-gray-100">
            {rooms.map((room) => {
                const lastText = getLastMessageText(room);
                const timeLabel = formatListTime(room.updatedAt);

                return (
                    <button
                        key={room.id}
                        type="button"
                        onClick={() => router.push(`/chat/${room.id}`)}
                        className={cn(
                            'flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50',
                        )}
                    >
                        <RoomAvatar room={room} />

                        <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                    <span className="truncate text-sm font-semibold text-gray-900">
                                        {room.title}
                                    </span>
                                    {room.category === 'personal' &&
                                        room.unreadCount > 0 && (
                                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-800 px-1.5 text-[10px] font-bold text-white">
                                                {room.unreadCount}
                                            </span>
                                        )}
                                </div>
                                <span
                                    suppressHydrationWarning
                                    className="shrink-0 text-[11px] text-gray-400"
                                >
                                    {timeLabel}
                                </span>
                            </div>
                            <p className="mt-0.5 truncate text-sm text-gray-500">
                                {lastText}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
