'use client';

import { Button, IconButton } from '@frontend/design-system';
import { useRef } from 'react';
import { Upload, Trash2, Download } from 'lucide-react';
import { BottomSheet } from '@/shared/ui';
import { useSpotFiles, useDeleteFile } from '../../../model/use-files';

interface FileShareModalProps {
    open: boolean;
    onClose: () => void;
    spotId: string;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function FileShareModal({ open, onClose, spotId }: FileShareModalProps) {
    const { data } = useSpotFiles(spotId);
    const { mutate: deleteFile } = useDeleteFile(spotId);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const files = data?.data ?? [];

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title="파일 공유"
            snapPoint="full"
        >
            <div className="flex flex-col gap-4">
                {/* 업로드 버튼 */}
                <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<Upload size={18} />}
                    className="border-2 border-dashed text-gray-500"
                >
                    파일 업로드
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                />

                {/* 파일 목록 */}
                {files.length === 0 ? (
                    <p className="text-center text-sm text-gray-400">
                        공유된 파일이 없어요
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-800">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {file.uploaderNickname} ·{' '}
                                        {formatBytes(file.sizeBytes)}
                                    </p>
                                </div>
                                <a
                                    href={file.url}
                                    download
                                    className="shrink-0 text-gray-400 active:text-brand-800"
                                >
                                    <Download size={16} />
                                </a>
                                <IconButton
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteFile(file.id)}
                                    label="파일 삭제"
                                    className="shrink-0 text-gray-300 hover:bg-red-50 hover:text-red-400"
                                    icon={<Trash2 size={16} />}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </BottomSheet>
    );
}
