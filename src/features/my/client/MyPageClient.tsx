'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/model/auth-store';
import { Main, Section } from '@/shared/ui';
import { formatNumber, getDisplayName } from '../model/my-page-helpers';
import { useMyProfile } from '../model/use-my';

const MY_GROUPS = [
    {
        title: '계정',
        items: [
            {
                href: '/my/settings',
                label: '기본 정보',
                description: '프로필 사진, 이름, 비밀번호, 이메일, 전화번호',
            },
            {
                href: '/my/notification-settings',
                label: '알림 설정',
                description: '푸시와 서비스 알림 수신 여부',
            },
        ],
    },
    {
        title: '서포터',
        items: [
            {
                href: '/my/support-register',
                label: '서포터 등록 정보',
                description: '분야, 소개, 인증 절차와 제출 자료',
            },
            {
                href: '/my/support-profile',
                label: '서포터 프로필',
                description: '노출 프로필, 별점, 히스토리와 리뷰',
            },
        ],
    },
    {
        title: '활동',
        items: [
            {
                href: '/my/point',
                label: '포인트',
                description: '내역, 충전, 출금, 연동 계좌',
            },
            {
                href: '/my/history',
                label: '히스토리',
                description: '스팟 활동, 서포터 관련 기록, 리뷰',
            },
            {
                href: '/my/favorite',
                label: '찜한 게시글',
                description: '저장해 둔 게시글 모아보기',
            },
            {
                href: '/my/recent',
                label: '최근 본 게시글',
                description: '최근 조회 기록과 캐시 기준',
            },
        ],
    },
] as const;

export function MyPageClient() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const profileQuery = useMyProfile();
    const profile = profileQuery.data?.data;
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setLogoutError(null);

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('logout-failed');
            }

            clearAuth();
            queryClient.clear();
            router.replace('/login');
            router.refresh();
        } catch {
            setLogoutError('로그아웃을 완료하지 못했어요. 다시 시도해 주세요.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Main px="md" gap="md" className="pb-6">
            <Section className="mx-[-1rem] border-b border-border-soft bg-card px-4 py-4 rounded-none">
                <p className="text-xs font-medium text-muted-foreground">
                    내 정보
                </p>
                {profileQuery.isPending ? (
                    <div className="mt-2 space-y-2">
                        <div className="h-6 w-28 rounded bg-muted" />
                        <div className="h-4 w-44 rounded bg-muted" />
                    </div>
                ) : (
                    <div className="mt-2 space-y-1">
                        <h1 className="text-lg font-semibold text-foreground">
                            {getDisplayName(profile?.nickname)}
                        </h1>
                        <p className="text-sm text-text-secondary">
                            {profile?.email ?? '계정 정보를 확인할 수 없어요.'}
                        </p>
                        {typeof profile?.pointBalance === 'number' && (
                            <p className="text-sm text-text-secondary">
                                보유 포인트 {formatNumber(profile.pointBalance)}
                                P
                            </p>
                        )}
                    </div>
                )}
            </Section>

            {MY_GROUPS.map((group) => (
                <Section
                    key={group.title}
                    className="mx-[-1rem] bg-card rounded-none"
                >
                    <h2 className="border-b border-border-soft px-4 py-3 text-sm font-semibold text-foreground">
                        {group.title}
                    </h2>
                    <div className="divide-y divide-border-soft">
                        {group.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block px-4 py-3 transition-colors hover:bg-muted active:bg-border-soft"
                            >
                                <p className="text-sm font-medium text-foreground">
                                    {item.label}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    {item.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </Section>
            ))}

            <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mx-[-1rem] border-b border-t border-border-soft bg-card px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted active:bg-border-soft"
            >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>

            {logoutError ? (
                <p className="text-sm text-destructive">{logoutError}</p>
            ) : null}
        </Main>
    );
}
