'use client';

import { useState } from 'react';
import { Check, ChevronDown, MessageCircle, SendHorizonal } from 'lucide-react';
import { formatReverseOfferApprovalProgress } from '../model/types';
import type { ChatMessage, ChatRoom } from '../model/types';
import { getChatRooms } from '../model/mock';
import { BottomSheet, EmptyState, StatusBadge, TypeBadge } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

interface ChatWorkspaceProps {
    initialRoomId: string | null;
    fallbackMessage?: string;
}

function formatDateChip(iso: string): string {
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    }).format(new Date(iso));
}

function formatTime(iso: string): string {
    return new Intl.DateTimeFormat('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(iso));
}

function formatRelativeMeta(iso: string): string {
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(iso));
}

function getRoomInitial(room: ChatRoom): string {
    if (room.category === 'personal') {
        return room.partnerName.slice(0, 1);
    }

    return room.title.slice(0, 1);
}

function createLocalMessage(room: ChatRoom, content: string): ChatMessage {
    return {
        id: `local-message-${room.id}-${Date.now()}`,
        kind: 'message',
        authorId: room.currentUserId,
        authorName: room.currentUserName,
        content,
        createdAt: new Date().toISOString(),
    };
}

function getThreadEntryText(message: Exclude<ChatMessage, { kind: 'system' }>) {
    if (message.kind === 'message') {
        return message.content;
    }

    if (message.kind === 'vote') {
        return `투표 · ${message.vote.question}`;
    }

    if (message.kind === 'schedule') {
        return `일정 · ${message.schedule.title}`;
    }

    if (message.kind === 'reverse-offer') {
        return `역제안 · ${formatReverseOfferApprovalProgress(message.reverseOffer)}`;
    }

    if (message.kind === 'proposal')
        return `제안 · ${message.proposal.suggestedAmount.toLocaleString('ko-KR')}원`;
    if (message.kind === 'file') return `파일 · ${message.file.name}`;
    return '';
}

function sortRoomsByUpdatedAt(rooms: ChatRoom[]): ChatRoom[] {
    return [...rooms].sort(
        (left, right) =>
            new Date(right.updatedAt).getTime() -
            new Date(left.updatedAt).getTime(),
    );
}

function MessageThread({
    room,
    messages,
}: {
    room: ChatRoom;
    messages: ChatMessage[];
}) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white px-4 py-4">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-gray-400 uppercase">
                        Thread
                    </p>
                    <h2 className="mt-1 text-base font-bold text-gray-900">
                        {room.category === 'personal'
                            ? '개인 메시지'
                            : '스팟 메시지'}
                    </h2>
                </div>
                <div className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700">
                    {
                        messages.filter((message) => message.kind !== 'system')
                            .length
                    }
                    개 메시지
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {messages.map((message, index) => {
                    const dateKey = new Date(message.createdAt)
                        .toISOString()
                        .slice(0, 10);
                    const previousDateKey = messages[index - 1]
                        ? new Date(messages[index - 1].createdAt)
                              .toISOString()
                              .slice(0, 10)
                        : null;
                    const shouldRenderDateChip = previousDateKey !== dateKey;

                    const mine =
                        message.kind === 'message' &&
                        message.authorId === room.currentUserId;

                    return (
                        <div key={message.id} className="flex flex-col gap-3">
                            {shouldRenderDateChip && (
                                <div className="flex justify-center">
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500">
                                        {formatDateChip(message.createdAt)}
                                    </span>
                                </div>
                            )}

                            {message.kind === 'system' ? (
                                <div className="flex justify-center">
                                    <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] text-gray-500 shadow-sm">
                                        {message.content}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={cn(
                                        'flex flex-col gap-1',
                                        mine ? 'items-end' : 'items-start',
                                    )}
                                >
                                    <span className="px-1 text-[11px] font-medium text-gray-400">
                                        {mine ? '나' : message.authorName}
                                    </span>
                                    <div
                                        className={cn(
                                            'max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                                            mine
                                                ? 'rounded-br-md bg-brand-800 text-white'
                                                : 'rounded-bl-md border border-gray-100 bg-gray-50 text-gray-800',
                                        )}
                                    >
                                        {getThreadEntryText(message)}
                                    </div>
                                    <span className="px-1 text-[11px] text-gray-400">
                                        {formatTime(message.createdAt)}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function RoomSwitcherSheet({
    rooms,
    activeRoomId,
    open,
    onClose,
    onSelect,
}: {
    rooms: ChatRoom[];
    activeRoomId: string;
    open: boolean;
    onClose: () => void;
    onSelect: (roomId: string) => void;
}) {
    const personalRooms = rooms.filter((room) => room.category === 'personal');
    const spotRooms = rooms.filter((room) => room.category === 'spot');

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title="대화방 전환"
            snapPoint="half"
        >
            <div className="flex flex-col gap-5 pb-3">
                <RoomSection
                    title="개인 채팅"
                    rooms={personalRooms}
                    activeRoomId={activeRoomId}
                    onSelect={onSelect}
                />
                <RoomSection
                    title="스팟 채팅"
                    rooms={spotRooms}
                    activeRoomId={activeRoomId}
                    onSelect={onSelect}
                />
            </div>
        </BottomSheet>
    );
}

function RoomSection({
    title,
    rooms,
    activeRoomId,
    onSelect,
}: {
    title: string;
    rooms: ChatRoom[];
    activeRoomId: string;
    onSelect: (roomId: string) => void;
}) {
    return (
        <section className="flex flex-col gap-2.5">
            <h3 className="text-xs font-semibold tracking-[0.16em] text-gray-400 uppercase">
                {title}
            </h3>
            <div className="flex flex-col gap-2">
                {rooms.map((room) => {
                    const active = room.id === activeRoomId;

                    return (
                        <button
                            key={room.id}
                            type="button"
                            onClick={() => onSelect(room.id)}
                            className={cn(
                                'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                                active
                                    ? 'border-brand-200 bg-brand-50'
                                    : 'border-gray-100 bg-white',
                            )}
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-sm font-bold text-gray-700">
                                {getRoomInitial(room)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-gray-900">
                                        {room.title}
                                    </p>
                                    {room.category === 'spot' && room.spot ? (
                                        <TypeBadge
                                            type={room.spot.type}
                                            size="sm"
                                        />
                                    ) : (
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                                            Personal
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 truncate text-xs text-gray-500">
                                    {room.subtitle}
                                </p>
                            </div>
                            {active && (
                                <Check size={18} className="text-brand-700" />
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export function ChatWorkspace({
    initialRoomId,
    fallbackMessage,
}: ChatWorkspaceProps) {
    const [rooms, setRooms] = useState<ChatRoom[]>(() =>
        sortRoomsByUpdatedAt(getChatRooms()),
    );
    const resolvedInitialRoomId =
        initialRoomId && rooms.some((room) => room.id === initialRoomId)
            ? initialRoomId
            : (rooms[0]?.id ?? '');
    const [activeRoomId, setActiveRoomId] = useState<string>(
        resolvedInitialRoomId,
    );
    const [draft, setDraft] = useState('');
    const [isRoomSheetOpen, setIsRoomSheetOpen] = useState(false);
    const [messagesByRoom, setMessagesByRoom] = useState<
        Record<string, ChatMessage[]>
    >(() => Object.fromEntries(rooms.map((room) => [room.id, room.messages])));

    if (rooms.length === 0) {
        return (
            <div className="px-4 py-8">
                <EmptyState
                    icon={<MessageCircle size={36} />}
                    title="표시할 채팅방이 없어요"
                    description="현재는 로컬 프레젠테이션용 대화방이 준비되지 않았어요."
                />
            </div>
        );
    }

    const activeRoom =
        rooms.find((room) => room.id === activeRoomId) ?? rooms[0];

    if (!activeRoom) {
        return null;
    }

    const activeMessages = messagesByRoom[activeRoom.id] ?? activeRoom.messages;

    function handleSend() {
        const trimmedDraft = draft.trim();

        if (!trimmedDraft) {
            return;
        }

        setMessagesByRoom((prev) => ({
            ...prev,
            [activeRoom.id]: [
                ...(prev[activeRoom.id] ?? activeRoom.messages),
                createLocalMessage(activeRoom, trimmedDraft),
            ],
        }));
        setRooms((prev) =>
            sortRoomsByUpdatedAt(
                prev.map((room) =>
                    room.id === activeRoom.id
                        ? {
                              ...room,
                              updatedAt: new Date().toISOString(),
                          }
                        : room,
                ),
            ),
        );
        setDraft('');
    }

    function handleSelectRoom(roomId: string) {
        setActiveRoomId(roomId);
        setDraft('');
        setIsRoomSheetOpen(false);
    }

    return (
        <>
            <div className="min-h-screen bg-surface pb-40">
                <div className="flex flex-col gap-4 px-4 py-4">
                    {fallbackMessage && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            {fallbackMessage}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsRoomSheetOpen(true)}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 text-left"
                    >
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold tracking-[0.16em] text-gray-400 uppercase">
                                Room switcher
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="truncate text-base font-bold text-gray-900">
                                    {activeRoom.title}
                                </span>
                                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                                    {activeRoom.category === 'personal'
                                        ? '개인 채팅'
                                        : '스팟 채팅'}
                                </span>
                            </div>
                            <p className="mt-1 truncate text-sm text-gray-500">
                                {activeRoom.subtitle}
                            </p>
                        </div>
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                            <ChevronDown size={18} />
                        </div>
                    </button>

                    <section className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-base font-bold text-brand-800">
                                {getRoomInitial(activeRoom)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    {activeRoom.category === 'spot' ? (
                                        <>
                                            <TypeBadge
                                                type={activeRoom.spot.type}
                                                size="sm"
                                            />
                                            <StatusBadge
                                                status={activeRoom.spot.status}
                                                size="sm"
                                            />
                                        </>
                                    ) : (
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                            {activeRoom.presenceLabel}
                                        </span>
                                    )}
                                </div>
                                <h1 className="mt-3 text-lg font-bold leading-tight text-gray-900">
                                    {activeRoom.title}
                                </h1>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                    {activeRoom.description}
                                </p>
                                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                    <span>{activeRoom.metaLabel}</span>
                                    <span>·</span>
                                    <span>
                                        {formatRelativeMeta(
                                            activeRoom.updatedAt,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <MessageThread
                        room={activeRoom}
                        messages={activeMessages}
                    />
                </div>

                <div className="fixed inset-x-0 bottom-20 z-20 mx-auto max-w-107.5 px-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-3">
                        <div className="flex items-end gap-3">
                            <label className="min-w-0 flex-1">
                                <span className="sr-only">메시지 입력</span>
                                <textarea
                                    value={draft}
                                    onChange={(event) =>
                                        setDraft(event.target.value)
                                    }
                                    rows={1}
                                    placeholder={`${activeRoom.title}에게 메시지 보내기`}
                                    className="min-h-11 w-full resize-none rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!draft.trim()}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-800 text-white disabled:bg-gray-300"
                                aria-label="메시지 보내기"
                            >
                                <SendHorizonal size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <RoomSwitcherSheet
                rooms={rooms}
                activeRoomId={activeRoom.id}
                open={isRoomSheetOpen}
                onClose={() => setIsRoomSheetOpen(false)}
                onSelect={handleSelectRoom}
            />
        </>
    );
}
