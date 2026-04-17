import { Suspense } from 'react';
import type { Metadata } from 'next';
import {
    MainChatPageClient,
    resolveChatRoom,
    resolveChatTopTab,
    type ChatRouteSearchParams,
} from '@/features/chat';

export const metadata: Metadata = {
    title: 'Chat',
};

interface ChatPageProps {
    searchParams: Promise<ChatRouteSearchParams>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
    const resolvedSearchParams = await searchParams;
    const initialIntent = resolveChatRoom(resolvedSearchParams);
    const initialTopTab = resolveChatTopTab(
        resolvedSearchParams,
        initialIntent,
    );

    return (
        <Suspense fallback={null}>
            <MainChatPageClient
                initialIntent={initialIntent}
                initialTopTab={initialTopTab}
            />
        </Suspense>
    );
}
