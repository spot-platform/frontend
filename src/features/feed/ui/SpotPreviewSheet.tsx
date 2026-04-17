'use client';

import { useRouter } from 'next/navigation';
import type { BottomSheetSnapPoint } from '@frontend/design-system';
import { AnimatePresence, motion } from 'framer-motion';
import { IconMapPin, IconUsers } from '@tabler/icons-react';
import { Button, Chip } from '@frontend/design-system';
import type { SpotMapItem } from '@/entities/spot/types';
import { useAuthStore } from '@/shared/model/auth-store';
import { FitnessScoreBadge } from './preference/FitnessScoreBadge';
import { AttractivenessMiniGauge } from './preference/AttractivenessMiniGauge';

type SpotPreviewSheetProps = {
    selectedSpot: SpotMapItem | null;
    sheetSnap: BottomSheetSnapPoint;
};

// PersistentDrawer snap fraction과 동기. design-system SNAP_VALUES와 일치시킬 것.
const SHEET_OFFSET_VH: Record<BottomSheetSnapPoint, number> = {
    peek: 20,
    half: 50,
    full: 90,
};

export function SpotPreviewSheet({
    selectedSpot,
    sheetSnap,
}: SpotPreviewSheetProps) {
    const router = useRouter();
    const userPersona = useAuthStore((state) => state.userPersona);
    const currentUserId = useAuthStore((state) => state.userId);

    const role = userPersona?.role ?? null;
    const showFitness =
        role === 'PARTNER' && selectedSpot?.personFitnessScore != null;
    // 자기 카드 판정: authorId/userId 중 하나라도 없으면 비공개 점수 노출 차단.
    const isOwnCard =
        selectedSpot?.authorId != null &&
        currentUserId != null &&
        selectedSpot.authorId === currentUserId;
    const showAttractiveness =
        role === 'SUPPORTER' &&
        isOwnCard &&
        selectedSpot?.attractivenessScore != null;

    return (
        <AnimatePresence mode="wait">
            {selectedSpot && (
                <motion.div
                    key={selectedSpot.id}
                    className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-4"
                    style={{
                        paddingBottom: `calc(env(safe-area-inset-bottom) + ${SHEET_OFFSET_VH[sheetSnap]}dvh + 0.75rem)`,
                    }}
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
                                    {showFitness &&
                                        selectedSpot.personFitnessScore !=
                                            null && (
                                            <FitnessScoreBadge
                                                score={
                                                    selectedSpot.personFitnessScore
                                                }
                                            />
                                        )}
                                </div>

                                <h3 className="mt-2 text-sm font-semibold text-foreground line-clamp-1">
                                    {selectedSpot.title}
                                </h3>

                                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <IconMapPin size={12} stroke={2} />
                                        {selectedSpot.location ?? '수원시'}
                                    </span>
                                    {selectedSpot.participantCount != null && (
                                        <span className="flex items-center gap-1">
                                            <IconUsers size={12} stroke={2} />
                                            {selectedSpot.participantCount}명
                                            참여 중
                                        </span>
                                    )}
                                </div>

                                {showAttractiveness &&
                                    selectedSpot.attractivenessScore !=
                                        null && (
                                        <div className="mt-2">
                                            <AttractivenessMiniGauge
                                                score={
                                                    selectedSpot.attractivenessScore
                                                }
                                            />
                                        </div>
                                    )}
                            </div>

                            <Button
                                size="sm"
                                onClick={() => {
                                    router.push(
                                        `/chat?spotId=${selectedSpot.id}`,
                                    );
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
