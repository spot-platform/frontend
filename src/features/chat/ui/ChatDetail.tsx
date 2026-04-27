'use client';

import { Chip, IconButton } from '@frontend/design-system';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
    IconArrowLeft,
    IconArrowUpRight,
    IconChartBar,
    IconCalendarEvent,
    IconCheck,
    IconFileText,
    IconHeartHandshake,
    IconMap,
    IconMicrophone,
    IconPlus,
    IconSend,
    IconUsers,
    IconX,
} from '@tabler/icons-react';
import { formatReverseOfferApprovalProgress } from '../model/types';
import type {
    ChatMessage,
    PersonalChatRoom,
    SpotActionItem,
    SpotChatRoom,
} from '../model/types';
import {
    PERSONAL_CHAT_CONTEXT_ID,
    useMainChatStore,
} from '../model/use-main-chat-store';
import { isSupporterForSpot } from '../model/mock';
import {
    getShareableSpotActionItems,
    getSpotScheduleActionId,
    buildScheduleSubtitle,
} from '../model/spot-action-items';
import { ChatLifecyclePanel } from './lifecycle/ChatLifecyclePanel';
import { cn } from '@/shared/lib/cn';
import {
    BottomSheet,
    EmptyState,
    StatusBadge,
    TypeBadge,
    UserAvatarStatic,
} from '@/shared/ui';
import { useChatNavStore } from '@/shared/model/chat-nav-store';
import { ChatCreationPanel } from './ChatCreationPanel';

type ShortcutMessagePayload = Extract<
    ChatMessage,
    { kind: 'shortcut' }
>['shortcut'];
type ShareableSpotActionItem = Extract<
    SpotActionItem,
    { kind: 'vote' | 'schedule' | 'file' }
>;

interface ChatDetailProps {
    roomId: string;
}

function formatTime(iso: string): string {
    return new Intl.DateTimeFormat('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(iso));
}

function formatDateChip(iso: string): string {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    }).format(new Date(iso));
}

function formatMetaDate(iso: string): string {
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(iso));
}

function getReverseOfferStatusLabel(
    status: 'PARTNER_REVIEW' | 'ADMIN_APPROVAL_PENDING',
) {
    return status === 'PARTNER_REVIEW' ? '파트너 검토 중' : '어드민 승인 대기';
}

function PersonalContextCard({ room }: { room: PersonalChatRoom }) {
    return (
        <section className="rounded-2xl border border-zinc-200/80 bg-white p-4">
            <div className="flex items-start gap-3">
                <UserAvatarStatic
                    userId={room.partnerId}
                    nickname={room.partnerName}
                    size="md"
                    profileType={
                        room.counterpartRole === 'SUPPORTER'
                            ? 'SUPPORTER'
                            : 'PARTNER'
                    }
                />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-[15px] font-bold text-zinc-900">
                            {room.partnerName}
                        </p>
                        <Chip
                            size="sm"
                            className={cn(
                                'border-transparent font-medium',
                                room.counterpartRole === 'SUPPORTER'
                                    ? 'bg-brand-50 text-brand-700'
                                    : 'bg-zinc-100 text-zinc-600',
                            )}
                        >
                            {room.counterpartRole === 'SUPPORTER'
                                ? '서포터'
                                : '파트너'}
                        </Chip>
                    </div>
                    <p className="mt-1 text-[12.5px] font-medium text-zinc-600">
                        {room.presenceLabel}
                    </p>
                    <p className="mt-2 text-[12.5px] leading-snug text-zinc-500">
                        {room.description}
                    </p>
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                <p className="text-[11px] font-medium text-zinc-500">
                    {room.metaLabel}
                </p>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">
                    최근 활동 {formatMetaDate(room.updatedAt)}
                </span>
            </div>
        </section>
    );
}

function formatFileSize(sizeBytes: number): string {
    if (sizeBytes >= 1024 * 1024) {
        return `${(sizeBytes / (1024 * 1024)).toFixed(1)}MB`;
    }

    if (sizeBytes >= 1024) {
        return `${Math.round(sizeBytes / 1024)}KB`;
    }

    return `${sizeBytes}B`;
}

function ThreadItemCard({
    icon,
    tone,
    eyebrow,
    title,
    description,
    footer,
    children,
}: {
    icon: React.ReactNode;
    tone: 'vote' | 'schedule' | 'file' | 'proposal' | 'reverse-offer';
    eyebrow: string;
    title: string;
    description?: string;
    footer?: string;
    children?: React.ReactNode;
}) {
    const toneClassName =
        tone === 'reverse-offer'
            ? 'bg-brand-50 text-brand-700'
            : 'bg-zinc-100 text-zinc-600';

    return (
        <div className="w-full min-w-0 rounded-2xl border border-zinc-200/80 bg-white px-3.5 py-3">
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                        toneClassName,
                    )}
                >
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-semibold tracking-[0.06em] text-zinc-500">
                        {eyebrow}
                    </p>
                    <p className="mt-0.5 text-[13px] font-semibold leading-snug text-zinc-900">
                        {title}
                    </p>
                    {description ? (
                        <p className="mt-1 text-[12.5px] leading-snug text-zinc-500">
                            {description}
                        </p>
                    ) : null}
                    {children ? <div className="mt-2.5">{children}</div> : null}
                    {footer ? (
                        <p className="mt-2.5 text-[11px] font-medium text-zinc-400">
                            {footer}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function renderThreadEntryContent(
    message:
        | PersonalChatRoom['messages'][number]
        | SpotChatRoom['messages'][number],
    mine: boolean,
    onShortcutOpen?: (shortcut: ShortcutMessagePayload) => void,
    onReverseOfferOpen?: (
        reverseOffer: Extract<
            ChatMessage,
            { kind: 'reverse-offer' }
        >['reverseOffer'],
    ) => void,
    onVoteOpen?: (vote: Extract<ChatMessage, { kind: 'vote' }>['vote']) => void,
    onScheduleOpen?: () => void,
) {
    if (message.kind === 'message') {
        return (
            <div
                className={cn(
                    'rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug',
                    mine
                        ? 'rounded-br-md bg-brand-600 text-white'
                        : 'rounded-bl-md bg-zinc-100 text-zinc-800',
                )}
            >
                {message.content}
            </div>
        );
    }

    if (message.kind === 'shortcut') {
        const shortcutIcon =
            message.shortcut.actionKind === 'vote' ? (
                <IconChartBar size={14} stroke={1.75} />
            ) : message.shortcut.actionKind === 'schedule' ? (
                <IconCalendarEvent size={14} stroke={1.75} />
            ) : (
                <IconFileText size={14} stroke={1.75} />
            );

        return (
            <button
                type="button"
                onClick={() => onShortcutOpen?.(message.shortcut)}
                className="flex w-full items-start gap-2.5 rounded-2xl border border-zinc-200/80 bg-white px-3 py-2.5 text-left transition active:scale-[0.99] hover:bg-zinc-50"
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                    {shortcutIcon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-semibold tracking-[0.04em] text-zinc-500">
                        {message.shortcut.label}
                    </p>
                    <p className="mt-0.5 line-clamp-2 break-words text-[12.5px] leading-snug font-semibold text-zinc-900">
                        {message.shortcut.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 break-words text-[11.5px] leading-snug text-zinc-500">
                        {message.shortcut.preview}
                    </p>
                </div>
                <IconArrowUpRight
                    size={14}
                    stroke={1.75}
                    className="mt-0.5 shrink-0 text-zinc-400"
                />
            </button>
        );
    }

    if (message.kind === 'vote') {
        const totalVotes = message.vote.options.reduce(
            (sum, option) => sum + option.voterIds.length,
            0,
        );
        const votePayload = message.vote;

        return (
            <button
                type="button"
                onClick={() => onVoteOpen?.(votePayload)}
                className="block w-full text-left transition active:scale-[0.99]"
                aria-label="투표 패널 열기"
            >
                <ThreadItemCard
                    icon={<IconChartBar size={16} stroke={1.75} />}
                    tone="vote"
                    eyebrow="투표"
                    title={message.vote.question}
                    footer={`총 ${totalVotes}표 · ${message.vote.multiSelect ? '복수 선택' : '단일 선택'} · 탭해서 투표하기`}
                >
                    <div className="flex flex-col gap-1.5">
                        {message.vote.options.map((option) => (
                            <div
                                key={option.id}
                                className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-1.5"
                            >
                                <span className="text-[12.5px] text-zinc-700">
                                    {option.label}
                                </span>
                                <span className="text-[11px] font-semibold text-zinc-500 tabular-nums">
                                    {option.voterIds.length}표
                                </span>
                            </div>
                        ))}
                    </div>
                </ThreadItemCard>
            </button>
        );
    }

    if (message.kind === 'schedule') {
        return (
            <button
                type="button"
                onClick={() => onScheduleOpen?.()}
                className="block w-full text-left transition active:scale-[0.99]"
                aria-label="일정 조율 패널 열기"
            >
                <ThreadItemCard
                    icon={<IconCalendarEvent size={16} stroke={1.75} />}
                    tone="schedule"
                    eyebrow="일정"
                    title={message.schedule.title}
                    description={message.schedule.description}
                    footer={`${message.schedule.metaLabel} · 탭해서 일정 조율하기`}
                />
            </button>
        );
    }

    if (message.kind === 'reverse-offer') {
        const statusLabel = getReverseOfferStatusLabel(
            message.reverseOffer.status,
        );
        const reverseOfferPayload = message.reverseOffer;

        return (
            <button
                type="button"
                onClick={() => onReverseOfferOpen?.(reverseOfferPayload)}
                className="block w-full text-left transition active:scale-[0.99]"
                aria-label="역제안 승인 패널 열기"
            >
                <ThreadItemCard
                    icon={<IconHeartHandshake size={16} stroke={1.75} />}
                    tone="reverse-offer"
                    eyebrow="역제안"
                    title="역제안을 등록했어요"
                    description={
                        message.reverseOffer.priorAgreementReachedInChat
                            ? '팀 채팅에서 사전 합의된 내용을 기준으로 역제안을 올렸어요.'
                            : '팀 채팅 합의 전 단계에서 역제안을 올렸어요.'
                    }
                    footer={`현재 상태: ${statusLabel}`}
                >
                    <div className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2.5">
                        <p className="text-[10.5px] font-semibold tracking-[0.04em] text-brand-700">
                            현재 상태
                        </p>
                        <p className="mt-0.5 text-[12.5px] font-semibold text-brand-900">
                            {statusLabel}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-brand-700">
                            {formatReverseOfferApprovalProgress(
                                message.reverseOffer,
                            )}
                        </p>
                        <p className="mt-1.5 text-[11px] leading-snug text-brand-800/80">
                            카드를 탭하면 승인 패널이 열려요.
                        </p>
                    </div>
                </ThreadItemCard>
            </button>
        );
    }

    if (message.kind === 'proposal') {
        const statusLabel = {
            PENDING: '검토 중',
            ACCEPTED: '수락됨',
            NEGOTIATING: '협의 중',
            DECLINED: '거절됨',
        }[message.status];

        const dateList = message.proposal.availableDates
            .slice(0, 3)
            .map((d) =>
                new Date(d).toLocaleDateString('ko-KR', {
                    month: 'numeric',
                    day: 'numeric',
                    weekday: 'short',
                }),
            )
            .join(', ');

        return (
            <ThreadItemCard
                icon={<IconHeartHandshake size={18} />}
                tone="proposal"
                eyebrow="제안"
                title={`${message.proposal.suggestedAmount.toLocaleString('ko-KR')}원`}
                description={message.proposal.description}
                footer={`가능 날짜: ${dateList || '미정'} · ${statusLabel}`}
            >
                {message.status === 'PENDING' && !mine && (
                    <div className="flex gap-1.5">
                        <button
                            type="button"
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand-600 py-1.5 text-[11.5px] font-semibold text-white hover:bg-brand-700"
                        >
                            <IconCheck size={12} stroke={2} />
                            수락
                        </button>
                        <button
                            type="button"
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-zinc-100 py-1.5 text-[11.5px] font-semibold text-zinc-600 hover:bg-zinc-200"
                        >
                            협의
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11.5px] font-semibold text-zinc-500 hover:bg-zinc-200"
                        >
                            <IconX size={12} stroke={1.75} />
                        </button>
                    </div>
                )}
                {message.status === 'ACCEPTED' && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-[11.5px] font-semibold text-brand-700">
                        <IconCheck size={12} stroke={2} />
                        수락 완료 · 스팟으로 전환하기
                    </div>
                )}
            </ThreadItemCard>
        );
    }

    if (message.kind !== 'file') {
        return null;
    }

    return (
        <ThreadItemCard
            icon={<IconFileText size={18} />}
            tone="file"
            eyebrow="File"
            title={message.file.name}
            description={`${message.file.uploaderNickname}님이 공유한 파일이에요.`}
            footer={`${formatFileSize(message.file.sizeBytes)} · ${formatMetaDate(message.file.uploadedAt)}`}
        />
    );
}

export function ChatDetail({ roomId }: ChatDetailProps) {
    const router = useRouter();
    const room = useMainChatStore(
        (state) =>
            state.rooms.find((candidate) => candidate.id === roomId) ?? null,
    );
    const sendMessage = useMainChatStore((state) => state.sendMessage);
    const shareActionShortcut = useMainChatStore(
        (state) => state.shareActionShortcut,
    );
    const setSelectedContextId = useMainChatStore(
        (state) => state.setSelectedContextId,
    );
    const setSelectedFriendId = useMainChatStore(
        (state) => state.setSelectedFriendId,
    );
    const openRoomInfo = useChatNavStore((state) => state.openRoomInfo);
    const openActionItem = useChatNavStore((state) => state.openActionItem);
    const openCreation = useChatNavStore((state) => state.openCreation);
    const chatNavExpanded = useChatNavStore((state) => state.expanded);
    const chatNavMode = useChatNavStore((state) => state.mode);
    const closeChatNav = useChatNavStore((state) => state.close);
    const [draft, setDraft] = useState('');
    const [shortcutPickerOpen, setShortcutPickerOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!room) {
            router.replace('/chat');
            return;
        }

        if (room.category === 'spot') {
            setSelectedContextId(room.id);
            setSelectedFriendId(null);
            return;
        }

        setSelectedContextId(PERSONAL_CHAT_CONTEXT_ID);
        setSelectedFriendId(room.partnerId);
    }, [room, router, setSelectedContextId, setSelectedFriendId]);

    useEffect(() => {
        if (!room) {
            return;
        }

        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [room?.id, room?.messages.length, room]);

    useEffect(() => {
        if (!textareaRef.current) {
            return;
        }

        textareaRef.current.style.height = '0px';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }, [draft]);

    if (!room) {
        return null;
    }

    const currentRoom = room;
    const messages = currentRoom.messages;
    const shareableActionItems: ShareableSpotActionItem[] =
        currentRoom.category === 'spot'
            ? getShareableSpotActionItems(currentRoom)
            : [];
    const headerSubtitle =
        currentRoom.category === 'personal'
            ? currentRoom.presenceLabel
            : currentRoom.metaLabel;
    const messageCount = messages.filter(
        (message) => message.kind !== 'system',
    ).length;
    const showMobileChatNavPanel =
        chatNavExpanded &&
        (chatNavMode.kind === 'room-info' ||
            chatNavMode.kind === 'action-item' ||
            chatNavMode.kind === 'creation');

    function handleSend() {
        const trimmed = draft.trim();

        if (!trimmed) {
            return;
        }

        sendMessage(currentRoom.id, trimmed);
        setDraft('');
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    }

    function handleShortcutOpen(shortcut: ShortcutMessagePayload) {
        const params = new URLSearchParams({
            roomId: currentRoom.id,
            actionKind: shortcut.actionKind,
            actionId: shortcut.actionId,
        });

        router.push(`/chat?${params.toString()}`);
    }

    function handleShortcutShare(item: ShareableSpotActionItem) {
        shareActionShortcut(currentRoom.id, item);
        setShortcutPickerOpen(false);
    }

    function handleReverseOfferOpen(
        reverseOffer: Extract<
            ChatMessage,
            { kind: 'reverse-offer' }
        >['reverseOffer'],
    ) {
        if (currentRoom.category !== 'spot') {
            return;
        }
        openActionItem({
            kind: 'reverse-offer',
            id: reverseOffer.id,
            roomId: currentRoom.id,
            roomTitle: currentRoom.title,
            reverseOffer,
            updatedAt: reverseOffer.updatedAt,
        });
    }

    function handleVoteOpen(
        vote: Extract<ChatMessage, { kind: 'vote' }>['vote'],
    ) {
        if (currentRoom.category !== 'spot') {
            return;
        }

        const liveVote =
            currentRoom.spot.votes.find(
                (candidate) => candidate.id === vote.id,
            ) ?? vote;

        openActionItem({
            kind: 'vote',
            id: liveVote.id,
            roomId: currentRoom.id,
            roomTitle: currentRoom.title,
            vote: liveVote,
            updatedAt: currentRoom.updatedAt,
        });
    }

    function handleScheduleOpen() {
        if (currentRoom.category !== 'spot' || !currentRoom.spot.schedule) {
            return;
        }

        const schedule = currentRoom.spot.schedule;
        openActionItem({
            kind: 'schedule',
            id: getSpotScheduleActionId(currentRoom.id),
            roomId: currentRoom.id,
            roomTitle: currentRoom.title,
            schedule: {
                id: getSpotScheduleActionId(currentRoom.id),
                spotId: currentRoom.spot.id,
                title: schedule.confirmedSlot ? '일정 확정' : '일정 조율 중',
                description: buildScheduleSubtitle(schedule),
                metaLabel: schedule.confirmedSlot ? '일정 확정' : '조율 중',
                createdAt: currentRoom.updatedAt,
            },
            updatedAt: currentRoom.updatedAt,
        });
    }

    return (
        <>
            <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-white">
                <div className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-[calc(env(safe-area-inset-top)+0.625rem)] pb-3">
                    <div className="mx-auto flex max-w-107.5 items-center justify-between gap-2">
                        <div className="pointer-events-auto inline-flex max-w-[calc(100%-3.5rem)] items-center rounded-full border border-zinc-200/80 bg-white py-1 pl-1 pr-3.5 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.18)]">
                            <IconButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                label="뒤로가기"
                                className="h-9 w-9 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                icon={<IconArrowLeft size={20} stroke={1.75} />}
                            />
                            <div className="min-w-0 pl-1">
                                <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-zinc-900">
                                    {currentRoom.title}
                                </p>
                                <p className="truncate text-[11px] text-zinc-500">
                                    {headerSubtitle}
                                </p>
                            </div>
                        </div>

                        <div className="pointer-events-auto inline-flex items-center rounded-full border border-zinc-200/80 bg-white p-1 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.18)]">
                            <IconButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/map')}
                                label="맵으로 돌아가기"
                                className="h-9 w-9 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                icon={<IconMap size={18} stroke={1.75} />}
                            />
                            {currentRoom.category === 'spot' && (
                                <IconButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openRoomInfo(currentRoom.id)}
                                    label="참여자 정보"
                                    className="h-9 w-9 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                    icon={<IconUsers size={18} stroke={1.75} />}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-20 pb-32">
                    <div className="mx-auto flex max-w-3xl flex-col gap-3">
                        {currentRoom.category === 'spot' ? (
                            <>
                                <section className="flex justify-center">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[10.5px] font-semibold text-brand-700">
                                        <TypeBadge
                                            type={currentRoom.spot.type}
                                            size="sm"
                                        />
                                        <StatusBadge
                                            status={currentRoom.spot.status}
                                            size="sm"
                                        />
                                        <span>{currentRoom.metaLabel}</span>
                                    </div>
                                </section>
                                <ChatLifecyclePanel room={currentRoom} />
                            </>
                        ) : (
                            <PersonalContextCard room={currentRoom} />
                        )}

                        <section className="pb-2">
                            <div className="mb-3 flex items-center justify-between gap-3 px-1">
                                <h2 className="text-[15px] font-bold tracking-[-0.01em] text-zinc-900">
                                    {currentRoom.category === 'spot'
                                        ? '스팟 대화'
                                        : '개인 대화'}
                                </h2>
                                <span className="text-[11px] font-medium text-zinc-400 tabular-nums">
                                    {messageCount}개 메시지
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {messages.map((message, index) => {
                                    const dateKey = new Date(message.createdAt)
                                        .toISOString()
                                        .slice(0, 10);
                                    const prevDateKey = messages[index - 1]
                                        ? new Date(
                                              messages[index - 1].createdAt,
                                          )
                                              .toISOString()
                                              .slice(0, 10)
                                        : null;
                                    const showDate = prevDateKey !== dateKey;

                                    if (message.kind === 'system') {
                                        return (
                                            <div
                                                key={message.id}
                                                className="flex flex-col items-center gap-2"
                                            >
                                                {showDate && (
                                                    <div className="flex justify-center">
                                                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10.5px] font-medium text-zinc-500">
                                                            {formatDateChip(
                                                                message.createdAt,
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="rounded-full bg-zinc-50 px-3 py-1 text-[10.5px] text-zinc-500">
                                                    {message.content}
                                                </div>
                                            </div>
                                        );
                                    }

                                    const mine =
                                        message.authorId ===
                                        currentRoom.currentUserId;
                                    const prevMessage = messages[index - 1];
                                    const nextMessage = messages[index + 1];
                                    const isFirstInGroup =
                                        !prevMessage ||
                                        prevMessage.kind !== 'message' ||
                                        message.kind !== 'message' ||
                                        prevMessage.authorId !==
                                            message.authorId;
                                    const isLastInGroup =
                                        !nextMessage ||
                                        nextMessage.kind !== 'message' ||
                                        message.kind !== 'message' ||
                                        nextMessage.authorId !==
                                            message.authorId;

                                    return (
                                        <div
                                            key={message.id}
                                            className="flex flex-col gap-2"
                                        >
                                            {showDate && (
                                                <div className="flex justify-center pt-1">
                                                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10.5px] font-medium text-zinc-500">
                                                        {formatDateChip(
                                                            message.createdAt,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            <div
                                                className={cn(
                                                    'flex items-end gap-1.5',
                                                    mine
                                                        ? 'justify-end'
                                                        : 'justify-start',
                                                )}
                                            >
                                                {!mine && (
                                                    <div className="mb-0.5 flex w-7 shrink-0 justify-center">
                                                        {isFirstInGroup ? (
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[12px] font-semibold text-zinc-700">
                                                                {message.authorName.slice(
                                                                    0,
                                                                    1,
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="h-7 w-7" />
                                                        )}
                                                    </div>
                                                )}

                                                <div
                                                    className={cn(
                                                        'flex max-w-[78%] flex-col gap-0.5 sm:max-w-[72%]',
                                                        mine
                                                            ? 'items-end'
                                                            : 'items-start',
                                                    )}
                                                >
                                                    {!mine &&
                                                        isFirstInGroup &&
                                                        currentRoom.category ===
                                                            'spot' && (
                                                            <span className="px-1 text-[10.5px] font-medium text-zinc-500">
                                                                {
                                                                    message.authorName
                                                                }
                                                            </span>
                                                        )}

                                                    <div
                                                        className={cn(
                                                            'flex items-end gap-1.5',
                                                            mine
                                                                ? 'flex-row-reverse'
                                                                : 'flex-row',
                                                        )}
                                                    >
                                                        <div className="max-w-full">
                                                            {renderThreadEntryContent(
                                                                message,
                                                                mine,
                                                                handleShortcutOpen,
                                                                handleReverseOfferOpen,
                                                                handleVoteOpen,
                                                                handleScheduleOpen,
                                                            )}
                                                        </div>

                                                        {isLastInGroup && (
                                                            <span className="shrink-0 px-0.5 text-[10px] font-medium text-zinc-400 tabular-nums">
                                                                {formatTime(
                                                                    message.createdAt,
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                        </section>
                    </div>
                </div>

                <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(env(safe-area-inset-bottom)+0.875rem)] md:pb-[calc(env(safe-area-inset-bottom)+6rem)]">
                    <div className="pointer-events-auto mx-auto flex max-w-3xl items-end gap-2 rounded-[26px] border border-zinc-200/80 bg-white py-1.5 pl-1.5 pr-1.5 shadow-[0_10px_28px_-14px_rgba(15,23,42,0.18)]">
                        {currentRoom.category === 'spot' ? (
                            <button
                                type="button"
                                onClick={() => setShortcutPickerOpen(true)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.96]"
                                aria-label="바로가기 공유"
                            >
                                <IconPlus size={16} stroke={1.75} />
                            </button>
                        ) : null}

                        <div className="flex min-h-9 flex-1 items-end px-2 py-1.5">
                            <textarea
                                ref={textareaRef}
                                value={draft}
                                onChange={(event) =>
                                    setDraft(event.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                rows={1}
                                placeholder={
                                    currentRoom.category === 'spot'
                                        ? '메시지를 남겨보세요'
                                        : '메시지를 입력하세요'
                                }
                                className="max-h-[120px] min-h-5 flex-1 resize-none bg-transparent text-[13.5px] leading-snug text-zinc-900 outline-none placeholder:text-zinc-400"
                            />
                        </div>

                        {draft.trim() ? (
                            <button
                                type="button"
                                onClick={handleSend}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_6px_18px_-6px_rgba(13,148,136,0.6)] transition-colors hover:bg-brand-700 active:scale-[0.96]"
                                aria-label="전송"
                            >
                                <IconSend size={14} stroke={1.75} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.96]"
                                aria-label={
                                    currentRoom.category === 'personal'
                                        ? '음성메시지'
                                        : '전송'
                                }
                            >
                                {currentRoom.category === 'personal' ? (
                                    <IconMicrophone size={16} stroke={1.75} />
                                ) : (
                                    <IconSend size={14} stroke={1.75} />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {currentRoom.category === 'spot' ? (
                <BottomSheet
                    open={shortcutPickerOpen}
                    onClose={() => setShortcutPickerOpen(false)}
                    title="항목 추가 / 공유"
                    snapPoint="half"
                >
                    <div className="flex flex-col gap-4 pb-2">
                        <section className="flex flex-col gap-2">
                            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                새로 만들기
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    {
                                        step: 'vote' as const,
                                        label: '투표',
                                        description: '선택지를 제안해요',
                                        icon: <IconChartBar size={18} />,
                                        tone: 'bg-amber-50 text-amber-700',
                                    },
                                    {
                                        step: 'schedule' as const,
                                        label: '일정',
                                        description: '가능한 시간 조율',
                                        icon: <IconCalendarEvent size={18} />,
                                        tone: 'bg-brand-50 text-brand-800',
                                    },
                                    ...(isSupporterForSpot(currentRoom)
                                        ? [
                                              {
                                                  step: 'reverse-offer' as const,
                                                  label: '역제안',
                                                  description:
                                                      '파트너에게 역제안',
                                                  icon: (
                                                      <IconHeartHandshake
                                                          size={18}
                                                      />
                                                  ),
                                                  tone: 'bg-emerald-50 text-emerald-700',
                                              },
                                          ]
                                        : []),
                                    {
                                        step: 'file' as const,
                                        label: '파일',
                                        description: '첨부 파일 공유',
                                        icon: <IconFileText size={18} />,
                                        tone: 'bg-muted text-text-secondary',
                                    },
                                ].map(
                                    ({
                                        step,
                                        label,
                                        description,
                                        icon,
                                        tone,
                                    }) => (
                                        <button
                                            key={step}
                                            type="button"
                                            onClick={() => {
                                                setShortcutPickerOpen(false);
                                                openCreation(step);
                                            }}
                                            className="flex items-start gap-3 rounded-2xl border border-border-soft bg-card px-3 py-3 text-left transition hover:bg-muted active:scale-[0.99]"
                                        >
                                            <div
                                                className={cn(
                                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                                    tone,
                                                )}
                                            >
                                                {icon}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-foreground">
                                                    {label}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {description}
                                                </p>
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>
                        </section>

                        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                            바로가기 공유
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                            이 방에 이미 등록된 투표, 일정, 파일만 바로가기
                            메시지로 공유할 수 있어요.
                        </p>

                        {shareableActionItems.length > 0 ? (
                            <div className="overflow-hidden rounded-[20px] border border-border-soft bg-card">
                                {shareableActionItems.map((item, index) => {
                                    const itemIcon =
                                        item.kind === 'vote' ? (
                                            <IconChartBar size={18} />
                                        ) : item.kind === 'schedule' ? (
                                            <IconCalendarEvent size={18} />
                                        ) : (
                                            <IconFileText size={18} />
                                        );
                                    const itemToneClassName =
                                        item.kind === 'vote'
                                            ? 'bg-amber-50 text-amber-700'
                                            : item.kind === 'schedule'
                                              ? 'bg-brand-50 text-brand-800'
                                              : 'bg-muted text-text-secondary';
                                    const itemTitle =
                                        item.kind === 'vote'
                                            ? item.vote.question
                                            : item.kind === 'schedule'
                                              ? item.schedule.title
                                              : item.file.name;
                                    const itemDescription =
                                        item.kind === 'vote'
                                            ? `${item.vote.options.length}개 선택지 · ${item.vote.multiSelect ? '복수 선택' : '단일 선택'}`
                                            : item.kind === 'schedule'
                                              ? item.schedule.description
                                              : `${item.file.uploaderNickname} · ${formatFileSize(item.file.sizeBytes)}`;

                                    return (
                                        <button
                                            key={`${item.kind}-${item.id}`}
                                            type="button"
                                            onClick={() =>
                                                handleShortcutShare(item)
                                            }
                                            className={cn(
                                                'flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted active:scale-[0.99]',
                                                index > 0 &&
                                                    'border-t border-border-soft',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                                    itemToneClassName,
                                                )}
                                            >
                                                {itemIcon}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 break-words text-sm leading-5 font-semibold text-foreground">
                                                    {itemTitle}
                                                </p>
                                                <p className="mt-0.5 line-clamp-2 break-words text-xs leading-5 text-muted-foreground">
                                                    {itemDescription}
                                                </p>
                                            </div>
                                            <IconArrowUpRight
                                                size={16}
                                                className="mt-0.5 shrink-0 text-muted-foreground"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<IconPlus size={22} />}
                                title="공유할 바로가기가 없어요"
                                description="먼저 이 방에서 투표, 일정, 파일을 만들어 주세요."
                            />
                        )}
                    </div>
                </BottomSheet>
            ) : null}

            <BottomSheet
                open={showMobileChatNavPanel}
                onClose={closeChatNav}
                snapPoint="half"
                className="border-2 border-[#3b4954] bg-[#1e2938] md:hidden"
            >
                <ChatCreationPanel onClose={closeChatNav} />
            </BottomSheet>
        </>
    );
}
