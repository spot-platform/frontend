'use client';

import { useRouter } from 'next/navigation';
import { IconSearch, IconUser, IconPlus } from '@tabler/icons-react';

type MapHeaderProps = {
    onCreateClick?: () => void;
};

export function MapHeader({ onCreateClick }: MapHeaderProps) {
    const router = useRouter();

    return (
        <div className="pointer-events-auto fixed left-0 right-0 top-0 z-30 flex items-center gap-2.5 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            <div className="flex h-11 flex-1 items-center gap-2.5 rounded-full bg-white px-4 shadow-md">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push('/search')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') router.push('/search');
                    }}
                    className="flex flex-1 items-center gap-2.5"
                >
                    <IconSearch
                        size={18}
                        stroke={1.8}
                        className="shrink-0 text-muted-foreground"
                    />
                    <span className="text-sm text-muted-foreground">
                        동네에서 찾아보기
                    </span>
                </div>
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
