import type { Participation } from '@/entities/user/types';

const NUMBER_FORMATTER = new Intl.NumberFormat('ko-KR');
const DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});
const MONTH_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
});

export type MyParticipationStats = {
    totalParticipations: number;
    recentActiveParticipations: number;
    recentAuthoredParticipations: number;
};

export function formatNumber(value: number) {
    return NUMBER_FORMATTER.format(value);
}

export function getParticipationStats(
    participations: Participation[],
    totalCount?: number,
): MyParticipationStats {
    return {
        totalParticipations: totalCount ?? participations.length,
        recentActiveParticipations: participations.filter(
            (item) => item.status === 'OPEN' || item.status === 'MATCHED',
        ).length,
        recentAuthoredParticipations: participations.filter(
            (item) => item.role === 'AUTHOR',
        ).length,
    };
}

export function getDisplayName(nickname: string | null | undefined) {
    const trimmed = nickname?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : '내 계정';
}

export function getRoleLabel(role: Participation['role']) {
    return role === 'AUTHOR' ? '주최자' : '참여자';
}

export function getInitials(nickname: string) {
    const compact = nickname.replace(/\s+/g, '');
    return compact.slice(0, 2).toUpperCase();
}

export function formatDate(value: string) {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return '날짜 정보 없음';
    }

    return DATE_FORMATTER.format(parsed);
}

export function formatMonth(value: string) {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return '최근';
    }

    return MONTH_FORMATTER.format(parsed);
}
