'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

interface ChatQuickLinkProps {
    spotId: string;
}

export function ChatQuickLink({ spotId }: ChatQuickLinkProps) {
    return (
        <Link
            href={`/chat?spotId=${spotId}`}
            className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-800 shadow-lg transition-transform active:scale-95"
            aria-label="채팅 바로가기"
        >
            <MessageCircle size={24} strokeWidth={2} className="text-white" />
        </Link>
    );
}
