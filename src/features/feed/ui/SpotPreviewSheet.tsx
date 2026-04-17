'use client';

import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { IconMapPin, IconUsers } from '@tabler/icons-react';
import { Button, Chip } from '@frontend/design-system';
import type { SpotMapItem } from '@/entities/spot/types';
import { MOCK_FEED } from '../model/mock';

type SpotPreviewSheetProps = {
    selectedSpot: SpotMapItem | null;
    onClose: () => void;
};

export function SpotPreviewSheet({
    selectedSpot,
    onClose,
}: SpotPreviewSheetProps) {
    const router = useRouter();

    const feedItem = selectedSpot
        ? MOCK_FEED.find(
              (item) =>
                  item.title.includes(selectedSpot.category) ||
                  item.category === selectedSpot.category,
          )
        : null;

    return (
        <AnimatePresence mode="wait">
            {selectedSpot && (
                <motion.div
                    key={selectedSpot.id}
                    className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-4 pb-[calc(env(safe-area-inset-bottom)+5rem)]"
                    initial={{ y: 24, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: 24, opacity: 0, filter: 'blur(4px)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                    <div className="rounded-xl bg-background p-4 shadow-lg ring-1 ring-border-soft/50">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <Chip
                                        size="sm"
                                        tone="brand"
                                        selected={selectedSpot.type === 'OFFER'}
                                    >
                                        {selectedSpot.type === 'OFFER'
                                            ? '해볼래'
                                            : '알려줘'}
                                    </Chip>
                                    <span className="text-xs text-muted-foreground">
                                        #{selectedSpot.category}
                                    </span>
                                </div>

                                <h3 className="mt-2 text-sm font-semibold text-foreground line-clamp-1">
                                    {selectedSpot.title}
                                </h3>

                                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <IconMapPin size={12} stroke={2} />
                                        수원시
                                    </span>
                                    {feedItem && (
                                        <span className="flex items-center gap-1">
                                            <IconUsers size={12} stroke={2} />
                                            {feedItem.partnerCount ??
                                                feedItem.applicantCount ??
                                                0}
                                            명 참여 중
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button
                                size="sm"
                                onClick={() => {
                                    router.push(
                                        `/chat?spotId=${selectedSpot.id}`,
                                    );
                                    onClose();
                                }}
                            >
                                {selectedSpot.status === 'MATCHED'
                                    ? '진행 공간 입장'
                                    : selectedSpot.status === 'CLOSED' ||
                                        selectedSpot.status === 'CANCELLED'
                                      ? '회고 보기'
                                      : '대화방 입장'}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
