import Link from 'next/link';
import { LockKeyhole, Mail } from 'lucide-react';
import { Button, Input } from '@frontend/design-system';
import type { ChangeEvent } from 'react';

type InputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;
type FormSubmitHandler = () => void;

type SignupInfoFormProps = {
    email: string;
    password: string;
    passwordConfirm: string;
    emailError?: string;
    passwordError?: string;
    passwordConfirmError?: string;
    loginPath: string;
    onEmailChange: InputChangeHandler;
    onPasswordChange: InputChangeHandler;
    onPasswordConfirmChange: InputChangeHandler;
    onSubmit: FormSubmitHandler;
};

export function SignupInfoForm({
    email,
    password,
    passwordConfirm,
    emailError,
    passwordError,
    passwordConfirmError,
    loginPath,
    onEmailChange,
    onPasswordChange,
    onPasswordConfirmChange,
    onSubmit,
}: SignupInfoFormProps) {
    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
            noValidate
        >
            <Input
                id="signup-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                label="이메일"
                value={email}
                onChange={onEmailChange}
                placeholder="you@example.com"
                startAdornment={<Mail size={18} />}
                error={emailError}
            />

            <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                label="비밀번호"
                value={password}
                onChange={onPasswordChange}
                placeholder="비밀번호를 입력해 주세요"
                startAdornment={<LockKeyhole size={18} />}
                error={passwordError}
            />

            <Input
                id="signup-password-confirm"
                type="password"
                autoComplete="new-password"
                label="비밀번호 확인"
                value={passwordConfirm}
                onChange={onPasswordConfirmChange}
                placeholder="비밀번호를 한 번 더 입력해 주세요"
                startAdornment={<LockKeyhole size={18} />}
                error={passwordConfirmError}
            />

            <Button type="submit" size="lg" fullWidth>
                다음 단계로
            </Button>

            <div className="text-center text-sm text-gray-500">
                이미 계정이 있나요?{' '}
                <Link
                    href={loginPath}
                    className="font-semibold text-brand-700 underline-offset-4 hover:underline"
                >
                    로그인
                </Link>
            </div>
        </form>
    );
}
