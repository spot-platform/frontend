'use client';

import { Section } from '@/shared/ui';
import { TypeBadge } from '@/shared/ui';
import { RecruitingSpotRow, InProgressSpotRow } from './SpotMyListRow';
import type { Spot, SpotType } from '@/entities/spot/types';

// ─── 모집 중 섹션 ─────────────────────────────────────────────────────────────

interface RecruitingGroupProps {
    type: SpotType;
    spots: Spot[];
    expandedSpotId: string | null;
    onToggleSpot: (id: string) => void;
}

function RecruitingGroup({
    type,
    spots,
    expandedSpotId,
    onToggleSpot,
}: RecruitingGroupProps) {
    if (spots.length === 0) return null;

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 px-1">
                <TypeBadge type={type} size="md" />
                <span className="text-xs text-muted-foreground">
                    {spots.length}건
                </span>
            </div>
            <ul className="divide-y divide-border-soft">
                {spots.map((spot) => (
                    <li key={spot.id}>
                        <RecruitingSpotRow
                            spot={spot}
                            expanded={expandedSpotId === spot.id}
                            onToggle={() => onToggleSpot(spot.id)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ─── 진행 중 섹션 ─────────────────────────────────────────────────────────────

interface InProgressGroupProps {
    spots: Spot[];
}

function InProgressGroup({ spots }: InProgressGroupProps) {
    if (spots.length === 0) return null;

    return (
        <ul className="divide-y divide-border-soft">
            {spots.map((spot) => (
                <li key={spot.id}>
                    <InProgressSpotRow spot={spot} />
                </li>
            ))}
        </ul>
    );
}

// ─── 공통 래퍼 ────────────────────────────────────────────────────────────────

type RecruitingProps = {
    mode: 'recruiting';
    expandedSpotId: string | null;
    onToggleSpot: (id: string) => void;
};

type InProgressProps = {
    mode: 'inProgress';
};

type SpotMyListSectionProps = {
    title: string;
    spots: Spot[];
    emptyMessage?: string;
} & (RecruitingProps | InProgressProps);

export function SpotMyListSection(props: SpotMyListSectionProps) {
    const { title, spots, emptyMessage = '스팟이 없어요' } = props;

    const offers = spots.filter((s) => s.type === 'OFFER');
    const requests = spots.filter((s) => s.type === 'REQUEST');

    return (
        <Section
            className="mx-4 border border-border-soft bg-card px-4 py-3"
            gap="sm"
        >
            <p className="text-sm font-bold text-text-secondary">{title}</p>

            {spots.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                </p>
            ) : props.mode === 'recruiting' ? (
                <>
                    <RecruitingGroup
                        type="OFFER"
                        spots={offers}
                        expandedSpotId={props.expandedSpotId}
                        onToggleSpot={props.onToggleSpot}
                    />
                    <RecruitingGroup
                        type="REQUEST"
                        spots={requests}
                        expandedSpotId={props.expandedSpotId}
                        onToggleSpot={props.onToggleSpot}
                    />
                </>
            ) : (
                <InProgressGroup spots={spots} />
            )}
        </Section>
    );
}
