'use client';

import {
    useMyParticipations,
    useMySupportActivitySummary,
    useSupporterProfile,
} from '../../model/use-my';
import { EmptyState } from '@/shared/ui';
import { formatDate, getRoleLabel } from '../../model/my-page-helpers';
import {
    MyPageLayout,
    MyPageSection,
    MyPageSummaryList,
    MyPageSummaryRow,
} from '../../ui/my-page/MyPageLayout';

export function MyHistoryPageClient() {
    const participationsQuery = useMyParticipations({ page: 1, size: 20 });
    const supportSummaryQuery = useMySupportActivitySummary();
    const supporterProfileQuery = useSupporterProfile();

    const participations = participationsQuery.data?.data ?? [];
    const supportSummary = supportSummaryQuery.data?.data;
    const supporterProfile = supporterProfileQuery.data?.data;

    return (
        <MyPageLayout
            title="히스토리"
            description="스팟 활동 기록과 서포터 리뷰·완료 이력을 한 화면에서 확인할 수 있어요."
        >
            <MyPageSection
                title="활동 요약"
                description="참여 기록과 서포터 활동을 함께 정리했어요."
            >
                <MyPageSummaryList>
                    <HistoryStatRow
                        label="전체 참여"
                        value={`${participationsQuery.data?.meta?.total ?? participations.length}건`}
                    />
                    <HistoryStatRow
                        label="최근 목록 기준 진행 중"
                        value={`${participations.filter((item) => item.status === 'OPEN' || item.status === 'MATCHED').length}건`}
                    />
                    <HistoryStatRow
                        label="완료 서포터 활동"
                        value={`${supportSummary?.completedCount ?? 0}건`}
                    />
                    <HistoryStatRow
                        label="평균 평점"
                        value={
                            supportSummary
                                ? `${supportSummary.avgRating.toFixed(1)}점`
                                : '-'
                        }
                    />
                </MyPageSummaryList>
            </MyPageSection>

            <MyPageSection
                title="스팟 활동 기록"
                description="내가 주최하거나 참여한 최근 스팟 목록이에요."
                contentClassName="py-0"
            >
                {participationsQuery.isPending &&
                participations.length === 0 ? (
                    <div className="space-y-3">
                        <div className="h-18 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-18 animate-pulse rounded-xl bg-gray-100" />
                    </div>
                ) : participationsQuery.isError &&
                  participations.length === 0 ? (
                    <EmptyState
                        title="활동 기록을 불러오지 못했어요"
                        action={{
                            label: '다시 시도',
                            onClick: () => participationsQuery.refetch(),
                        }}
                    />
                ) : participations.length === 0 ? (
                    <EmptyState title="최근 활동 기록이 없어요" />
                ) : (
                    <ul className="-mx-4 divide-y divide-gray-200">
                        {participations.map((item) => (
                            <li
                                key={`${item.spotId}-${item.joinedAt}`}
                                className="px-4 py-3 transition-colors hover:bg-gray-50"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {item.spotTitle}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {item.spotType} ·{' '}
                                            {getRoleLabel(item.role)} ·{' '}
                                            {item.status}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {formatDate(item.joinedAt)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </MyPageSection>

            <MyPageSection
                title="서포터 활동 기록"
                description="완료 이력과 최신 리뷰 흐름을 함께 보여줘요."
                contentClassName="py-0"
            >
                {supporterProfileQuery.isPending && !supporterProfile ? (
                    <div className="space-y-3">
                        <div className="h-18 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-18 animate-pulse rounded-xl bg-gray-100" />
                    </div>
                ) : supporterProfileQuery.isError && !supporterProfile ? (
                    <EmptyState
                        title="서포터 활동 기록을 불러오지 못했어요"
                        action={{
                            label: '다시 시도',
                            onClick: () => supporterProfileQuery.refetch(),
                        }}
                    />
                ) : !supporterProfile ||
                  supporterProfile.history.length === 0 ? (
                    <EmptyState title="서포터 활동 기록이 없어요" />
                ) : (
                    <ul className="-mx-4 divide-y divide-gray-200">
                        {supporterProfile.history.map((item) => (
                            <li
                                key={item.spotId}
                                className="px-4 py-3 transition-colors hover:bg-gray-50"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {item.spotTitle}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {item.spotType} · 리뷰{' '}
                                            {item.reviewCount}개
                                        </p>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                        <p>{formatDate(item.completedAt)}</p>
                                        <p>
                                            {typeof item.avgRating === 'number'
                                                ? `${item.avgRating.toFixed(1)}점`
                                                : '평점 없음'}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </MyPageSection>

            <MyPageSection
                title="최근 리뷰 요약"
                description="가장 최근에 받은 후기를 빠르게 확인하세요."
            >
                {supportSummaryQuery.isPending && !supportSummary ? (
                    <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
                ) : supportSummaryQuery.isError && !supportSummary ? (
                    <EmptyState
                        title="리뷰 요약을 불러오지 못했어요"
                        action={{
                            label: '다시 시도',
                            onClick: () => supportSummaryQuery.refetch(),
                        }}
                    />
                ) : supportSummary?.latestReview ? (
                    <MyPageSummaryList>
                        <MyPageSummaryRow
                            label={supportSummary.latestReview.reviewerNickname}
                            value={`${supportSummary.latestReview.rating}점`}
                            detail={
                                <>
                                    <span className="text-xs text-gray-500">
                                        {formatDate(
                                            supportSummary.latestReview
                                                .createdAt,
                                        )}{' '}
                                        ·{' '}
                                        {supportSummary.latestReview.spotTitle}
                                    </span>
                                    <span className="mt-2 block text-sm leading-6 text-gray-600">
                                        {supportSummary.latestReview.comment ||
                                            '남겨진 코멘트가 없어요.'}
                                    </span>
                                </>
                            }
                            valueClassName="text-sm"
                        />
                    </MyPageSummaryList>
                ) : (
                    <EmptyState title="최근 리뷰가 없어요" />
                )}
            </MyPageSection>
        </MyPageLayout>
    );
}

function HistoryStatRow({ label, value }: { label: string; value: string }) {
    return <MyPageSummaryRow label={label} value={value} />;
}
