'use client';

import {
    IconMusic,
    IconToolsKitchen2,
    IconBarbell,
    IconScissors,
    IconLanguage,
    IconDeviceGamepad2,
    IconLayoutGrid,
} from '@tabler/icons-react';
import type { FeedCategory } from '../model/types';
import { cn } from '@/shared/lib/cn';

interface CategoryItem {
    value: FeedCategory | '전체';
    label: string;
    icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
    { value: '전체', label: '전체', icon: <IconLayoutGrid size={20} /> },
    { value: '음악', label: '음악/악기', icon: <IconMusic size={20} /> },
    {
        value: '요리',
        label: '요리/카페',
        icon: <IconToolsKitchen2 size={20} />,
    },
    { value: '운동', label: '운동/스포츠', icon: <IconBarbell size={20} /> },
    { value: '공예', label: '공예/만들기', icon: <IconScissors size={20} /> },
    { value: '언어', label: '외국/언어', icon: <IconLanguage size={20} /> },
    {
        value: '기타',
        label: '게임/오락',
        icon: <IconDeviceGamepad2 size={20} />,
    },
];

interface CategoryGridProps {
    selected: FeedCategory | '전체';
    onChange: (value: FeedCategory | '전체') => void;
}

export function CategoryGrid({ selected, onChange }: CategoryGridProps) {
    return (
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 px-4">
            {CATEGORIES.map((cat) => {
                const isActive = selected === cat.value;
                return (
                    <button
                        key={cat.value}
                        type="button"
                        onClick={() => onChange(cat.value)}
                        className="flex flex-col items-center gap-2"
                    >
                        <div
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-full transition-all duration-150',
                                isActive
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-brand-50 text-brand-800',
                            )}
                        >
                            {cat.icon}
                        </div>
                        <span
                            className={cn(
                                'text-center text-xs leading-tight',
                                isActive
                                    ? 'font-bold text-brand-800'
                                    : 'text-gray-500',
                            )}
                        >
                            {cat.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
