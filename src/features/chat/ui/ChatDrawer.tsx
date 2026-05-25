'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { cn } from '@/shared/lib/cn';
import { useMainChatStore } from '../model/use-main-chat-store';
import type { ChatRoom, PersonalChatRoom, SpotChatRoom } from '../model/types';

type ChatDrawerProps = {
    open: boolean;
    onClose: () => void;
};

const spring = { type: 'spring', stiffness: 380, damping: 34 } as const;

type ChatFilter = 'all' | 'personal' | 'feed' | 'spot';

type ChatFilterOption = {
    value: ChatFilter;
    label: string;
    count: number;
};

const EMPTY_STATE: Record<ChatFilter, { title: string; description: string }> =
    {
        all: {
            title: '아직 열린 채팅이 없어요',
            description:
                '피드에 신청하거나 스팟에 참여하면 대화가 여기에 모여요.',
        },
        personal: {
            title: '아직 개인 채팅이 없어요',
            description: '상대 프로필에서 1:1 대화를 시작하면 여기에 표시돼요.',
        },
        feed: {
            title: '아직 피드 채팅이 없어요',
            description:
                '피드에서 시작된 대화는 스팟으로 전환되기 전까지 여기에 보여요.',
        },
        spot: {
            title: '아직 스팟 채팅이 없어요',
            description:
                '피드가 스팟으로 확정되면 같은 채팅이 스팟 채팅으로 이동해요.',
        },
    };

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

function getRoomFilter(room: ChatRoom): Exclude<ChatFilter, 'all'> {
    if (room.category === 'personal') return 'personal';
    return room.sourceFeedId ? 'feed' : 'spot';
}

function getRoomLabel(room: ChatRoom): string {
    const filter = getRoomFilter(room);
    if (filter === 'personal') return '개인';
    if (filter === 'feed') return '피드';
    return '스팟';
}

function getUnreadCount(room: ChatRoom): number {
    return 'unreadCount' in room ? (room.unreadCount ?? 0) : 0;
}

function RoomRow({ room, onClick }: { room: ChatRoom; onClick: () => void }) {
    const unread = getUnreadCount(room);
    const lastText = getLastText(room) || room.description;

    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 active:bg-zinc-100"
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
                <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                    <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
                        {getRoomLabel(room)}
                    </span>
                    <p className="truncate text-[12.5px] leading-snug text-zinc-500">
                        {lastText}
                    </p>
                </div>
            </div>
            {unread > 0 && (
                <span className="flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white tabular-nums">
                    {unread > 99 ? '99+' : unread}
                </span>
            )}
        </button>
    );
}

type FilterBarProps = {
    options: ChatFilterOption[];
    selected: ChatFilter;
    onSelect: (filter: ChatFilter) => void;
};

function FilterBar({ options, selected, onSelect }: FilterBarProps) {
    return (
        <div className="sticky top-[calc(env(safe-area-inset-top)+3.75rem)] z-10 bg-white px-5 pb-3">
            <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {options.map((option) => {
                    const isSelected = option.value === selected;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onSelect(option.value)}
                            aria-label={`${option.label} 채팅 필터`}
                            aria-pressed={isSelected}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                                isSelected
                                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                                    : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50',
                            )}
                        >
                            <span>{option.label}</span>
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                                    isSelected
                                        ? 'bg-white/18 text-white'
                                        : 'bg-zinc-100 text-zinc-500',
                                )}
                            >
                                {option.count > 99 ? '99+' : option.count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

type ChatListProps = {
    filter: ChatFilter;
    rooms: ChatRoom[];
    onRoomClick: (room: ChatRoom) => void;
};

function ChatList({ filter, rooms, onRoomClick }: ChatListProps) {
    if (rooms.length === 0) {
        const empty = EMPTY_STATE[filter];
        return (
            <div className="mx-5 mt-8 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/60 px-5 py-8 text-center">
                <p className="text-[14px] font-semibold text-zinc-700">
                    {empty.title}
                </p>
                <p className="mx-auto mt-2 max-w-[260px] text-[12.5px] leading-relaxed text-zinc-400">
                    {empty.description}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5 px-3">
            {rooms.map((room) => (
                <RoomRow
                    key={room.id}
                    room={room}
                    onClick={() => onRoomClick(room)}
                />
            ))}
        </div>
    );
}

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
    const router = useRouter();
    const rooms = useMainChatStore((s) => s.rooms);
    const loadRooms = useMainChatStore((s) => s.loadRooms);

    useEffect(() => {
        if (!open) return;

        void loadRooms();
    }, [loadRooms, open]);

    const [selectedFilter, setSelectedFilter] = useState<ChatFilter>('all');

    const { personalRooms, feedRooms, spotRooms, allRooms } = useMemo(() => {
        const byUpdatedAtDesc = (left: ChatRoom, right: ChatRoom) =>
            new Date(right.updatedAt).getTime() -
            new Date(left.updatedAt).getTime();
        const personal: PersonalChatRoom[] = [];
        const feed: SpotChatRoom[] = [];
        const spot: SpotChatRoom[] = [];
        for (const room of rooms) {
            if (room.category === 'personal') personal.push(room);
            else if (room.sourceFeedId) feed.push(room);
            else spot.push(room);
        }
        return {
            personalRooms: [...personal].sort(byUpdatedAtDesc),
            feedRooms: [...feed].sort(byUpdatedAtDesc),
            spotRooms: [...spot].sort(byUpdatedAtDesc),
            allRooms: [...personal, ...feed, ...spot].sort(byUpdatedAtDesc),
        };
    }, [rooms]);

    const filterOptions = useMemo<ChatFilterOption[]>(
        () => [
            { value: 'all', label: '전체', count: allRooms.length },
            { value: 'personal', label: '개인', count: personalRooms.length },
            { value: 'feed', label: '피드', count: feedRooms.length },
            { value: 'spot', label: '스팟', count: spotRooms.length },
        ],
        [
            allRooms.length,
            feedRooms.length,
            personalRooms.length,
            spotRooms.length,
        ],
    );

    const visibleRooms = useMemo(() => {
        if (selectedFilter === 'personal') return personalRooms;
        if (selectedFilter === 'feed') return feedRooms;
        if (selectedFilter === 'spot') return spotRooms;
        return allRooms;
    }, [allRooms, feedRooms, personalRooms, selectedFilter, spotRooms]);

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

                    <FilterBar
                        options={filterOptions}
                        selected={selectedFilter}
                        onSelect={setSelectedFilter}
                    />

                    <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
                        <div className="px-1 pb-8 pt-2">
                            <ChatList
                                filter={selectedFilter}
                                rooms={visibleRooms}
                                onRoomClick={handleRoomClick}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
