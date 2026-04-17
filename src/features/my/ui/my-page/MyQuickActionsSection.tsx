import Link from 'next/link';
import {
    IconBookmark,
    IconChevronRight,
    IconMapPinFilled,
    IconSettings,
} from '@tabler/icons-react';
import { Section } from '@/shared/ui';
import { MySectionHeader } from './MySectionHeader';

const QUICK_ACTIONS = [
    {
        href: '/my/settings',
        label: '설정',
        description: '프로필과 계정 환경을 관리해요.',
        icon: IconSettings,
    },
    {
        href: '/bookmarks',
        label: '북마크',
        description: '저장해 둔 스팟을 다시 확인해요.',
        icon: IconBookmark,
    },
    {
        href: '/spot',
        label: '참여 관리',
        description: '진행 중인 스팟과 최근 활동을 이어서 봐요.',
        icon: IconMapPinFilled,
    },
] as const;

export function MyQuickActionsSection() {
    return (
        <Section
            gap="md"
            className="rounded-xl border border-gray-200 bg-white p-4"
        >
            <MySectionHeader
                eyebrow="Quick access"
                title="자주 쓰는 메뉴"
                description="바로 이동할 수 있는 핵심 동선을 모아뒀어요."
            />
            <div className="grid gap-3">
                {QUICK_ACTIONS.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-surface px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50"
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-brand-700">
                                <Icon size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                    {item.label}
                                </p>
                                <p className="text-xs leading-5 text-gray-500">
                                    {item.description}
                                </p>
                            </div>
                            <IconChevronRight
                                size={18}
                                className="shrink-0 text-gray-300"
                            />
                        </Link>
                    );
                })}
            </div>
        </Section>
    );
}
