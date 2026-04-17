'use client';

import {
    useMemo,
    useState,
    type ChangeEventHandler,
    type FormEventHandler,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/model/auth-store';
import { authApi } from '../api/auth-api';
import { getLoginSupportPaths } from './get-login-support-paths';
import { resolvePostLoginPath } from './safe-next';
import type { LoginResult } from './types';
import { useDummyLoginMutation, useLoginMutation } from './use-login';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginFormErrors = {
    email?: string;
    password?: string;
    form?: string;
};

type UseLoginFormOptions = {
    nextPath?: string;
};

export function useLoginForm({ nextPath }: UseLoginFormOptions) {
    const router = useRouter();
    const setToken = useAuthStore((state) => state.setToken);
    const loginMutation = useLoginMutation();
    const dummyLoginMutation = useDummyLoginMutation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<LoginFormErrors>({});

    const redirectPath = resolvePostLoginPath(nextPath);
    const { helpPath, signupPath, supportPath } = useMemo(
        () => getLoginSupportPaths(nextPath),
        [nextPath],
    );
    const oauthLinks = useMemo(
        () => ({
            kakao: authApi.oauthStartPath('kakao', nextPath),
            google: authApi.oauthStartPath('google', nextPath),
        }),
        [nextPath],
    );

    const isPending = loginMutation.isPending || dummyLoginMutation.isPending;

    const handleLoginSuccess = (result: LoginResult) => {
        setToken(result.accessToken, result.userId);
        const hasCompletedOnboarding =
            useAuthStore.getState().hasCompletedOnboarding;
        const destination = hasCompletedOnboarding
            ? resolvePostLoginPath(result.redirectTo || redirectPath)
            : '/onboarding';
        router.replace(destination);
        router.refresh();
    };

    const handleEmailChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        setEmail(event.target.value);
        setErrors((current) => ({
            ...current,
            email: undefined,
            form: undefined,
        }));
    };

    const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = (
        event,
    ) => {
        setPassword(event.target.value);
        setErrors((current) => ({
            ...current,
            password: undefined,
            form: undefined,
        }));
    };

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        const trimmedEmail = email.trim();
        const nextErrors: LoginFormErrors = {};

        if (!trimmedEmail) {
            nextErrors.email = '이메일을 입력해 주세요.';
        } else if (!EMAIL_REGEX.test(trimmedEmail)) {
            nextErrors.email = '이메일 형식을 확인해 주세요.';
        }

        if (!password) {
            nextErrors.password = '비밀번호를 입력해 주세요.';
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setErrors({});

        try {
            const result = await loginMutation.mutateAsync({
                email: trimmedEmail,
                password,
                next: nextPath ?? undefined,
            });

            handleLoginSuccess(result);
        } catch (error) {
            setErrors({
                form:
                    error instanceof Error
                        ? error.message
                        : '로그인에 실패했어요. 다시 시도해 주세요.',
            });
        }
    };

    const handleDummyLogin = async () => {
        setErrors({});

        try {
            const result = await dummyLoginMutation.mutateAsync(nextPath);
            handleLoginSuccess(result);
        } catch (error) {
            setErrors({
                form:
                    error instanceof Error
                        ? error.message
                        : '더미 로그인에 실패했어요. 다시 시도해 주세요.',
            });
        }
    };

    return {
        email,
        password,
        errors,
        helpPath,
        signupPath,
        supportPath,
        oauthLinks,
        isPending,
        isDummyPending: dummyLoginMutation.isPending,
        handleEmailChange,
        handlePasswordChange,
        handleSubmit,
        handleDummyLogin,
    };
}
