import Link from 'next/link';

type LoginSupportCardProps = {
    signupPath: string;
    supportPath: string;
};

export function LoginSupportCard({
    signupPath,
    supportPath,
}: LoginSupportCardProps) {
    return (
        <div className="relative rounded-lg border border-brand-100 bg-brand-50/70 px-4 py-4 text-sm leading-6 text-gray-600">
            <span id="help" className="absolute -top-20" aria-hidden="true" />
            <span
                id="support"
                className="absolute -top-20"
                aria-hidden="true"
            />
            아직 계정이 없나요?{' '}
            <Link
                href={signupPath}
                className="font-semibold text-brand-700 underline-offset-4 hover:underline"
            >
                회원가입
            </Link>
            <span className="mx-2 text-brand-200">·</span>
            <Link
                href={supportPath}
                className="font-semibold text-brand-700 underline-offset-4 hover:underline"
            >
                도움이 필요해요
            </Link>
        </div>
    );
}
