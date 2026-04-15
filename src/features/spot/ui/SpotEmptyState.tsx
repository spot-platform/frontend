import { Inbox } from 'lucide-react';
import { EmptyState } from '@/shared/ui';
import type { SpotTabFilter } from '@/entities/spot/types';

const MESSAGES: Record<SpotTabFilter, { title: string; description: string }> =
    {
        ACTIVE: {
            title: '진행 중인 스팟이 없어요',
            description: '피드에서 마음에 드는 스팟을 찾아보세요',
        },
        COMPLETED: {
            title: '완료된 스팟이 없어요',
            description: '스팟을 완료하면 여기에 기록돼요',
        },
        ALL: {
            title: '참여한 스팟이 없어요',
            description: '피드에서 다양한 스팟에 참여해보세요',
        },
    };

interface SpotEmptyStateProps {
    tab: SpotTabFilter;
}

export function SpotEmptyState({ tab }: SpotEmptyStateProps) {
    const { title, description } = MESSAGES[tab];
    return (
        <EmptyState
            icon={<Inbox size={48} strokeWidth={1.2} />}
            title={title}
            description={description}
        />
    );
}
