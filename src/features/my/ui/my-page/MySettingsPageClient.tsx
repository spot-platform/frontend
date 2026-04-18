'use client';

import { useMemo, useState } from 'react';
import {
    useMyProfile,
    useUpdateProfile,
    useChangePassword,
} from '@/features/my';
import { EmptyState } from '@/shared/ui';
import { formatDate, formatNumber } from '../../model/my-page-helpers';
import { MyActionButton, MyField, MyInput, MyMessage } from './MyFormControls';
import {
    MyPageLayout,
    MyPageSection,
    MyPageSummaryList,
    MyPageSummaryRow,
} from './MyPageLayout';
import {
    getErrorMessage,
    isValidEmail,
    normalizePhone,
} from './my-page-client-utils';

type ProfileFormState = {
    avatarUrl: string;
    nickname: string;
    email: string;
    phone: string;
};

type PasswordFormState = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

type FormSubmitEvent = {
    preventDefault: () => void;
};

const EMPTY_PROFILE_FORM: ProfileFormState = {
    avatarUrl: '',
    nickname: '',
    email: '',
    phone: '',
};

const EMPTY_PASSWORD_FORM: PasswordFormState = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

export function MySettingsPageClient() {
    const profileQuery = useMyProfile();
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();
    const [profileForm, setProfileForm] =
        useState<ProfileFormState>(EMPTY_PROFILE_FORM);
    const [passwordForm, setPasswordForm] =
        useState<PasswordFormState>(EMPTY_PASSWORD_FORM);
    const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
    const [passwordFeedback, setPasswordFeedback] = useState<string | null>(
        null,
    );

    const profile = profileQuery.data?.data;
    const [syncedProfile, setSyncedProfile] = useState(profile);

    if (profile && profile !== syncedProfile) {
        setSyncedProfile(profile);
        setProfileForm({
            avatarUrl: profile.avatarUrl ?? '',
            nickname: profile.nickname ?? '',
            email: profile.email ?? '',
            phone: profile.phone ?? '',
        });
    }

    const profileErrors = useMemo(() => {
        const nextErrors: Partial<Record<keyof ProfileFormState, string>> = {};

        if (profileForm.avatarUrl.trim()) {
            try {
                new URL(profileForm.avatarUrl.trim());
            } catch {
                nextErrors.avatarUrl = '프로필 사진 URL 형식을 확인해 주세요.';
            }
        }

        if (profileForm.nickname.trim().length < 2) {
            nextErrors.nickname = '이름은 2자 이상 입력해 주세요.';
        }

        if (!isValidEmail(profileForm.email.trim())) {
            nextErrors.email = '이메일 형식을 확인해 주세요.';
        }

        if (
            profileForm.phone.trim() &&
            normalizePhone(profileForm.phone).replace(/-/g, '').length < 9
        ) {
            nextErrors.phone = '전화번호 형식을 확인해 주세요.';
        }

        return nextErrors;
    }, [profileForm]);

    const passwordErrors = useMemo(() => {
        const nextErrors: Partial<Record<keyof PasswordFormState, string>> = {};

        if (!passwordForm.currentPassword) {
            nextErrors.currentPassword = '현재 비밀번호를 입력해 주세요.';
        }

        if (passwordForm.newPassword.length < 8) {
            nextErrors.newPassword = '새 비밀번호는 8자 이상 입력해 주세요.';
        }

        if (passwordForm.confirmPassword !== passwordForm.newPassword) {
            nextErrors.confirmPassword =
                '새 비밀번호 확인이 일치하지 않습니다.';
        }

        return nextErrors;
    }, [passwordForm]);

    const handleProfileSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();
        setProfileFeedback(null);

        if (Object.keys(profileErrors).length > 0) {
            setProfileFeedback('입력한 기본 정보를 다시 확인해 주세요.');
            return;
        }

        try {
            await updateProfileMutation.mutateAsync({
                avatarUrl: profileForm.avatarUrl.trim() || undefined,
                nickname: profileForm.nickname.trim(),
                email: profileForm.email.trim(),
                phone: normalizePhone(profileForm.phone) || undefined,
            });
            setProfileFeedback('기본 정보를 저장했어요.');
        } catch (error) {
            setProfileFeedback(
                getErrorMessage(error, '기본 정보를 저장하지 못했어요.'),
            );
        }
    };

    const handlePasswordSubmit = async (event: FormSubmitEvent) => {
        event.preventDefault();
        setPasswordFeedback(null);

        if (Object.keys(passwordErrors).length > 0) {
            setPasswordFeedback('비밀번호 입력값을 다시 확인해 주세요.');
            return;
        }

        try {
            await changePasswordMutation.mutateAsync(passwordForm);
            setPasswordFeedback('비밀번호를 변경했어요.');
            setPasswordForm(EMPTY_PASSWORD_FORM);
        } catch (error) {
            setPasswordFeedback(
                getErrorMessage(error, '비밀번호를 변경하지 못했어요.'),
            );
        }
    };

    if (profileQuery.isLoading && !profile) {
        return (
            <MyPageLayout
                title="기본 정보"
                description="프로필과 계정 정보를 확인하고 수정할 수 있어요."
            >
                <MyPageSection title="불러오는 중">
                    <div className="space-y-3">
                        <div className="h-11 rounded-xl bg-muted" />
                        <div className="h-11 rounded-xl bg-muted" />
                        <div className="h-11 rounded-xl bg-muted" />
                    </div>
                </MyPageSection>
            </MyPageLayout>
        );
    }

    if (!profile) {
        return (
            <MyPageLayout
                title="기본 정보"
                description="프로필과 계정 정보를 확인하고 수정할 수 있어요."
            >
                <MyPageSection title="기본 정보">
                    <EmptyState title="계정 정보를 불러오지 못했어요" />
                </MyPageSection>
            </MyPageLayout>
        );
    }

    return (
        <MyPageLayout
            title="기본 정보"
            description="프로필 사진, 이름, 이메일, 전화번호와 비밀번호를 관리할 수 있어요."
        >
            <MyPageSection title="계정 요약">
                <MyPageSummaryList>
                    <MyPageSummaryRow
                        label="가입일"
                        value={formatDate(profile.joinedAt)}
                    />
                    <MyPageSummaryRow
                        label="보유 포인트"
                        value={`${formatNumber(profile.pointBalance)}P`}
                    />
                </MyPageSummaryList>
            </MyPageSection>

            <MyPageSection
                title="프로필과 연락처"
                description="현재 계정에 연결된 정보를 수정해 저장하세요."
            >
                <form
                    className="divide-y divide-border-soft"
                    onSubmit={handleProfileSubmit}
                >
                    <MyField
                        label="프로필 사진 URL"
                        hint="이미지 주소를 입력하면 프로필 대표 이미지로 저장돼요."
                        error={profileErrors.avatarUrl}
                        className="py-4"
                    >
                        <MyInput
                            value={profileForm.avatarUrl}
                            onChange={(event) =>
                                setProfileForm((prev) => ({
                                    ...prev,
                                    avatarUrl: event.target.value,
                                }))
                            }
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </MyField>

                    <MyField
                        label="이름"
                        required
                        error={profileErrors.nickname}
                        className="py-4"
                    >
                        <MyInput
                            value={profileForm.nickname}
                            onChange={(event) =>
                                setProfileForm((prev) => ({
                                    ...prev,
                                    nickname: event.target.value,
                                }))
                            }
                            placeholder="이름을 입력해 주세요"
                        />
                    </MyField>

                    <MyField
                        label="이메일"
                        required
                        error={profileErrors.email}
                        className="py-4"
                    >
                        <MyInput
                            type="email"
                            value={profileForm.email}
                            onChange={(event) =>
                                setProfileForm((prev) => ({
                                    ...prev,
                                    email: event.target.value,
                                }))
                            }
                            placeholder="you@example.com"
                        />
                    </MyField>

                    <MyField
                        label="전화번호"
                        error={profileErrors.phone}
                        className="py-4"
                    >
                        <MyInput
                            value={profileForm.phone}
                            onChange={(event) =>
                                setProfileForm((prev) => ({
                                    ...prev,
                                    phone: event.target.value,
                                }))
                            }
                            placeholder="010-0000-0000"
                        />
                    </MyField>

                    {profileFeedback ? (
                        <div className="py-4">
                            <MyMessage
                                tone={
                                    updateProfileMutation.isError
                                        ? 'error'
                                        : 'success'
                                }
                            >
                                {profileFeedback}
                            </MyMessage>
                        </div>
                    ) : null}

                    <div className="flex justify-end py-4">
                        <MyActionButton
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                        >
                            {updateProfileMutation.isPending
                                ? '저장 중...'
                                : '기본 정보 저장'}
                        </MyActionButton>
                    </div>
                </form>
            </MyPageSection>

            <MyPageSection
                title="비밀번호 변경"
                description="현재 비밀번호를 확인한 뒤 새 비밀번호로 변경하세요."
            >
                <form
                    className="divide-y divide-border-soft"
                    onSubmit={handlePasswordSubmit}
                >
                    <MyField
                        label="현재 비밀번호"
                        required
                        error={passwordErrors.currentPassword}
                        className="py-4"
                    >
                        <MyInput
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(event) =>
                                setPasswordForm((prev) => ({
                                    ...prev,
                                    currentPassword: event.target.value,
                                }))
                            }
                        />
                    </MyField>

                    <MyField
                        label="새 비밀번호"
                        required
                        hint="8자 이상으로 설정해 주세요."
                        error={passwordErrors.newPassword}
                        className="py-4"
                    >
                        <MyInput
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(event) =>
                                setPasswordForm((prev) => ({
                                    ...prev,
                                    newPassword: event.target.value,
                                }))
                            }
                        />
                    </MyField>

                    <MyField
                        label="새 비밀번호 확인"
                        required
                        error={passwordErrors.confirmPassword}
                        className="py-4"
                    >
                        <MyInput
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(event) =>
                                setPasswordForm((prev) => ({
                                    ...prev,
                                    confirmPassword: event.target.value,
                                }))
                            }
                        />
                    </MyField>

                    {passwordFeedback ? (
                        <div className="py-4">
                            <MyMessage
                                tone={
                                    changePasswordMutation.isError
                                        ? 'error'
                                        : 'success'
                                }
                            >
                                {passwordFeedback}
                            </MyMessage>
                        </div>
                    ) : null}

                    <div className="flex justify-end py-4">
                        <MyActionButton
                            type="submit"
                            disabled={changePasswordMutation.isPending}
                        >
                            {changePasswordMutation.isPending
                                ? '변경 중...'
                                : '비밀번호 변경'}
                        </MyActionButton>
                    </div>
                </form>
            </MyPageSection>
        </MyPageLayout>
    );
}
