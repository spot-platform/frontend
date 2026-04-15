import { Input, Textarea } from '@frontend/design-system';
import type { PostSpotCategory } from '../../model/types';
import { CategoryTagSelector } from '../CategoryTagSelector';
import { FormCard } from '../FormCard';
import { FormField } from '../FormField';
import { ImageUploadGrid } from '../ImageUploadGrid';

type PostBaseInfoSectionProps = {
    spotName: string;
    title: string;
    content: string;
    categories: PostSpotCategory[];
    photoPreviews: string[];
    location: string;
    deadline: string;
    onSpotNameChange: (value: string) => void;
    onTitleChange: (value: string) => void;
    onContentChange: (value: string) => void;
    onCategoriesChange: (value: PostSpotCategory[]) => void;
    onAddPhoto: (file: File, preview: string) => void;
    onRemovePhoto: (index: number) => void;
    onLocationChange: (value: string) => void;
    onDeadlineChange: (value: string) => void;
};

export function PostBaseInfoSection({
    spotName,
    title,
    content,
    categories,
    photoPreviews,
    location,
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
        <FormCard title="기본 정보 입력">
            <FormField label="스팟 이름" required>
                <Input
                    type="text"
                    placeholder="예) '홈카페 클래스' / '다이슨 공기청정기 공동구매'"
                    value={spotName}
                    onChange={(event) => onSpotNameChange(event.target.value)}
                />
            </FormField>

            <FormField label="게시글 제목" required>
                <Input
                    type="text"
                    placeholder="파트너들이 한눈에 이해할 수 있는 제목을 작성해주세요."
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value)}
                />
            </FormField>

            <FormField label="게시글 내용">
                <Textarea
                    className="resize-none"
                    rows={3}
                    placeholder="활동 내용이나 파트너에게 전하고 싶은 내용을 작성해주세요."
                    value={content}
                    onChange={(event) => onContentChange(event.target.value)}
                />
            </FormField>

            <FormField label="활동 위치" required>
                <Input
                    type="text"
                    placeholder="예) 마포구 합정동 / 온라인"
                    value={location}
                    onChange={(event) => onLocationChange(event.target.value)}
                />
            </FormField>

            <FormField label="모집 마감일" required>
                <Input
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

            <FormField label="스팟 사진 (최대 4장)">
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
