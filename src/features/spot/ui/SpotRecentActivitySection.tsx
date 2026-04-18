import Link from 'next/link';
import { IconChevronRight } from '@tabler/icons-react';
import { formatRelativeTime } from '@/shared/lib/format-time';
import { MOCK_RECENT_ACTIVITY } from '../model/mock-dashboard';

export function SpotRecentActivitySection() {
    const { spotId, spotTitle, occurredAt } = MOCK_RECENT_ACTIVITY;
    const relTime = formatRelativeTime(occurredAt);

    return (
        <div className="mx-4 rounded-2xl bg-muted px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        {relTime}에 이런 활동을 진행했어요.
                    </span>
                    <span className="text-sm font-semibold text-text-secondary">
                        {spotTitle}
                    </span>
                </div>
                <Link
                    href={`/spot/${spotId}`}
                    className="flex shrink-0 items-center gap-0.5 rounded-lg bg-card px-3 py-1.5 text-xs font-semibold text-text-secondary"
                >
                    내역
                    <IconChevronRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </div>
    );
}
