'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
    IconChevronDown,
    IconChevronRight,
    IconMessageCircle,
    IconUsers,
    IconX,
    IconBolt,
} from '@tabler/icons-react';
import { IconButton } from '@frontend/design-system';
import { useMainChatStore } from '../model/use-main-chat-store';
import type { ChatRoom, PersonalChatRoom, SpotChatRoom } from '../model/types';

type ChatDrawerProps = {
    open: boolean;
    onClose: () => void;
};

const spring = { type: 'spring', stiffness: 400, damping: 35 } as const;
const PREVIEW_COUNT = 3;

function RoomAvatar({ room }: { room: ChatRoom }) {
    const initial =
        room.category === 'personal'
            ? room.partnerName.slice(0, 1)
            : room.title.slice(0, 1);
    const bg = room.category === 'personal' ? 'bg-brand-100' : 'bg-violet-100';

    return (
        <div className="relative shrink-0">
            <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-foreground ${bg}`}
            >
                {initial}
            </div>
            {room.category === 'spot' && (
                <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-primary-foreground">
                    S
                </div>
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
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-neutral-50"
        >
            <RoomAvatar room={room} />
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                        {room.title}
                    </span>
                    <span
                        suppressHydrationWarning
                        className="shrink-0 text-[11px] text-muted-foreground"
                    >
                        {formatTime(room.updatedAt)}
                    </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {getLastText(room)}
                </p>
            </div>
            {unread > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                    {unread > 99 ? '99+' : unread}
                </span>
            )}
        </button>
    );
}

type SectionProps = {
    icon: React.ReactNode;
    title: string;
    count: number;
    rooms: ChatRoom[];
    onRoomClick: (room: ChatRoom) => void;
};

function ChatSection({ icon, title, count, rooms, onRoomClick }: SectionProps) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? rooms : rooms.slice(0, PREVIEW_COUNT);
    const hasMore = rooms.length > PREVIEW_COUNT;

    return (
        <section>
            <div className="flex items-center gap-2 px-4 pb-1 pt-4">
                {icon}
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {title}
                </h3>
                <span className="text-xs text-neutral-400">{count}</span>
            </div>
            {rooms.length === 0 ? (
                <p className="px-4 py-4 text-xs text-muted-foreground">
                    아직 채팅이 없어요
                </p>
            ) : (
                <>
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
                            className="flex w-full items-center justify-center gap-1 py-2 text-xs font-medium text-primary active:text-accent-dark"
                        >
                            {expanded ? (
                                <>
                                    접기{' '}
                                    <IconChevronDown size={14} stroke={2} />
                                </>
                            ) : (
                                <>
                                    {rooms.length - PREVIEW_COUNT}개 더보기{' '}
                                    <IconChevronRight size={14} stroke={2} />
                                </>
                            )}
                        </button>
                    )}
                </>
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
                    className="fixed inset-0 z-50 flex flex-col bg-background"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={spring}
                >
                    <div className="flex items-center justify-between border-b border-border-soft px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
                        <h2 className="text-base font-semibold text-foreground">
                            채팅
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="fixed right-0 top-[55vh] z-[51] flex h-[72px] w-14 items-center justify-center rounded-l-2xl bg-primary shadow-lg"
                        aria-label="채팅 닫기"
                    >
                        <IconX
                            size={18}
                            stroke={2}
                            className="text-primary-foreground"
                        />
                    </button>

                    <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
                        <ChatSection
                            icon={
                                <IconMessageCircle
                                    size={14}
                                    stroke={2}
                                    className="text-primary"
                                />
                            }
                            title="개인 채팅"
                            count={personalRooms.length}
                            rooms={personalRooms}
                            onRoomClick={handleRoomClick}
                        />
                        <div className="mx-4 border-t border-border-soft" />
                        <ChatSection
                            icon={
                                <IconBolt
                                    size={14}
                                    stroke={2}
                                    className="text-violet-500"
                                />
                            }
                            title="피드 채팅"
                            count={feedRooms.length}
                            rooms={feedRooms}
                            onRoomClick={handleRoomClick}
                        />
                        <div className="mx-4 border-t border-border-soft" />
                        <ChatSection
                            icon={
                                <IconUsers
                                    size={14}
                                    stroke={2}
                                    className="text-amber-500"
                                />
                            }
                            title="스팟 채팅"
                            count={spotRooms.length}
                            rooms={spotRooms}
                            onRoomClick={handleRoomClick}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
