'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '../lib/cn';

type Size = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<Size, string> = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
};

const LABEL_SIZE: Record<Size, string> = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-xs',
};

const IMAGE_SIZE: Record<Size, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
};

const passthroughLoader = ({ src }: { src: string }) => src;

const BG_COLORS = [
    'bg-emerald-400',
    'bg-blue-400',
    'bg-purple-400',
    'bg-orange-400',
    'bg-pink-400',
    'bg-teal-400',
    'bg-rose-400',
];

function pickColor(userId: string) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash * 31 + userId.charCodeAt(i)) & 0xffff;
    }
    return BG_COLORS[hash % BG_COLORS.length];
}

type ProfileType = 'SUPPORTER' | 'PARTNER';

const BADGE_SIZE: Record<Size, string> = {
    xs: 'h-3 w-3 text-[7px]',
    sm: 'h-3.5 w-3.5 text-[8px]',
    md: 'h-4 w-4 text-[9px]',
    lg: 'h-5 w-5 text-[10px]',
};

function ProfileBadge({ type, size }: { type: ProfileType; size: Size }) {
    const isSupporter = type === 'SUPPORTER';
    return (
        <span
            className={cn(
                'absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full font-black ring-1 ring-card',
                BADGE_SIZE[size],
                isSupporter
                    ? 'bg-accent text-primary-foreground'
                    : 'bg-brand-800 text-primary-foreground',
            )}
        >
            {isSupporter ? 'S' : 'P'}
        </span>
    );
}

interface UserAvatarProps {
    userId: string;
    nickname: string;
    avatarUrl?: string;
    profileType?: ProfileType;
    size?: Size;
    showLabel?: boolean;
    /** 라벨 아래에 추가로 보여줄 텍스트 (예: '호스트') */
    sublabel?: string;
    className?: string;
    /** dark 배경(nav 등)에서 사용할 때 true */
    dark?: boolean;
}

export function UserAvatar({
    userId,
    nickname,
    avatarUrl,
    profileType,
    size = 'md',
    showLabel = false,
    sublabel,
    className,
    dark = false,
}: UserAvatarProps) {
    const initials = nickname.slice(0, 1);
    const bg = pickColor(userId);

    const avatarEl = avatarUrl ? (
        <Image
            loader={passthroughLoader}
            unoptimized
            src={avatarUrl}
            alt={nickname}
            width={IMAGE_SIZE[size]}
            height={IMAGE_SIZE[size]}
            className={cn('rounded-full object-cover', SIZE_CLASSES[size])}
        />
    ) : (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center rounded-full font-bold text-primary-foreground',
                SIZE_CLASSES[size],
                bg,
            )}
        >
            {initials}
        </div>
    );

    return (
        <Link
            href={`/users/${userId}`}
            className={cn('flex flex-col items-center gap-1', className)}
        >
            <div className="relative shrink-0">
                {avatarEl}
                {profileType && <ProfileBadge type={profileType} size={size} />}
            </div>
            {showLabel && (
                <div className="flex flex-col items-center gap-0">
                    <span
                        className={cn(
                            'max-w-12 truncate font-medium',
                            LABEL_SIZE[size],
                            dark ? 'text-white/70' : 'text-text-secondary',
                        )}
                    >
                        {nickname}
                    </span>
                    {sublabel && (
                        <span
                            className={cn(
                                LABEL_SIZE[size],
                                dark
                                    ? 'text-white/40'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {sublabel}
                        </span>
                    )}
                </div>
            )}
        </Link>
    );
}

/** 클릭 불가 버전 — 자기 자신('나') 등에 사용 */
export function UserAvatarStatic({
    userId,
    nickname,
    avatarUrl,
    profileType,
    size = 'md',
    showLabel = false,
    sublabel,
    className,
    dark = false,
}: UserAvatarProps) {
    const initials = nickname.slice(0, 1);
    const bg = pickColor(userId);

    const avatarEl = avatarUrl ? (
        <Image
            loader={passthroughLoader}
            unoptimized
            src={avatarUrl}
            alt={nickname}
            width={IMAGE_SIZE[size]}
            height={IMAGE_SIZE[size]}
            className={cn('rounded-full object-cover', SIZE_CLASSES[size])}
        />
    ) : (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center rounded-full font-bold text-primary-foreground',
                SIZE_CLASSES[size],
                bg,
            )}
        >
            {initials}
        </div>
    );

    return (
        <div className={cn('flex flex-col items-center gap-1', className)}>
            <div className="relative shrink-0">
                {avatarEl}
                {profileType && <ProfileBadge type={profileType} size={size} />}
            </div>
            {showLabel && (
                <div className="flex flex-col items-center gap-0">
                    <span
                        className={cn(
                            'max-w-12 truncate font-medium',
                            LABEL_SIZE[size],
                            dark ? 'text-white/70' : 'text-text-secondary',
                        )}
                    >
                        {nickname}
                    </span>
                    {sublabel && (
                        <span
                            className={cn(
                                LABEL_SIZE[size],
                                dark
                                    ? 'text-white/40'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {sublabel}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
