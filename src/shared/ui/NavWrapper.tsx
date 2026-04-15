'use client';

import { useEffect } from 'react';
import { BarChart3, CalendarRange, FileText, Handshake } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { SubNavPill, SubNavPillItem } from './SubNavPill';
import {
    OfferExpandedPanel,
    RequestExpandedPanel,
} from '@/features/spot/ui/SpotExpandedPanel';
import { ChatCreationPanel } from '@/features/chat/ui/ChatCreationPanel';
import {
    PERSONAL_CHAT_CONTEXT_ID,
    useMainChatStore,
} from '@/features/chat/model/use-main-chat-store';
import { isSupporterForSpot } from '@/features/chat/model/mock';
import { MOCK_SPOT_DETAILS } from '@/features/spot/model/mock';
import { useChatNavStore } from '@/shared/model/chat-nav-store';
import { useBottomNavMessageStore } from '@/shared/model/bottom-nav-message-store';

const TEAM_CHAT_SUB_NAV_ITEMS = [
    { step: 'vote' as const, icon: BarChart3, label: '투표' },
    { step: 'schedule' as const, icon: CalendarRange, label: '일정' },
    { step: 'file' as const, icon: FileText, label: '파일' },
];

export function NavWrapper() {
    const pathname = usePathname();
    const isChatRoute = pathname === '/chat' || pathname.startsWith('/chat/');
    const { subNavOpen, openCreation } = useChatNavStore();
    const { message, routePrefix, clearMessage } = useBottomNavMessageStore();
    const selectedContextId = useMainChatStore(
        (state) => state.selectedContextId,
    );
    const selectedSpotRoom = useMainChatStore((state) => {
        const room = state.rooms.find(
            (candidate) => candidate.id === selectedContextId,
        );

        return room?.category === 'spot' ? room : null;
    });
    const showTeamSubNav =
        isChatRoute && selectedContextId !== PERSONAL_CHAT_CONTEXT_ID;
    const teamChatSubNavItems =
        selectedSpotRoom && isSupporterForSpot(selectedSpotRoom)
            ? [
                  ...TEAM_CHAT_SUB_NAV_ITEMS,
                  {
                      step: 'reverse-offer' as const,
                      icon: Handshake,
                      label: '제안',
                  },
              ]
            : TEAM_CHAT_SUB_NAV_ITEMS;
    const showCelebrationMessage =
        message != null &&
        routePrefix != null &&
        pathname.startsWith(routePrefix);

    useEffect(() => {
        if (!message || !routePrefix) {
            return;
        }

        if (!pathname.startsWith(routePrefix)) {
            clearMessage();
            return;
        }

        const timeout = window.setTimeout(() => {
            clearMessage();
        }, 3000);

        return () => window.clearTimeout(timeout);
    }, [clearMessage, message, pathname, routePrefix]);

    return (
        <BottomNav
            subNavContent={
                showCelebrationMessage ? (
                    <SubNavPill
                        open
                        bottomOffset="calc(var(--spacing-nav-h) - 0.5rem + env(safe-area-inset-bottom))"
                    >
                        <div className="px-3 py-1 text-sm font-medium text-white">
                            {message}
                        </div>
                    </SubNavPill>
                ) : showTeamSubNav ? (
                    <SubNavPill
                        open={subNavOpen}
                        bottomOffset="calc(var(--spacing-nav-h) + env(safe-area-inset-bottom))"
                    >
                        {teamChatSubNavItems.map(
                            ({ step, icon: Icon, label }) => (
                                <SubNavPillItem
                                    key={step}
                                    icon={<Icon size={20} strokeWidth={1.8} />}
                                    label={label}
                                    onClickAction={() => openCreation(step)}
                                />
                            ),
                        )}
                    </SubNavPill>
                ) : null
            }
            chatExpandedContent={(onClose) => (
                <ChatCreationPanel onClose={onClose} />
            )}
            spotExpandedContent={(spotId) => {
                const detail = MOCK_SPOT_DETAILS[spotId];
                if (!detail) return null;
                return detail.type === 'OFFER' ? (
                    <OfferExpandedPanel detail={detail} />
                ) : (
                    <RequestExpandedPanel detail={detail} />
                );
            }}
        />
    );
}
