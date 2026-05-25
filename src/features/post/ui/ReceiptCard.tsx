import {
    buildOfferGoalAmount,
    buildRequestGoalAmount,
    formatKrw,
    parseBudgetAmount,
    parsePartnerCount,
} from '../model/pricing-preview';
import { FormCard } from './FormCard';
import { PostTextInput } from './FormControls';
import { FormField } from './FormField';

type BaseReceiptCardProps = {
    spotName: string;
    pointCost: number;
};

type RequestReceiptCardProps = BaseReceiptCardProps & {
    type: 'REQUEST';
    maxPartnerCount: string;
    priceCapPerPerson: string;
    onMaxPartnerCountChange: (value: string) => void;
    onPriceCapPerPersonChange: (value: string) => void;
};

type OfferReceiptCardProps = BaseReceiptCardProps & {
    type: 'OFFER';
    desiredPrice: string;
    maxPartnerCount: string;
    onDesiredPriceChange: (value: string) => void;
    onMaxPartnerCountChange: (value: string) => void;
};

type ReceiptCardProps = RequestReceiptCardProps | OfferReceiptCardProps;

const WORKFLOW_COPY = {
    OFFER: [
        {
            title: '작성',
            description:
                '희망 예산과 최대 파트너 수를 정하면 참여 인원별 1인당 금액을 바로 맞춰볼 수 있어요.',
        },
        {
            title: '스팟 확정',
            description:
                '참여자가 모이면 확정된 인원 기준으로 각자 부담할 금액이 정리돼요.',
        },
        {
            title: '정산',
            description:
                '활동이 끝나면 확정 인원수 기준으로 같은 금액 흐름대로 정산돼요.',
        },
    ],
    REQUEST: [
        {
            title: '작성',
            description:
                '최대 파트너 수와 1인당 최대 금액을 정하면 목표 예산이 자동으로 계산돼요.',
        },
        {
            title: '스팟 확정',
            description:
                '예상 참여 인원을 기준으로 현재 맞춰볼 수 있는 예산 규모를 미리 확인할 수 있어요.',
        },
        {
            title: '정산',
            description:
                '최종 참여 인원과 합의된 범위 안에서 예산을 기준으로 정산이 진행돼요.',
        },
    ],
} as const;

export function ReceiptCard(props: ReceiptCardProps) {
    const { spotName, pointCost } = props;
    const previewTitle =
        spotName.trim() === ''
            ? '스팟 예산 미리보기'
            : `${spotName} 예산 미리보기`;

    const maxPartnerCount = parsePartnerCount(props.maxPartnerCount);
    const offerGoalAmount =
        props.type === 'OFFER'
            ? buildOfferGoalAmount(props.desiredPrice)
            : null;
    const requestGoalAmount =
        props.type === 'REQUEST'
            ? buildRequestGoalAmount(
                  props.maxPartnerCount,
                  props.priceCapPerPerson,
              )
            : null;
    const offerPerPersonPreview =
        props.type === 'OFFER' &&
        offerGoalAmount !== null &&
        maxPartnerCount !== null
            ? {
                  amount: Math.floor(offerGoalAmount / maxPartnerCount),
                  remainder: offerGoalAmount % maxPartnerCount,
              }
            : null;
    const requestPerPersonPreview =
        props.type === 'REQUEST'
            ? parseBudgetAmount(props.priceCapPerPerson)
            : null;

    return (
        <FormCard title="가격 흐름 / 정산 미리보기">
            <div className="flex flex-col gap-4">
                <div className="rounded-2xl bg-brand-800/5 px-4 py-4">
                    <p className="text-xs font-semibold text-brand-800">
                        {props.type === 'OFFER'
                            ? 'OFFER 진행 흐름'
                            : 'REQUEST 진행 흐름'}
                    </p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-3 sm:divide-x sm:divide-brand-800/10">
                        {WORKFLOW_COPY[props.type].map((step, index) => (
                            <div
                                key={step.title}
                                className="flex flex-col gap-1 sm:px-4 first:sm:pl-0 last:sm:pr-0"
                            >
                                <p className="text-xs font-semibold text-brand-800">
                                    {index + 1}. {step.title}
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {props.type === 'REQUEST' ? (
                        <>
                            <FormField
                                label="최대 파트너 수"
                                labelSize="compact"
                                required
                            >
                                <PostTextInput
                                    type="number"
                                    min={1}
                                    step={1}
                                    placeholder="예) 3"
                                    value={props.maxPartnerCount}
                                    onChange={(event) =>
                                        props.onMaxPartnerCountChange(
                                            event.target.value,
                                        )
                                    }
                                    variant="box"
                                />
                            </FormField>
                            <FormField
                                label="1인당 최대 금액"
                                labelSize="compact"
                                required
                            >
                                <PostTextInput
                                    type="number"
                                    min={0}
                                    step={1000}
                                    placeholder="예) 30000"
                                    value={props.priceCapPerPerson}
                                    onChange={(event) =>
                                        props.onPriceCapPerPersonChange(
                                            event.target.value,
                                        )
                                    }
                                    variant="box"
                                />
                            </FormField>
                        </>
                    ) : (
                        <>
                            <FormField
                                label="희망 예산"
                                labelSize="compact"
                                required
                            >
                                <PostTextInput
                                    type="number"
                                    min={0}
                                    step={1000}
                                    placeholder="예) 50000"
                                    value={props.desiredPrice}
                                    onChange={(event) =>
                                        props.onDesiredPriceChange(
                                            event.target.value,
                                        )
                                    }
                                    variant="box"
                                />
                            </FormField>
                            <FormField
                                label="최대 파트너 수"
                                labelSize="compact"
                                required
                            >
                                <PostTextInput
                                    type="number"
                                    min={1}
                                    step={1}
                                    placeholder="예) 3"
                                    value={props.maxPartnerCount}
                                    onChange={(event) =>
                                        props.onMaxPartnerCountChange(
                                            event.target.value,
                                        )
                                    }
                                    variant="box"
                                />
                            </FormField>
                        </>
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl bg-gray-50/80">
                    <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-500">
                                라이브 미리보기
                            </p>
                            <p className="mt-1 text-base font-bold text-gray-900">
                                {previewTitle}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-gray-500">
                                {props.type === 'OFFER'
                                    ? '희망 예산과 최대 파트너 수를 기준으로 1인당 예상 금액만 가볍게 확인할 수 있어요.'
                                    : '최대 파트너 수와 1인당 상한을 기준으로 목표 예산과 1인당 금액만 보여줘요.'}
                            </p>
                        </div>
                        <div className="shrink-0 rounded-xl bg-white px-4 py-3 sm:min-w-44">
                            <p className="text-xs font-semibold text-gray-500">
                                등록 시 결제 예정
                            </p>
                            <p className="mt-1 text-lg font-bold tracking-tight text-gray-900">
                                {formatKrw(pointCost)}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200/80 px-4 py-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <SummaryBlock
                                label={
                                    props.type === 'OFFER'
                                        ? '희망 예산'
                                        : '목표 예산'
                                }
                                value={
                                    props.type === 'OFFER'
                                        ? offerGoalAmount === null
                                            ? '입력 후 계산돼요'
                                            : formatKrw(offerGoalAmount)
                                        : requestGoalAmount === null
                                          ? '입력 후 계산돼요'
                                          : formatKrw(requestGoalAmount)
                                }
                                description={
                                    props.type === 'OFFER'
                                        ? '작성한 총 금액 그대로 모집 목표가 돼요.'
                                        : '최대 파트너 수 x 1인당 최대 금액으로 계산돼요.'
                                }
                            />
                            <SummaryBlock
                                label={
                                    props.type === 'OFFER'
                                        ? '최대 파트너 수'
                                        : '최대 파트너 수'
                                }
                                value={
                                    props.type === 'OFFER'
                                        ? maxPartnerCount === null
                                            ? '입력 후 계산돼요'
                                            : `${maxPartnerCount}명까지`
                                        : maxPartnerCount === null
                                          ? '입력 후 계산돼요'
                                          : `${maxPartnerCount}명까지`
                                }
                                description={
                                    props.type === 'OFFER'
                                        ? '참여 인원 수가 늘수록 1인당 부담 금액이 내려가요.'
                                        : '입력한 인원 수만큼 현재 맞춰본 예산 흐름을 미리 보여줘요.'
                                }
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200/80 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-900">
                                1인당 예상 금액
                            </p>
                            <span className="text-xs font-medium text-gray-400">
                                누적 목록 없이 요약
                            </span>
                        </div>

                        {props.type === 'OFFER' ? (
                            offerPerPersonPreview ? (
                                <PreviewRow
                                    label={`${maxPartnerCount}명 기준`}
                                    value={`${offerPerPersonPreview.remainder > 0 ? '약 ' : ''}${formatKrw(offerPerPersonPreview.amount)} / 1인`}
                                    description={
                                        offerPerPersonPreview.remainder > 0
                                            ? '1원 단위 차이는 마지막 정산에서 조정될 수 있어요.'
                                            : '최대 파트너 수로 나눴을 때의 1인당 예상 금액이에요.'
                                    }
                                />
                            ) : (
                                <EmptyPreview message="희망 예산과 최대 파트너 수를 입력하면 1인당 예상 금액을 바로 보여드릴게요." />
                            )
                        ) : requestPerPersonPreview !== null &&
                          maxPartnerCount !== null ? (
                            <PreviewRow
                                label={`${maxPartnerCount}명까지 모집`}
                                value={`${formatKrw(requestPerPersonPreview)} / 1인`}
                                description="목표 예산은 최대 파트너 수 x 1인당 최대 금액으로만 계산해요."
                            />
                        ) : (
                            <EmptyPreview message="최대 파트너 수와 1인당 최대 금액을 입력하면 1인당 금액을 바로 볼 수 있어요." />
                        )}
                    </div>
                </div>
            </div>
        </FormCard>
    );
}

function SummaryBlock({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="flex h-full flex-col justify-between gap-2 rounded-xl bg-white px-4 py-3.5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-500">
                        {label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        {description}
                    </p>
                </div>
                <p className="text-right text-lg font-bold tracking-tight text-gray-900">
                    {value}
                </p>
            </div>
        </div>
    );
}

function PreviewRow({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                        {label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        {description}
                    </p>
                </div>
                <p className="shrink-0 text-right text-sm font-bold text-brand-800">
                    {value}
                </p>
            </div>
        </div>
    );
}

function EmptyPreview({ message }: { message: string }) {
    return (
        <div className="mt-4 rounded-xl bg-white/70 px-4 py-5 text-sm leading-relaxed text-gray-500">
            {message}
        </div>
    );
}
