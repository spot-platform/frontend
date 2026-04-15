import { TimelineItem } from './TimelineItem';
import type { TimelineEvent } from '@/entities/spot/types';

interface TimelineSectionProps {
    events: TimelineEvent[];
}

export function TimelineSection({ events }: TimelineSectionProps) {
    if (events.length === 0) return null;

    return (
        <div className="mx-4 rounded-2xl border border-gray-100 bg-white px-5 py-4">
            <h2 className="mb-4 text-sm font-bold text-gray-700">타임라인</h2>
            <div>
                {events.map((event, idx) => (
                    <TimelineItem
                        key={event.id}
                        event={event}
                        isLast={idx === events.length - 1}
                    />
                ))}
            </div>
        </div>
    );
}
