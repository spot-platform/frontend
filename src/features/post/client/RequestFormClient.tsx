'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePostBaseForm } from '../model/use-post-base-form';
import { PostBaseInfoSection } from '../ui/post-form/PostBaseInfoSection';
import { PostSubmitBar } from '../ui/post-form/PostSubmitBar';
import { PostStepIndicator } from '../ui/PostStepIndicator';
import { ReceiptCard } from '../ui/ReceiptCard';
import { RequestDetailsSection } from '../ui/post-form/RequestDetailsSection';
import { DetailPageShell } from '@/shared/ui';

const POINT_COST = 15000;
const STEPS = ['기본 정보', 'Request 상세', '가격 설정'];

export function RequestFormClient() {
    const router = useRouter();
    const [step, setStep] = useState(0);

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
    } = usePostBaseForm();

    const [detailDescription, setDetailDescription] = useState('');
    const [stylePhotoPreview, setStylePhotoPreview] = useState<string | null>(
        null,
    );
    const [preferredSchedule, setPreferredSchedule] = useState('');
    const [maxPartnerCount, setMaxPartnerCount] = useState('');
    const [priceCapPerPerson, setPriceCapPerPerson] = useState('');

    const isStep0Valid =
        spotName.trim() !== '' &&
        title.trim() !== '' &&
        location.trim() !== '' &&
        deadline !== '';
    const isStep1Valid = detailDescription.trim() !== '';
    const isStep2Valid = maxPartnerCount !== '' && priceCapPerPerson !== '';

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
                    <ReceiptCard
                        type="REQUEST"
                        spotName={spotName}
                        pointCost={POINT_COST}
                        maxPartnerCount={maxPartnerCount}
                        priceCapPerPerson={priceCapPerPerson}
                        onMaxPartnerCountChange={setMaxPartnerCount}
                        onPriceCapPerPersonChange={setPriceCapPerPerson}
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
