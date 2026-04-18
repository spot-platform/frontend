import type { VoteOption } from '@/entities/spot/types';

interface VoteOptionBarProps {
    option: VoteOption;
    totalVotes: number;
    selected?: boolean;
    onSelect?: () => void;
}

export function VoteOptionBar({
    option,
    totalVotes,
    selected,
    onSelect,
}: VoteOptionBarProps) {
    const percent =
        totalVotes > 0
            ? Math.round((option.voterIds.length / totalVotes) * 100)
            : 0;

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-colors ${
                selected
                    ? 'border-brand-800 bg-brand-800/5'
                    : 'border-border-soft bg-card'
            }`}
        >
            {/* 진행 바 배경 */}
            <div
                className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                    selected ? 'bg-brand-800/10' : 'bg-muted'
                }`}
                style={{ width: `${percent}%` }}
            />
            <div className="relative flex items-center justify-between">
                <span
                    className={`text-sm font-semibold ${selected ? 'text-brand-800' : 'text-text-secondary'}`}
                >
                    {option.label}
                </span>
                <span
                    className={`text-xs font-bold ${selected ? 'text-brand-800' : 'text-muted-foreground'}`}
                >
                    {percent}%
                </span>
            </div>
            <p className="relative mt-0.5 text-xs text-muted-foreground">
                {option.voterIds.length}표
            </p>
        </button>
    );
}
