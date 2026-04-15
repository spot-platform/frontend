'use client';

import { Chip, IconButton } from '@frontend/design-system';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowUpRight,
    BarChart3,
    CalendarRange,
    Check,
    FileText,
    Handshake,
    Mic,
    Plus,
    SendHorizonal,
    Users,
    X,
} from 'lucide-react';
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
import { getShareableSpotActionItems } from '../model/spot-action-items';
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
        <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start gap-4">
                <UserAvatarStatic
                    userId={room.partnerId}
                    nickname={room.partnerName}
                    size="lg"
                    profileType={
                        room.counterpartRole === 'SUPPORTER'
                            ? 'SUPPORTER'
                            : 'PARTNER'
                    }
                />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold text-gray-900">
                            {room.partnerName}
                        </p>
                        <Chip
                            size="sm"
                            className={cn(
                                'border-transparent font-semibold',
                                room.counterpartRole === 'SUPPORTER'
                                    ? 'bg-brand-50 text-brand-800'
                                    : 'bg-gray-100 text-gray-700',
                            )}
                        >
                            {room.counterpartRole === 'SUPPORTER'
                                ? '서포터'
                                : '파트너'}
                        </Chip>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-600">
                        {room.presenceLabel}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        {room.description}
                    </p>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-400">
                    {room.metaLabel}
                </p>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
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
    mine,
    icon,
    tone,
    eyebrow,
    title,
    description,
    footer,
    children,
}: {
    mine: boolean;
    icon: React.ReactNode;
    tone: 'vote' | 'schedule' | 'file' | 'proposal' | 'reverse-offer';
    eyebrow: string;
    title: string;
    description?: string;
    footer?: string;
    children?: React.ReactNode;
}) {
    const toneClassName =
        tone === 'vote'
            ? mine
                ? 'bg-amber-50 text-amber-700'
                : 'bg-amber-100 text-amber-800'
            : tone === 'schedule'
              ? mine
                  ? 'bg-brand-50 text-brand-800'
                  : 'bg-gray-100 text-gray-700'
              : tone === 'reverse-offer'
                ? mine
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-emerald-100 text-emerald-800'
                : tone === 'proposal'
                  ? mine
                      ? 'bg-accent-muted text-accent'
                      : 'bg-accent-muted text-accent'
                  : mine
                    ? 'bg-brand-100 text-brand-900'
                    : 'bg-gray-100 text-gray-700';

    return (
        <div
            className={cn(
                'w-full min-w-0 rounded-3xl border px-4 py-4 shadow-sm',
                mine ? 'border-brand-100 bg-white' : 'border-gray-100 bg-white',
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                        toneClassName,
                    )}
                >
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-gray-400 uppercase">
                        {eyebrow}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                        {title}
                    </p>
                    {description ? (
                        <p className="mt-1 text-sm leading-6 text-gray-500">
                            {description}
                        </p>
                    ) : null}
                    {children ? <div className="mt-3">{children}</div> : null}
                    {footer ? (
                        <p className="mt-3 text-xs font-medium text-gray-400">
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
) {
    if (message.kind === 'message') {
        return (
            <div
                className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    mine
                        ? 'rounded-br-md bg-brand-800 text-white'
                        : 'rounded-bl-md border border-gray-100 bg-gray-50 text-gray-800',
                )}
            >
                {message.content}
            </div>
        );
    }

    if (message.kind === 'shortcut') {
        const shortcutToneClassName =
            message.shortcut.actionKind === 'vote'
                ? mine
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-amber-100 text-amber-800'
                : message.shortcut.actionKind === 'schedule'
                  ? mine
                      ? 'bg-brand-50 text-brand-800'
                      : 'bg-gray-100 text-gray-700'
                  : mine
                    ? 'bg-brand-100 text-brand-900'
                    : 'bg-gray-100 text-gray-700';

        const shortcutIcon =
            message.shortcut.actionKind === 'vote' ? (
                <BarChart3 size={16} />
            ) : message.shortcut.actionKind === 'schedule' ? (
                <CalendarRange size={16} />
            ) : (
                <FileText size={16} />
            );

        return (
            <button
                type="button"
                onClick={() => onShortcutOpen?.(message.shortcut)}
                className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition active:scale-[0.99]',
                    mine
                        ? 'border-brand-100 bg-white hover:bg-brand-50/40'
                        : 'border-gray-200 bg-white hover:bg-gray-50',
                )}
            >
                <div
                    className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        shortcutToneClassName,
                    )}
                >
                    {shortcutIcon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400 uppercase">
                        {message.shortcut.label}
                    </p>
                    <p className="mt-1 line-clamp-2 break-words text-sm leading-5 font-semibold text-gray-900">
                        {message.shortcut.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 break-words text-xs leading-5 text-gray-500">
                        {message.shortcut.preview}
                    </p>
                </div>
                <ArrowUpRight
                    size={16}
                    className="mt-0.5 shrink-0 text-gray-400"
                />
            </button>
        );
    }

    if (message.kind === 'vote') {
        const totalVotes = message.vote.options.reduce(
            (sum, option) => sum + option.voterIds.length,
            0,
        );

        return (
            <ThreadItemCard
                mine={mine}
                icon={<BarChart3 size={18} />}
                tone="vote"
                eyebrow="Vote"
                title={message.vote.question}
                footer={`총 ${totalVotes}표 · ${message.vote.multiSelect ? '복수 선택' : '단일 선택'}`}
            >
                <div className="flex flex-col gap-2">
                    {message.vote.options.map((option) => (
                        <div
                            key={option.id}
                            className="flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-2"
                        >
                            <span className="text-sm text-gray-700">
                                {option.label}
                            </span>
                            <span className="text-xs font-semibold text-gray-400">
                                {option.voterIds.length}표
                            </span>
                        </div>
                    ))}
                </div>
            </ThreadItemCard>
        );
    }

    if (message.kind === 'schedule') {
        return (
            <ThreadItemCard
                mine={mine}
                icon={<CalendarRange size={18} />}
                tone="schedule"
                eyebrow="Schedule"
                title={message.schedule.title}
                description={message.schedule.description}
                footer={message.schedule.metaLabel}
            />
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
                    mine={mine}
                    icon={<Handshake size={18} />}
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
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3">
                        <p className="text-xs font-semibold text-emerald-700">
                            현재 상태
                        </p>
                        <p className="mt-1 text-sm font-semibold text-emerald-900">
                            {statusLabel}
                        </p>
                        <p className="mt-1 text-xs font-medium text-emerald-700">
                            {formatReverseOfferApprovalProgress(
                                message.reverseOffer,
                            )}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-emerald-800/80">
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
                mine={mine}
                icon={<Handshake size={18} />}
                tone="proposal"
                eyebrow="제안"
                title={`${message.proposal.suggestedAmount.toLocaleString('ko-KR')}원`}
                description={message.proposal.description}
                footer={`가능 날짜: ${dateList || '미정'} · ${statusLabel}`}
            >
                {message.status === 'PENDING' && !mine && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-accent py-2 text-xs font-semibold text-white"
                        >
                            <Check size={13} />
                            수락
                        </button>
                        <button
                            type="button"
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gray-100 py-2 text-xs font-semibold text-gray-600"
                        >
                            협의
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-400"
                        >
                            <X size={13} />
                        </button>
                    </div>
                )}
                {message.status === 'ACCEPTED' && (
                    <div className="flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                        <Check size={13} />
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
            mine={mine}
            icon={<FileText size={18} />}
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
    const showMobileRoomInfoPanel =
        chatNavExpanded && chatNavMode.kind === 'room-info';

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

    return (
        <>
            <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-surface">
                <div className="fixed left-0 right-0 top-0 z-40 border-b border-gray-200 bg-white">
                    <div className="mx-auto max-w-107.5">
                        <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
                            <div className="flex items-center gap-2">
                                <IconButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.back()}
                                    label="뒤로가기"
                                    className="text-gray-700"
                                    icon={
                                        <ArrowLeft
                                            size={22}
                                            className="text-gray-700"
                                        />
                                    }
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-base font-semibold text-gray-900">
                                        {currentRoom.title}
                                    </p>
                                    <p className="truncate text-xs text-gray-400">
                                        {headerSubtitle}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {currentRoom.category === 'spot' && (
                                    <IconButton
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            openRoomInfo(currentRoom.id)
                                        }
                                        label="참여자 정보"
                                        className="text-gray-700"
                                        icon={
                                            <Users
                                                size={20}
                                                className="text-gray-700"
                                            />
                                        }
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-6 pt-18">
                    <div className="mx-auto flex max-w-3xl flex-col gap-4">
                        {currentRoom.category === 'spot' ? (
                            <section className="flex justify-center">
                                <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-[11px] font-semibold text-brand-800">
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
                        ) : (
                            <PersonalContextCard room={currentRoom} />
                        )}

                        <section className="px-1 pb-2">
                            <div className="mb-4 flex items-center justify-between gap-3 px-1">
                                <div>
                                    <p className="text-[11px] font-semibold tracking-[0.16em] text-gray-400 uppercase">
                                        Thread
                                    </p>
                                    <h2 className="mt-1 text-base font-bold text-gray-900">
                                        {currentRoom.category === 'spot'
                                            ? '스팟 대화'
                                            : '개인 대화'}
                                    </h2>
                                </div>
                                <div className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-800">
                                    {messageCount}개 메시지
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
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
                                                className="flex flex-col items-center gap-3"
                                            >
                                                {showDate && (
                                                    <div className="flex justify-center">
                                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500">
                                                            {formatDateChip(
                                                                message.createdAt,
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] text-gray-500 shadow-sm">
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
                                            className="flex flex-col gap-3"
                                        >
                                            {showDate && (
                                                <div className="flex justify-center">
                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500">
                                                        {formatDateChip(
                                                            message.createdAt,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            <div
                                                className={cn(
                                                    'flex items-end gap-2',
                                                    mine
                                                        ? 'justify-end'
                                                        : 'justify-start',
                                                )}
                                            >
                                                {!mine && (
                                                    <div className="mb-1 flex w-9 shrink-0 justify-center">
                                                        {isFirstInGroup ? (
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-900">
                                                                {message.authorName.slice(
                                                                    0,
                                                                    1,
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="h-9 w-9" />
                                                        )}
                                                    </div>
                                                )}

                                                <div
                                                    className={cn(
                                                        'flex w-[96vw] max-w-[96vw] flex-col gap-1 sm:w-auto sm:max-w-[74vw] md:max-w-[82%]',
                                                        mine
                                                            ? 'items-end'
                                                            : 'items-start',
                                                    )}
                                                >
                                                    {!mine &&
                                                        isFirstInGroup &&
                                                        currentRoom.category ===
                                                            'spot' && (
                                                            <span className="px-1 text-[11px] font-medium text-gray-400">
                                                                {
                                                                    message.authorName
                                                                }
                                                            </span>
                                                        )}

                                                    <div
                                                        className={cn(
                                                            'flex items-end gap-2',
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
                                                            )}
                                                        </div>

                                                        {isLastInGroup && (
                                                            <span className="shrink-0 px-1 text-[11px] text-gray-400">
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

                <div className="shrink-0 border-t border-gray-200 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 md:pb-[calc(env(safe-area-inset-bottom)+6rem)]">
                    <div className="mx-auto flex max-w-3xl items-end gap-2">
                        {currentRoom.category === 'spot' ? (
                            <button
                                type="button"
                                onClick={() => setShortcutPickerOpen(true)}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                                aria-label="바로가기 공유"
                            >
                                <Plus size={18} />
                            </button>
                        ) : null}

                        <div className="flex min-h-11 flex-1 items-end rounded-[26px] border border-gray-200 bg-gray-50 px-4 py-2 shadow-sm">
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
                                className="max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                            />
                        </div>

                        {draft.trim() ? (
                            <button
                                type="button"
                                onClick={handleSend}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-800 text-white shadow-sm transition-colors hover:bg-brand-900"
                                aria-label="전송"
                            >
                                <SendHorizonal size={18} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors active:bg-gray-200"
                                aria-label="음성메시지"
                            >
                                {currentRoom.category === 'personal' ? (
                                    <Mic size={18} />
                                ) : (
                                    <SendHorizonal size={18} />
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
                    title="대화에 바로가기 공유"
                    snapPoint="half"
                >
                    <div className="flex flex-col gap-3 pb-2">
                        <p className="text-sm leading-6 text-gray-500">
                            이 방에 이미 등록된 투표, 일정, 파일만 바로가기
                            메시지로 공유할 수 있어요.
                        </p>

                        {shareableActionItems.length > 0 ? (
                            <div className="overflow-hidden rounded-[20px] border border-gray-200 bg-white">
                                {shareableActionItems.map((item, index) => {
                                    const itemIcon =
                                        item.kind === 'vote' ? (
                                            <BarChart3 size={18} />
                                        ) : item.kind === 'schedule' ? (
                                            <CalendarRange size={18} />
                                        ) : (
                                            <FileText size={18} />
                                        );
                                    const itemToneClassName =
                                        item.kind === 'vote'
                                            ? 'bg-amber-50 text-amber-700'
                                            : item.kind === 'schedule'
                                              ? 'bg-brand-50 text-brand-800'
                                              : 'bg-gray-100 text-gray-700';
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
                                                'flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 active:scale-[0.99]',
                                                index > 0 &&
                                                    'border-t border-gray-100',
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
                                                <p className="line-clamp-2 break-words text-sm leading-5 font-semibold text-gray-900">
                                                    {itemTitle}
                                                </p>
                                                <p className="mt-0.5 line-clamp-2 break-words text-xs leading-5 text-gray-500">
                                                    {itemDescription}
                                                </p>
                                            </div>
                                            <ArrowUpRight
                                                size={16}
                                                className="mt-0.5 shrink-0 text-gray-400"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<Plus size={22} />}
                                title="공유할 바로가기가 없어요"
                                description="먼저 이 방에서 투표, 일정, 파일을 만들어 주세요."
                            />
                        )}
                    </div>
                </BottomSheet>
            ) : null}

            {showMobileRoomInfoPanel ? (
                <div className="fixed inset-0 z-50 md:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/30"
                        onClick={closeChatNav}
                        aria-label="대화 정보 닫기"
                    />
                    <div className="absolute bottom-1 left-1 right-1">
                        <div className="mx-auto max-w-107.5 overflow-hidden rounded-[28px] border-2 border-[#3b4954] bg-[#1e2938]">
                            <div className="max-h-[calc(80dvh-5rem)] overflow-y-auto overscroll-contain px-4 pt-4 pb-4">
                                <ChatCreationPanel onClose={closeChatNav} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
