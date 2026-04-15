export type PointsInfo = {
    balance: number;
    upcomingPayment: {
        daysUntil: number;
        label: string;
        amount: number;
    } | null;
};

export type RecentActivity = {
    spotId: string;
    spotTitle: string;
    occurredAt: string;
};

export const MOCK_POINTS: PointsInfo = {
    balance: 84824,
    upcomingPayment: {
        daysUntil: 3,
        label: '팀 렌트값',
        amount: 20000,
    },
};

export const MOCK_RECENT_ACTIVITY: RecentActivity = {
    spotId: 'spot-1',
    spotTitle: '베이킹 킹 킹 알려줘요~',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
};
