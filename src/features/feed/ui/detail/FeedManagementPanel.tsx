'use client';

import type { ReactNode } from 'react';
import { Chip } from '@frontend/design-system';
import { IconCoinMonero, IconUsers } from '@tabler/icons-react';
import { cn } from '@/shared/lib/cn';
import { EmptyState, Section, UserAvatarStatic } from '@/shared/ui';
import type {
    FeedItem,
    FeedManagementFlow,
    FeedParticipantProfile,
    SupporterApplication,
} from '../../model/types';

const STATUS_STYLES: Record<SupporterApplication['status'], string> = {
    LEADING: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    REVIEWING: 'border-brand-800/10 bg-brand-800/5 text-brand-800',
    WAITING: 'border-border-soft bg-muted text-muted-foreground',
};

const STATUS_LABELS: Record<SupporterApplication['status'], string> = {
    LEADING: '우선 검토',
    REVIEWING: '비교 중',
    WAITING: '대기',
};

function formatCurrency(value: number) {
    return value.toLocaleString('ko-KR') + '원';
}

export function FeedManagementPanel({
    item,
    flow,
}: {
    item: FeedItem;
    flow: FeedManagementFlow;
}) {
    const progressPercent = Math.min(
        Math.round((flow.demand.fundedAmount / flow.demand.fundingGoal) * 100),
        100,
    );
    const isRequest = item.type === 'REQUEST';
    const currentAmountLabel =
        flow.demand.currentAmountLabel ??
        (isRequest ? '현재 맞춰본 예산' : '모인 금액');
    const targetAmountLabel =
        flow.demand.targetAmountLabel ??
        (isRequest ? '희망 예산' : '목표 예산');
    const progressLabel =
        flow.demand.progressLabel ?? (isRequest ? '예산 조율도' : '달성률');
    const partnersLabel = isRequest ? '검토 파트너' : '확정 파트너';
    const remainingPartnersCopy = isRequest ? '추가 검토' : '추가 확보';
    const comparisonTitle = isRequest ? '서포터 지원 경쟁' : '파트너 제안 비교';
    const comparisonDescription = isRequest
        ? '비교 중인 제안 프로필과 검토 포인트를 탭에서 나눠 볼 수 있어요.'
        : '지원자 프로필과 검토 포인트를 탭에서 나눠 볼 수 있어요.';
    const emptyTitle = isRequest
        ? '아직 도착한 제안이 없어요'
        : '아직 도착한 지원이 없어요';
    const emptyDescription = isRequest
        ? '첫 파트너 제안이 들어오면 여기에서 비교할 수 있어요.'
        : '첫 지원자가 들어오면 여기에서 비교할 수 있어요.';
    const confirmedPartners = flow.demand.confirmedPartnerProfiles;
    const confirmedPartnerCount = confirmedPartners.length;

    return (
        <Section gap="lg" className="pt-8 pb-4 px-4">
            <div className="space-y-5 border-b border-border-soft pb-6">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        {flow.stageLabel}
                    </h2>
                    <Chip
                        className="border-border-soft bg-card text-text-secondary"
                        size="sm"
                    >
                        {flow.demand.deadlineLabel}
                    </Chip>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-3">
                    <StatBlock
                        icon={<IconCoinMonero className="h-3.5 w-3.5" />}
                        label={currentAmountLabel}
                        value={formatCurrency(flow.demand.fundedAmount)}
                        meta={`${targetAmountLabel} ${formatCurrency(flow.demand.fundingGoal)}`}
                    />
                    <StatBlock
                        icon={<IconUsers className="h-3.5 w-3.5" />}
                        label={partnersLabel}
                        value={`${confirmedPartnerCount} / ${flow.demand.requiredPartners}명`}
                        meta={`${remainingPartnersCopy} ${Math.max(flow.demand.requiredPartners - confirmedPartnerCount, 0)}명 필요`}
                    />
                    <div className="col-span-2 space-y-2 md:col-span-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{progressLabel}</span>
                            <span className="font-semibold text-foreground">
                                {progressPercent}%
                            </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {flow.demand.hostNote}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between gap-2 text-sm ">
                            <p className="text-base font-semibold text-foreground">
                                {comparisonTitle}
                            </p>
                            <Chip
                                className="border-border-soft bg-card text-text-secondary"
                                size="sm"
                            >
                                총 {flow.applications.length}건 도착
                            </Chip>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {comparisonDescription}
                        </p>
                    </div>
                </div>

                {flow.applications.length === 0 ? (
                    <EmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                    />
                ) : (
                    <ApplicantAvatarGrid applications={flow.applications} />
                )}
            </div>

            <div className="space-y-4  border-border-soft py-6 border-t">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between gap-2 text-sm text-text-secondary">
                        <p className="text-base font-semibold text-foreground">
                            현재 참여 중인 파트너
                        </p>
                        <Chip className="border-border-soft bg-card" size="sm">
                            {confirmedPartnerCount}명 참여 중
                        </Chip>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        진행을 함께 맡고 있는 프로필을 바로 확인할 수 있어요.
                    </p>
                </div>

                <AvatarRoster profiles={confirmedPartners} />
            </div>
        </Section>
    );
}

function StatBlock({
    icon,
    label,
    value,
    meta,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    meta: string;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {icon}
                {label}
            </div>
            <p className="text-lg font-semibold tracking-tight text-foreground">
                {value}
            </p>
            <p className="text-xs text-muted-foreground">{meta}</p>
        </div>
    );
}

function AvatarRoster({ profiles }: { profiles: FeedParticipantProfile[] }) {
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-5">
            {profiles.map((profile) => (
                <UserAvatarStatic
                    key={profile.id}
                    userId={profile.id}
                    nickname={profile.nickname}
                    avatarUrl={profile.avatarUrl}
                    size="lg"
                    showLabel
                    className="min-w-14"
                />
            ))}
        </div>
    );
}

function ApplicantAvatarGrid({
    applications,
}: {
    applications: SupporterApplication[];
}) {
    return (
        <div className=" pt-5">
            <div className="flex flex-wrap gap-x-5 gap-y-6">
                {applications.map((application) => (
                    <div
                        key={application.id}
                        className="flex min-w-18 flex-col items-center gap-2 text-center"
                    >
                        <UserAvatarStatic
                            userId={application.id}
                            nickname={application.nickname}
                            avatarUrl={application.avatarUrl}
                            size="lg"
                        />
                        <div className="space-y-1">
                            <p className="max-w-16 truncate text-xs font-medium text-text-secondary">
                                {application.nickname}
                            </p>
                            <span
                                className={cn(
                                    'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                                    STATUS_STYLES[application.status],
                                )}
                            >
                                {STATUS_LABELS[application.status]}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
