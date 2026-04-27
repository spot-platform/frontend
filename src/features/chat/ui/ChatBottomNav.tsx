'use client';

import {
    IconCalendarEvent,
    IconChartBar,
    IconFileText,
    IconHeartHandshake,
    IconMessageCirclePlus,
    IconSearch,
    IconUserPlus,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

type CreationStep = 'vote' | 'schedule' | 'file' | 'reverse-offer';

interface ChatBottomNavPersonalProps {
    mode: 'personal';
    onSearchToggle: () => void;
    onCreatePersonal: () => void;
    onAddFriend: () => void;
    searchActive?: boolean;
}

interface ChatBottomNavTeamProps {
    mode: 'team';
    onAddItem: (step: CreationStep) => void;
    showReverseOffer: boolean;
    disabled?: boolean;
}

type ChatBottomNavProps = ChatBottomNavPersonalProps | ChatBottomNavTeamProps;

const spring = { type: 'spring', stiffness: 320, damping: 28 } as const;

function NavButton({
    icon,
    label,
    onClick,
    primary = false,
    active = false,
    disabled = false,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    primary?: boolean;
    active?: boolean;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-[0.94] disabled:opacity-40',
                primary
                    ? 'bg-brand-600 text-white shadow-[0_8px_24px_-10px_rgba(13,148,136,0.6)] hover:bg-brand-700'
                    : active
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
            )}
        >
            {icon}
        </button>
    );
}

export function ChatBottomNav(props: ChatBottomNavProps) {
    return (
        <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={spring}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.875rem)]"
        >
            <div
                className={cn(
                    'pointer-events-auto inline-flex items-center gap-1 rounded-full border border-zinc-200/80 bg-white p-1.5',
                    'shadow-[0_10px_28px_-14px_rgba(15,23,42,0.22)]',
                )}
            >
                {props.mode === 'personal' ? (
                    <>
                        <NavButton
                            icon={<IconSearch size={20} stroke={1.75} />}
                            label="개인 채팅 검색"
                            active={props.searchActive}
                            onClick={props.onSearchToggle}
                        />
                        <NavButton
                            icon={
                                <IconMessageCirclePlus
                                    size={20}
                                    stroke={1.75}
                                />
                            }
                            label="새 채팅"
                            primary
                            onClick={props.onCreatePersonal}
                        />
                        <NavButton
                            icon={<IconUserPlus size={20} stroke={1.75} />}
                            label="친구 추가"
                            onClick={props.onAddFriend}
                        />
                    </>
                ) : (
                    <>
                        <NavButton
                            icon={<IconCalendarEvent size={20} stroke={1.75} />}
                            label="일정 추가"
                            onClick={() => props.onAddItem('schedule')}
                            disabled={props.disabled}
                        />
                        <NavButton
                            icon={<IconChartBar size={20} stroke={1.75} />}
                            label="투표 추가"
                            onClick={() => props.onAddItem('vote')}
                            disabled={props.disabled}
                        />
                        <NavButton
                            icon={<IconFileText size={20} stroke={1.75} />}
                            label="파일 추가"
                            onClick={() => props.onAddItem('file')}
                            disabled={props.disabled}
                        />
                        {props.showReverseOffer && (
                            <NavButton
                                icon={
                                    <IconHeartHandshake
                                        size={20}
                                        stroke={1.75}
                                    />
                                }
                                label="역제안 등록"
                                primary
                                onClick={() => props.onAddItem('reverse-offer')}
                                disabled={props.disabled}
                            />
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
}
