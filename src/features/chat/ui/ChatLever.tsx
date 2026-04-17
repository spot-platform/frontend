'use client';

import { IconMessageCircle } from '@tabler/icons-react';
import { useMainChatStore } from '../model/use-main-chat-store';

type ChatLeverProps = {
    onOpen: () => void;
};

export function ChatLever({ onOpen }: ChatLeverProps) {
    const rooms = useMainChatStore((s) => s.rooms);
    const unreadCount = rooms.reduce(
        (sum, r) => sum + (r.category === 'personal' ? r.unreadCount : 0),
        0,
    );

    return (
        <button
            type="button"
            onClick={onOpen}
            className="pointer-events-auto fixed right-0 top-[55vh] z-30 flex h-[72px] w-14 items-center justify-center rounded-l-2xl bg-primary shadow-lg active:scale-95 transition-transform"
            aria-label="채팅 열기"
        >
            <IconMessageCircle
                size={18}
                stroke={2}
                className="text-primary-foreground"
            />
            {unreadCount > 0 && (
                <span className="absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
}
