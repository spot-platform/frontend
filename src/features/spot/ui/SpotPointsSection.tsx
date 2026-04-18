import Link from 'next/link';
import { IconChevronRight } from '@tabler/icons-react';
import { MOCK_POINTS } from '../model/mock-dashboard';

export function SpotPointsSection() {
    const { balance, upcomingPayment } = MOCK_POINTS;

    return (
        <div className="mx-4 rounded-2xl border border-border-soft bg-card px-4 py-3.5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">보우 포인트</p>
                    <p className="mt-0.5 text-xl font-bold text-foreground">
                        {balance.toLocaleString('ko-KR')} Point
                    </p>
                </div>
                <Link
                    href="/pay"
                    className="flex items-center gap-0.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-text-secondary"
                >
                    내역
                    <IconChevronRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {upcomingPayment && (
                <div className="mt-3 flex items-center justify-between border-t border-border-soft pt-3">
                    <span className="text-xs text-muted-foreground">
                        {upcomingPayment.daysUntil}일 후 지불{' '}
                        {upcomingPayment.label}
                    </span>
                    <span className="text-xs font-semibold text-text-secondary">
                        {upcomingPayment.amount.toLocaleString('ko-KR')} 원
                    </span>
                </div>
            )}
        </div>
    );
}
