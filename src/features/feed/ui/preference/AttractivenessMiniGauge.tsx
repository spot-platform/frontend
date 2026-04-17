// Phase 3a 임시 스텁. Phase 4a 대시보드가 공식 버전 담당.

type AttractivenessMiniGaugeProps = {
    score: number;
};

export function AttractivenessMiniGauge({
    score,
}: AttractivenessMiniGaugeProps) {
    const clamped = Math.max(0, Math.min(1, score));
    const percent = Math.round(clamped * 100);
    const bar =
        clamped >= 0.7
            ? 'bg-accent-dark'
            : clamped >= 0.4
              ? 'bg-brand-500'
              : 'bg-neutral-400';

    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-muted-foreground">
                피드 매력도
            </span>
            <div className="h-1 w-16 overflow-hidden rounded-full bg-neutral-200">
                <div
                    className={`h-full rounded-full ${bar}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
            <span className="text-[10px] font-semibold tabular-nums text-foreground">
                {percent}
            </span>
        </div>
    );
}
