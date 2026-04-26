'use client';

import { useRouter } from 'next/navigation';
import {
    IconSearch,
    IconUser,
    IconPlus,
    IconBell,
    IconX,
} from '@tabler/icons-react';
import { useFilterStore } from '@/features/map/model/use-filter-store';

type MapHeaderProps = {
    onCreateClick?: () => void;
    hidden?: boolean;
};

export function MapHeader({ onCreateClick, hidden = false }: MapHeaderProps) {
    const router = useRouter();
    const searchQuery = useFilterStore((s) => s.searchQuery);
    const setSearchQuery = useFilterStore((s) => s.setSearchQuery);

    const handleChange = (value: string) => {
        setSearchQuery(value);
    };

    return (
        <div
            aria-hidden={hidden}
            className="pointer-events-auto fixed left-0 right-0 top-0 z-30 flex items-center gap-2 pb-2 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
                paddingTop: 'calc(env(safe-area-inset-top) + 2rem)',
                paddingLeft: 'calc(env(safe-area-inset-left) + 1rem)',
                paddingRight: 'calc(env(safe-area-inset-right) + 1rem)',
                transform: hidden
                    ? 'translateX(calc(100% + 1rem))'
                    : 'translateX(0)',
                pointerEvents: hidden ? 'none' : 'auto',
            }}
        >
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-white pl-4 pr-2 shadow-md">
                <IconSearch
                    size={18}
                    stroke={1.8}
                    className="shrink-0 text-muted-foreground"
                />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="동네에서 찾아보기"
                    aria-label="모임 검색"
                    className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {searchQuery.length > 0 ? (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100"
                        aria-label="검색어 지우기"
                    >
                        <IconX
                            size={13}
                            stroke={2}
                            className="text-foreground"
                        />
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={() => router.push('/notifications')}
                    className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 xs:flex"
                    aria-label="알림"
                >
                    <IconBell
                        size={15}
                        stroke={1.8}
                        className="text-foreground"
                    />
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/my')}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100"
                    aria-label="내 프로필"
                >
                    <IconUser
                        size={15}
                        stroke={1.8}
                        className="text-foreground"
                    />
                </button>
            </div>

            <button
                type="button"
                onClick={() => onCreateClick?.()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md"
                aria-label="새 게시물"
            >
                <IconPlus size={20} stroke={2} className="text-foreground" />
            </button>
        </div>
    );
}
