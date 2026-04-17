import Link from 'next/link';
import { IconHelpCircle, IconWallet } from '@tabler/icons-react';
import { Button } from '@frontend/design-system';
import { Section } from '@/shared/ui';
import { MySectionHeader } from './MySectionHeader';

type MySupportSectionProps = {
    email?: string;
};

export function MySupportSection({ email }: MySupportSectionProps) {
    return (
        <Section
            gap="md"
            className="rounded-xl border border-gray-200 bg-white p-4"
        >
            <MySectionHeader
                eyebrow="Support"
                title="계정과 알림을 차분하게 정리해 보세요"
                description={
                    email
                        ? `${email} 계정으로 이용 중이에요.`
                        : '프로필과 알림 설정은 언제든지 내 환경에 맞게 바꿀 수 있어요.'
                }
            />

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
                        <IconHelpCircle size={18} className="text-gray-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                        설정에서 관리 가능한 항목
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                        프로필 수정, 알림 기본값, 계정 관련 액션을 한 곳에서
                        확인할 수 있어요.
                    </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
                        <IconWallet size={18} className="text-gray-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                        다음에 확인하면 좋은 것
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                        북마크한 스팟과 최근 참여 내역을 함께 보면서 다음 액션을
                        빠르게 이어갈 수 있어요.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/my/settings" className="flex-1">
                    <Button
                        variant="ghost"
                        size="lg"
                        fullWidth
                        className="text-brand-900"
                    >
                        설정 열기
                    </Button>
                </Link>
                <Link href="/bookmarks" className="flex-1">
                    <Button variant="secondary" size="lg" fullWidth>
                        북마크 보기
                    </Button>
                </Link>
            </div>
        </Section>
    );
}
