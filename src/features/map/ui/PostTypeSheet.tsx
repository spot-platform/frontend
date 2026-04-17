'use client';

import { useRouter } from 'next/navigation';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@frontend/design-system';
import { IconSparkles, IconHandStop } from '@tabler/icons-react';

type PostTypeSheetProps = {
    open: boolean;
    onClose: () => void;
};

export function PostTypeSheet({ open, onClose }: PostTypeSheetProps) {
    const router = useRouter();

    const handleSelect = (type: 'offer' | 'request') => {
        onClose();
        router.push(`/post/${type}`);
    };

    return (
        <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>어떤 글을 작성할까요?</DrawerTitle>
                    <DrawerDescription>
                        목적에 맞는 유형을 선택해 주세요
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-3 px-4 pb-6">
                    <button
                        type="button"
                        onClick={() => handleSelect('offer')}
                        className="flex items-start gap-4 rounded-2xl border border-border-soft bg-brand-50/50 p-4 text-left transition-colors active:bg-brand-100/60"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100">
                            <IconSparkles
                                size={22}
                                stroke={1.8}
                                className="text-primary"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground">
                                해볼래
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                내가 운영하는 모임이나 클래스에 참여자를
                                모집해요
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSelect('request')}
                        className="flex items-start gap-4 rounded-2xl border border-border-soft bg-violet-50/50 p-4 text-left transition-colors active:bg-violet-100/60"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100">
                            <IconHandStop
                                size={22}
                                stroke={1.8}
                                className="text-violet-600"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground">
                                알려줘
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                내가 원하는 활동을 등록하고 서포터를 찾아요
                            </p>
                        </div>
                    </button>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
