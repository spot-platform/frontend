'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePostBaseForm } from '../model/use-post-base-form';
import { usePostFormPrefill } from '../model/use-post-form-prefill';
import { readSimulationConversionContext } from '@/features/simulation/model/simulation-conversion-context';
import { SimulationInsightCard } from '@/features/simulation/ui/SimulationInsightCard';
import type { SimulationConversionContext } from '@/features/simulation/model/simulation-conversion-context';
import { useMySpotsStore } from '@/features/spot/model/my-spots-store';
import { PlanInputSection } from '../ui/post-form/PlanInputSection';
import { PostBaseInfoSection } from '../ui/post-form/PostBaseInfoSection';
import { PostSubmitBar } from '../ui/post-form/PostSubmitBar';
import { PreparationInputSection } from '../ui/post-form/PreparationInputSection';
import { PriceInputSection } from '../ui/post-form/PriceInputSection';
import { PostStepIndicator } from '../ui/PostStepIndicator';
import { ReceiptCard } from '../ui/ReceiptCard';
import { RequestDetailsSection } from '../ui/post-form/RequestDetailsSection';
import { DetailPageShell } from '@/shared/ui';
import type {
    PlanV3,
    Preparation,
    PriceBreakdown,
} from '@/entities/spot/simulation-types';

const POINT_COST = 15000;
const STEPS = ['기본 정보', 'Request 상세', '플랜·준비물 (선택)', '가격 설정'];

export function RequestFormClient() {
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
    const [stylePhotoPreview, setStylePhotoPreview] = useState<string | null>(
        null,
    );
    const [preferredSchedule, setPreferredSchedule] = useState('');
    const [maxPartnerCount, setMaxPartnerCount] = useState('');
    const [priceCapPerPerson, setPriceCapPerPerson] = useState('');
    // 2026-04-30 contextBuilder 통합: REQUEST 는 모두 선택. 비우면 매칭된 서포터가 채울 수 있음.
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
    // step 2 (플랜·준비물) 는 선택. 항상 다음 진행 가능.
    const isStep2Valid = true;
    const isStep3Valid = maxPartnerCount !== '' && priceCapPerPerson !== '';

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
            const fallbackLocation = {
                lat: 37.2636,
                lng: 127.0286,
            };
            const created = addMySpot({
                title: title || spotName,
                category: simContext?.category ?? '운동',
                intent: 'request',
                location: simContext?.spotLocation ?? fallbackLocation,
                participants: [
                    { id: 'me', emoji: '👤', name: '나' },
                    { id: 'demo-a', emoji: '🎨', name: '서연' },
                ],
            });
            clearDraft();
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
                            setPriceCapPerPerson(String(priceKrw))
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
                    <RequestDetailsSection
                        detailDescription={detailDescription}
                        stylePhotoPreview={stylePhotoPreview}
                        preferredSchedule={preferredSchedule}
                        onDetailDescriptionChange={setDetailDescription}
                        onStylePhotoChange={setStylePhotoPreview}
                        onPreferredScheduleChange={setPreferredSchedule}
                    />
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <p className="text-xs text-gray-500">
                            플랜과 준비물은 선택 입력이에요. 비워두면 매칭된
                            서포터가 함께 채울 수 있어요.
                        </p>
                        <PlanInputSection
                            value={plan}
                            onChange={setPlan}
                            optional
                        />
                        <PreparationInputSection
                            value={preparation}
                            onChange={setPreparation}
                            optional
                        />
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-6">
                        <ReceiptCard
                            type="REQUEST"
                            spotName={spotName}
                            pointCost={POINT_COST}
                            maxPartnerCount={maxPartnerCount}
                            priceCapPerPerson={priceCapPerPerson}
                            onMaxPartnerCountChange={setMaxPartnerCount}
                            onPriceCapPerPersonChange={setPriceCapPerPerson}
                        />
                        <PriceInputSection
                            value={priceBreakdown}
                            onChange={setPriceBreakdown}
                            optional
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
