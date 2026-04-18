import { MOCK_SPOT_DETAILS } from '../model/mock';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function getWeekDates(base: Date): Date[] {
    const day = base.getDay(); // 0=일, 1=월...
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function toISODate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function getMarkedDates(): Set<string> {
    const marked = new Set<string>();
    for (const detail of Object.values(MOCK_SPOT_DETAILS)) {
        if (detail.schedule?.confirmedSlot) {
            marked.add(detail.schedule.confirmedSlot.date);
        }
    }
    return marked;
}

export function SpotCalendarSection() {
    const today = new Date();
    const todayStr = toISODate(today);
    const weekDates = getWeekDates(today);
    const marked = getMarkedDates();

    return (
        <div className="mx-4 rounded-2xl border border-border-soft bg-card px-4 py-3.5">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">
                주간 캘린더
            </p>
            <div className="grid grid-cols-7 gap-1">
                {weekDates.map((date, i) => {
                    const dateStr = toISODate(date);
                    const isToday = dateStr === todayStr;
                    const hasEvent = marked.has(dateStr);

                    return (
                        <div
                            key={dateStr}
                            className="flex flex-col items-center gap-1"
                        >
                            <span className="text-[10px] text-muted-foreground">
                                {DAY_LABELS[i]}
                            </span>
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                                    isToday
                                        ? 'bg-brand-800 text-white'
                                        : 'text-text-secondary'
                                }`}
                            >
                                {date.getDate()}
                            </div>
                            <div
                                className={`h-1.5 w-1.5 rounded-full ${hasEvent ? 'bg-emerald-400' : 'bg-transparent'}`}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
