'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@frontend/design-system';
import {
    IconChartBar,
    IconCalendarEvent,
    IconCheck,
    IconChevronLeft,
    IconChevronRight,
    IconCopy,
    IconFileText,
    IconHeartHandshake,
    IconLink,
    IconPlus,
    IconTrash,
    IconUpload,
    IconUsers,
    IconX,
} from '@tabler/icons-react';
import { UserAvatarStatic } from '@/shared/ui';
import { SearchBar } from '@/shared/ui/SearchBar';
import { useChatNavStore } from '@/shared/model/chat-nav-store';
import { formatKrw } from '@/features/post/model/pricing-preview';
import { useMainChatStore } from '../model/use-main-chat-store';
import { resolveReverseOfferFinancialSummary } from '../model/reverse-offer-finance';
import { formatReverseOfferApprovalProgress } from '../model/types';
import {
    CHAT_CURRENT_USER_ID,
    getChatDirectoryCandidates,
} from '../model/mock';
import type {
    ChatReverseOfferFinancialSnapshot,
    ChatReverseOfferStatus,
    SpotActionItem,
    SpotChatRoom,
    PersonalChatRoom,
} from '../model/types';
import type { ScheduleSlot } from '@/entities/spot/types';

interface ChatCreationPanelProps {
    onClose: () => void;
}

function ReverseOfferMoneySummary({
    summary,
}: {
    summary: ChatReverseOfferFinancialSnapshot;
}) {
    const topLabel =
        summary.sourceKind === 'management'
            ? '사전 협의 기준'
            : '현재 스팟 정보 기준 예상';
    const topCaption =
        summary.sourceKind === 'management'
            ? '팀 채팅에서 맞춘 목표 금액과 인원 기준으로 다시 확인해 주세요.'
            : '사전 협의 기준 데이터가 아직 없어 현재 스팟 정보로만 예상 금액을 보여드려요.';

    return (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <div className="space-y-3">
                <p className="text-xs font-semibold text-white">{topLabel}</p>
                <p className="mt-1 text-xs leading-5 text-white/45">
                    {topCaption}
                </p>
                <dl className="mt-2 space-y-2 text-sm text-white/70">
                    <div className="flex items-center justify-between gap-4">
                        <dt>목표 금액</dt>
                        <dd className="font-semibold text-white">
                            {formatKrw(summary.targetAmount)}
                        </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <dt>기준 인원</dt>
                        <dd className="font-semibold text-white">
                            {summary.agreedHeadcount}명
                        </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <dt>1인당 금액</dt>
                        <dd className="font-semibold text-white">
                            {summary.agreedRemainder > 0 ? '약 ' : ''}
                            {formatKrw(summary.agreedPerPersonAmount)}
                        </dd>
                    </div>
                </dl>
                {summary.agreedRemainder > 0 ? (
                    <p className="mt-2 text-xs leading-5 text-white/45">
                        1원 단위 차이는 마지막 정산에서 조정될 수 있어요.
                    </p>
                ) : null}

                {summary.sourceKind === 'management' &&
                summary.comparisonNeeded ? (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3">
                        <p className="text-xs font-semibold text-amber-100">
                            현재 참여 인원 기준
                        </p>
                        <dl className="mt-2 space-y-2 text-sm text-white/75">
                            <div className="flex items-center justify-between gap-4">
                                <dt>현재 참여 인원</dt>
                                <dd className="font-semibold text-white">
                                    {summary.currentHeadcount}명
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt>예상 1인당 금액</dt>
                                <dd className="font-semibold text-white">
                                    {summary.currentRemainder > 0 ? '약 ' : ''}
                                    {formatKrw(summary.currentPerPersonAmount)}
                                </dd>
                            </div>
                        </dl>
                        <p className="mt-2 text-xs leading-5 text-white/55">
                            현재 인원이 사전 협의 인원과 다르면 실제 부담 금액도
                            함께 다시 확인해 주세요.
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function ReverseOfferPenaltyNotice({
    hasAuthoritativeAgreement,
}: {
    hasAuthoritativeAgreement: boolean;
}) {
    return (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-white uppercase">
                주의사항
            </p>
            <p className="mt-2 text-sm leading-6 text-white/80">
                팀 채팅에서 사전 협의한 금액·인원과
                {hasAuthoritativeAgreement
                    ? ' 위 기준이 다르면'
                    : ' 실제 협의 내용이 다르면'}{' '}
                위약금이 발생할 수 있어요. 역제안을 등록하기 전에 한 번 더
                꼼꼼히 확인해 주세요.
            </p>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   FriendChip (개인채팅용)
───────────────────────────────────────────────────────────── */
function FriendChip({
    selected,
    name,
    role,
    presenceLabel,
    onClick,
}: {
    selected: boolean;
    name: string;
    role: 'SUPPORTER' | 'PARTNER';
    presenceLabel: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex min-w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-center transition ${
                selected
                    ? 'border-brand-300 bg-brand-50 text-brand-950'
                    : 'border-white/10 bg-white/5 text-white'
            }`}
        >
            <div
                className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${
                    selected
                        ? 'bg-brand-800 text-white'
                        : 'bg-white/10 text-white'
                }`}
            >
                {name.slice(0, 1)}
            </div>
            <div className="space-y-0.5">
                <p className="text-sm font-semibold">{name}</p>
                <p
                    className={`text-[11px] ${selected ? 'text-brand-900/70' : 'text-white/55'}`}
                >
                    {role === 'SUPPORTER' ? '서포터' : '파트너'}
                </p>
                <p
                    className={`line-clamp-2 text-[10px] ${selected ? 'text-brand-900/70' : 'text-white/45'}`}
                >
                    {presenceLabel}
                </p>
            </div>
            {selected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-800 text-white">
                    <IconCheck size={12} stroke={2.5} />
                </span>
            )}
        </button>
    );
}

/* ─────────────────────────────────────────────────────────────
   투표 생성 패널
───────────────────────────────────────────────────────────── */
function VoteCreatePanel({
    room,
    onClose,
}: {
    room: SpotChatRoom;
    onClose: () => void;
}) {
    const { createTeamVote, setSelectedContextId } = useMainChatStore();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [multiSelect, setMultiSelect] = useState(false);

    function addOption() {
        if (options.length < 6) setOptions((p) => [...p, '']);
    }
    function removeOption(i: number) {
        if (options.length > 2)
            setOptions((p) => p.filter((_, idx) => idx !== i));
    }
    function updateOption(i: number, val: string) {
        setOptions((p) => p.map((o, idx) => (idx === i ? val : o)));
    }

    const filledOptions = options.filter((o) => o.trim());
    const canSubmit = question.trim() && filledOptions.length >= 2;

    function handleSubmit() {
        if (!canSubmit) return;
        // store에 직접 투표 데이터 주입
        setSelectedContextId(room.id);
        createTeamVote(
            question.trim(),
            options.filter((o) => o.trim()),
            multiSelect,
        );
        onClose();
    }

    return (
        <div className="pb-2">
            <p className="mb-4 text-center text-sm font-semibold text-white">
                투표 만들기
            </p>

            <div className="mb-3">
                <label className="mb-1.5 block text-xs font-medium text-white/50">
                    질문
                </label>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="예) 어떤 장소가 좋을까요?"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-brand-400/50 focus:outline-none"
                />
            </div>

            <div className="mb-3">
                <label className="mb-1.5 block text-xs font-medium text-white/50">
                    선택지
                </label>
                <div className="flex flex-col gap-2">
                    {options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) =>
                                    updateOption(i, e.target.value)
                                }
                                placeholder={`선택지 ${i + 1}`}
                                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-brand-400/50 focus:outline-none"
                            />
                            {options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeOption(i)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/30 hover:bg-white/10 hover:text-white/60"
                                >
                                    <IconX size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {options.length < 6 && (
                    <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60"
                    >
                        <IconPlus size={13} /> 선택지 추가
                    </button>
                )}
            </div>

            <button
                type="button"
                onClick={() => setMultiSelect((p) => !p)}
                className="mb-4 flex items-center gap-2 text-xs text-white/50"
            >
                <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                        multiSelect
                            ? 'border-brand-400 bg-brand-400'
                            : 'border-white/20 bg-transparent'
                    }`}
                >
                    {multiSelect && (
                        <IconCheck
                            size={10}
                            stroke={3}
                            className="text-white"
                        />
                    )}
                </div>
                복수 선택 허용
            </button>

            <Button
                fullWidth
                size="lg"
                disabled={!canSubmit}
                className="bg-white text-brand-900 hover:bg-brand-50 disabled:opacity-40 focus-visible:ring-white/40"
                onClick={handleSubmit}
            >
                투표 생성
            </Button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   일정 생성 패널 (웬투밋 그리드)
───────────────────────────────────────────────────────────── */
const SCHEDULE_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
const DAYS_PER_PAGE = 5;

function getDateRange(startOffset: number, count: number): string[] {
    return Array.from({ length: count }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + startOffset + i);
        return d.toISOString().slice(0, 10);
    });
}

function formatDateHeader(iso: string) {
    const d = new Date(iso);
    return {
        day: `${d.getDate()}`,
        weekday: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
    };
}

function getReverseOfferStatusLabel(status: ChatReverseOfferStatus) {
    return status === 'PARTNER_REVIEW' ? '파트너 검토 중' : '어드민 승인 대기';
}

function ScheduleCreatePanel({
    room,
    onClose,
}: {
    room: SpotChatRoom;
    onClose: () => void;
}) {
    const { updateSpotSchedule } = useMainChatStore();
    const existing = room.spot.schedule?.proposedSlots ?? [];
    const [slots, setSlots] = useState<ScheduleSlot[]>(existing);
    const [pageOffset, setPageOffset] = useState(0);
    const currentUserId = room.currentUserId;
    const totalParticipants = room.spot.participants.length;
    const dates = getDateRange(pageOffset, DAYS_PER_PAGE);

    function isMySlot(date: string, hour: number) {
        return slots.some(
            (s) =>
                s.date === date &&
                s.hour === hour &&
                s.availableUserIds.includes(currentUserId),
        );
    }
    function participantCount(date: string, hour: number) {
        return (
            slots.find((s) => s.date === date && s.hour === hour)
                ?.availableUserIds.length ?? 0
        );
    }
    function handleToggle(date: string, hour: number) {
        setSlots((prev) => {
            const existing = prev.find(
                (s) => s.date === date && s.hour === hour,
            );
            if (existing) {
                const mine = existing.availableUserIds.includes(currentUserId);
                const next = mine
                    ? existing.availableUserIds.filter(
                          (id) => id !== currentUserId,
                      )
                    : [...existing.availableUserIds, currentUserId];
                if (next.length === 0)
                    return prev.filter(
                        (s) => !(s.date === date && s.hour === hour),
                    );
                return prev.map((s) =>
                    s.date === date && s.hour === hour
                        ? { ...s, availableUserIds: next }
                        : s,
                );
            }
            return [...prev, { date, hour, availableUserIds: [currentUserId] }];
        });
    }

    function handleSave() {
        updateSpotSchedule(room.id, slots);
        onClose();
    }

    const myCount = slots.filter((s) =>
        s.availableUserIds.includes(currentUserId),
    ).length;

    return (
        <div className="pb-2">
            <p className="mb-3 text-center text-sm font-semibold text-white">
                일정 조율
            </p>

            <p className="mb-3 text-center text-xs text-white/40">
                가능한 시간을 탭해서 표시해주세요
            </p>

            {/* 날짜 페이지네이션 */}
            <div className="mb-2 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() =>
                        setPageOffset((p) => Math.max(0, p - DAYS_PER_PAGE))
                    }
                    disabled={pageOffset === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 disabled:opacity-20"
                >
                    <IconChevronLeft size={16} />
                </button>
                <span className="text-xs text-white/40">
                    {dates[0]} ~ {dates[dates.length - 1]}
                </span>
                <button
                    type="button"
                    onClick={() => setPageOffset((p) => p + DAYS_PER_PAGE)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10"
                >
                    <IconChevronRight size={16} />
                </button>
            </div>

            {/* 그리드 */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-3">
                <table className="w-full text-xs">
                    <thead>
                        <tr>
                            <th className="w-10 pb-2 text-white/30" />
                            {dates.map((d) => {
                                const { day, weekday } = formatDateHeader(d);
                                return (
                                    <th
                                        key={d}
                                        className="pb-2 text-center font-medium"
                                    >
                                        <span className="block text-[11px] text-white/40">
                                            {weekday}
                                        </span>
                                        <span className="block text-sm font-bold text-white">
                                            {day}
                                        </span>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {SCHEDULE_HOURS.map((hour) => (
                            <tr key={hour}>
                                <td className="pr-2 text-right text-[10px] text-white/30">
                                    {hour}:00
                                </td>
                                {dates.map((date) => {
                                    const mine = isMySlot(date, hour);
                                    const count = participantCount(date, hour);
                                    const intensity =
                                        totalParticipants > 0
                                            ? count / totalParticipants
                                            : 0;
                                    return (
                                        <td key={date} className="p-0.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggle(date, hour)
                                                }
                                                className={`h-7 w-full rounded transition-colors ${
                                                    mine
                                                        ? 'bg-brand-400 text-white'
                                                        : count > 0
                                                          ? 'text-brand-200'
                                                          : 'bg-white/5 text-white/10'
                                                }`}
                                                style={
                                                    !mine && count > 0
                                                        ? {
                                                              backgroundColor: `rgba(99,179,237,${0.15 + intensity * 0.55})`,
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {count > 0 ? count : ''}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-2 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded bg-brand-400" />
                        <span className="text-[10px] text-white/40">
                            내가 가능
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: 'rgba(99,179,237,0.5)' }}
                        />
                        <span className="text-[10px] text-white/40">
                            다른 참여자
                        </span>
                    </div>
                </div>
                <span className="text-[10px] text-white/30">
                    {myCount}개 선택됨
                </span>
            </div>

            <Button
                fullWidth
                size="lg"
                disabled={myCount === 0}
                className="bg-white text-brand-900 hover:bg-brand-50 disabled:opacity-40 focus-visible:ring-white/40"
                onClick={handleSave}
            >
                저장하기
            </Button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   파일 업로드 패널
───────────────────────────────────────────────────────────── */
function FileCreatePanel({ onClose }: { onClose: () => void }) {
    const { createTeamFileShare } = useMainChatStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);

    function handleFiles(incoming: FileList | null) {
        if (!incoming) return;
        setFiles((prev) => {
            const combined = [...prev, ...Array.from(incoming)];
            // 중복 제거 (이름+크기 기준)
            const seen = new Set<string>();
            return combined.filter((f) => {
                const key = `${f.name}-${f.size}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        });
    }

    function removeFile(i: number) {
        setFiles((p) => p.filter((_, idx) => idx !== i));
    }

    function formatSize(bytes: number) {
        if (bytes >= 1024 * 1024)
            return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
        return `${Math.round(bytes / 1024)}KB`;
    }

    function getFileIcon(name: string) {
        const ext = name.split('.').pop()?.toLowerCase() ?? '';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
            return '🖼';
        if (['pdf'].includes(ext)) return '📄';
        if (['doc', 'docx'].includes(ext)) return '📝';
        if (['xls', 'xlsx'].includes(ext)) return '📊';
        if (['zip', 'rar'].includes(ext)) return '📦';
        return '📎';
    }

    function handleUpload() {
        if (files.length === 0) return;
        // mock: 파일 이름/크기만 store에 반영 (실제 업로드 없음)
        for (const file of files) {
            createTeamFileShare(file.name, file.size);
        }
        onClose();
    }

    return (
        <div className="pb-2">
            <p className="mb-3 text-center text-sm font-semibold text-white">
                파일 추가
            </p>

            {/* 드롭존 */}
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mb-3 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center transition hover:border-white/30 hover:bg-white/8"
            >
                <IconUpload size={22} className="text-white/30" />
                <p className="text-sm text-white/50">
                    파일을 선택하거나 여기에 끌어다 놓으세요
                </p>
                <p className="text-[11px] text-white/25">
                    최대 10MB · 여러 파일 선택 가능
                </p>
            </button>
            <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />

            {/* 선택된 파일 목록 */}
            {files.length > 0 && (
                <div className="mb-4 flex flex-col gap-2">
                    {files.map((file, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                            <span className="text-xl">
                                {getFileIcon(file.name)}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">
                                    {file.name}
                                </p>
                                <p className="text-[11px] text-white/30">
                                    {formatSize(file.size)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-white/30 hover:bg-white/10 hover:text-white/60"
                            >
                                <IconTrash size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Button
                fullWidth
                size="lg"
                disabled={files.length === 0}
                className="bg-white text-brand-900 hover:bg-brand-50 disabled:opacity-40 focus-visible:ring-white/40"
                onClick={handleUpload}
            >
                업로드 ({files.length}개)
            </Button>
        </div>
    );
}

function ReverseOfferCreatePanel({
    room,
    onClose,
}: {
    room: SpotChatRoom;
    onClose: () => void;
}) {
    const { createTeamReverseOffer, setSelectedContextId } = useMainChatStore();
    const [priorAgreementReachedInChat, setPriorAgreementReachedInChat] =
        useState<boolean | null>(null);
    const financialSummary = resolveReverseOfferFinancialSummary(room);

    return (
        <div className="pb-2">
            <div className="mb-1 flex items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                    <IconHeartHandshake size={16} />
                </div>
            </div>
            <p className="mb-1 text-center text-sm font-semibold text-white">
                역제안 만들기
            </p>
            <p className="mb-4 text-center text-xs leading-5 text-white/40">
                팀 채팅에서 먼저 방향을 맞췄는지 확인한 뒤 역제안을 올려둘 수
                있어요.
            </p>

            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-sm font-semibold text-white">
                    팀 채팅에서 사전 합의가 이미 되었나요?
                </p>
                <p className="mt-1 text-xs leading-5 text-white/45">
                    선택 내용은 현재 상태 카드와 채팅 스레드에 함께 표시돼요.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                        { label: '네, 합의했어요', value: true },
                        { label: '아직 아니에요', value: false },
                    ].map((option) => {
                        const selected =
                            priorAgreementReachedInChat === option.value;

                        return (
                            <button
                                key={option.label}
                                type="button"
                                onClick={() =>
                                    setPriorAgreementReachedInChat(option.value)
                                }
                                className={`rounded-2xl border px-4 py-3 text-left transition ${
                                    selected
                                        ? 'border-emerald-300/60 bg-emerald-500/10 text-white'
                                        : 'border-white/10 bg-black/10 text-white/70 hover:bg-white/10'
                                }`}
                            >
                                <span className="text-sm font-medium">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {financialSummary ? (
                <ReverseOfferMoneySummary summary={financialSummary} />
            ) : null}
            <ReverseOfferPenaltyNotice
                hasAuthoritativeAgreement={
                    financialSummary?.sourceKind === 'management'
                }
            />

            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs font-semibold tracking-[0.14em] text-white uppercase">
                    진행 안내
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                    역제안을 올리면{' '}
                    {`파트너 승인 0/${Math.max(room.spot.participants.length - 1, 0)}`}
                    에서 시작하고, 모든 파트너 승인 후 어드민 승인 대기로
                    이어져요.
                </p>
            </div>

            <Button
                fullWidth
                size="lg"
                disabled={priorAgreementReachedInChat == null}
                onClick={() => {
                    if (priorAgreementReachedInChat == null) {
                        return;
                    }

                    setSelectedContextId(room.id);
                    createTeamReverseOffer(priorAgreementReachedInChat);
                    onClose();
                }}
            >
                역제안 등록
            </Button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   팀 생성 패널 — store의 step을 읽어 바로 폼 진입
───────────────────────────────────────────────────────────── */
function TeamCreationPanel({
    step,
    onClose,
}: {
    step: 'vote' | 'schedule' | 'file' | 'reverse-offer';
    onClose: () => void;
}) {
    const { rooms, selectedContextId } = useMainChatStore();

    const selectedSpotRoom =
        rooms.find(
            (room): room is SpotChatRoom =>
                room.id === selectedContextId && room.category === 'spot',
        ) ?? null;

    if (!selectedSpotRoom) {
        return (
            <div className="rounded-2xl bg-white/10 px-4 py-4 text-center text-sm text-white/60 pb-2">
                스팟 채팅방을 선택한 후 항목을 추가할 수 있어요.
            </div>
        );
    }

    if (step === 'vote')
        return <VoteCreatePanel room={selectedSpotRoom} onClose={onClose} />;
    if (step === 'schedule')
        return (
            <ScheduleCreatePanel room={selectedSpotRoom} onClose={onClose} />
        );
    if (step === 'reverse-offer') {
        return (
            <ReverseOfferCreatePanel
                room={selectedSpotRoom}
                onClose={onClose}
            />
        );
    }
    return <FileCreatePanel onClose={onClose} />;
}

/* ─────────────────────────────────────────────────────────────
   개인 채팅 생성 패널
───────────────────────────────────────────────────────────── */
function PersonalCreationPanel({ onClose }: { onClose: () => void }) {
    const {
        friends,
        selectedFriendId,
        setSelectedFriendId,
        createPersonalRoom,
    } = useMainChatStore();

    return (
        <div className="pb-2">
            <p className="mb-1 text-center text-sm font-medium text-white/60">
                누구와 바로 대화를 시작할까요?
            </p>
            <p className="mb-4 text-center text-xs text-white/40">
                친구를 고르면 개인 채팅방이 바로 목록 상단으로 올라와요.
            </p>
            <div className="-mx-1 mb-4 flex gap-3 overflow-x-auto px-1 pb-1">
                {friends.map((friend) => (
                    <FriendChip
                        key={friend.id}
                        selected={selectedFriendId === friend.id}
                        name={friend.name}
                        role={friend.role}
                        presenceLabel={friend.presenceLabel}
                        onClick={() => setSelectedFriendId(friend.id)}
                    />
                ))}
            </div>
            <Button
                fullWidth
                size="lg"
                disabled={!selectedFriendId}
                className="bg-white text-brand-900 hover:bg-brand-50 focus-visible:ring-white/40"
                onClick={() => {
                    const room = createPersonalRoom();
                    if (room) onClose();
                }}
            >
                채팅 생성
            </Button>
        </div>
    );
}

function FriendAddPanel() {
    const [searchQuery, setSearchQuery] = useState('');
    const [shareFeedback, setShareFeedback] = useState<string | null>(null);
    const { friends, addFriendById } = useMainChatStore();

    const existingFriendIds = useMemo(
        () => new Set(friends.map((friend) => friend.id)),
        [friends],
    );

    const candidateResults = useMemo(() => {
        const trimmedQuery = searchQuery.trim().toLowerCase();

        return getChatDirectoryCandidates().filter((candidate) => {
            if (candidate.id === CHAT_CURRENT_USER_ID) {
                return false;
            }

            if (existingFriendIds.has(candidate.id)) {
                return false;
            }

            if (!trimmedQuery) {
                return true;
            }

            return [candidate.name, candidate.presenceLabel]
                .join(' ')
                .toLowerCase()
                .includes(trimmedQuery);
        });
    }, [existingFriendIds, searchQuery]);

    const myShareUrl =
        typeof window === 'undefined'
            ? `/chat?userId=${CHAT_CURRENT_USER_ID}`
            : `${window.location.origin}/chat?userId=${CHAT_CURRENT_USER_ID}`;

    async function handleShareMyUrl() {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: '친구 추가 링크',
                    url: myShareUrl,
                });
                setShareFeedback('공유 시트를 열었어요.');
                return;
            }

            await navigator.clipboard.writeText(myShareUrl);
            setShareFeedback('링크를 복사했어요.');
        } catch {
            setShareFeedback('링크를 복사하지 못했어요.');
        }
    }

    useEffect(() => {
        if (!shareFeedback) {
            return undefined;
        }

        const timeout = window.setTimeout(() => setShareFeedback(null), 2400);

        return () => window.clearTimeout(timeout);
    }, [shareFeedback]);

    return (
        <div className="pb-2">
            <p className="mb-1 text-center text-sm font-medium text-white/60">
                닉네임으로 새 친구를 찾아보세요
            </p>
            <p className="mb-4 text-center text-xs text-white/40">
                친구를 추가하면 개인 채팅 생성 목록에서 바로 선택할 수 있어요.
            </p>

            <div className="mb-4 overflow-hidden rounded-[20px] border border-white/10 bg-white/5">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="닉네임 검색"
                    autoFocus
                />
            </div>

            <div className="mb-4 rounded-[20px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                        <IconLink size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">
                            내 친구 추가 링크
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                            이 주소로 들어오면 바로 내 채팅 링크를 확인할 수
                            있어요.
                        </p>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-3 py-3">
                    <p className="min-w-0 flex-1 truncate text-xs text-white/75">
                        {myShareUrl}
                    </p>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="border-white/10 bg-white text-brand-900 hover:bg-brand-50"
                        startIcon={<IconCopy size={14} />}
                        onClick={handleShareMyUrl}
                    >
                        복사
                    </Button>
                </div>

                {shareFeedback ? (
                    <p className="mt-2 text-xs text-brand-200">
                        {shareFeedback}
                    </p>
                ) : null}
            </div>

            <div className="flex flex-col overflow-hidden rounded-[20px] border border-white/10 bg-white/5">
                {candidateResults.length > 0 ? (
                    candidateResults.map((candidate, index) => (
                        <div
                            key={candidate.id}
                            className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? 'border-t border-white/10' : ''}`}
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <UserAvatarStatic
                                    userId={candidate.id}
                                    nickname={candidate.name}
                                    size="md"
                                    profileType={candidate.role}
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {candidate.name}
                                    </p>
                                    <p className="truncate text-xs text-white/45">
                                        {candidate.presenceLabel}
                                    </p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="border-white/10 bg-white text-brand-900 hover:bg-brand-50"
                                onClick={() => addFriendById(candidate.id)}
                            >
                                추가
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="px-4 py-10 text-center text-sm text-white/45">
                        {searchQuery.trim()
                            ? '검색한 닉네임과 맞는 후보가 없어요.'
                            : '추가할 수 있는 후보를 모두 확인했어요.'}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   action-item 패널들 (기존 — 목록에서 탭했을 때)
───────────────────────────────────────────────────────────── */
function VoteActionPanel({
    item,
    onClose,
}: {
    item: Extract<SpotActionItem, { kind: 'vote' }>;
    onClose: () => void;
}) {
    const totalVotes = item.vote.options.reduce(
        (sum, o) => sum + o.voterIds.length,
        0,
    );
    return (
        <div className="pb-2">
            <div className="mb-1 flex items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                    <IconChartBar size={16} />
                </div>
            </div>
            <p className="mb-1 text-center text-sm font-semibold text-white">
                {item.vote.question}
            </p>
            <p className="mb-4 text-center text-xs text-white/40">
                {item.roomTitle} · 총 {totalVotes}표 ·{' '}
                {item.vote.multiSelect ? '복수 선택' : '단일 선택'}
            </p>
            <div className="flex flex-col gap-2 mb-4">
                {item.vote.options.map((option) => {
                    const pct =
                        totalVotes > 0
                            ? Math.round(
                                  (option.voterIds.length / totalVotes) * 100,
                              )
                            : 0;
                    const voted = option.voterIds.includes('user-me');
                    return (
                        <button
                            key={option.id}
                            type="button"
                            className={`relative flex items-center justify-between overflow-hidden rounded-2xl border px-4 py-3 text-left transition ${
                                voted
                                    ? 'border-amber-400/40 bg-amber-500/10'
                                    : 'border-white/10 bg-white/5'
                            }`}
                        >
                            <div
                                className="absolute inset-y-0 left-0 bg-amber-500/15"
                                style={{ width: `${pct}%` }}
                            />
                            <span className="relative text-sm font-medium text-white">
                                {option.label}
                            </span>
                            <div className="relative flex items-center gap-2">
                                {voted && (
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] text-white">
                                        <IconCheck size={10} stroke={2.5} />
                                    </span>
                                )}
                                <span className="text-xs text-white/50">
                                    {option.voterIds.length}표
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
            <Button
                fullWidth
                size="lg"
                className="bg-white text-brand-900 hover:bg-brand-50 focus-visible:ring-white/40"
                onClick={onClose}
            >
                완료
            </Button>
        </div>
    );
}

function ScheduleActionPanel({
    item,
    onClose,
}: {
    item: Extract<SpotActionItem, { kind: 'schedule' }>;
    onClose: () => void;
}) {
    const { rooms, updateSpotSchedule } = useMainChatStore();
    const spotRoom = rooms.find(
        (r) => r.id === item.roomId && r.category === 'spot',
    );
    const existingSlots: ScheduleSlot[] =
        spotRoom?.category === 'spot'
            ? (spotRoom.spot.schedule?.proposedSlots ?? [])
            : [];
    const [slots, setSlots] = useState<ScheduleSlot[]>(existingSlots);
    const [pageOffset, setPageOffset] = useState(0);
    const currentUserId = spotRoom?.currentUserId ?? 'user-me';
    const totalParticipants =
        spotRoom?.category === 'spot' ? spotRoom.spot.participants.length : 1;
    const dates = getDateRange(pageOffset, DAYS_PER_PAGE);

    function isMySlot(date: string, hour: number) {
        return slots.some(
            (s) =>
                s.date === date &&
                s.hour === hour &&
                s.availableUserIds.includes(currentUserId),
        );
    }
    function participantCount(date: string, hour: number) {
        return (
            slots.find((s) => s.date === date && s.hour === hour)
                ?.availableUserIds.length ?? 0
        );
    }
    function handleToggle(date: string, hour: number) {
        setSlots((prev) => {
            const existing = prev.find(
                (s) => s.date === date && s.hour === hour,
            );
            if (existing) {
                const mine = existing.availableUserIds.includes(currentUserId);
                const next = mine
                    ? existing.availableUserIds.filter(
                          (id) => id !== currentUserId,
                      )
                    : [...existing.availableUserIds, currentUserId];
                if (next.length === 0)
                    return prev.filter(
                        (s) => !(s.date === date && s.hour === hour),
                    );
                return prev.map((s) =>
                    s.date === date && s.hour === hour
                        ? { ...s, availableUserIds: next }
                        : s,
                );
            }
            return [...prev, { date, hour, availableUserIds: [currentUserId] }];
        });
    }

    const isConfirmed =
        spotRoom?.category === 'spot' &&
        Boolean(spotRoom.spot.schedule?.confirmedSlot);
    const myCount = slots.filter((s) =>
        s.availableUserIds.includes(currentUserId),
    ).length;

    return (
        <div className="pb-2">
            <div className="mb-1 flex items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
                    <IconCalendarEvent size={16} />
                </div>
            </div>
            <p className="mb-1 text-center text-sm font-semibold text-white">
                {item.schedule.title}
            </p>
            <p className="mb-4 text-center text-xs text-white/40">
                {item.roomTitle} · 가능한 시간을 탭해서 표시해주세요
            </p>

            {isConfirmed &&
                spotRoom?.category === 'spot' &&
                spotRoom.spot.schedule?.confirmedSlot && (
                    <div className="mb-4 rounded-2xl border border-brand-400/30 bg-brand-500/10 px-4 py-3 text-center">
                        <p className="text-xs text-brand-300">확정된 일정</p>
                        <p className="mt-1 text-sm font-semibold text-white">
                            {spotRoom.spot.schedule.confirmedSlot.date}{' '}
                            {spotRoom.spot.schedule.confirmedSlot.hour}:00
                        </p>
                    </div>
                )}

            <div className="mb-2 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() =>
                        setPageOffset((p) => Math.max(0, p - DAYS_PER_PAGE))
                    }
                    disabled={pageOffset === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 disabled:opacity-20"
                >
                    <IconChevronLeft size={16} />
                </button>
                <span className="text-xs text-white/40">
                    {dates[0]} ~ {dates[dates.length - 1]}
                </span>
                <button
                    type="button"
                    onClick={() => setPageOffset((p) => p + DAYS_PER_PAGE)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10"
                >
                    <IconChevronRight size={16} />
                </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-3">
                <table className="w-full text-xs">
                    <thead>
                        <tr>
                            <th className="w-10 pb-2 text-white/30" />
                            {dates.map((d) => {
                                const { day, weekday } = formatDateHeader(d);
                                return (
                                    <th
                                        key={d}
                                        className="pb-2 text-center font-medium"
                                    >
                                        <span className="block text-[11px] text-white/40">
                                            {weekday}
                                        </span>
                                        <span className="block text-sm font-bold text-white">
                                            {day}
                                        </span>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {SCHEDULE_HOURS.map((hour) => (
                            <tr key={hour}>
                                <td className="pr-2 text-right text-[10px] text-white/30">
                                    {hour}:00
                                </td>
                                {dates.map((date) => {
                                    const mine = isMySlot(date, hour);
                                    const count = participantCount(date, hour);
                                    const intensity =
                                        totalParticipants > 0
                                            ? count / totalParticipants
                                            : 0;
                                    return (
                                        <td key={date} className="p-0.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggle(date, hour)
                                                }
                                                className={`h-7 w-full rounded transition-colors ${mine ? 'bg-brand-400 text-white' : count > 0 ? 'text-brand-200' : 'bg-white/5 text-white/10'}`}
                                                style={
                                                    !mine && count > 0
                                                        ? {
                                                              backgroundColor: `rgba(99,179,237,${0.15 + intensity * 0.55})`,
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {count > 0 ? count : ''}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-2 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded bg-brand-400" />
                        <span className="text-[10px] text-white/40">
                            내가 가능
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: 'rgba(99,179,237,0.5)' }}
                        />
                        <span className="text-[10px] text-white/40">
                            다른 참여자
                        </span>
                    </div>
                </div>
                <span className="text-[10px] text-white/30">
                    {myCount}개 선택됨
                </span>
            </div>

            <Button
                fullWidth
                size="lg"
                className="bg-white text-brand-900 hover:bg-brand-50 focus-visible:ring-white/40"
                onClick={() => {
                    updateSpotSchedule(item.roomId, slots);
                    onClose();
                }}
            >
                저장하기
            </Button>
        </div>
    );
}

function FileActionPanel({
    item,
    onClose,
}: {
    item: Extract<SpotActionItem, { kind: 'file' }>;
    onClose: () => void;
}) {
    function formatSize(bytes: number) {
        if (bytes >= 1024 * 1024)
            return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
        if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
        return `${bytes}B`;
    }
    return (
        <div className="pb-2">
            <div className="mb-1 flex items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-500/20 text-gray-300">
                    <IconFileText size={16} />
                </div>
            </div>
            <p className="mb-1 text-center text-sm font-semibold text-white">
                {item.file.name}
            </p>
            <p className="mb-4 text-center text-xs text-white/40">
                {item.roomTitle} · {formatSize(item.file.sizeBytes)}
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 mb-4">
                <p className="text-sm text-white/70">
                    {item.file.uploaderNickname}님이 공유한 파일이에요.
                </p>
            </div>
            <Button
                fullWidth
                size="lg"
                className="bg-white text-brand-900 hover:bg-brand-50 focus-visible:ring-white/40"
                onClick={onClose}
            >
                닫기
            </Button>
        </div>
    );
}

function ReverseOfferActionPanel({
    item,
    onClose,
}: {
    item: Extract<SpotActionItem, { kind: 'reverse-offer' }>;
    onClose: () => void;
}) {
    const liveRoom = useMainChatStore(
        (state) =>
            state.rooms.find(
                (candidate): candidate is SpotChatRoom =>
                    candidate.id === item.roomId &&
                    candidate.category === 'spot',
            ) ?? null,
    );
    const approveReverseOffer = useMainChatStore(
        (state) => state.approveReverseOffer,
    );
    const reverseOffer = liveRoom?.reverseOffer ?? item.reverseOffer;
    const statusLabel = getReverseOfferStatusLabel(reverseOffer.status);
    const financialSummary =
        reverseOffer.financialSnapshot ??
        (liveRoom ? resolveReverseOfferFinancialSummary(liveRoom) : null);

    const viewerId = liveRoom?.currentUserId ?? null;
    const isAuthor = viewerId !== null && viewerId === reverseOffer.authorId;
    const hasViewerApproved =
        viewerId !== null && reverseOffer.approverIds.includes(viewerId);
    const isAdminPending = reverseOffer.status === 'ADMIN_APPROVAL_PENDING';
    const canApprove = !isAuthor && !hasViewerApproved && !isAdminPending;

    function handleApprove() {
        if (!liveRoom || !canApprove) {
            return;
        }
        approveReverseOffer(liveRoom.id);
    }

    const approveLabel = isAdminPending
        ? '어드민 승인 대기 중'
        : isAuthor
          ? '내가 올린 역제안이에요'
          : hasViewerApproved
            ? '이미 승인했어요'
            : '역제안 승인하기';

    return (
        <div className="pb-2">
            <div className="mb-1 flex items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                    <IconHeartHandshake size={16} />
                </div>
            </div>
            <p className="mb-1 text-center text-sm font-semibold text-white">
                역제안 진행 상태
            </p>
            <p className="mb-4 text-center text-xs text-white/40">
                {item.roomTitle} ·{' '}
                {formatReverseOfferApprovalProgress(reverseOffer)}
            </p>

            <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
                    Current Status
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                    {statusLabel}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-200">
                    {formatReverseOfferApprovalProgress(reverseOffer)}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                    사전 합의가 된 내용이라 파트너는 승인만 하면 돼요. 모두
                    승인하면 어드민 승인 대기 단계로 넘어가요.
                </p>
            </div>

            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
                    Team Chat IconCheck
                </p>
                <p className="mt-2 text-sm text-white/75">
                    {reverseOffer.priorAgreementReachedInChat
                        ? '팀 채팅에서 사전 합의가 있었어요.'
                        : '팀 채팅에서 아직 사전 합의 전이에요.'}
                </p>
            </div>

            {financialSummary ? (
                <ReverseOfferMoneySummary summary={financialSummary} />
            ) : null}
            <ReverseOfferPenaltyNotice
                hasAuthoritativeAgreement={
                    financialSummary?.sourceKind === 'management'
                }
            />

            <Button
                fullWidth
                size="lg"
                disabled={!canApprove}
                className={
                    canApprove
                        ? 'bg-emerald-400 text-brand-900 hover:bg-emerald-300 focus-visible:ring-emerald-200/40'
                        : 'bg-white/10 text-white/50'
                }
                onClick={canApprove ? handleApprove : onClose}
            >
                {approveLabel}
            </Button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Room Info 패널
───────────────────────────────────────────────────────────── */
function RoomInfoPanel({
    roomId,
    onClose,
}: {
    roomId: string;
    onClose: () => void;
}) {
    const room = useMainChatStore(
        (state) => state.rooms.find((r) => r.id === roomId) ?? null,
    );
    if (!room) return null;

    return (
        <div className="pb-2">
            <p className="mb-4 text-center text-sm font-medium text-white/60">
                대화 정보
            </p>
            <div className="mb-3 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <UserAvatarStatic
                    userId={
                        room.category === 'personal'
                            ? room.partnerId
                            : room.spot.authorId
                    }
                    nickname={
                        room.category === 'personal'
                            ? room.partnerName
                            : room.title
                    }
                    size="md"
                    profileType={
                        room.category === 'personal'
                            ? room.counterpartRole === 'SUPPORTER'
                                ? 'SUPPORTER'
                                : 'PARTNER'
                            : undefined
                    }
                />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                        {room.title}
                    </p>
                    <p className="mt-0.5 text-xs text-white/50">
                        {room.metaLabel}
                    </p>
                </div>
            </div>

            {room.category === 'personal' ? (
                <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                            Presence
                        </p>
                        <p className="mt-1 text-xs font-semibold text-white/80">
                            {(room as PersonalChatRoom).presenceLabel}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                            Role
                        </p>
                        <p className="mt-1 text-xs font-semibold text-white/80">
                            {(room as PersonalChatRoom).counterpartRole ===
                            'SUPPORTER'
                                ? '서포터'
                                : '파트너'}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-3 grid grid-cols-3 gap-2">
                        {[
                            {
                                label: '참여자',
                                value: (room as SpotChatRoom).spot.participants
                                    .length,
                            },
                            {
                                label: '투표',
                                value: (room as SpotChatRoom).spot.votes.length,
                            },
                            {
                                label: '파일',
                                value: (room as SpotChatRoom).spot.files.length,
                            },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center"
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                                    {label}
                                </p>
                                <p className="mt-1 text-base font-bold text-white">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <div className="mb-2 flex items-center gap-2">
                            <IconUsers size={14} className="text-white/40" />
                            <p className="text-xs font-semibold text-white/60">
                                참여 중인 멤버
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(room as SpotChatRoom).spot.participants.map(
                                (p) => (
                                    <span
                                        key={p.userId}
                                        className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                                    >
                                        {p.nickname}
                                        <span className="ml-1 text-white/30">
                                            ·{' '}
                                            {p.role === 'AUTHOR'
                                                ? '작성자'
                                                : '참여자'}
                                        </span>
                                    </span>
                                ),
                            )}
                        </div>
                    </div>
                </>
            )}

            <Button
                fullWidth
                size="lg"
                className="bg-white text-brand-900 hover:bg-brand-50 focus-visible:ring-white/40"
                onClick={onClose}
            >
                닫기
            </Button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   루트 패널
───────────────────────────────────────────────────────────── */
export function ChatCreationPanel({ onClose }: ChatCreationPanelProps) {
    const mode = useChatNavStore((state) => state.mode);
    const activeActionItem = useChatNavStore((state) => state.activeActionItem);

    if (mode.kind === 'room-info') {
        return <RoomInfoPanel roomId={mode.roomId} onClose={onClose} />;
    }

    if (mode.kind === 'action-item' && activeActionItem) {
        if (activeActionItem.kind === 'vote')
            return (
                <VoteActionPanel item={activeActionItem} onClose={onClose} />
            );
        if (activeActionItem.kind === 'schedule')
            return (
                <ScheduleActionPanel
                    item={activeActionItem}
                    onClose={onClose}
                />
            );
        if (activeActionItem.kind === 'file')
            return (
                <FileActionPanel item={activeActionItem} onClose={onClose} />
            );
        if (activeActionItem.kind === 'reverse-offer')
            return (
                <ReverseOfferActionPanel
                    item={activeActionItem}
                    onClose={onClose}
                />
            );
    }

    if (mode.kind === 'personal-create') {
        return <PersonalCreationPanel onClose={onClose} />;
    }

    if (mode.kind === 'friend-add') {
        return <FriendAddPanel />;
    }

    if (mode.kind === 'creation') {
        return <TeamCreationPanel step={mode.step} onClose={onClose} />;
    }

    return null;
}
