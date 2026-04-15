import { Calendar } from 'lucide-react';
import { SectionCard } from '../SectionCard';
import type { SpotSchedule } from '@/entities/spot/types';

interface ScheduleSectionProps {
    schedule?: SpotSchedule | null;
}

export function ScheduleSection({ schedule }: ScheduleSectionProps) {
    const confirmed = schedule?.confirmedSlot;
    const topSlots = schedule?.proposedSlots.slice(0, 2) ?? [];

    return (
        <SectionCard title="일정 조율" manageModal="schedule">
            {confirmed ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5">
                    <Calendar size={16} className="text-emerald-600" />
                    <div>
                        <p className="text-xs font-semibold text-emerald-700">
                            확정된 일정
                        </p>
                        <p className="text-xs text-emerald-600">
                            {confirmed.date} {confirmed.hour}:00
                        </p>
                    </div>
                </div>
            ) : topSlots.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs text-gray-400">후보 일정</p>
                    {topSlots.map((slot, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                        >
                            <span className="text-xs text-gray-600">
                                {slot.date} {slot.hour}:00
                            </span>
                            <span className="text-xs text-gray-400">
                                {slot.availableUserIds.length}명 가능
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400">
                    아직 일정이 없어요. 가용 시간을 입력해보세요.
                </p>
            )}
        </SectionCard>
    );
}
