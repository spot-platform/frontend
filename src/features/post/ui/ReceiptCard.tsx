import { Input } from '@frontend/design-system';
import {
    buildOfferGoalAmount,
    buildOfferParticipationRows,
    buildRequestGoalAmount,
    buildRequestParticipationRows,
    formatKrw,
    parsePartnerCount,
} from '../model/pricing-preview';
import { FormCard } from './FormCard';
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
    const offerRows =
        props.type === 'OFFER'
            ? buildOfferParticipationRows(
                  props.desiredPrice,
                  props.maxPartnerCount,
              )
            : [];
    const requestRows =
        props.type === 'REQUEST'
            ? buildRequestParticipationRows(
                  props.maxPartnerCount,
                  props.priceCapPerPerson,
              )
            : [];

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
                            <FormField label="최대 파트너 수" required>
                                <Input
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
                                />
                            </FormField>
                            <FormField label="1인당 최대 금액" required>
                                <Input
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
                                />
                            </FormField>
                        </>
                    ) : (
                        <>
                            <FormField label="희망 예산" required>
                                <Input
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
                                />
                            </FormField>
                            <FormField label="최대 파트너 수" required>
                                <Input
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
                                    ? '희망 예산을 기준으로 참여 인원별 1인당 금액이 어떻게 나뉘는지 바로 확인할 수 있어요.'
                                    : '1인당 최대 금액과 참여 인원에 따라 예상 예산 규모가 어떻게 커지는지 바로 볼 수 있어요.'}
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
                                {props.type === 'OFFER'
                                    ? '참여 인원별 1인당 금액'
                                    : '참여 인원별 예산 흐름'}
                            </p>
                            <span className="text-xs font-medium text-gray-400">
                                {props.type === 'OFFER'
                                    ? '입력과 동시에 계산'
                                    : '상한 금액 기준 자동 계산'}
                            </span>
                        </div>

                        {props.type === 'OFFER' ? (
                            offerRows.length > 0 ? (
                                <div className="mt-4 divide-y divide-gray-200/80">
                                    {offerRows.map((row) => (
                                        <PreviewRow
                                            key={row.participantCount}
                                            label={`${row.participantCount}명 참여 시`}
                                            value={`${row.remainder > 0 ? '약 ' : ''}${formatKrw(row.perPersonAmount)} / 1인`}
                                            description={
                                                row.participantCount === 1
                                                    ? '혼자 진행하면 전체 희망 예산을 그대로 부담해요.'
                                                    : row.remainder > 0
                                                      ? `${row.participantCount}명이 함께하면 1원 단위 차이는 마지막 정산에서 조정될 수 있어요.`
                                                      : `${row.participantCount}명이 함께하면 1인당 금액이 동일하게 나뉘어요.`
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyPreview message="희망 예산과 최대 파트너 수를 입력하면 참여 인원별 1인당 금액을 바로 보여드릴게요." />
                            )
                        ) : requestRows.length > 0 ? (
                            <div className="mt-4 divide-y divide-gray-200/80">
                                {requestRows.map((row) => (
                                    <PreviewRow
                                        key={row.participantCount}
                                        label={`${row.participantCount}명 참여 시`}
                                        value={formatKrw(row.currentBudget)}
                                        description={`1인당 최대 ${formatKrw(row.perPersonCap)} 기준으로 현재 맞춰본 예산이에요.`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyPreview message="최대 파트너 수와 1인당 최대 금액을 입력하면 목표 예산과 참여 인원별 누적 예산을 바로 볼 수 있어요." />
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
