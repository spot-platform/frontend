'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Plus, X } from 'lucide-react';

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
                        <X size={11} strokeWidth={2.5} />
                    </button>
                </div>
            ))}

            {canAdd && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 text-gray-300"
                >
                    <Plus size={20} strokeWidth={1.5} />
                    <span className="text-[10px]">추가</span>
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
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-100 bg-gray-50"
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
