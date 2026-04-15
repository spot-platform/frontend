'use client';

import { Button, Textarea } from '@frontend/design-system';
import { useState } from 'react';
import { BottomSheet } from '@/shared/ui';
import { useSpotNotes, useCreateNote } from '../../../model/use-notes';

interface ProgressNoteModalProps {
    open: boolean;
    onClose: () => void;
    spotId: string;
}

export function ProgressNoteModal({
    open,
    onClose,
    spotId,
}: ProgressNoteModalProps) {
    const { data } = useSpotNotes(spotId);
    const { mutate: createNote, isPending } = useCreateNote(spotId);
    const [content, setContent] = useState('');
    const notes = [...(data?.data ?? [])].reverse();

    function handleSubmit() {
        if (!content.trim()) return;
        createNote(content.trim(), {
            onSuccess: () => setContent(''),
        });
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title="진행 노트"
            snapPoint="full"
        >
            <div className="flex flex-col gap-4">
                {/* 입력창 */}
                <div>
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="활동 진행 상황을 기록해보세요..."
                        rows={3}
                        className="resize-none"
                    />
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !content.trim()}
                        fullWidth
                        className="mt-2"
                    >
                        노트 추가
                    </Button>
                </div>

                {/* 노트 목록 */}
                {notes.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className="rounded-xl bg-gray-50 px-4 py-3"
                            >
                                <p className="text-xs font-semibold text-gray-500">
                                    {note.authorNickname}
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                                    {note.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </BottomSheet>
    );
}
