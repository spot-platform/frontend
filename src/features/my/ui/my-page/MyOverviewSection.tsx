import { Section } from '@/shared/ui';
import {
    formatNumber,
    type MyParticipationStats,
} from '../../model/my-page-helpers';
import { MySectionHeader } from './MySectionHeader';

type MyOverviewSectionProps = {
    pointBalance?: number;
    stats: MyParticipationStats;
};

export function MyOverviewSection({
    pointBalance,
    stats,
}: MyOverviewSectionProps) {
    return (
        <Section
            gap="md"
            className="rounded-xl border border-gray-200 bg-white p-4"
        >
            <MySectionHeader
                eyebrow="Overview"
                title="한눈에 보는 내 활동"
                description="실제 프로필과 참여 기록을 기준으로 지금 상태를 정리했어요."
            />
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    label="보유 포인트"
                    value={
                        typeof pointBalance === 'number'
                            ? `${formatNumber(pointBalance)}P`
                            : '불러오는 중'
                    }
                    accent="text-brand-800"
                />
                <StatCard
                    label="전체 참여"
                    value={formatNumber(stats.totalParticipations)}
                />
                <StatCard
                    label="최근 진행 중"
                    value={formatNumber(stats.recentActiveParticipations)}
                />
                <StatCard
                    label="최근 주최"
                    value={formatNumber(stats.recentAuthoredParticipations)}
                />
            </div>
        </Section>
    );
}

function StatCard({
    label,
    value,
    accent = 'text-gray-950',
}: {
    label: string;
    value: string;
    accent?: string;
}) {
    return (
        <div className="rounded-lg border border-gray-100 bg-surface px-4 py-3.5">
            <p className="text-xs font-semibold tracking-[0.14em] text-gray-400 uppercase">
                {label}
            </p>
            <p
                className={`mt-2 text-xl font-black tracking-[-0.04em] ${accent}`}
            >
                {value}
            </p>
        </div>
    );
}
