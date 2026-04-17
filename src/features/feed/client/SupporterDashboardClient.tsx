'use client';

// 서포터 전용 대시보드 진입점. 역할 게이트 + 목업 리포트 조립 담당.

import { useRouter } from 'next/navigation';
import { IconGauge } from '@tabler/icons-react';
import { useAuthStore } from '@/shared/model/auth-store';
import { DetailHeader, DetailPageShell, EmptyState } from '@/shared/ui';
import {
    MOCK_ATTRACTIVENESS_REPORT,
    MOCK_CONVERSION_HINTS,
} from '@/features/simulation/model/mock-api-responses';
import { SupporterDashboard } from '../ui/dashboard/SupporterDashboard';

export function SupporterDashboardClient() {
    const router = useRouter();
    const role = useAuthStore((state) => state.userPersona?.role);

    if (role !== 'SUPPORTER') {
        return (
            <>
                <DetailHeader title="서포터 대시보드" />
                <DetailPageShell
                    as="main"
                    px="md"
                    gap="md"
                    topInset="md"
                    bottomInset="lg"
                    className="bg-surface"
                >
                    <EmptyState
                        icon={<IconGauge size={36} stroke={1.5} />}
                        title="서포터만 이용할 수 있어요"
                        description="대시보드는 피드를 운영하는 서포터 역할 전용이에요. 지도로 돌아가 다양한 모임을 둘러보세요."
                        action={{
                            label: '지도로 가기',
                            onClick: () => router.replace('/map'),
                        }}
                    />
                </DetailPageShell>
            </>
        );
    }

    const reports = [
        {
            feedId: 'feed-001',
            feedTitle: '연무동 저녁 라떼아트 실습',
            report: MOCK_ATTRACTIVENESS_REPORT,
            hints: MOCK_CONVERSION_HINTS,
        },
        {
            feedId: 'feed-002',
            feedTitle: '연무동 코딩 입문 스터디',
            report: {
                ...MOCK_ATTRACTIVENESS_REPORT,
                composite_score: 0.58,
                signals: {
                    ...MOCK_ATTRACTIVENESS_REPORT.signals,
                    title_hookiness: 0.54,
                    skill_rarity_bonus: 0.43,
                    narrative_authenticity: 0.62,
                },
                improvement_hints: [
                    '스터디 커리큘럼을 3줄로 요약해 첫 카드에 노출하면 좋아요.',
                    '가격이 p25에 가깝습니다. 간식/자료비 포함 표기로 가치를 보강하세요.',
                ],
            },
        },
    ];

    return (
        <>
            <DetailHeader title="서포터 대시보드" />
            <DetailPageShell
                as="main"
                px="md"
                gap="md"
                topInset="md"
                bottomInset="lg"
                className="bg-surface"
            >
                <section className="border-b border-neutral-200 pb-4">
                    <h1 className="text-lg font-semibold text-neutral-900">
                        내 피드 매력도 리포트
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                        contextBuilder 시뮬레이션이 생성한 매력도 점수와 개선
                        힌트입니다. 가상 스팟은 전환 가이드도 함께 제공돼요.
                    </p>
                </section>

                <SupporterDashboard reports={reports} />
            </DetailPageShell>
        </>
    );
}
