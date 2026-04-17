'use client';

import { Button, IconButton, Input } from '@frontend/design-system';
import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { BottomSheet } from '@/shared/ui';
import { ChecklistItem } from './ChecklistItem';
import {
    useSpotChecklist,
    useUpsertChecklist,
} from '../../../model/use-checklist';
import type { ChecklistItem as ChecklistItemType } from '@/entities/spot/types';

interface ChecklistModalProps {
    open: boolean;
    onClose: () => void;
    spotId: string;
}

export function ChecklistModal({ open, onClose, spotId }: ChecklistModalProps) {
    const { data } = useSpotChecklist(spotId);
    const { mutate: upsert, isPending } = useUpsertChecklist(spotId);
    const [items, setItems] = useState<ChecklistItemType[]>(
        data?.data?.items ?? [],
    );
    const [newText, setNewText] = useState('');

    // 원격 데이터 동기화
    const remoteItems = data?.data?.items ?? [];
    const localItems = items.length > 0 ? items : remoteItems;

    function handleToggle(id: string) {
        setItems((prev) =>
            (prev.length > 0 ? prev : remoteItems).map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item,
            ),
        );
    }

    function handleDelete(id: string) {
        setItems((prev) =>
            (prev.length > 0 ? prev : remoteItems).filter(
                (item) => item.id !== id,
            ),
        );
    }

    function handleAdd() {
        if (!newText.trim()) return;
        const newItem: ChecklistItemType = {
            id: `local-${Date.now()}`,
            text: newText.trim(),
            completed: false,
        };
        setItems((prev) => [
            ...(prev.length > 0 ? prev : remoteItems),
            newItem,
        ]);
        setNewText('');
    }

    function handleSave() {
        upsert(localItems, { onSuccess: onClose });
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title="체크리스트"
            snapPoint="full"
        >
            <div className="flex flex-col gap-4">
                {/* 아이템 목록 */}
                <div className="flex flex-col gap-3">
                    {localItems.map((item) => (
                        <ChecklistItem
                            key={item.id}
                            item={item}
                            onToggle={() => handleToggle(item.id)}
                            onDelete={() => handleDelete(item.id)}
                        />
                    ))}
                    {localItems.length === 0 && (
                        <p className="text-sm text-gray-400">
                            아직 항목이 없어요
                        </p>
                    )}
                </div>

                {/* 새 항목 추가 */}
                <div className="flex gap-2">
                    <Input
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        placeholder="새 항목 입력..."
                        className="h-10 flex-1 rounded-xl"
                    />
                    <IconButton
                        size="sm"
                        variant="primary"
                        onClick={handleAdd}
                        label="항목 추가"
                        className="h-10 w-10 rounded-xl"
                        icon={<IconPlus size={18} />}
                    />
                </div>

                <Button onClick={handleSave} disabled={isPending} fullWidth>
                    저장하기
                </Button>
            </div>
        </BottomSheet>
    );
}
