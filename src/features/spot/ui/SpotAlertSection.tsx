import { IconBell, IconCalendarCheck } from '@tabler/icons-react';
import { MOCK_MY_SPOTS, MOCK_SPOT_DETAILS } from '../model/mock';

function getAlertContent(): {
    icon: 'vote' | 'schedule';
    spotTitle: string;
    message: string;
} | null {
    // MATCHED 스팟에서 미결 투표 확인
    for (const spot of MOCK_MY_SPOTS) {
        if (spot.status !== 'MATCHED' && spot.status !== 'OPEN') continue;
        const detail = MOCK_SPOT_DETAILS[spot.id];
        if (!detail) continue;

        // 미결 투표가 있으면 우선 표시
        const openVote = detail.votes.find((v) => !v.closedAt);
        if (openVote) {
            return {
                icon: 'vote',
                spotTitle: spot.title,
                message: `${spot.title}에서 투표가 올라왔어요`,
            };
        }
    }

    // 가장 가까운 confirmedSlot 찾기
    let nearest: { date: string; spotTitle: string } | null = null;
    for (const spot of MOCK_MY_SPOTS) {
        const detail = MOCK_SPOT_DETAILS[spot.id];
        if (!detail?.schedule?.confirmedSlot) continue;
        const slotDate = detail.schedule.confirmedSlot.date;
        if (!nearest || slotDate < nearest.date) {
            nearest = { date: slotDate, spotTitle: spot.title };
        }
    }

    if (nearest) {
        return {
            icon: 'schedule',
            spotTitle: nearest.spotTitle,
            message: `가장 가까운 일정 · ${nearest.date}`,
        };
    }

    return null;
}

export function SpotAlertSection() {
    const alert = getAlertContent();
    if (!alert) return null;

    return (
        <div className="mx-4">
            <div className="flex items-start gap-3 rounded-2xl bg-brand-800/5 px-4 py-3.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-800/10">
                    {alert.icon === 'vote' ? (
                        <IconBell className="h-4 w-4 text-brand-800" />
                    ) : (
                        <IconCalendarCheck className="h-4 w-4 text-brand-800" />
                    )}
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-brand-800">
                        {alert.icon === 'vote'
                            ? '지금 할일'
                            : '가장 가까운 일정'}
                    </span>
                    <span className="text-sm text-text-secondary">
                        {alert.message}
                    </span>
                </div>
            </div>
        </div>
    );
}
