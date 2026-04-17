'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Chip, IconButton } from '@frontend/design-system';
import {
    IconChartBar,
    IconCalendarEvent,
    IconChevronDown,
    IconChevronRight,
    IconDownload,
    IconFileText,
    IconHeartHandshake,
    IconMap,
    IconMessageCirclePlus,
    IconSearch,
    IconUserPlus,
} from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { useChatNavStore } from '@/shared/model/chat-nav-store';
import { SearchBar } from '@/shared/ui/SearchBar';
import { ChatCreationPanel } from '../ui/ChatCreationPanel';
import { ChatHeaderContextSelect } from '../ui/ChatHeaderContextSelect';
import { ChatRoomList } from '../ui/ChatRoomList';
import {
    PERSONAL_CHAT_CONTEXT_ID,
    useMainChatStore,
} from '../model/use-main-chat-store';
import { formatReverseOfferApprovalProgress } from '../model/types';
import { isSupporterForSpot } from '../model/mock';
import {
    buildScheduleSubtitle,
    findSpotActionItem,
    getSpotActionItems,
} from '../model/spot-action-items';
import type {
    ChatRouteIntent,
    MainChatTopTab,
    MainChatPersonalFilter,
    PersonalChatRoom,
    SpotActionItem,
    SpotChatRoom,
} from '../model/types';
import { BottomSheet, Main } from '@/shared/ui';
import type { SharedFile } from '@/entities/spot/types';

const PERSONAL_FILTERS: Array<{
    value: MainChatPersonalFilter;
    label: string;
}> = [
    { value: 'all', label: '전체' },
    { value: 'unread', label: '안읽음' },
    { value: 'SUPPORTER', label: '서포터' },
    { value: 'PARTNER', label: '파트너' },
];

const DEFAULT_CHAT_ROUTE_INTENT: ChatRouteIntent = { kind: 'default' };

interface MainChatPageClientProps {
    initialIntent?: ChatRouteIntent;
    initialTopTab?: MainChatTopTab;
}

function formatListTime(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return new Intl.DateTimeFormat('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    }
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
    }).format(date);
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getReverseOfferStatusLabel(
    status: 'PARTNER_REVIEW' | 'ADMIN_APPROVAL_PENDING',
) {
    return status === 'PARTNER_REVIEW' ? '파트너 검토 중' : '어드민 승인 대기';
}

function getLastSpotRoomPreview(room: SpotChatRoom): string {
    const messages = room.messages;

    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];

        if (message.kind === 'system') {
            return `팀 채팅방 · ${message.content}`;
        }

        if (message.kind === 'message') {
            return `팀 채팅방 · ${message.content}`;
        }

        if (message.kind === 'vote') {
            return `팀 채팅방 · 투표: ${message.vote.question}`;
        }

        if (message.kind === 'schedule') {
            return `팀 채팅방 · 일정: ${message.schedule.title}`;
        }

        if (message.kind === 'reverse-offer') {
            return `팀 채팅방 · 역제안: ${formatReverseOfferApprovalProgress(message.reverseOffer)}`;
        }

        if (message.kind === 'proposal') {
            return `팀 채팅방 · 제안: ${message.proposal.suggestedAmount.toLocaleString('ko-KR')}원`;
        }

        if (message.kind === 'file') {
            return `팀 채팅방 · 파일: ${message.file.name}`;
        }
    }

    return `팀 채팅방 · ${room.subtitle}`;
}

function getSafeTeamContextId(
    spotRooms: SpotChatRoom[],
    currentContextId: string,
    preservedContextId: string | null,
): string | null {
    if (spotRooms.some((room) => room.id === currentContextId)) {
        return currentContextId;
    }

    if (
        preservedContextId &&
        spotRooms.some((room) => room.id === preservedContextId)
    ) {
        return preservedContextId;
    }

    return spotRooms[0]?.id ?? null;
}

function getTopTabForResolvedIntent(
    rooms: Array<PersonalChatRoom | SpotChatRoom>,
    initialIntent: ChatRouteIntent,
    resolvedRoomId: string | null,
    requestedTopTab: MainChatTopTab,
): MainChatTopTab {
    if (initialIntent.kind === 'default') {
        return requestedTopTab;
    }

    if (initialIntent.kind === 'user') {
        return 'personal';
    }

    if (!resolvedRoomId) {
        return 'personal';
    }

    const resolvedRoom = rooms.find((room) => room.id === resolvedRoomId);

    if (!resolvedRoom) {
        return 'personal';
    }

    return resolvedRoom.category === 'spot' ? 'team' : 'personal';
}

function SpotRoomListRow({
    room,
    onOpen,
}: {
    room: SpotChatRoom;
    onOpen: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
        >
            <div className="relative shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-base font-bold text-gray-600">
                    {room.title.slice(0, 1)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-800 text-[8px] font-bold text-white">
                    S
                </div>
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-gray-900">
                        {room.title}
                    </span>
                    <span
                        suppressHydrationWarning
                        className="shrink-0 text-[11px] text-gray-400"
                    >
                        {formatListTime(room.updatedAt)}
                    </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-gray-500">
                    {getLastSpotRoomPreview(room)}
                </p>
            </div>
        </button>
    );
}

/* ── 파일 묶음 행 (접힌/펼친) ─────────────────────────────── */
function FileListRow({ files }: { files: SharedFile[] }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="divide-y divide-gray-50">
            {/* 헤더 행 — 1대1 채팅 행과 동일한 높이/패딩 */}
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
            >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <IconFileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                            파일
                        </span>
                        <span className="shrink-0 text-[11px] text-gray-400">
                            {files.length}개
                        </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-gray-500">
                        {files.map((f) => f.name).join(', ')}
                    </p>
                </div>
                <span className="shrink-0 text-gray-300">
                    {open ? (
                        <IconChevronDown size={16} />
                    ) : (
                        <IconChevronRight size={16} />
                    )}
                </span>
            </button>

            {/* 펼쳐진 파일 목록 */}
            {open &&
                files.map((file) => (
                    <div
                        key={file.id}
                        className="flex items-center gap-3 bg-gray-50 px-4 py-3"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm">
                            <IconFileText size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-800">
                                {file.name}
                            </p>
                            <p className="text-[11px] text-gray-400">
                                {file.uploaderNickname} ·{' '}
                                {formatFileSize(file.sizeBytes)}
                            </p>
                        </div>
                        <a
                            href={file.url}
                            download={file.name}
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 active:bg-gray-300"
                            aria-label={`${file.name} 다운로드`}
                        >
                            <IconDownload size={16} />
                        </a>
                    </div>
                ))}
        </div>
    );
}

/* ── 스팟 컨텍스트 아이템 목록 ────────────────────────────── */
function SpotItemList({
    room,
    onOpenRoom,
    onActionItem,
}: {
    room: SpotChatRoom;
    onOpenRoom: () => void;
    onActionItem: (item: SpotActionItem) => void;
}) {
    const actionItems = getSpotActionItems(room);
    const reverseOfferItem =
        actionItems.find(
            (
                item,
            ): item is Extract<SpotActionItem, { kind: 'reverse-offer' }> =>
                item.kind === 'reverse-offer',
        ) ?? null;
    const voteItems = actionItems.filter(
        (item): item is Extract<SpotActionItem, { kind: 'vote' }> =>
            item.kind === 'vote',
    );

    const hasSchedule = Boolean(room.spot.schedule);
    const hasFiles = room.spot.files.length > 0;
    const hasItems =
        Boolean(reverseOfferItem) ||
        voteItems.length > 0 ||
        hasSchedule ||
        hasFiles;

    return (
        <div className="flex flex-col divide-y divide-gray-100">
            <SpotRoomListRow room={room} onOpen={onOpenRoom} />

            {reverseOfferItem && reverseOfferItem.kind === 'reverse-offer' && (
                <button
                    type="button"
                    onClick={() => onActionItem(reverseOfferItem)}
                    className="flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <IconHeartHandshake size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-gray-900">
                                역제안 진행 상태
                            </span>
                            <span
                                suppressHydrationWarning
                                className="shrink-0 text-[11px] text-gray-400"
                            >
                                {formatListTime(reverseOfferItem.updatedAt)}
                            </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                            {getReverseOfferStatusLabel(
                                reverseOfferItem.reverseOffer.status,
                            )}{' '}
                            ·{' '}
                            {formatReverseOfferApprovalProgress(
                                reverseOfferItem.reverseOffer,
                            )}
                        </p>
                    </div>
                </button>
            )}

            {/* 투표 */}
            {voteItems.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={() => onActionItem(item)}
                    className="flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                        <IconChartBar size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-gray-900">
                                {item.kind === 'vote' ? item.vote.question : ''}
                            </span>
                            <span
                                suppressHydrationWarning
                                className="shrink-0 text-[11px] text-gray-400"
                            >
                                {formatListTime(item.updatedAt)}
                            </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                            {item.kind === 'vote'
                                ? `${item.vote.options.length}개 선택지 · ${item.vote.multiSelect ? '복수 선택' : '단일 선택'}`
                                : ''}
                        </p>
                    </div>
                </button>
            ))}

            {/* 일정 — 탭 시 확장 nav 오픈 */}
            {hasSchedule && room.spot.schedule && (
                <button
                    type="button"
                    onClick={() => {
                        const scheduleItem = actionItems.find(
                            (
                                item,
                            ): item is Extract<
                                SpotActionItem,
                                { kind: 'schedule' }
                            > => item.kind === 'schedule',
                        );

                        if (scheduleItem) {
                            onActionItem(scheduleItem);
                        }
                    }}
                    className="flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <IconCalendarEvent size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-gray-900">
                                {room.spot.schedule.confirmedSlot
                                    ? '일정 확정'
                                    : '일정 조율 중'}
                            </span>
                            <span
                                suppressHydrationWarning
                                className="shrink-0 text-[11px] text-gray-400"
                            >
                                {formatListTime(room.updatedAt)}
                            </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                            {buildScheduleSubtitle(room.spot.schedule)}
                        </p>
                    </div>
                </button>
            )}

            {/* 파일 묶음 */}
            {hasFiles && <FileListRow files={room.spot.files} />}

            {!hasItems ? (
                <div className="px-4 py-4 text-sm text-gray-400">
                    아직 등록된 투표·일정·파일·역제안이 없어요.
                </div>
            ) : null}
        </div>
    );
}

export function MainChatPageClient({
    initialIntent,
    initialTopTab = 'personal',
}: MainChatPageClientProps) {
    const routeIntent = initialIntent ?? DEFAULT_CHAT_ROUTE_INTENT;
    const pathname = usePathname();
    const { push, replace } = useRouter();
    const handledRouteActionRef = useRef<string | null>(null);
    const [lastTeamContextId, setLastTeamContextId] = useState<string | null>(
        null,
    );
    const routeActionRoomId =
        routeIntent.kind === 'room' && routeIntent.actionTarget
            ? routeIntent.roomId
            : null;
    const routeActionKey =
        routeIntent.kind === 'room' && routeIntent.actionTarget
            ? `${routeIntent.roomId}:${routeIntent.actionTarget.actionKind}:${routeIntent.actionTarget.actionId}`
            : null;
    const searchParams = useSearchParams();
    const tabQuery = searchParams.get('tab');
    const activeTopTab: MainChatTopTab =
        tabQuery === 'team' || tabQuery === 'personal'
            ? tabQuery
            : initialTopTab;
    const [personalSearchQuery, setPersonalSearchQuery] = useState('');
    const [isPersonalSearchOpen, setIsPersonalSearchOpen] = useState(false);
    const {
        rooms,
        selectedContextId,
        personalFilter,
        setSelectedContextId,
        setPersonalFilter,
        applyRouteIntent,
    } = useMainChatStore();
    const {
        subNavOpen,
        setSubNavOpen,
        close: closeChatNav,
        openPersonalCreate,
        openFriendAdd,
        openActionItem,
        openCreation,
        expanded: chatNavExpanded,
        mode: chatNavMode,
    } = useChatNavStore();
    const showMobileChatNavPanel =
        chatNavExpanded &&
        (chatNavMode.kind === 'action-item' ||
            chatNavMode.kind === 'creation' ||
            chatNavMode.kind === 'room-info' ||
            chatNavMode.kind === 'personal-create' ||
            chatNavMode.kind === 'friend-add');

    useEffect(() => {
        const resolution = applyRouteIntent(routeIntent);
        const resolvedTopTab = getTopTabForResolvedIntent(
            rooms,
            routeIntent,
            resolution.roomId,
            initialTopTab,
        );

        if (resolvedTopTab !== activeTopTab) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', resolvedTopTab);
            replace(`${pathname}?${params.toString()}`, { scroll: false });
        }

        if (
            resolution.roomId &&
            (routeIntent.kind === 'user' ||
                (routeIntent.kind === 'room' && !routeIntent.actionTarget))
        ) {
            replace(`/chat/${resolution.roomId}`);
        }
    }, [
        activeTopTab,
        applyRouteIntent,
        initialTopTab,
        pathname,
        replace,
        rooms,
        routeIntent,
        searchParams,
    ]);

    useEffect(() => {
        if (routeIntent.kind !== 'room' || !routeIntent.actionTarget) {
            handledRouteActionRef.current = null;
            return;
        }

        if (handledRouteActionRef.current === routeActionKey) {
            return;
        }

        const room = rooms.find(
            (candidate): candidate is SpotChatRoom =>
                candidate.id === routeIntent.roomId &&
                candidate.category === 'spot',
        );

        if (!room) {
            handledRouteActionRef.current = routeActionKey;
            closeChatNav();
            return;
        }

        const item = findSpotActionItem(room, routeIntent.actionTarget);

        if (!item) {
            handledRouteActionRef.current = routeActionKey;
            closeChatNav();
            return;
        }

        openActionItem(item);
        handledRouteActionRef.current = routeActionKey;
    }, [closeChatNav, openActionItem, routeActionKey, rooms, routeIntent]);

    const personalRooms = useMemo(
        () =>
            rooms.filter(
                (room): room is PersonalChatRoom =>
                    room.category === 'personal',
            ),
        [rooms],
    );
    const spotRooms = useMemo(
        () =>
            rooms.filter(
                (room): room is SpotChatRoom => room.category === 'spot',
            ),
        [rooms],
    );

    const teamDropdownOptions = useMemo(
        () =>
            spotRooms.map((room) => ({
                label: room.title,
                value: room.id,
            })),
        [spotRooms],
    );

    const filteredPersonalRooms = useMemo(() => {
        const roomsByFilter = (() => {
            switch (personalFilter) {
                case 'unread':
                    return personalRooms.filter((room) => room.unreadCount > 0);
                case 'SUPPORTER':
                    return personalRooms.filter(
                        (room) => room.counterpartRole === 'SUPPORTER',
                    );
                case 'PARTNER':
                    return personalRooms.filter(
                        (room) => room.counterpartRole === 'PARTNER',
                    );
                case 'all':
                default:
                    return personalRooms;
            }
        })();

        const trimmedQuery = personalSearchQuery.trim().toLowerCase();

        if (!trimmedQuery) {
            return roomsByFilter;
        }

        return roomsByFilter.filter((room) => {
            const searchableText = [
                room.title,
                room.partnerName,
                room.presenceLabel,
                room.description,
            ]
                .join(' ')
                .toLowerCase();

            return searchableText.includes(trimmedQuery);
        });
    }, [personalFilter, personalRooms, personalSearchQuery]);

    const isPersonalMode = activeTopTab === 'personal';
    if (
        spotRooms.some((room) => room.id === selectedContextId) &&
        lastTeamContextId !== selectedContextId
    ) {
        setLastTeamContextId(selectedContextId);
    }
    const safeTeamContextId = getSafeTeamContextId(
        spotRooms,
        selectedContextId,
        lastTeamContextId,
    );
    const teamContextSelectOptions =
        teamDropdownOptions.length > 0
            ? teamDropdownOptions
            : [{ label: '참여 중인 팀 채팅 없음', value: '' }];

    useEffect(() => {
        if (isPersonalMode) {
            if (selectedContextId !== PERSONAL_CHAT_CONTEXT_ID) {
                setSelectedContextId(PERSONAL_CHAT_CONTEXT_ID);
            }

            return;
        }

        if (safeTeamContextId && selectedContextId !== safeTeamContextId) {
            setSelectedContextId(safeTeamContextId);
        }
    }, [
        isPersonalMode,
        safeTeamContextId,
        selectedContextId,
        setSelectedContextId,
    ]);

    useEffect(() => {
        if (routeActionKey || routeActionRoomId !== null) {
            return;
        }

        closeChatNav();
    }, [closeChatNav, routeActionKey, routeActionRoomId]);

    const selectedSpotRoom = useMemo(
        () =>
            isPersonalMode
                ? null
                : (spotRooms.find((room) => room.id === safeTeamContextId) ??
                  null),
        [isPersonalMode, safeTeamContextId, spotRooms],
    );

    return (
        <Main>
            <div className="flex min-h-0 flex-1 flex-col bg-white">
                {/* 헤더 */}
                <div className="shrink-0 border-b border-gray-100 bg-white">
                    <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
                        <div className="min-w-0 max-w-60 flex-1">
                            {isPersonalMode ? (
                                <div className="px-1 font-bold">개인 채팅</div>
                            ) : (
                                <ChatHeaderContextSelect
                                    value={safeTeamContextId ?? ''}
                                    onChange={(e) =>
                                        setSelectedContextId(e.target.value)
                                    }
                                    options={teamContextSelectOptions}
                                    disabled={teamDropdownOptions.length === 0}
                                    ariaLabel="팀 채팅방 전환"
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            {isPersonalMode ? (
                                <>
                                    <IconButton
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setIsPersonalSearchOpen(
                                                (current) => !current,
                                            )
                                        }
                                        label="개인 채팅 검색"
                                        className="text-gray-700"
                                        icon={
                                            <IconSearch
                                                size={22}
                                                className="text-gray-700"
                                            />
                                        }
                                    />
                                    <IconButton
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={openPersonalCreate}
                                        label="채팅 생성"
                                        className="text-gray-700"
                                        icon={
                                            <IconMessageCirclePlus
                                                size={22}
                                                className="text-gray-700"
                                            />
                                        }
                                    />
                                </>
                            ) : (
                                <IconButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSubNavOpen(!subNavOpen)}
                                    label="항목 추가"
                                    className="text-gray-700"
                                    icon={
                                        <IconMessageCirclePlus
                                            size={22}
                                            className="text-gray-700"
                                        />
                                    }
                                />
                            )}
                            {isPersonalMode ? (
                                <IconButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={openFriendAdd}
                                    label="친구 추가"
                                    className="text-gray-700"
                                    icon={
                                        <IconUserPlus
                                            size={22}
                                            className="text-gray-700"
                                        />
                                    }
                                />
                            ) : null}
                            <IconButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => push('/map')}
                                label="맵으로 돌아가기"
                                className="text-gray-700"
                                icon={
                                    <IconMap
                                        size={22}
                                        className="text-gray-700"
                                    />
                                }
                            />
                        </div>
                    </div>

                    {isPersonalMode && isPersonalSearchOpen ? (
                        <div className="border-t border-gray-100">
                            <SearchBar
                                value={personalSearchQuery}
                                onChange={setPersonalSearchQuery}
                                placeholder="닉네임으로 개인 채팅 검색"
                                autoFocus
                            />
                        </div>
                    ) : null}

                    {/* 개인채팅 필터 칩 */}
                    {isPersonalMode ? (
                        <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
                            {PERSONAL_FILTERS.map((filter) => {
                                const selected =
                                    personalFilter === filter.value;
                                return (
                                    <Chip
                                        key={filter.value}
                                        selected={selected}
                                        tone="brand"
                                        size="md"
                                        onClick={() =>
                                            setPersonalFilter(
                                                filter.value as MainChatPersonalFilter,
                                            )
                                        }
                                        className={cn(
                                            'shrink-0',
                                            selected
                                                ? 'border-gray-900 bg-gray-900 text-white'
                                                : 'border-gray-200 bg-white text-gray-700',
                                        )}
                                    >
                                        {filter.label}
                                    </Chip>
                                );
                            })}
                        </div>
                    ) : null}
                </div>

                {/* 컨텐츠 */}
                <div className="flex-1 overflow-y-auto pb-28">
                    {isPersonalMode ? (
                        filteredPersonalRooms.length > 0 ? (
                            <ChatRoomList rooms={filteredPersonalRooms} />
                        ) : (
                            <div className="px-4 py-10 text-center text-sm text-gray-400">
                                {personalSearchQuery.trim()
                                    ? '검색한 닉네임과 맞는 개인 채팅이 없어요.'
                                    : '현재 필터에 맞는 개인 채팅이 없어요.'}
                            </div>
                        )
                    ) : selectedSpotRoom ? (
                        <SpotItemList
                            room={selectedSpotRoom}
                            onOpenRoom={() =>
                                push(`/chat/${selectedSpotRoom.id}`)
                            }
                            onActionItem={(item) => openActionItem(item)}
                        />
                    ) : (
                        <div className="px-4 py-10 text-center text-sm text-gray-400">
                            참여 중인 팀 채팅이 없어요.
                        </div>
                    )}
                </div>
            </div>

            <BottomSheet
                open={showMobileChatNavPanel}
                onClose={closeChatNav}
                snapPoint="half"
                className="border-2 border-[#3b4954] bg-[#1e2938]"
            >
                <ChatCreationPanel onClose={closeChatNav} />
            </BottomSheet>

            <BottomSheet
                open={!isPersonalMode && subNavOpen}
                onClose={() => setSubNavOpen(false)}
                snapPoint="half"
                title="항목 추가"
                className="md:hidden"
            >
                <div className="grid grid-cols-2 gap-2 pb-4">
                    {[
                        {
                            step: 'schedule' as const,
                            label: '일정',
                            description: '가능한 시간 조율',
                            icon: <IconCalendarEvent size={18} />,
                            tone: 'bg-brand-50 text-brand-800',
                        },
                        {
                            step: 'vote' as const,
                            label: '투표',
                            description: '선택지를 제안해요',
                            icon: <IconChartBar size={18} />,
                            tone: 'bg-amber-50 text-amber-700',
                        },
                        {
                            step: 'file' as const,
                            label: '파일',
                            description: '첨부 파일 공유',
                            icon: <IconFileText size={18} />,
                            tone: 'bg-gray-100 text-gray-700',
                        },
                        ...(selectedSpotRoom &&
                        isSupporterForSpot(selectedSpotRoom)
                            ? [
                                  {
                                      step: 'reverse-offer' as const,
                                      label: '역제안',
                                      description: '파트너에게 역제안',
                                      icon: <IconHeartHandshake size={18} />,
                                      tone: 'bg-emerald-50 text-emerald-700',
                                  },
                              ]
                            : []),
                    ].map(({ step, label, description, icon, tone }) => (
                        <button
                            key={step}
                            type="button"
                            onClick={() => {
                                setSubNavOpen(false);
                                openCreation(step);
                            }}
                            className={cn(
                                'flex items-start gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-left transition hover:bg-gray-50 active:scale-[0.99]',
                            )}
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
                                <p className="text-sm font-semibold text-gray-900">
                                    {label}
                                </p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    {description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </BottomSheet>
        </Main>
    );
}
