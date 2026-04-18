'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    IconUserPlus,
    IconUserCheck,
    IconMessageCircle,
} from '@tabler/icons-react';
import { Button } from '@frontend/design-system';
import { DetailHeader } from '@/shared/ui/DetailHeader';
import { Section } from '@/shared/ui';
import type { PartnerProfile } from '@/entities/user/types';

function Avatar({
    nickname,
    avatarUrl,
}: {
    nickname: string;
    avatarUrl?: string;
}) {
    const initials = nickname.slice(0, 1);
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={nickname}
                className="h-24 w-24 rounded-xl object-cover"
            />
        );
    }
    return (
        <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-brand-800 text-3xl font-black text-white">
            {initials}
        </div>
    );
}

export function PartnerProfileClient({
    profile: initialProfile,
}: {
    profile: PartnerProfile;
}) {
    const router = useRouter();
    const [isFriend, setIsFriend] = useState(initialProfile.isFriend);

    const handleFriendToggle = () => {
        setIsFriend((v) => !v);
    };

    const handleChat = () => {
        router.push(`/chat?userId=${initialProfile.id}`);
    };

    return (
        <>
            <DetailHeader title="파트너 프로필" />
            {/* 프로필 카드 */}
            <Section
                className="rounded-xl border border-border-soft bg-card p-6 pb-10"
                px="md"
                gap="lg"
            >
                {/* 아바타 + 이름 */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <Avatar
                        nickname={initialProfile.nickname}
                        avatarUrl={initialProfile.avatarUrl}
                    />
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                            Partner
                        </p>
                        <h1 className="mt-1 text-2xl font-black tracking-[-0.03em] text-foreground">
                            {initialProfile.nickname}
                        </h1>
                    </div>
                </div>

                {/* 관심 카테고리 */}
                <div className="flex flex-col gap-2">
                    <p className="text-center text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                        관심 카테고리
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {initialProfile.interestCategories.map((cat) => (
                            <span
                                key={cat}
                                className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 액션 버튼 */}
                <div className="grid grid-cols-2 gap-2.5">
                    <Button
                        variant={isFriend ? 'secondary' : 'primary'}
                        fullWidth
                        onClick={handleFriendToggle}
                        startIcon={
                            isFriend ? (
                                <IconUserCheck size={16} />
                            ) : (
                                <IconUserPlus size={16} />
                            )
                        }
                    >
                        {isFriend ? '친구 추가됨' : '친구 추가'}
                    </Button>
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={handleChat}
                        startIcon={<IconMessageCircle size={16} />}
                    >
                        1:1 채팅
                    </Button>
                </div>
            </Section>
        </>
    );
}
