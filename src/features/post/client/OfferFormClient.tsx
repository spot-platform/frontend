'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePostBaseForm } from '../model/use-post-base-form';
import { usePostFormPrefill } from '../model/use-post-form-prefill';
import { readSimulationConversionContext } from '@/features/simulation/model/simulation-conversion-context';
import { SimulationInsightCard } from '@/features/simulation/ui/SimulationInsightCard';
import type { SimulationConversionContext } from '@/features/simulation/model/simulation-conversion-context';
import { OfferDetailsSection } from '../ui/post-form/OfferDetailsSection';
import { PostBaseInfoSection } from '../ui/post-form/PostBaseInfoSection';
import { PostSubmitBar } from '../ui/post-form/PostSubmitBar';
import { PostStepIndicator } from '../ui/PostStepIndicator';
import { ReceiptCard } from '../ui/ReceiptCard';
import { DetailPageShell } from '@/shared/ui';

const POINT_COST = 25000;
const STEPS = ['기본 정보', 'Offer 상세', '가격 설정'];

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

    const isStep0Valid =
        spotName.trim() !== '' &&
        title.trim() !== '' &&
        location.trim() !== '' &&
        deadline !== '';
    const isStep1Valid = detailDescription.trim() !== '';
    const isStep2Valid = desiredPrice !== '' && maxPartnerCount !== '';

    const canNext =
        step === 0 ? isStep0Valid : step === 1 ? isStep1Valid : isStep2Valid;

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            clearDraft();
            router.push('/post/complete');
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
                    <ReceiptCard
                        type="OFFER"
                        spotName={spotName}
                        pointCost={POINT_COST}
                        desiredPrice={desiredPrice}
                        maxPartnerCount={maxPartnerCount}
                        onDesiredPriceChange={setDesiredPrice}
                        onMaxPartnerCountChange={setMaxPartnerCount}
                    />
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
