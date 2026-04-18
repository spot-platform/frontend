'use client';

import { useMemo, useState } from 'react';
import { useSupporterProfile, useUpdateSupporterProfile } from '@/features/my';
import { EmptyState } from '@/shared/ui';
import { formatDate } from '../../model/my-page-helpers';
import {
    MyActionButton,
    MyField,
    MyMessage,
    MyTextarea,
    MyInput,
} from './MyFormControls';
import {
    MyPageLayout,
    MyPageSection,
    MyPageSummaryList,
    MyPageSummaryRow,
} from './MyPageLayout';
import {
    fromMediaUrlLines,
    getErrorMessage,
    isValidUrl,
    toMediaUrlLines,
} from './my-page-client-utils';

type SupportProfileFormState = {
    field: string;
    mediaUrls: string;
    career: string;
    bio: string;
};

type FormSubmitEvent = {
    preventDefault: () => void;
};

const EMPTY_FORM: SupportProfileFormState = {
    field: '',
    mediaUrls: '',
    career: '',
    bio: '',
};

export function MySupportProfilePageClient() {
    const profileQuery = useSupporterProfile();
    const updateMutation = useUpdateSupporterProfile();
    const [form, setForm] = useState<SupportProfileFormState>(EMPTY_FORM);
    const [feedback, setFeedback] = useState<string | null>(null);

    const profile = profileQuery.data?.data;
    const [syncedProfile, setSyncedProfile] = useState(profile);

    if (profile && profile !== syncedProfile) {
        setSyncedProfile(profile);
        setForm({
            field: profile.field,
            mediaUrls: toMediaUrlLines(profile.mediaUrls),
            career: profile.career,
            bio: profile.bio,
        });
    }

    const errors = useMemo(() => {
        const nextErrors: Partial<
            Record<keyof SupportProfileFormState, string>
        > = {};
        const mediaUrls = fromMediaUrlLines(form.mediaUrls);

        if (form.field.trim().length < 2) {
            nextErrors.field = '분야를 2자 이상 입력해 주세요.';
        }

        if (!form.career.trim()) {
            nextErrors.career = '경력을 입력해 주세요.';
        }

        if (!form.bio.trim()) {
            nextErrors.bio = '소개 글을 입력해 주세요.';
        }

        if (mediaUrls.some((item) => !isValidUrl(item))) {
            nextErrors.mediaUrls = '미디어 URL 형식을 확인해 주세요.';
        }

        return nextErrors;
    }, [form]);

    const handleSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();
        setFeedback(null);

        if (Object.keys(errors).length > 0) {
            setFeedback('입력한 프로필 정보를 다시 확인해 주세요.');
            return;
        }

        try {
            await updateMutation.mutateAsync({
                field: form.field.trim(),
                mediaUrls: fromMediaUrlLines(form.mediaUrls),
                career: form.career.trim(),
                bio: form.bio.trim(),
            });
            setFeedback('서포터 프로필을 저장했어요.');
        } catch (error) {
            setFeedback(
                getErrorMessage(error, '서포터 프로필을 저장하지 못했어요.'),
            );
        }
    };

    if (profileQuery.isLoading && !profile) {
        return (
            <MyPageLayout
                title="서포터 프로필"
                description="노출 중인 프로필 정보와 평점·리뷰 요약을 함께 관리할 수 있어요."
            >
                <MyPageSection title="불러오는 중">
                    <div className="space-y-3">
                        <div className="h-11 rounded-xl bg-muted" />
                        <div className="h-24 rounded-xl bg-muted" />
                        <div className="h-24 rounded-xl bg-muted" />
                    </div>
                </MyPageSection>
            </MyPageLayout>
        );
    }

    if (!profile) {
        return (
            <MyPageLayout
                title="서포터 프로필"
                description="노출 중인 프로필 정보와 평점·리뷰 요약을 함께 관리할 수 있어요."
            >
                <MyPageSection title="서포터 프로필">
                    <EmptyState title="서포터 프로필을 불러오지 못했어요" />
                </MyPageSection>
            </MyPageLayout>
        );
    }

    return (
        <MyPageLayout
            title="서포터 프로필"
            description="실제 사용자에게 보이는 소개 정보와 최근 평가 흐름을 확인할 수 있어요."
        >
            <MyPageSection
                title="프로필 요약"
                description={`프로필 이름 ${profile.nickname}`}
            >
                <MyPageSummaryList>
                    <MyPageSummaryRow
                        label="평점"
                        value={`${profile.avgRating.toFixed(1)} / 5`}
                    />
                    <MyPageSummaryRow
                        label="리뷰 수"
                        value={`${profile.reviewCount}개`}
                    />
                    <MyPageSummaryRow
                        label="완료 활동"
                        value={`${profile.history.length}건`}
                    />
                </MyPageSummaryList>
            </MyPageSection>

            <MyPageSection
                title="노출 프로필 수정"
                description="분야, 경력, 소개, 미디어 주소를 직접 수정해 저장하세요."
            >
                <form
                    className="divide-y divide-border-soft"
                    onSubmit={handleSubmit}
                >
                    <MyField
                        label="분야"
                        required
                        error={errors.field}
                        className="py-4"
                    >
                        <MyInput
                            value={form.field}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    field: event.target.value,
                                }))
                            }
                            placeholder="대표 활동 분야를 입력해 주세요"
                        />
                    </MyField>

                    <MyField
                        label="사진 / 동영상 URL"
                        hint="한 줄에 하나씩 등록해 주세요."
                        error={errors.mediaUrls}
                        className="py-4"
                    >
                        <MyTextarea
                            value={form.mediaUrls}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    mediaUrls: event.target.value,
                                }))
                            }
                            placeholder={[
                                'https://example.com/photo-1.jpg',
                                'https://example.com/video-1',
                            ].join('\n')}
                        />
                    </MyField>

                    <MyField
                        label="경력"
                        required
                        error={errors.career}
                        className="py-4"
                    >
                        <MyTextarea
                            value={form.career}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    career: event.target.value,
                                }))
                            }
                            placeholder="프로필에 노출할 경력을 입력해 주세요"
                        />
                    </MyField>

                    <MyField
                        label="소개 글"
                        required
                        error={errors.bio}
                        className="py-4"
                    >
                        <MyTextarea
                            value={form.bio}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    bio: event.target.value,
                                }))
                            }
                            placeholder="활동 스타일과 제공 가능한 도움을 입력해 주세요"
                        />
                    </MyField>

                    {feedback ? (
                        <div className="py-4">
                            <MyMessage
                                tone={
                                    updateMutation.isError ? 'error' : 'success'
                                }
                            >
                                {feedback}
                            </MyMessage>
                        </div>
                    ) : null}

                    <div className="flex justify-end py-4">
                        <MyActionButton
                            type="submit"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending
                                ? '저장 중...'
                                : '프로필 저장'}
                        </MyActionButton>
                    </div>
                </form>
            </MyPageSection>

            <MyPageSection
                title="리뷰 요약"
                description="최근 받은 평가를 읽기 쉽게 정리했어요."
                contentClassName="py-0"
            >
                {profile.reviews.length === 0 ? (
                    <EmptyState title="아직 받은 리뷰가 없어요" />
                ) : (
                    <ul className="-mx-4 divide-y divide-border-soft">
                        {profile.reviews.map((review) => (
                            <li
                                key={review.id}
                                className="px-4 py-3 transition-colors hover:bg-muted"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-foreground">
                                        {review.reviewerNickname}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {review.rating}점 ·{' '}
                                        {formatDate(review.createdAt)}
                                    </p>
                                </div>
                                <p className="mt-1 text-sm text-text-secondary">
                                    {review.comment ||
                                        '남겨진 코멘트가 없어요.'}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {review.spotTitle}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </MyPageSection>

            <MyPageSection
                title="활동 히스토리"
                description="완료한 스팟과 평가 흐름을 함께 확인할 수 있어요."
                contentClassName="py-0"
            >
                {profile.history.length === 0 ? (
                    <EmptyState title="완료된 서포터 활동이 없어요" />
                ) : (
                    <ul className="-mx-4 divide-y divide-border-soft">
                        {profile.history.map((item) => (
                            <li
                                key={item.spotId}
                                className="px-4 py-3 transition-colors hover:bg-muted"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {item.spotTitle}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            완료일{' '}
                                            {formatDate(item.completedAt)}
                                        </p>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                        <p>{item.reviewCount}개 리뷰</p>
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
        </MyPageLayout>
    );
}
