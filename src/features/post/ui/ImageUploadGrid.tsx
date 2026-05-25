'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { IconX } from '@tabler/icons-react';

interface ImageUploadGridProps {
    previews: string[];
    maxCount?: number;
    onAdd: (file: File, preview: string) => void;
    onRemove: (index: number) => void;
}

export function ImageUploadGrid({
    previews,
    maxCount = 4,
    onAdd,
    onRemove,
}: ImageUploadGridProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const objectUrlsRef = useRef<string[]>([]);

    useEffect(() => {
        const objectUrls = objectUrlsRef.current;

        return () => {
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const handleFile = (file: File) => {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.push(url);
        onAdd(file, url);
    };

    const handleRemove = (index: number) => {
        const url = objectUrlsRef.current[index];
        if (url) URL.revokeObjectURL(url);
        objectUrlsRef.current.splice(index, 1);
        onRemove(index);
    };

    const canAdd = previews.length < maxCount;

    return (
        <div className="grid grid-cols-4 gap-2">
            {previews.map((preview, i) => (
                <div key={i} className="relative aspect-square">
                    <div className="relative h-full w-full overflow-hidden rounded-xl border border-gray-200">
                        <Image
                            src={preview}
                            alt={`사진 ${i + 1}`}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => handleRemove(i)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white"
                        aria-label={`사진 ${i + 1} 삭제`}
                    >
                        <IconX size={11} stroke={2.5} />
                    </button>
                </div>
            ))}

            {canAdd && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="aspect-square rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                    사진 추가
                </button>
            )}

            {Array.from({
                length: Math.max(
                    0,
                    maxCount - previews.length - (canAdd ? 1 : 0),
                ),
            }).map((_, i) => (
                <div
                    key={`empty-${i}`}
                    className="aspect-square rounded-xl bg-gray-50"
                />
            ))}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    if (e.target) e.target.value = '';
                }}
            />
        </div>
    );
}
