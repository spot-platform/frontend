import Link from 'next/link';
import { ArrowLeft, BadgeCheck, KeyRound } from 'lucide-react';
import { Button, Input } from '@frontend/design-system';
import type { ChangeEvent } from 'react';

type InputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;
type FormSubmitHandler = () => void;

type SignupVerificationFormProps = {
    email: string;
    verificationCode: string;
    verificationCodeError?: string;
    loginPath: string;
    isComplete: boolean;
    onBack: () => void;
    onChange: InputChangeHandler;
    onSubmit: FormSubmitHandler;
};

export function SignupVerificationForm({
    email,
    verificationCode,
    verificationCodeError,
    loginPath,
    isComplete,
    onBack,
    onChange,
    onSubmit,
}: SignupVerificationFormProps) {
    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
            noValidate
        >
            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-sm leading-6 text-gray-600">
                <span className="font-semibold text-gray-900">{email}</span>{' '}
                기준으로 6자리 코드 입력 UI를 확인해 보세요. 실제 메일 발송은
                아직 연결되지 않았어요.
            </div>

            <Input
                id="signup-verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                label="확인 코드"
                value={verificationCode}
                onChange={onChange}
                placeholder="6자리 숫자"
                startAdornment={<KeyRound size={18} />}
                error={verificationCodeError}
                hint="현재는 코드 형식만 확인해요."
                disabled={isComplete}
                className="text-center tracking-[0.3em]"
            />

            {isComplete && (
                <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <div className="flex items-start gap-2">
                        <BadgeCheck size={18} className="mt-0.5 shrink-0" />
                        <div>
                            코드 입력 형식만 확인했어요. 실제 가입 완료는 인증
                            API가 연결된 뒤 이어질 수 있어요.
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={onBack}
                    disabled={isComplete}
                    startIcon={<ArrowLeft size={18} />}
                    className="flex-1"
                >
                    이전 단계
                </Button>
                <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    disabled={isComplete}
                >
                    코드 형식 확인
                </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
                로그인 화면으로 돌아가시겠어요?{' '}
                <Link
                    href={loginPath}
                    className="font-semibold text-brand-700 underline-offset-4 hover:underline"
                >
                    로그인으로 이동
                </Link>
            </div>
        </form>
    );
}
