'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePostBaseForm } from '../model/use-post-base-form';
import { usePostFormPrefill } from '../model/use-post-form-prefill';
import { readSimulationConversionContext } from '@/features/simulation/model/simulation-conversion-context';
import { SimulationInsightCard } from '@/features/simulation/ui/SimulationInsightCard';
import type { SimulationConversionContext } from '@/features/simulation/model/simulation-conversion-context';
import { useMySpotsStore } from '@/features/spot/model/my-spots-store';
import { OfferDetailsSection } from '../ui/post-form/OfferDetailsSection';
import { PlanInputSection } from '../ui/post-form/PlanInputSection';
import { PostBaseInfoSection } from '../ui/post-form/PostBaseInfoSection';
import { PostSubmitBar } from '../ui/post-form/PostSubmitBar';
import { PreparationInputSection } from '../ui/post-form/PreparationInputSection';
import { PriceInputSection } from '../ui/post-form/PriceInputSection';
import { PostStepIndicator } from '../ui/PostStepIndicator';
import { ReceiptCard } from '../ui/ReceiptCard';
import { DetailPageShell } from '@/shared/ui';
import type {
    PlanV3,
    Preparation,
    PriceBreakdown,
} from '@/entities/spot/simulation-types';

const POINT_COST = 25000;
const STEPS = ['기본 정보', 'Offer 상세', '플랜·준비물', '가격 설정'];

export function OfferFormClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(0);
    const [simContext, setSimContext] =
        useState<SimulationConversionContext | null>(null);
    useEffect(() => {
        setSimContext(
            readSimulationConversionContext(searchParams.get('fromSpot')),
        );
    }, [searchParams]);

    const {
        spotName,
        title,
        content,
        categories,
        photoPreviews,
        location,
        deadline,
        setSpotName,
        setTitle,
        setContent,
        setCategories,
        setLocation,
        setDeadline,
        handleAddPhoto,
        handleRemovePhoto,
        clearDraft,
    } = usePostBaseForm(usePostFormPrefill());

    const [detailDescription, setDetailDescription] = useState('');
    const [supporterPhotoPreview, setSupporterPhotoPreview] = useState<
        string | null
    >(null);
    const [qualifications, setQualifications] = useState('');
    const [autoClose, setAutoClose] = useState(false);
    const [desiredPrice, setDesiredPrice] = useState('');
    const [maxPartnerCount, setMaxPartnerCount] = useState('');
    const [plan, setPlan] = useState<PlanV3 | undefined>(undefined);
    const [preparation, setPreparation] = useState<Preparation | undefined>(
        undefined,
    );
    const [priceBreakdown, setPriceBreakdown] = useState<
        PriceBreakdown | undefined
    >(undefined);

    const isStep0Valid =
        spotName.trim() !== '' &&
        title.trim() !== '' &&
        location.trim() !== '' &&
        deadline !== '';
    const isStep1Valid = detailDescription.trim() !== '';
    const isStep2Valid =
        plan !== undefined &&
        plan.steps.length > 0 &&
        plan.steps.every(
            (s) => s.time.trim() !== '' && s.activity.trim() !== '',
        ) &&
        preparation !== undefined &&
        (preparation.host_provides.length > 0 ||
            preparation.partner_brings.length > 0);
    const isStep3Valid =
        desiredPrice !== '' &&
        maxPartnerCount !== '' &&
        priceBreakdown !== undefined &&
        priceBreakdown.base_fee > 0;

    const canNext =
        step === 0
            ? isStep0Valid
            : step === 1
              ? isStep1Valid
              : step === 2
                ? isStep2Valid
                : isStep3Valid;

    const addMySpot = useMySpotsStore((s) => s.addSpot);

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // 시뮬 context 가 있으면 그 좌표/카테고리를 우선 사용, 없으면 기본 수원 중심.
            const fallbackLocation = {
                lat: 37.2636,
                lng: 127.0286,
            };
            const created = addMySpot({
                title: title || spotName,
                category: simContext?.category ?? '운동',
                intent: 'offer',
                location: simContext?.spotLocation ?? fallbackLocation,
                participants: [
                    { id: 'me', emoji: '👤', name: '나' },
                    { id: 'demo-a', emoji: '🧘', name: '민지' },
                    { id: 'demo-b', emoji: '💻', name: '지훈' },
                ],
            });
            clearDraft();
            // 완료 페이지는 생성된 spot id 를 URL 에 실어, 완료 후 맵에서 강조 표시.
            router.push(`/post/complete?mySpot=${created.id}`);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep((s) => s - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            router.back();
        }
    };

    return (
        <DetailPageShell
            px="md"
            gap="md"
            topInset="md"
            bottomInset="submit-bar"
        >
            <PostStepIndicator steps={STEPS} currentStep={step} />

            <div className="flex flex-col gap-4">
                {simContext && (
                    <SimulationInsightCard
                        context={simContext}
                        onApplyPriceAction={(priceKrw) =>
                            setDesiredPrice(String(priceKrw))
                        }
                        onApplyParticipantsAction={(count) =>
                            setMaxPartnerCount(String(count))
                        }
                        onApplyDeadlineAction={(isoDate) =>
                            setDeadline(isoDate)
                        }
                    />
                )}
                <p className="text-sm text-gray-500">
                    함께할 파트너들이 한눈에 이해할 수 있게 작성해주세요.
                </p>

                {step === 0 && (
                    <PostBaseInfoSection
                        spotName={spotName}
                        title={title}
                        content={content}
                        categories={categories}
                        photoPreviews={photoPreviews}
                        location={location}
                        deadline={deadline}
                        onSpotNameChange={setSpotName}
                        onTitleChange={setTitle}
                        onContentChange={setContent}
                        onCategoriesChange={setCategories}
                        onAddPhoto={handleAddPhoto}
                        onRemovePhoto={handleRemovePhoto}
                        onLocationChange={setLocation}
                        onDeadlineChange={setDeadline}
                    />
                )}

                {step === 1 && (
                    <OfferDetailsSection
                        detailDescription={detailDescription}
                        supporterPhotoPreview={supporterPhotoPreview}
                        qualifications={qualifications}
                        autoClose={autoClose}
                        onDetailDescriptionChange={setDetailDescription}
                        onSupporterPhotoChange={setSupporterPhotoPreview}
                        onQualificationsChange={setQualifications}
                        onAutoCloseChange={setAutoClose}
                    />
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <PlanInputSection value={plan} onChange={setPlan} />
                        <PreparationInputSection
                            value={preparation}
                            onChange={setPreparation}
                        />
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-6">
                        <ReceiptCard
                            type="OFFER"
                            spotName={spotName}
                            pointCost={POINT_COST}
                            desiredPrice={desiredPrice}
                            maxPartnerCount={maxPartnerCount}
                            onDesiredPriceChange={setDesiredPrice}
                            onMaxPartnerCountChange={setMaxPartnerCount}
                        />
                        <PriceInputSection
                            value={priceBreakdown}
                            onChange={setPriceBreakdown}
                        />
                    </div>
                )}
            </div>

            <PostSubmitBar
                label={step < STEPS.length - 1 ? '다음' : '결제하기'}
                onClick={handleNext}
                onBack={handleBack}
                disabled={!canNext}
                showBack
            />
        </DetailPageShell>
    );
}
