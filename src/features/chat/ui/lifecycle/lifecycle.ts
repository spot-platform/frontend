import type { SpotStatus } from '@/entities/spot/types';

export type ChatLifecycle = 'open' | 'matched' | 'closed';

export function deriveChatLifecycle(status: SpotStatus): ChatLifecycle {
    if (status === 'OPEN') return 'open';
    if (status === 'MATCHED') return 'matched';
    return 'closed';
}

export const LIFECYCLE_LABEL: Record<ChatLifecycle, string> = {
    open: '모집 중',
    matched: '진행 중',
    closed: '종료',
};
