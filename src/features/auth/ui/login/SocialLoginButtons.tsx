import { SiGoogle, SiKakaotalk } from 'react-icons/si';

type SocialLoginButtonsProps = {
    kakaoHref: string;
    googleHref: string;
};

export function SocialLoginButtons({
    kakaoHref,
    googleHref,
}: SocialLoginButtonsProps) {
    return (
        <>
            <div className="relative flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-gray-300 uppercase">
                <span className="h-px flex-1 bg-gray-200" />
                or continue
                <span className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="relative grid gap-3">
                <a
                    href={kakaoHref}
                    className="flex h-12 items-center justify-center gap-3 rounded-2xl border border-[#F2D85B] bg-[#FEE500] px-4 text-sm font-semibold text-[#191919] transition hover:brightness-95"
                >
                    <SiKakaotalk size={18} />
                    카카오로 시작하기
                </a>
                <a
                    href={googleHref}
                    className="flex h-12 items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-brand-200 hover:bg-brand-50"
                >
                    <SiGoogle size={18} className="text-[#EA4335]" />
                    구글로 시작하기
                </a>
            </div>
        </>
    );
}
