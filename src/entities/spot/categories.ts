export const SPOT_CATEGORIES = [
    '요리',
    '운동',
    '음악',
    '공예',
    '코딩',
    '등산',
    '요가',
    '미술',
    '볼더링',
] as const;

export type SpotCategory = (typeof SPOT_CATEGORIES)[number];

export type SpotCategoryMeta = {
    value: SpotCategory;
    label: string;
    emoji: string;
};

const META: Record<SpotCategory, SpotCategoryMeta> = {
    요리: { value: '요리', label: '요리', emoji: '🍳' },
    운동: { value: '운동', label: '운동', emoji: '💪' },
    음악: { value: '음악', label: '음악', emoji: '🎵' },
    공예: { value: '공예', label: '공예', emoji: '✂️' },
    코딩: { value: '코딩', label: '코딩', emoji: '💻' },
    등산: { value: '등산', label: '등산', emoji: '🥾' },
    요가: { value: '요가', label: '요가', emoji: '🧘' },
    미술: { value: '미술', label: '미술', emoji: '🎨' },
    볼더링: { value: '볼더링', label: '볼더링', emoji: '🧗' },
};

const FALLBACK_EMOJI = '📍';

export function isSpotCategory(value: string): value is SpotCategory {
    return (SPOT_CATEGORIES as readonly string[]).includes(value);
}

export function getCategoryEmoji(category: string): string {
    return isSpotCategory(category) ? META[category].emoji : FALLBACK_EMOJI;
}

export function getCategoryMeta(category: SpotCategory): SpotCategoryMeta {
    return META[category];
}
