// 활동 장소(ResolvedPlace[]) 섹션 — /feed/[id] 디테일 페이지 본문에서 사용.

import type {
    PlaceRole,
    ResolvedPlace,
} from '@/entities/spot/simulation-types';

type VenueSectionProps = {
    primaryPin?: ResolvedPlace;
    venueAnchors?: ResolvedPlace[];
    emptyHint?: string;
};

const ROLE_LABEL: Record<PlaceRole, string> = {
    meetup: '모임 시작',
    main: '메인',
    secondary: '보조',
    wrapup: '마무리',
};

export function VenueSection({
    primaryPin,
    venueAnchors,
    emptyHint,
}: VenueSectionProps) {
    const places: ResolvedPlace[] = [];
    const seen = new Set<number>();
    if (primaryPin && !seen.has(primaryPin.place_id)) {
        places.push(primaryPin);
        seen.add(primaryPin.place_id);
    }
    for (const v of venueAnchors ?? []) {
        if (!seen.has(v.place_id)) {
            places.push(v);
            seen.add(v.place_id);
        }
    }

    if (places.length === 0) {
        if (!emptyHint) return null;
        return (
            <div className="border-b border-gray-200 px-4 py-5">
                <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase mb-3">
                    활동 장소
                </p>
                <p className="text-sm text-gray-500">{emptyHint}</p>
            </div>
        );
    }

    return (
        <div className="border-b border-gray-200 px-4 py-5">
            <p className="text-xs font-medium tracking-[0.14em] text-gray-400 uppercase mb-3">
                활동 장소
            </p>
            <ul className="flex flex-col gap-2">
                {places.map((p) => (
                    <li
                        key={p.place_id}
                        className="rounded-lg bg-gray-50 px-3 py-2.5"
                    >
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-500">
                                {ROLE_LABEL[p.role]}
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                                {p.name}
                            </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">
                            {p.address}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
