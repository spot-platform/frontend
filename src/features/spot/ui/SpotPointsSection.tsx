import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MOCK_POINTS } from '../model/mock-dashboard';

export function SpotPointsSection() {
    const { balance, upcomingPayment } = MOCK_POINTS;

    return (
        <div className="mx-4 rounded-2xl border border-gray-100 bg-white px-4 py-3.5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400">보우 포인트</p>
                    <p className="mt-0.5 text-xl font-bold text-gray-900">
                        {balance.toLocaleString('ko-KR')} Point
                    </p>
                </div>
                <Link
                    href="/pay"
                    className="flex items-center gap-0.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600"
                >
                    내역
                    <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {upcomingPayment && (
                <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                    <span className="text-xs text-gray-500">
                        {upcomingPayment.daysUntil}일 후 지불{' '}
                        {upcomingPayment.label}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                        {upcomingPayment.amount.toLocaleString('ko-KR')} 원
                    </span>
                </div>
            )}
        </div>
    );
}
