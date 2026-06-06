'use client';

import { toast } from '@frontend/design-system';
import { SiGoogle, SiNaver } from 'react-icons/si';

type SocialLoginButtonsProps = {
    naverHref: string;
    googleHref: string;
};

function showBlockedOAuth() {
    toast.info('시연 중에는 소셜 로그인을 잠시 막아뒀어요.');
}

export function SocialLoginButtons(props: SocialLoginButtonsProps) {
    void props;

    return (
        <>
            <div className="relative flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-gray-300 uppercase">
                <span className="h-px flex-1 bg-gray-200" />
                or continue
                <span className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="relative grid gap-3">
                <button
                    type="button"
                    onClick={showBlockedOAuth}
                    className="flex h-12 items-center justify-center gap-3 rounded-2xl border border-[#03C75A] bg-[#03C75A] px-4 text-sm font-semibold text-white transition hover:brightness-95"
                >
                    <SiNaver size={18} />
                    네이버로 시작하기
                </button>
                <button
                    type="button"
                    onClick={showBlockedOAuth}
                    className="flex h-12 items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-brand-200 hover:bg-brand-50"
                >
                    <SiGoogle size={18} className="text-[#EA4335]" />
                    구글로 시작하기
                </button>
            </div>
        </>
    );
}
