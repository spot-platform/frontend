import type { SpotChatRoom } from '../../model/types';
import { ClosedPhasePanel } from './ClosedPhasePanel';
import { deriveChatLifecycle } from './lifecycle';
import { MatchedPhasePanel } from './MatchedPhasePanel';
import { OpenPhasePanel } from './OpenPhasePanel';

type Props = { room: SpotChatRoom };

export function ChatLifecyclePanel({ room }: Props) {
    const lifecycle = deriveChatLifecycle(room.spot.status);

    if (lifecycle === 'open') return <OpenPhasePanel room={room} />;
    if (lifecycle === 'matched') return <MatchedPhasePanel room={room} />;
    return <ClosedPhasePanel room={room} />;
}
