import { Textarea } from '@frontend/design-system';
import { FormCard } from '../FormCard';
import { FormField } from '../FormField';
import { ImageUploadSlot } from '../ImageUploadSlot';

type OfferDetailsSectionProps = {
    detailDescription: string;
    supporterPhotoPreview: string | null;
    qualifications: string;
    autoClose: boolean;
    onDetailDescriptionChange: (value: string) => void;
    onSupporterPhotoChange: (preview: string | null) => void;
    onQualificationsChange: (value: string) => void;
    onAutoCloseChange: (value: boolean) => void;
};

export function OfferDetailsSection({
    detailDescription,
    supporterPhotoPreview,
    qualifications,
    autoClose,
    onDetailDescriptionChange,
    onSupporterPhotoChange,
    onQualificationsChange,
    onAutoCloseChange,
}: OfferDetailsSectionProps) {
    return (
        <FormCard title="Offer 상세 정보">
            <FormField label="스팟 상세 설명" required>
                <Textarea
                    className="resize-none"
                    rows={5}
                    placeholder={`어떤 활동인지 구체적으로 설명해주세요.\n예) "핸드드립, 에스프레소, 라떼아트 순서로 진행. 원두 샘플 증정."`}
                    value={detailDescription}
                    onChange={(event) =>
                        onDetailDescriptionChange(event.target.value)
                    }
                />
            </FormField>

            <FormField label="원하는 서포터 자격/조건">
                <Textarea
                    className="resize-none"
                    rows={3}
                    placeholder={`이런 서포터를 찾고 있어요.\n예) "커피 관련 경험이 있거나 관심 있는 분 환영해요."`}
                    value={qualifications}
                    onChange={(event) =>
                        onQualificationsChange(event.target.value)
                    }
                />
            </FormField>

            <FormField label="서포터 프로필 사진">
                <ImageUploadSlot
                    preview={supporterPhotoPreview}
                    onChange={(_, preview) => onSupporterPhotoChange(preview)}
                    size="md"
                />
            </FormField>

            <FormField label="정원 마감 시 자동 종료">
                <label className="flex cursor-pointer items-center gap-3">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={autoClose}
                        onClick={() => onAutoCloseChange(!autoClose)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                            autoClose ? 'bg-brand-800' : 'bg-gray-200'
                        }`}
                    >
                        <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                autoClose ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                        />
                    </button>
                    <span className="text-sm text-gray-700">
                        {autoClose
                            ? '최대 파트너 수 도달 시 자동으로 모집을 마감해요.'
                            : '수동으로 마감을 관리해요.'}
                    </span>
                </label>
            </FormField>
        </FormCard>
    );
}
