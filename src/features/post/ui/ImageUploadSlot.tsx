'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { IconPlus, IconX } from '@tabler/icons-react';

interface ImageUploadSlotProps {
    preview: string | null;
    onChange: (file: File | null, preview: string | null) => void;
    size?: 'sm' | 'md';
}

export function ImageUploadSlot({
    preview,
    onChange,
    size = 'md',
}: ImageUploadSlotProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const prevPreviewRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            if (prevPreviewRef.current) {
                URL.revokeObjectURL(prevPreviewRef.current);
            }
        };
    }, []);

    const handleFile = (file: File) => {
        if (prevPreviewRef.current) {
            URL.revokeObjectURL(prevPreviewRef.current);
        }
        const url = URL.createObjectURL(file);
        prevPreviewRef.current = url;
        onChange(file, url);
    };

    const handleRemove = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
            prevPreviewRef.current = null;
        }
        onChange(null, null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const sizeClass = size === 'sm' ? 'h-20 w-20' : 'h-28 w-28';

    return (
        <div className="relative">
            <div
                className={`${sizeClass} relative rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden`}
            >
                {preview ? (
                    <Image
                        src={preview}
                        alt="업로드 이미지"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-300"
                    >
                        <IconPlus size={20} stroke={1.5} />
                        <span className="text-[10px]">사진 추가</span>
                    </button>
                )}
            </div>
            {preview && (
                <button
                    type="button"
                    onClick={handleRemove}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white"
                    aria-label="삭제"
                >
                    <IconX size={11} stroke={2.5} />
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />
        </div>
    );
}
