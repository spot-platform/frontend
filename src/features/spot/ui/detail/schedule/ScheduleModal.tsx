'use client';

import { Button } from '@frontend/design-system';
import { useState } from 'react';
import { BottomSheet } from '@/shared/ui';
import { ScheduleGrid } from './ScheduleGrid';
import { useUpsertSchedule } from '../../../model/use-schedule';
import type { SpotSchedule, ScheduleSlot } from '@/entities/spot/types';

interface ScheduleModalProps {
    open: boolean;
    onClose: () => void;
    spotId: string;
    schedule?: SpotSchedule;
    currentUserId: string;
}

// 오늘부터 7일
function getNextDates(count: number): string[] {
    return Array.from({ length: count }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toISOString().slice(0, 10);
    });
}

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const DATES = getNextDates(7);

export function ScheduleModal({
    open,
    onClose,
    spotId,
    schedule,
    currentUserId,
}: ScheduleModalProps) {
    const [slots, setSlots] = useState<ScheduleSlot[]>(
        schedule?.proposedSlots ?? [],
    );
    const { mutate: upsert, isPending } = useUpsertSchedule(spotId);

    function handleToggle(date: string, hour: number) {
        setSlots((prev) => {
            const existing = prev.find(
                (s) => s.date === date && s.hour === hour,
            );
            if (existing) {
                const newUserIds = existing.availableUserIds.includes(
                    currentUserId,
                )
                    ? existing.availableUserIds.filter(
                          (id) => id !== currentUserId,
                      )
                    : [...existing.availableUserIds, currentUserId];
                if (newUserIds.length === 0) {
                    return prev.filter(
                        (s) => !(s.date === date && s.hour === hour),
                    );
                }
                return prev.map((s) =>
                    s.date === date && s.hour === hour
                        ? { ...s, availableUserIds: newUserIds }
                        : s,
                );
            }
            return [...prev, { date, hour, availableUserIds: [currentUserId] }];
        });
    }

    function handleSave() {
        upsert(slots, { onSuccess: onClose });
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title="일정 조율"
            snapPoint="full"
        >
            <div className="flex flex-col gap-4">
                <p className="text-xs text-gray-500">
                    가능한 시간대를 탭해서 표시해주세요
                </p>
                <ScheduleGrid
                    dates={DATES}
                    hours={HOURS}
                    slots={slots}
                    currentUserId={currentUserId}
                    onToggle={handleToggle}
                />
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    fullWidth
                    className="mt-2"
                >
                    저장하기
                </Button>
            </div>
        </BottomSheet>
    );
}
