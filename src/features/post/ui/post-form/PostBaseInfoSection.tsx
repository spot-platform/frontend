import type { PostSpotCategory } from '../../model/types';
import { CategoryTagSelector } from '../CategoryTagSelector';
import { FormCard } from '../FormCard';
import { PostTextInput, PostTextarea } from '../FormControls';
import { FormField } from '../FormField';
import { ImageUploadGrid } from '../ImageUploadGrid';
import type { SelectedPostLocation } from '../../model/types';
import { MapLocationPicker } from './MapLocationPicker';

type PostBaseInfoSectionProps = {
    spotName: string;
    title: string;
    content: string;
    categories: PostSpotCategory[];
    photoPreviews: string[];
    selectedLocation: SelectedPostLocation | null;
    deadline: string;
    onSpotNameChange: (value: string) => void;
    onTitleChange: (value: string) => void;
    onContentChange: (value: string) => void;
    onCategoriesChange: (value: PostSpotCategory[]) => void;
    onAddPhoto: (file: File, preview: string) => void;
    onRemovePhoto: (index: number) => void;
    onLocationChange: (value: SelectedPostLocation) => void;
    onDeadlineChange: (value: string) => void;
};

export function PostBaseInfoSection({
    spotName,
    title,
    content,
    categories,
    photoPreviews,
    selectedLocation,
    deadline,
    onSpotNameChange,
    onTitleChange,
    onContentChange,
    onCategoriesChange,
    onAddPhoto,
    onRemovePhoto,
    onLocationChange,
    onDeadlineChange,
}: PostBaseInfoSectionProps) {
    return (
        <FormCard title="기본 정보 입력" showTitle={false}>
            <FormField label="스팟 이름" required>
                <PostTextInput
                    type="text"
                    placeholder="스팟 이름을 입력해주세요"
                    value={spotName}
                    onChange={(event) => onSpotNameChange(event.target.value)}
                />
            </FormField>

            <FormField label="글 제목을 입력해주세요." required>
                <PostTextInput
                    type="text"
                    placeholder="제목을 입력해주세요"
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value)}
                />
            </FormField>

            <FormField label="내용을 입력해주세요." required>
                <PostTextarea
                    className="min-h-60"
                    rows={8}
                    placeholder="어떤 이야기를 나누고 싶으신가요?"
                    value={content}
                    onChange={(event) => onContentChange(event.target.value)}
                />
            </FormField>

            <FormField label="활동 위치" required>
                <MapLocationPicker
                    value={selectedLocation}
                    onChange={onLocationChange}
                />
            </FormField>

            <FormField label="모집 마감일" required>
                <PostTextInput
                    type="date"
                    value={deadline}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => onDeadlineChange(event.target.value)}
                />
            </FormField>

            <FormField label="스팟 카테고리">
                <CategoryTagSelector
                    selected={categories}
                    onChange={onCategoriesChange}
                />
            </FormField>

            <FormField label="사진을 추가해주세요. (선택)">
                <ImageUploadGrid
                    previews={photoPreviews}
                    maxCount={4}
                    onAdd={onAddPhoto}
                    onRemove={onRemovePhoto}
                />
            </FormField>
        </FormCard>
    );
}
