// map-v3 FeedBottomSheet 위에 덧입히는 얇은 헤더. 원본 시트 수정 없이 collapsed 영역 덮기.

'use client';

type ClusterBottomSheetHeaderProps = {
    counts: {
        total: number;
        offer: number;
        request: number;
    };
    radiusKm?: number;
    className?: string;
};

export function ClusterBottomSheetHeader({
    counts,
    radiusKm = 1,
    className,
}: ClusterBottomSheetHeaderProps) {
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute bottom-0 left-0 right-0 ${className ?? ''}`}
        >
            <div className="h-[92px] rounded-t-[20px] border-t border-border-soft bg-card/95 px-5 pt-[10px] shadow-lg backdrop-blur-xl dark:shadow-none">
                <div className="mx-auto h-1 w-10 rounded-full bg-border-strong" />
                <div className="mt-[14px] flex items-baseline gap-2">
                    <span className="text-[16px] font-bold tracking-tight text-foreground">
                        이 동네 피드{' '}
                        <span className="text-primary">{counts.total}</span>
                    </span>
                    <span className="ml-auto text-[11px] text-muted-foreground">
                        위로 올려서 목록 ↑
                    </span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                    반경 {radiusKm}km · 해볼래 {counts.offer} · 알려줘{' '}
                    {counts.request}
                </div>
            </div>
        </div>
    );
}
