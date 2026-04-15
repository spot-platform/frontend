import Link from 'next/link';
import { LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { Button, Input } from '@frontend/design-system';
import type { ChangeEvent, FormEvent } from 'react';

type InputChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;
type FormSubmitHandler = (event: FormEvent<HTMLFormElement>) => void;

type LoginCredentialsFormProps = {
    email: string;
    password: string;
    emailError?: string;
    passwordError?: string;
    formError?: string;
    helpPath: string;
    isPending: boolean;
    onEmailChange: InputChangeHandler;
    onPasswordChange: InputChangeHandler;
    onSubmit: FormSubmitHandler;
};

export function LoginCredentialsForm({
    email,
    password,
    emailError,
    passwordError,
    formError,
    helpPath,
    isPending,
    onEmailChange,
    onPasswordChange,
    onSubmit,
}: LoginCredentialsFormProps) {
    return (
        <form
            className="relative flex flex-col gap-4"
            onSubmit={onSubmit}
            noValidate
        >
            <Input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                label="이메일"
                value={email}
                onChange={onEmailChange}
                placeholder="you@example.com"
                startAdornment={<Mail size={18} />}
                error={emailError}
                disabled={isPending}
            />

            <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                label="비밀번호"
                value={password}
                onChange={onPasswordChange}
                placeholder="비밀번호를 입력해 주세요"
                startAdornment={<LockKeyhole size={18} />}
                error={passwordError}
                disabled={isPending}
            />

            <div className="flex items-center justify-end gap-3 text-xs text-gray-500">
                <Link
                    href={helpPath}
                    className="font-semibold text-brand-700 underline-offset-4 hover:underline"
                >
                    비밀번호를 잊으셨나요?
                </Link>
            </div>

            {formError && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {formError}
                </div>
            )}

            <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={isPending}
                startIcon={
                    isPending ? (
                        <LoaderCircle size={18} className="animate-spin" />
                    ) : undefined
                }
            >
                로그인
            </Button>
        </form>
    );
}
