'use client';
import {
    IconHeartHandshake,
    IconLayoutList,
    IconBulb,
    IconMapPin,
    IconMessageCircle,
    IconPlus,
    IconUser,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExpandableNav } from './ExpandableNav';
import { NavTrayAction } from './NavTrayAction';
import { useSpotNavStore } from '@/shared/model/spot-nav-store';
import { useChatNavStore } from '@/shared/model/chat-nav-store';
import { useState, type ReactNode } from 'react';

interface TabItem {
    href: string;
    label: string;
    Icon: React.ComponentType<{
        size?: number;
        stroke?: number;
        className?: string;
    }>;
}

const NAV_FOOTER_BOTTOM_PADDING =
    'pb-[calc(env(safe-area-inset-bottom)+1.25rem)]';

const LEFT_TABS: TabItem[] = [
    { href: '/feed', label: '피드', Icon: IconLayoutList },
    { href: '/spot', label: '스팟', Icon: IconMapPin },
];

const RIGHT_TABS: TabItem[] = [
    { href: '/chat', label: '채팅', Icon: IconMessageCircle },
    { href: '/my', label: '마이', Icon: IconUser },
];

function getActivePath(pathname: string): string {
    if (pathname === '/' || pathname.startsWith('/feed')) return '/feed';
    if (pathname.startsWith('/spot')) return '/spot';
    if (pathname.startsWith('/post')) return '/post';
    if (pathname.startsWith('/chat')) return '/chat';
    if (pathname.startsWith('/my')) return '/my';
    return '/feed';
}

function NavTab({ tab, isActive }: { tab: TabItem; isActive: boolean }) {
    return (
        <Link
            href={tab.href}
            className={`flex min-w-0 flex-1 basis-0 flex-col items-center justify-center gap-1 px-1 pt-2 ${NAV_FOOTER_BOTTOM_PADDING}`}
        >
            <tab.Icon
                size={22}
                stroke={isActive ? 2.5 : 1.5}
                className={`transition-colors duration-200 ${isActive ? 'text-accent' : 'text-nav-inactive'}`}
            />
            <span
                className={`text-[11px] font-medium leading-none transition-colors duration-200 ${isActive ? 'text-accent' : 'text-nav-inactive'}`}
            >
                {tab.label}
            </span>
        </Link>
    );
}

function CenterButton({
    expanded,
    onToggle,
    collapsedLabel,
}: {
    expanded: boolean;
    onToggle: () => void;
    collapsedLabel: string;
}) {
    return (
        <div
            className={`flex min-w-0 flex-1 basis-0 flex-col items-center justify-center pt-2 ${NAV_FOOTER_BOTTOM_PADDING}`}
        >
            <motion.button
                onClick={onToggle}
                aria-label={expanded ? '닫기' : collapsedLabel}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg"
                animate={{ rotate: expanded ? 45 : 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
                <IconPlus
                    size={28}
                    stroke={2.5}
                    className="text-primary-foreground"
                />
            </motion.button>
        </div>
    );
}

interface BottomNavProps {
    spotExpandedContent?: (spotId: string, onClose: () => void) => ReactNode;
    chatExpandedContent?: (onClose: () => void) => ReactNode;
    /** nav + 버튼 위에 띄울 SubNavPill (라우트별로 NavWrapper에서 주입) */
    subNavContent?: ReactNode;
}

export function BottomNav({
    spotExpandedContent,
    chatExpandedContent,
    subNavContent,
}: BottomNavProps = {}) {
    const pathname = usePathname();
    const router = useRouter();
    const activePath = getActivePath(pathname);
    const { expandedSpotId, setExpandedSpotId } = useSpotNavStore();
    const {
        expanded: chatExpanded,
        subNavOpen: chatSubNavOpen,
        close: closeChatNav,
    } = useChatNavStore();
    const [postExpanded, setPostExpanded] = useState(false);
    const isChatRoute = pathname === '/chat' || pathname.startsWith('/chat/');
    const isFeedRoute = activePath === '/feed';
    const isMyRoute = activePath === '/my';

    const isSpotExpanded = Boolean(expandedSpotId);
    const expanded =
        postExpanded || isSpotExpanded || (isChatRoute && chatExpanded);

    const handleExpandChange = (v: boolean) => {
        if (!v) {
            setPostExpanded(false);
            setExpandedSpotId(null);
            closeChatNav();
        }
    };

    const handleCenterToggle = () => {
        const hasOtherExpandedState =
            isSpotExpanded || (isChatRoute && (chatExpanded || chatSubNavOpen));

        if (isSpotExpanded) {
            setExpandedSpotId(null);
        }

        if (isChatRoute && (chatExpanded || chatSubNavOpen)) {
            closeChatNav();
        }

        setPostExpanded(hasOtherExpandedState ? true : !postExpanded);
    };

    const postExpandedContent = (
        <div className="pb-3">
            <p className="mb-3 text-center text-sm font-medium text-white/50">
                어떤 글을 올릴까요?
            </p>
            <div className="flex flex-col gap-2">
                <NavTrayAction
                    icon={<IconBulb size={18} stroke={1.8} />}
                    title="알려줘"
                    description="도움이 필요한 스팟을 모집해요"
                    tonal="neutral"
                    onClick={() => {
                        setPostExpanded(false);
                        router.push('/post/request');
                    }}
                />
                <NavTrayAction
                    icon={<IconHeartHandshake size={18} stroke={1.8} />}
                    title="해볼래"
                    description="내 재능으로 새로운 스팟을 열어요"
                    tonal="accent"
                    onClick={() => {
                        setPostExpanded(false);
                        router.push('/post/offer');
                    }}
                />
            </div>
        </div>
    );

    const defaultContent = (
        <>
            {LEFT_TABS.map((tab) => (
                <NavTab
                    key={tab.href}
                    tab={tab}
                    isActive={activePath === tab.href}
                />
            ))}
            <CenterButton
                expanded={expanded}
                onToggle={handleCenterToggle}
                collapsedLabel={
                    isFeedRoute || isMyRoute ? '빠른 실행' : '새 게시물 작성'
                }
            />
            {RIGHT_TABS.map((tab) => (
                <NavTab
                    key={tab.href}
                    tab={tab}
                    isActive={activePath === tab.href}
                />
            ))}
        </>
    );

    const expandedContent = postExpanded
        ? postExpandedContent
        : isChatRoute && chatExpanded && chatExpandedContent
          ? chatExpandedContent(() => closeChatNav())
          : isSpotExpanded && spotExpandedContent
            ? spotExpandedContent(expandedSpotId!, () =>
                  setExpandedSpotId(null),
              )
            : null;

    return (
        <>
            {/* SubNavPill — ExpandableNav 바깥, z-[60]으로 nav 위에 표시 */}
            {subNavContent}
            <ExpandableNav
                expandable
                expanded={expanded}
                onExpandChange={handleExpandChange}
                defaultContent={defaultContent}
                expandedContent={expandedContent}
            />
        </>
    );
}
