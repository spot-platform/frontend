import { Plus, Users, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { formatRelativeTime } from '@/shared/lib/format-time';
import type { TimelineEvent } from '@/entities/spot/types';

interface TimelineItemProps {
    event: TimelineEvent;
    isLast: boolean;
}

const ICON_MAP = {
    CREATED: { Icon: Plus, color: 'bg-emerald-100 text-emerald-600' },
    MATCHED: { Icon: Users, color: 'bg-blue-100 text-blue-600' },
    COMPLETED: { Icon: CheckCircle, color: 'bg-brand-800/10 text-brand-800' },
    CANCELLED: { Icon: XCircle, color: 'bg-red-100 text-red-500' },
    COMMENT: { Icon: MessageCircle, color: 'bg-gray-100 text-gray-500' },
    SETTLEMENT_REQUESTED: {
        Icon: MessageCircle,
        color: 'bg-purple-100 text-purple-600',
    },
    SETTLEMENT_APPROVED: {
        Icon: CheckCircle,
        color: 'bg-green-100 text-green-600',
    },
};

const KIND_LABELS: Record<TimelineEvent['kind'], string> = {
    CREATED: '스팟 생성',
    MATCHED: '매칭됨',
    COMPLETED: '활동 완료',
    CANCELLED: '취소됨',
    COMMENT: '코멘트',
    SETTLEMENT_REQUESTED: '정산 요청',
    SETTLEMENT_APPROVED: '정산 승인',
};

export function TimelineItem({ event, isLast }: TimelineItemProps) {
    const { Icon, color } = ICON_MAP[event.kind];
    const relativeTime = formatRelativeTime(event.createdAt);

    return (
        <div className="flex gap-3">
            {/* 아이콘 + 라인 */}
            <div className="flex flex-col items-center">
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color}`}
                >
                    <Icon size={14} strokeWidth={2} />
                </div>
                {!isLast && <div className="mt-1 w-0.5 flex-1 bg-gray-100" />}
            </div>

            {/* 콘텐츠 */}
            <div className={`min-w-0 flex-1 ${isLast ? '' : 'pb-4'}`}>
                <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-700">
                        {KIND_LABELS[event.kind]}
                    </span>
                    <span className="shrink-0 text-[10px] text-gray-400">
                        {relativeTime}
                    </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                    {event.actorNickname}
                </p>
                {event.content && (
                    <p className="mt-1 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
                        {event.content}
                    </p>
                )}
            </div>
        </div>
    );
}
