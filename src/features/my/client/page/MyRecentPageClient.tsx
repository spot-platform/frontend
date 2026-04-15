'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    useMyRecentViews,
    useRemoveRecentView,
    useClearRecentViews,
} from '../../model/use-my';
import { EmptyState } from '@/shared/ui';
import { formatDate } from '../../model/my-page-helpers';
import { MyActionButton, MyMessage } from '../../ui/my-page/MyFormControls';
import { MyPageLayout, MyPageSection } from '../../ui/my-page/MyPageLayout';
import { getErrorMessage } from '../../ui/my-page/my-page-client-utils';

export function MyRecentPageClient() {
    const recentViewsQuery = useMyRecentViews({ page: 1, size: 20 });
    const removeRecentViewMutation = useRemoveRecentView();
    const clearRecentViewsMutation = useClearRecentViews();
    const [feedback, setFeedback] = useState<string | null>(null);

    const recentViews = recentViewsQuery.data?.data ?? [];

    const handleRemove = async (recentViewId: string) => {
        setFeedback(null);

        try {
            await removeRecentViewMutation.mutateAsync(recentViewId);
            setFeedback('최근 본 게시글을 목록에서 제거했어요.');
        } catch (error) {
            setFeedback(
                getErrorMessage(error, '최근 본 게시글을 제거하지 못했어요.'),
            );
        }
    };

    const handleClear = async () => {
        setFeedback(null);

        try {
            await clearRecentViewsMutation.mutateAsync();
            setFeedback('최근 본 게시글 목록을 비웠어요.');
        } catch (error) {
            setFeedback(
                getErrorMessage(error, '최근 본 게시글을 비우지 못했어요.'),
            );
        }
    };

    return (
        <MyPageLayout
            title="최근 본 게시글"
            description="최근 확인한 게시글을 이어서 보고 필요할 때 개별 삭제나 전체 정리를 할 수 있어요."
        >
            <MyPageSection
                title="조회 기록"
                description="최근 본 순서대로 최대 20개를 보여줘요."
                contentClassName="py-0"
                actions={
                    recentViews.length > 0 ? (
                        <MyActionButton
                            variant="secondary"
                            onClick={handleClear}
                            disabled={clearRecentViewsMutation.isPending}
                        >
                            {clearRecentViewsMutation.isPending
                                ? '비우는 중...'
                                : '전체 삭제'}
                        </MyActionButton>
                    ) : null
                }
            >
                {feedback ? (
                    <div className="px-4 py-4">
                        <MyMessage
                            tone={
                                removeRecentViewMutation.isError ||
                                clearRecentViewsMutation.isError
                                    ? 'error'
                                    : 'success'
                            }
                        >
                            {feedback}
                        </MyMessage>
                    </div>
                ) : null}

                {recentViewsQuery.isPending && recentViews.length === 0 ? (
                    <div className="space-y-3">
                        <div className="h-18 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-18 animate-pulse rounded-xl bg-gray-100" />
                    </div>
                ) : recentViewsQuery.isError && recentViews.length === 0 ? (
                    <EmptyState
                        title="최근 본 게시글을 불러오지 못했어요"
                        action={{
                            label: '다시 시도',
                            onClick: () => recentViewsQuery.refetch(),
                        }}
                    />
                ) : recentViews.length === 0 ? (
                    <EmptyState title="최근 본 게시글이 없어요" />
                ) : (
                    <ul className="-mx-4 divide-y divide-gray-200">
                        {recentViews.map((item) => (
                            <li
                                key={item.id}
                                className="px-4 py-3 transition-colors hover:bg-gray-50"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/spot/${item.targetId}`}
                                            className="text-sm font-medium text-gray-900 underline-offset-2 hover:underline"
                                        >
                                            {item.title}
                                        </Link>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {item.type}
                                            {item.authorNickname
                                                ? ` · ${item.authorNickname}`
                                                : ''}
                                            {item.status
                                                ? ` · ${item.status}`
                                                : ''}
                                            {' · '}
                                            조회일 {formatDate(item.viewedAt)}
                                        </p>
                                        {item.description ? (
                                            <p className="mt-2 text-sm text-gray-600">
                                                {item.description}
                                            </p>
                                        ) : null}
                                    </div>
                                    <MyActionButton
                                        variant="secondary"
                                        onClick={() => handleRemove(item.id)}
                                        disabled={
                                            removeRecentViewMutation.isPending
                                        }
                                        className="shrink-0"
                                    >
                                        삭제
                                    </MyActionButton>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </MyPageSection>
        </MyPageLayout>
    );
}
