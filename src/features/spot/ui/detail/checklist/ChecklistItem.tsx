'use client';

import { IconTrash } from '@tabler/icons-react';
import type { ChecklistItem as ChecklistItemType } from '@/entities/spot/types';

interface ChecklistItemProps {
    item: ChecklistItemType;
    onToggle: () => void;
    onDelete?: () => void;
}

export function ChecklistItem({
    item,
    onToggle,
    onDelete,
}: ChecklistItemProps) {
    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={onToggle}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    item.completed
                        ? 'border-brand-800 bg-brand-800'
                        : 'border-gray-300 bg-white'
                }`}
            >
                {item.completed && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </button>
            <span
                className={`flex-1 text-sm ${
                    item.completed
                        ? 'text-gray-400 line-through'
                        : 'text-gray-700'
                }`}
            >
                {item.text}
            </span>
            {item.assigneeNickname && (
                <span className="text-[10px] text-gray-400">
                    {item.assigneeNickname}
                </span>
            )}
            {onDelete && (
                <button
                    type="button"
                    onClick={onDelete}
                    className="text-gray-300 active:text-red-400"
                >
                    <IconTrash size={14} />
                </button>
            )}
        </div>
    );
}
