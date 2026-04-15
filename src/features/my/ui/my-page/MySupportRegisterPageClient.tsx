'use client';

import { useMemo, useState } from 'react';
import {
    useSupporterRegistration,
    useUpdateSupporterRegistration,
} from '@/features/my';
import { EmptyState } from '@/shared/ui';
import type { SupporterRegistrationStatus } from '@/entities/user/types';
import {
    MyActionButton,
    MyField,
    MyInput,
    MyMessage,
    MyTextarea,
} from './MyFormControls';
import {
    MyPageLayout,
    MyPageSection,
    MyPageSummaryList,
    MyPageSummaryRow,
} from './MyPageLayout';
import {
    formatDateTime,
    fromMediaUrlLines,
    getErrorMessage,
    isValidUrl,
    toMediaUrlLines,
} from './my-page-client-utils';

type SupportRegisterFormState = {
    field: string;
    mediaUrls: string;
    career: string;
    bio: string;
    verificationStatus: SupporterRegistrationStatus;
    verificationNotes: string;
    extraNotes: string;
};

type FormSubmitEvent = {
    preventDefault: () => void;
};

const STATUS_OPTIONS: Array<{
    value: SupporterRegistrationStatus;
    label: string;
}> = [
    { value: 'NOT_SUBMITTED', label: '미제출' },
    { value: 'PENDING', label: '검토 중' },
    { value: 'VERIFIED', label: '인증 완료' },
    { value: 'REJECTED', label: '보완 필요' },
];

const EMPTY_FORM: SupportRegisterFormState = {
    field: '',
    mediaUrls: '',
    career: '',
    bio: '',
    verificationStatus: 'NOT_SUBMITTED',
    verificationNotes: '',
    extraNotes: '',
};

export function MySupportRegisterPageClient() {
    const registrationQuery = useSupporterRegistration();
    const updateMutation = useUpdateSupporterRegistration();
    const [form, setForm] = useState<SupportRegisterFormState>(EMPTY_FORM);
    const [feedback, setFeedback] = useState<string | null>(null);

    const registration = registrationQuery.data?.data;
    const [syncedRegistration, setSyncedRegistration] = useState(registration);

    if (registration && registration !== syncedRegistration) {
        setSyncedRegistration(registration);
        setForm({
            field: registration.field,
            mediaUrls: toMediaUrlLines(registration.mediaUrls),
            career: registration.career,
            bio: registration.bio,
            verificationStatus: registration.verificationStatus,
            verificationNotes: registration.verificationNotes,
            extraNotes: registration.extraNotes,
        });
    }

    const errors = useMemo(() => {
        const nextErrors: Partial<
            Record<keyof SupportRegisterFormState, string>
        > = {};
        const mediaUrls = fromMediaUrlLines(form.mediaUrls);

        if (form.field.trim().length < 2) {
            nextErrors.field = '분야 또는 카테고리를 2자 이상 입력해 주세요.';
        }

        if (!form.career.trim()) {
            nextErrors.career = '경력을 입력해 주세요.';
        }

        if (!form.bio.trim()) {
            nextErrors.bio = '소개 글을 입력해 주세요.';
        }

        if (mediaUrls.some((item) => !isValidUrl(item))) {
            nextErrors.mediaUrls =
                '미디어 URL은 http 또는 https 주소여야 해요.';
        }

        return nextErrors;
    }, [form]);

    const handleSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();
        setFeedback(null);

        if (Object.keys(errors).length > 0) {
            setFeedback('입력한 등록 정보를 다시 확인해 주세요.');
            return;
        }

        try {
            await updateMutation.mutateAsync({
                field: form.field.trim(),
                mediaUrls: fromMediaUrlLines(form.mediaUrls),
                career: form.career.trim(),
                bio: form.bio.trim(),
                verificationStatus: form.verificationStatus,
                verificationNotes: form.verificationNotes.trim(),
                extraNotes: form.extraNotes.trim(),
            });
            setFeedback('서포터 등록 정보를 저장했어요.');
        } catch (error) {
            setFeedback(
                getErrorMessage(error, '서포터 등록 정보를 저장하지 못했어요.'),
            );
        }
    };

    if (registrationQuery.isLoading && !registration) {
        return (
            <MyPageLayout
                title="서포터 등록 정보"
                description="서포터 등록 심사에 필요한 정보를 입력하고 관리할 수 있어요."
            >
                <MyPageSection title="불러오는 중">
                    <div className="space-y-3">
                        <div className="h-11 rounded-xl bg-gray-100" />
                        <div className="h-28 rounded-xl bg-gray-100" />
                        <div className="h-28 rounded-xl bg-gray-100" />
                    </div>
                </MyPageSection>
            </MyPageLayout>
        );
    }

    if (!registration) {
        return (
            <MyPageLayout
                title="서포터 등록 정보"
                description="서포터 등록 심사에 필요한 정보를 입력하고 관리할 수 있어요."
            >
                <MyPageSection title="등록 정보">
                    <EmptyState title="등록 정보를 불러오지 못했어요" />
                </MyPageSection>
            </MyPageLayout>
        );
    }

    return (
        <MyPageLayout
            title="서포터 등록 정보"
            description="심사에 필요한 기본 정보와 인증 메모를 한 곳에서 관리하세요."
        >
            <MyPageSection
                title="등록 상태"
                description={`마지막 변경 ${formatDateTime(registration.updatedAt)}`}
            >
                <MyPageSummaryList>
                    <MyPageSummaryRow
                        label="현재 상태"
                        value={
                            STATUS_OPTIONS.find(
                                (option) =>
                                    option.value === form.verificationStatus,
                            )?.label ?? '-'
                        }
                    />
                    <MyPageSummaryRow
                        label="인증 메모"
                        detail={
                            form.verificationNotes || '등록된 메모가 없어요.'
                        }
                    />
                </MyPageSummaryList>
            </MyPageSection>

            <MyPageSection
                title="등록 정보 입력"
                description="실제 심사 및 등록 정보에 반영되는 값이에요."
            >
                <form
                    className="divide-y divide-gray-200"
                    onSubmit={handleSubmit}
                >
                    <MyField
                        label="분야 / 카테고리"
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
                            placeholder="예: 운동, 요리, 언어, 촬영"
                        />
                    </MyField>

                    <MyField
                        label="사진 / 동영상 URL"
                        hint="한 줄에 하나씩 입력해 주세요."
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
                            placeholder="관련 경력과 이력을 입력해 주세요"
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
                            placeholder="지원자에게 보여줄 자기소개를 입력해 주세요"
                        />
                    </MyField>

                    <MyField label="본인 인증 상태" className="py-4">
                        <span className="relative block">
                            <select
                                value={form.verificationStatus}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        verificationStatus: event.target
                                            .value as SupporterRegistrationStatus,
                                    }))
                                }
                                className="peer w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[border-color,background-color,box-shadow,color] duration-200 hover:border-gray-400 hover:bg-gray-50/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-gray-400 transition-colors duration-200 peer-hover:text-gray-500 peer-focus:text-brand-700 peer-disabled:text-gray-300">
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className="h-4 w-4"
                                >
                                    <path
                                        d="M4 6.5L8 10L12 6.5"
                                        stroke="currentColor"
                                        strokeWidth="1.75"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </span>
                    </MyField>

                    <MyField label="인증 메모" className="py-4">
                        <MyTextarea
                            value={form.verificationNotes}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    verificationNotes: event.target.value,
                                }))
                            }
                            placeholder="확인 내용이나 보완 요청 사항을 입력해 주세요"
                        />
                    </MyField>

                    <MyField label="추가 메모" className="py-4">
                        <MyTextarea
                            value={form.extraNotes}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    extraNotes: event.target.value,
                                }))
                            }
                            placeholder="운영팀에 전달할 추가 사항을 남겨 주세요"
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
                                : '등록 정보 저장'}
                        </MyActionButton>
                    </div>
                </form>
            </MyPageSection>
        </MyPageLayout>
    );
}
