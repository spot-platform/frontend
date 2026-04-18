import { IconPaperclip } from '@tabler/icons-react';
import { SectionCard } from '../SectionCard';
import type { SharedFile } from '@/entities/spot/types';

interface FileShareSectionProps {
    files: SharedFile[];
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function FileShareSection({ files }: FileShareSectionProps) {
    const preview = files.slice(-2);

    return (
        <SectionCard
            title="파일 공유"
            manageModal="files"
            manageLabel="파일 관리"
        >
            {files.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    공유된 파일이 없어요
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <IconPaperclip
                            size={12}
                            className="text-muted-foreground"
                        />
                        <span className="text-xs text-muted-foreground">
                            {files.length}개 파일
                        </span>
                    </div>
                    {preview.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
                        >
                            <span className="truncate text-xs text-text-secondary">
                                {file.name}
                            </span>
                            <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">
                                {formatBytes(file.sizeBytes)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
}
