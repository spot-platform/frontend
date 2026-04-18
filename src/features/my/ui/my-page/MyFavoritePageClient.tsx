'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMyFavorites, useRemoveFavorite } from '@/features/my';
import { EmptyState } from '@/shared/ui';
import { formatDate } from '../../model/my-page-helpers';
import { MyActionButton, MyMessage } from './MyFormControls';
import { MyPageLayout, MyPageSection } from './MyPageLayout';
import { getErrorMessage } from './my-page-client-utils';

export function MyFavoritePageClient() {
    const favoritesQuery = useMyFavorites({ page: 1, size: 20 });
    const removeFavoriteMutation = useRemoveFavorite();
    const [feedback, setFeedback] = useState<string | null>(null);

    const favorites = favoritesQuery.data?.data ?? [];

    const handleRemove = async (favoriteId: string) => {
        setFeedback(null);

        try {
            await removeFavoriteMutation.mutateAsync(favoriteId);
            setFeedback('찜한 게시글을 목록에서 제거했어요.');
        } catch (error) {
            setFeedback(
                getErrorMessage(error, '찜한 게시글을 제거하지 못했어요.'),
            );
        }
    };

    return (
        <MyPageLayout
            title="찜한 게시글"
            description="저장한 게시글을 다시 보고 필요 없어진 항목은 바로 정리할 수 있어요."
        >
            <MyPageSection
                title="저장한 목록"
                description="최근 저장한 순서대로 보여줘요."
                contentClassName="py-0"
            >
                {feedback ? (
                    <div className="px-4 py-4">
                        <MyMessage
                            tone={
                                removeFavoriteMutation.isError
                                    ? 'error'
                                    : 'success'
                            }
                        >
                            {feedback}
                        </MyMessage>
                    </div>
                ) : null}

                {favoritesQuery.isPending && favorites.length === 0 ? (
                    <div className="space-y-3">
                        <div className="h-18 animate-pulse rounded-xl bg-muted" />
                        <div className="h-18 animate-pulse rounded-xl bg-muted" />
                    </div>
                ) : favoritesQuery.isError && favorites.length === 0 ? (
                    <EmptyState
                        title="찜한 게시글을 불러오지 못했어요"
                        action={{
                            label: '다시 시도',
                            onClick: () => favoritesQuery.refetch(),
                        }}
                    />
                ) : favorites.length === 0 ? (
                    <EmptyState title="찜한 게시글이 없어요" />
                ) : (
                    <ul className="-mx-4 divide-y divide-border-soft">
                        {favorites.map((item) => (
                            <li
                                key={item.id}
                                className="px-4 py-3 transition-colors hover:bg-muted"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/spot/${item.targetId}`}
                                            className="text-sm font-medium text-foreground underline-offset-2 hover:underline"
                                        >
                                            {item.title}
                                        </Link>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {item.type}
                                            {item.authorNickname
                                                ? ` · ${item.authorNickname}`
                                                : ''}
                                            {item.status
                                                ? ` · ${item.status}`
                                                : ''}
                                            {' · '}
                                            저장일 {formatDate(item.savedAt)}
                                        </p>
                                        {item.description ? (
                                            <p className="mt-2 text-sm text-text-secondary">
                                                {item.description}
                                            </p>
                                        ) : null}
                                    </div>
                                    <MyActionButton
                                        variant="secondary"
                                        onClick={() => handleRemove(item.id)}
                                        disabled={
                                            removeFavoriteMutation.isPending
                                        }
                                        className="shrink-0"
                                    >
                                        제거
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
