import { UserAvatar, UserAvatarStatic } from '@/shared/ui';
import { getMockUserProfile } from '@/entities/user/mock';
import type { SpotParticipant } from '@/entities/spot/types';

interface ParticipantListProps {
    participants: SpotParticipant[];
    currentUserId?: string;
}

const MAX_VISIBLE = 5;

export function ParticipantList({
    participants,
    currentUserId,
}: ParticipantListProps) {
    const visible = participants.slice(0, MAX_VISIBLE);
    const overflow = participants.length - MAX_VISIBLE;

    return (
        <div className="mx-4 rounded-2xl border border-gray-100 bg-white px-5 py-4">
            <h2 className="mb-3 text-sm font-bold text-gray-700">
                참여자 {participants.length}명
            </h2>
            <div className="flex flex-wrap items-start gap-3">
                {visible.map((p) => {
                    const isMe = p.userId === currentUserId;
                    const sublabel = p.role === 'AUTHOR' ? '호스트' : undefined;

                    const profileType = getMockUserProfile(
                        p.userId,
                    )?.profileType;

                    return isMe ? (
                        <UserAvatarStatic
                            key={p.userId}
                            userId={p.userId}
                            nickname={p.nickname}
                            profileType={profileType}
                            size="md"
                            showLabel
                            sublabel={sublabel}
                        />
                    ) : (
                        <UserAvatar
                            key={p.userId}
                            userId={p.userId}
                            nickname={p.nickname}
                            profileType={profileType}
                            size="md"
                            showLabel
                            sublabel={sublabel}
                        />
                    );
                })}
                {overflow > 0 && (
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">
                            +{overflow}
                        </div>
                        <span className="text-[10px] text-gray-400">
                            더보기
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
