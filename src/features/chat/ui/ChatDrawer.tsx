'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { IconChevronDown, IconChevronRight, IconX } from '@tabler/icons-react';
import { useMainChatStore } from '../model/use-main-chat-store';
import type { ChatRoom, PersonalChatRoom, SpotChatRoom } from '../model/types';

type ChatDrawerProps = {
    open: boolean;
    onClose: () => void;
};

const spring = { type: 'spring', stiffness: 380, damping: 34 } as const;
const PREVIEW_COUNT = 2;

function RoomAvatar({ room }: { room: ChatRoom }) {
    const initial =
        room.category === 'personal'
            ? room.partnerName.slice(0, 1)
            : room.title.slice(0, 1);

    return (
        <div className="relative shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
                {initial}
            </div>
            {room.category === 'spot' && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white" />
            )}
        </div>
    );
}

function getLastText(room: ChatRoom): string {
    const msgs = room.messages;
    if (msgs.length === 0) return '';
    const last = msgs[msgs.length - 1];
    if (last.kind === 'message' || last.kind === 'system') return last.content;
    if (last.kind === 'vote') return `투표: ${last.vote.question}`;
    if (last.kind === 'schedule') return `일정: ${last.schedule.title}`;
    return '';
}

function formatTime(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0)
        return new Intl.DateTimeFormat('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    if (diffDays === 1) return '어제';
    return `${diffDays}일 전`;
}

function RoomRow({ room, onClick }: { room: ChatRoom; onClick: () => void }) {
    const unread = room.category === 'personal' ? room.unreadCount : 0;
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors active:bg-zinc-100"
        >
            <RoomAvatar room={room} />
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[13.5px] font-semibold text-zinc-900">
                        {room.title}
                    </span>
                    <span
                        suppressHydrationWarning
                        className="shrink-0 text-[10.5px] font-medium text-zinc-400 tabular-nums"
                    >
                        {formatTime(room.updatedAt)}
                    </span>
                </div>
                <p className="mt-0.5 truncate text-[12.5px] leading-snug text-zinc-500">
                    {getLastText(room)}
                </p>
            </div>
            {unread > 0 && (
                <span className="flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white tabular-nums">
                    {unread > 99 ? '99+' : unread}
                </span>
            )}
        </button>
    );
}

type SectionProps = {
    title: string;
    count: number;
    rooms: ChatRoom[];
    onRoomClick: (room: ChatRoom) => void;
};

function ChatSection({ title, count, rooms, onRoomClick }: SectionProps) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? rooms : rooms.slice(0, PREVIEW_COUNT);
    const hasMore = rooms.length > PREVIEW_COUNT;

    return (
        <section>
            <div className="flex items-baseline justify-between px-5 pb-2.5">
                <h3 className="text-[11.5px] font-semibold tracking-[0.02em] text-zinc-500">
                    {title}
                </h3>
                <span className="text-[11px] font-medium text-zinc-400 tabular-nums">
                    {count}
                </span>
            </div>
            {rooms.length === 0 ? (
                <p className="mx-5 rounded-2xl border border-dashed border-zinc-200 px-4 py-5 text-center text-[12px] text-zinc-400">
                    아직 채팅이 없어요
                </p>
            ) : (
                <div className="flex flex-col gap-0.5 px-3">
                    {visible.map((room) => (
                        <RoomRow
                            key={room.id}
                            room={room}
                            onClick={() => onRoomClick(room)}
                        />
                    ))}
                    {hasMore && (
                        <button
                            type="button"
                            onClick={() => setExpanded((p) => !p)}
                            className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-[11.5px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
                        >
                            {expanded ? (
                                <>
                                    접기{' '}
                                    <IconChevronDown size={12} stroke={1.75} />
                                </>
                            ) : (
                                <>
                                    {rooms.length - PREVIEW_COUNT}개 더보기{' '}
                                    <IconChevronRight size={12} stroke={1.75} />
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
    const router = useRouter();
    const rooms = useMainChatStore((s) => s.rooms);

    const { personalRooms, feedRooms, spotRooms } = useMemo(() => {
        const personal: PersonalChatRoom[] = [];
        const feed: SpotChatRoom[] = [];
        const spot: SpotChatRoom[] = [];
        for (const room of rooms) {
            if (room.category === 'personal') personal.push(room);
            else if (room.sourceFeedId) feed.push(room);
            else spot.push(room);
        }
        return { personalRooms: personal, feedRooms: feed, spotRooms: spot };
    }, [rooms]);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, onClose]);

    const handleRoomClick = useCallback(
        (room: ChatRoom) => {
            onClose();
            if (room.category === 'personal')
                router.push(`/chat?roomId=${room.id}`);
            else router.push(`/chat?tab=team&spotId=${room.spot.id}`);
        },
        [onClose, router],
    );

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="drawer-fullscreen"
                    className="fixed inset-0 z-60 flex flex-col bg-white"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={spring}
                >
                    <div className="pointer-events-none sticky top-0 z-10 flex items-center justify-between gap-3 px-5 pt-[calc(env(safe-area-inset-top)+0.875rem)] pb-3">
                        <h2 className="text-[18px] font-bold tracking-[-0.01em] text-zinc-900">
                            채팅
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.96]"
                            aria-label="채팅 닫기"
                        >
                            <IconX size={18} stroke={1.75} />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
                        <div className="flex flex-col gap-8 px-1 pb-8 pt-2">
                            <ChatSection
                                title="개인 채팅"
                                count={personalRooms.length}
                                rooms={personalRooms}
                                onRoomClick={handleRoomClick}
                            />
                            <ChatSection
                                title="피드 채팅"
                                count={feedRooms.length}
                                rooms={feedRooms}
                                onRoomClick={handleRoomClick}
                            />
                            <ChatSection
                                title="스팟 채팅"
                                count={spotRooms.length}
                                rooms={spotRooms}
                                onRoomClick={handleRoomClick}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
