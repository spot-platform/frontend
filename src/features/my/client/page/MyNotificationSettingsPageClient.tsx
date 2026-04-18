'use client';

import { useMemo, useState } from 'react';
import {
    useNotificationSettings,
    useUpdateNotificationSettings,
} from '../../model/use-my';
import { EmptyState } from '@/shared/ui';
import {
    MyActionButton,
    MyMessage,
    MyToggleRow,
} from '../../ui/my-page/MyFormControls';
import { MyPageLayout, MyPageSection } from '../../ui/my-page/MyPageLayout';
import {
    formatDateTime,
    getErrorMessage,
} from '../../ui/my-page/my-page-client-utils';

type NotificationFormState = {
    serviceNoticeEnabled: boolean;
    activityEnabled: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
};

const EMPTY_FORM: NotificationFormState = {
    serviceNoticeEnabled: false,
    activityEnabled: false,
    pushEnabled: false,
    emailEnabled: false,
};

function toNotificationFormState(
    settings: NonNullable<
        NonNullable<ReturnType<typeof useNotificationSettings>['data']>['data']
    >,
): NotificationFormState {
    return {
        serviceNoticeEnabled: settings.serviceNoticeEnabled,
        activityEnabled: settings.activityEnabled,
        pushEnabled: settings.pushEnabled,
        emailEnabled: settings.emailEnabled,
    };
}

export function MyNotificationSettingsPageClient() {
    const settingsQuery = useNotificationSettings();
    const updateMutation = useUpdateNotificationSettings();
    const [formDraft, setFormDraft] = useState<NotificationFormState | null>(
        null,
    );
    const [feedback, setFeedback] = useState<string | null>(null);

    const settings = settingsQuery.data?.data;
    const initialForm = useMemo(
        () => (settings ? toNotificationFormState(settings) : EMPTY_FORM),
        [settings],
    );
    const form = formDraft ?? initialForm;

    const handleSave = async () => {
        setFeedback(null);

        try {
            await updateMutation.mutateAsync(form);
            setFeedback('알림 설정을 저장했어요.');
        } catch (error) {
            setFeedback(
                getErrorMessage(error, '알림 설정을 저장하지 못했어요.'),
            );
        }
    };

    if (settingsQuery.isLoading && !settings) {
        return (
            <MyPageLayout
                title="알림 설정"
                description="서비스 공지와 활동 알림의 수신 여부를 관리할 수 있어요."
            >
                <MyPageSection title="불러오는 중">
                    <div className="space-y-3">
                        <div className="h-18 rounded-xl bg-muted" />
                        <div className="h-18 rounded-xl bg-muted" />
                    </div>
                </MyPageSection>
            </MyPageLayout>
        );
    }

    if (!settings) {
        return (
            <MyPageLayout
                title="알림 설정"
                description="서비스 공지와 활동 알림의 수신 여부를 관리할 수 있어요."
            >
                <MyPageSection title="알림 설정">
                    <EmptyState title="알림 설정을 불러오지 못했어요" />
                </MyPageSection>
            </MyPageLayout>
        );
    }

    return (
        <MyPageLayout
            title="알림 설정"
            description="중요 공지와 활동 안내를 어떤 채널로 받을지 직접 설정할 수 있어요."
        >
            <MyPageSection
                title="수신 정보"
                description={`마지막 변경 ${formatDateTime(settings.updatedAt)}`}
                contentClassName="py-0"
            >
                <div className="-mx-4 divide-y divide-border-soft">
                    <MyToggleRow
                        label="서비스 공지"
                        description="정책 변경, 점검, 공지사항을 받아요."
                        checked={form.serviceNoticeEnabled}
                        onChange={(checked) =>
                            setFormDraft((prev) => ({
                                ...(prev ?? initialForm),
                                serviceNoticeEnabled: checked,
                            }))
                        }
                        className="px-4"
                    />
                    <MyToggleRow
                        label="활동 알림"
                        description="신청, 승인, 진행, 리뷰 관련 알림을 받아요."
                        checked={form.activityEnabled}
                        onChange={(checked) =>
                            setFormDraft((prev) => ({
                                ...(prev ?? initialForm),
                                activityEnabled: checked,
                            }))
                        }
                        className="px-4"
                    />
                    <MyToggleRow
                        label="푸시 알림"
                        description="앱 푸시로 빠르게 안내를 받아요."
                        checked={form.pushEnabled}
                        onChange={(checked) =>
                            setFormDraft((prev) => ({
                                ...(prev ?? initialForm),
                                pushEnabled: checked,
                            }))
                        }
                        className="px-4"
                    />
                    <MyToggleRow
                        label="이메일 알림"
                        description="보관이 필요한 안내를 이메일로 받아요."
                        checked={form.emailEnabled}
                        onChange={(checked) =>
                            setFormDraft((prev) => ({
                                ...(prev ?? initialForm),
                                emailEnabled: checked,
                            }))
                        }
                        className="px-4"
                    />
                </div>

                {feedback ? (
                    <div className="px-4 py-4">
                        <MyMessage
                            tone={updateMutation.isError ? 'error' : 'success'}
                        >
                            {feedback}
                        </MyMessage>
                    </div>
                ) : null}

                <div className="flex justify-end px-4 py-4">
                    <MyActionButton
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? '저장 중...' : '설정 저장'}
                    </MyActionButton>
                </div>
            </MyPageSection>
        </MyPageLayout>
    );
}
