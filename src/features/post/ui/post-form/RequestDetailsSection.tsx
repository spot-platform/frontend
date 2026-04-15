import { Textarea } from '@frontend/design-system';
import { FormCard } from '../FormCard';
import { FormField } from '../FormField';
import { ImageUploadSlot } from '../ImageUploadSlot';

type RequestDetailsSectionProps = {
    detailDescription: string;
    stylePhotoPreview: string | null;
    preferredSchedule: string;
    onDetailDescriptionChange: (value: string) => void;
    onStylePhotoChange: (preview: string | null) => void;
    onPreferredScheduleChange: (value: string) => void;
};

export function RequestDetailsSection({
    detailDescription,
    stylePhotoPreview,
    preferredSchedule,
    onDetailDescriptionChange,
    onStylePhotoChange,
    onPreferredScheduleChange,
}: RequestDetailsSectionProps) {
    return (
        <FormCard title="Request 상세 정보">
            <FormField label="스팟 상세 설명" required>
                <Textarea
                    className="resize-none"
                    rows={5}
                    placeholder={`어떤 서포터를 찾고 있는지 구체적으로 설명해주세요.\n예) "홈카페 분위기 연출을 도와줄 바리스타 경력자를 찾고 있어요."`}
                    value={detailDescription}
                    onChange={(event) =>
                        onDetailDescriptionChange(event.target.value)
                    }
                />
            </FormField>

            <FormField label="선호 일정">
                <Textarea
                    className="resize-none"
                    rows={2}
                    placeholder={`언제 활동하고 싶으신가요?\n예) "주말 오전 가능해요." / "평일 저녁 선호해요."`}
                    value={preferredSchedule}
                    onChange={(event) =>
                        onPreferredScheduleChange(event.target.value)
                    }
                />
            </FormField>

            <FormField label="원하는 서비스 스타일">
                <ImageUploadSlot
                    preview={stylePhotoPreview}
                    onChange={(_, preview) => onStylePhotoChange(preview)}
                    size="md"
                />
            </FormField>
        </FormCard>
    );
}
