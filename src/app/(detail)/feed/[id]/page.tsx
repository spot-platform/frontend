// Feed 상세 페이지 — OFFER/REQUEST 타입별 분기 렌더링
import type { Metadata } from 'next';
import Image from 'next/image';
import { cookies } from 'next/headers';
import {
    IconPhoto,
    IconUserCircle,
    IconUsers,
    IconStar,
} from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import {
    getServerFeedApplications,
    getServerFeedDetail,
} from '@/features/feed/api/feed-server-api';
import { FeedParticipationActions } from '@/features/feed/ui/detail/FeedParticipationActions';
import { EditPlanPreparationCard } from '@/features/feed/ui/detail/EditPlanPreparationCard';
import { PlanSection } from '@/features/feed/ui/detail/PlanSection';
import { PriceSection } from '@/features/feed/ui/detail/PriceSection';
import { PreparationSection } from '@/features/feed/ui/detail/PreparationSection';
import { VenueSection } from '@/features/feed/ui/detail/VenueSection';
import { DetailHeader, DetailPageShell } from '@/shared/ui';
import type {
    FeedApplication,
    FeedItem,
    FeedManagementFlow,
    SupporterApplication,
} from '@/features/feed/model/types';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const item = await getServerFeedDetail(id);

    return { title: item?.title ?? '피드 상세' };
}

function TrustMeter({ level }: { level: '하' | '중' | '중상' | '상' }) {
    const LEVELS = ['하', '중', '중상', '상'] as const;
    const filled = LEVELS.indexOf(level) + 1;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex gap-0.5">
                {LEVELS.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 w-5 rounded-full transition-colors ${
                            i < filled ? 'bg-accent' : 'bg-gray-200'
                        }`}
                    />
                ))}
            </div>
            <span className="text-[10px] font-semibold text-accent">
                신뢰도 {level}
            </span>
        </div>
    );
}

function formatPrice(price: number): string {
    return price.toLocaleString('ko-KR') + '원';
}

function AuthorSection({ item }: { item: FeedItem }) {
    const profile = item.authorProfile;
    const isSupporter = profile?.role === 'SUPPORTER';

    return (
        <div className="border-b border-gray-200 px-4 py-5">
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                    {profile?.avatarUrl ? (
                        <Image
                            src={profile.avatarUrl}
                            alt={profile.nickname}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <IconUserCircle size={32} className="text-gray-400" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-gray-900">
                            {item.authorNickname}
                        </p>
                        {profile && (
                            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                                {isSupporter ? '서포터' : '파트너'}
                            </span>
                        )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                        <span>{item.location}</span>
                        {isSupporter && profile.rating != null && (
                            <span className="flex items-center gap-0.5">
                                <IconStar
                                    size={10}
                                    className="fill-amber-400 text-amber-400"
                                />
                                <span className="font-medium text-gray-600">
                                    {profile.rating.toFixed(1)}
                                </span>
                            </span>
                        )}
                        {isSupporter && profile.field && (
                            <span>#{profile.field}</span>
                        )}
                    </div>
                </div>
                <TrustMeter level="중상" />
            </div>
        </div>
    );
}

function OfferDetailContent({ item }: { item: FeedItem }) {
    const partnerCount = item.partnerCount ?? 0;
    const remaining =
        item.maxParticipants != null
            ? item.maxParticipants - partnerCount
            : null;

    return (
        <>
            {/* 확정 금액 + 슬롯 현황 */}
            <div className="border-b border-gray-200 px-4 py-5">
                <div className="flex items-baseline justify-between gap-4">
                    <span className="text-xl font-semibold tracking-tight text-gray-900">
                        {formatPrice(item.price)}
                    </span>
                    {item.progressPercent != null && (
                        <span className="text-sm font-semibold text-accent">
                            {item.progressPercent}%
                        </span>
                    )}
                </div>
                {item.progressPercent != null && (
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-accent transition-all duration-500"
                            style={{
                                width: `${Math.min(item.progressPercent, 100)}%`,
                            }}
                        />
                    </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                        <IconUsers size={14} />
                        <span>{partnerCount}명 참여 중</span>
                    </div>
                    {remaining != null && (
                        <span className="text-xs font-medium text-brand-800">
                            {remaining > 0
                                ? `${remaining}자리 남음`
                                : '정원 마감'}
                        </span>
                    )}
                </div>
            </div>

            {/* 본문 */}
            <article className="border-b border-gray-200 px-4 py-7">
                <div className="max-w-3xl space-y-5">
                    <div className="space-y-2">
                        <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase">
                            {item.category ?? '활동 소개'}
                        </p>
                        <h1 className="text-[1.75rem] leading-tight font-semibold tracking-tight text-gray-900 sm:text-[2.125rem]">
                            {item.title}
                        </h1>
                    </div>
                    <div className="space-y-4 text-base leading-7 text-gray-600">
                        {item.description ? (
                            <p>{item.description}</p>
                        ) : (
                            <>
                                <p>
                                    함께할 파트너를 모집하는 활동입니다.
                                    서포터가 직접 기획하고 운영하는
                                    프로그램으로, 금액과 일정이 사전에 확정되어
                                    있습니다.
                                </p>
                                <p>
                                    참여 신청 후 서포터가 확정하면 스팟이
                                    시작되며, 이후 채팅으로 세부 사항을
                                    공유합니다.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </article>

            <VenueSection
                primaryPin={item.primaryPin}
                venueAnchors={item.venueAnchors}
            />
            <PlanSection
                plan={item.plan}
                places={[
                    ...(item.primaryPin ? [item.primaryPin] : []),
                    ...(item.venueAnchors ?? []),
                ]}
            />
            <PreparationSection preparation={item.preparation} />
            <PriceSection
                priceBreakdown={item.priceBreakdown}
                fallbackPrice={item.price}
            />
        </>
    );
}

function RequestDetailContent({
    item,
    management,
}: {
    item: FeedItem;
    management?: FeedManagementFlow;
}) {
    const applicants = management?.applications ?? [];
    const applicantCount = item.applicantCount ?? applicants.length;
    const MAX_VISIBLE = 5;

    return (
        <>
            {/* 희망 조건 */}
            <div className="border-b border-gray-200 px-4 py-5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase mb-1">
                            희망 예산
                        </p>
                        <span className="text-lg font-semibold text-gray-500">
                            금액 협의 예정
                        </span>
                    </div>
                    <span className="rounded-full border border-accent-border bg-accent-muted px-3 py-1 text-xs font-semibold text-accent">
                        해볼래
                    </span>
                </div>
                <p className="mt-3 text-xs text-gray-400">
                    서포터와 매칭된 후 채팅을 통해 금액과 일정을 함께
                    조율합니다.
                </p>
            </div>

            {/* 서포터 지원 현황 */}
            <div className="border-b border-gray-200 px-4 py-5">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                        서포터 지원 현황
                    </p>
                    <span className="text-sm text-gray-500">
                        {applicantCount}명 지원 중
                    </span>
                </div>
                <div className="mt-2 flex gap-1.5">
                    {applicants.length > 0
                        ? applicants.slice(0, MAX_VISIBLE).map((applicant) =>
                              applicant.avatarUrl ? (
                                  <div
                                      key={applicant.id}
                                      className="h-7 w-7 overflow-hidden rounded-full bg-gray-200"
                                  >
                                      <Image
                                          src={applicant.avatarUrl}
                                          alt={applicant.nickname}
                                          width={28}
                                          height={28}
                                          className="h-full w-full object-cover"
                                      />
                                  </div>
                              ) : (
                                  <div
                                      key={applicant.id}
                                      className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500"
                                  >
                                      {applicant.nickname[0]}
                                  </div>
                              ),
                          )
                        : Array.from({
                              length: Math.min(applicantCount, MAX_VISIBLE),
                          }).map((_, i) => (
                              <div
                                  key={i}
                                  className="h-7 w-7 rounded-full bg-gray-200"
                              />
                          ))}
                    {applicantCount > MAX_VISIBLE && (
                        <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                            +{applicantCount - MAX_VISIBLE}
                        </div>
                    )}
                </div>
            </div>

            {/* 본문 */}
            <article className="border-b border-gray-200 px-4 py-7">
                <div className="max-w-3xl space-y-5">
                    <div className="space-y-2">
                        <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase">
                            {item.category ?? '요청 내용'}
                        </p>
                        <h1 className="text-[1.75rem] leading-tight font-semibold tracking-tight text-gray-900 sm:text-[2.125rem]">
                            {item.title}
                        </h1>
                    </div>
                    <div className="space-y-4 text-base leading-7 text-gray-600">
                        {item.description ? (
                            <p>{item.description}</p>
                        ) : (
                            <>
                                <p>
                                    파트너가 원하는 활동을 함께해줄 서포터를
                                    찾고 있습니다. 아직 금액과 일정이 정해지지
                                    않았으며, 매칭 후 채팅으로 협의합니다.
                                </p>
                                <p>
                                    제안서를 보내면 파트너에게 개인 채팅방이
                                    생성되고, 채팅에서 조건을 맞춰가며 스팟을
                                    시작할 수 있어요.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </article>

            <VenueSection
                primaryPin={item.primaryPin}
                venueAnchors={item.venueAnchors}
            />
            <PlanSection
                plan={item.plan}
                places={[
                    ...(item.primaryPin ? [item.primaryPin] : []),
                    ...(item.venueAnchors ?? []),
                ]}
                emptyHint="활동 계획은 매칭된 서포터가 함께 작성해요. 제안 시 플랜을 같이 보낼 수 있어요."
            />
            <PreparationSection
                preparation={item.preparation}
                emptyHint="준비물은 매칭된 서포터가 정리해 공유할 예정이에요."
            />
            <PriceSection
                priceBreakdown={item.priceBreakdown}
                fallbackPrice={undefined}
                emptyHint="세부 가격은 서포터와 협의 후 확정해요."
            />
        </>
    );
}

function formatDeadlineLabel(deadline?: string) {
    if (!deadline) return '마감일 미정';

    return `마감 ${deadline}`;
}

function toSupporterApplication(
    application: FeedApplication,
    item: FeedItem,
): SupporterApplication {
    const nickname =
        application.applicantProfile?.nickname ??
        application.nickname ??
        application.userId;

    return {
        id: application.userId,
        nickname,
        avatarUrl:
            application.applicantProfile?.avatarUrl ??
            application.avatarUrl ??
            undefined,
        category: item.category ?? '기타',
        tagline: application.proposal,
        tags: [application.appliedRole],
        completedCount: 0,
        rating: 0,
        location: item.location,
        proposal: application.proposal,
        competitionScore: application.status === 'ACCEPTED' ? 100 : 50,
        status:
            application.status === 'ACCEPTED'
                ? 'LEADING'
                : application.status === 'REJECTED'
                  ? 'WAITING'
                  : 'REVIEWING',
        relatedRequestId: item.id,
    };
}

function buildFeedManagement(
    item: FeedItem,
    applications: FeedApplication[] | null,
): FeedManagementFlow | undefined {
    if (!applications) return undefined;

    const confirmedPartnerProfiles = item.confirmedPartnerProfiles ?? [];
    const requiredPartners = item.maxParticipants ?? applications.length;
    const confirmedPartners =
        item.partnerCount ?? confirmedPartnerProfiles.length;

    return {
        feedId: item.id,
        stageLabel: item.status === 'OPEN' ? '지원 검토 중' : item.status,
        demand: {
            fundingGoal: item.price,
            fundedAmount: Math.round(
                item.price * ((item.progressPercent ?? 0) / 100),
            ),
            requiredPartners,
            confirmedPartners,
            confirmedPartnerProfiles,
            deadlineLabel: formatDeadlineLabel(item.deadline),
            hostNote: item.description ?? '',
        },
        applications: applications.map((application) =>
            toSupporterApplication(application, item),
        ),
        insights: [],
    };
}

export default async function FeedDetailPage({ params }: Props) {
    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('spot-auth-token')?.value;
    const item = await getServerFeedDetail(id, { accessToken });

    if (!item) {
        notFound();
    }

    const applications = await getServerFeedApplications(id, { accessToken });
    const management = buildFeedManagement(item, applications);
    const canEditPlanPreparation =
        item.owner === true ||
        (item.myApplicationRole === 'SUPPORTER' &&
            (item.myApplicationStatus === 'APPLIED' ||
                item.myApplicationStatus === 'PENDING' ||
                item.myApplicationStatus === 'ACCEPTED'));
    const isOffer = item.type === 'OFFER' || item.type === 'RENT';
    const isRequest = item.type === 'REQUEST';

    return (
        <>
            <DetailHeader showShare />
            <DetailPageShell
                as="main"
                className="bg-white"
                bottomInset="sticky"
            >
                {/* 히어로 이미지 */}
                <div className="relative h-72 border-b border-gray-200 bg-gray-100 sm:h-104">
                    {item.imageUrl ? (
                        <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="100vw"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-300">
                            <IconPhoto size={40} stroke={1} />
                            <span className="text-sm">관련 사진</span>
                        </div>
                    )}
                </div>

                {/* 작성자 */}
                <AuthorSection item={item} />

                {/* 타입별 본문 */}
                {isOffer && <OfferDetailContent item={item} />}
                {isRequest && (
                    <RequestDetailContent item={item} management={management} />
                )}

                {/* 매칭된 서포터/작성자가 plan/preparation 을 추가/수정.
                    AI 피드는 실제 호스트가 없으므로 수정 진입점 숨김. */}
                {!item.isAi && canEditPlanPreparation ? (
                    <EditPlanPreparationCard
                        feedId={item.id}
                        initialPlan={item.plan}
                        initialPreparation={item.preparation}
                    />
                ) : null}

                <FeedParticipationActions item={item} management={management} />
            </DetailPageShell>
        </>
    );
}
