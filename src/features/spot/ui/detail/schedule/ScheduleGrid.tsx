'use client';

import type { ScheduleSlot } from '@/entities/spot/types';

interface ScheduleGridProps {
    dates: string[];
    hours: number[];
    slots: ScheduleSlot[];
    currentUserId: string;
    onToggle: (date: string, hour: number) => void;
}

export function ScheduleGrid({
    dates,
    hours,
    slots,
    currentUserId,
    onToggle,
}: ScheduleGridProps) {
    function isAvailable(date: string, hour: number) {
        return slots.some(
            (s) =>
                s.date === date &&
                s.hour === hour &&
                s.availableUserIds.includes(currentUserId),
        );
    }

    function participantCount(date: string, hour: number) {
        return (
            slots.find((s) => s.date === date && s.hour === hour)
                ?.availableUserIds.length ?? 0
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
                <thead>
                    <tr>
                        <th className="w-10 pb-2 text-gray-400" />
                        {dates.map((d) => (
                            <th
                                key={d}
                                className="pb-2 text-center font-semibold text-gray-600"
                            >
                                {d.slice(5)} {/* MM-DD */}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {hours.map((hour) => (
                        <tr key={hour}>
                            <td className="pr-2 text-right text-gray-400">
                                {hour}:00
                            </td>
                            {dates.map((date) => {
                                const active = isAvailable(date, hour);
                                const count = participantCount(date, hour);
                                return (
                                    <td key={date} className="p-0.5">
                                        <button
                                            type="button"
                                            onClick={() => onToggle(date, hour)}
                                            className={`h-8 w-full rounded transition-colors ${
                                                active
                                                    ? 'bg-brand-800 text-white'
                                                    : count > 0
                                                      ? 'bg-brand-800/20 text-brand-800'
                                                      : 'bg-gray-100 text-gray-300'
                                            }`}
                                        >
                                            {count > 0 ? count : ''}
                                        </button>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
