'use client';

import { useMemo, useState, type ChangeEventHandler } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth-api';
import { getAuthPathWithNext } from './get-auth-path-with-next';
import { validateSignupInfo, type SignupFormErrors } from './signup-validation';

type SignupStep = 'info' | 'verify';

type UseSignupFormOptions = {
    nextPath?: string;
};

export function useSignupForm({ nextPath }: UseSignupFormOptions) {
    const [step, setStep] = useState<SignupStep>('info');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [errors, setErrors] = useState<SignupFormErrors>({});
    const [isComplete, setIsComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const loginPath = useMemo(
        () => getAuthPathWithNext('/login', nextPath),
        [nextPath],
    );

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
            passwordConfirm: undefined,
            form: undefined,
        }));
    };

    const handlePasswordConfirmChange: ChangeEventHandler<HTMLInputElement> = (
        event,
    ) => {
        setPasswordConfirm(event.target.value);
        setErrors((current) => ({
            ...current,
            passwordConfirm: undefined,
            form: undefined,
        }));
    };

    const handleVerificationCodeChange: ChangeEventHandler<HTMLInputElement> = (
        event,
    ) => {
        setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6));
        setErrors((current) => ({
            ...current,
            verificationCode: undefined,
            form: undefined,
        }));
    };

    const handleInfoSubmit = async () => {
        const nextErrors = validateSignupInfo({
            email,
            password,
            passwordConfirm,
        });

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        const trimmedEmail = email.trim();
        setIsSubmitting(true);

        try {
            const exists = await authApi.checkEmailExists(trimmedEmail);
            if (exists) {
                setErrors({ email: '이미 가입된 이메일이에요.' });
                return;
            }

            await authApi.signup({
                email: trimmedEmail,
                password,
                nickname:
                    trimmedEmail.split('@')[0].slice(0, 20) || 'spot-user',
            });

            setEmail(trimmedEmail);
            setVerificationCode('');
            setErrors({});
            setIsComplete(true);
            router.push(loginPath);
        } catch (error) {
            setErrors({
                form:
                    error instanceof Error
                        ? error.message
                        : '회원가입에 실패했어요.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerificationSubmit = async () => {
        await handleInfoSubmit();
    };

    const handleBackToInfo = () => {
        setErrors({});
        setVerificationCode('');
        setIsComplete(false);
        setStep('info');
    };

    return {
        step,
        email,
        password,
        passwordConfirm,
        verificationCode,
        errors,
        isComplete,
        isSubmitting,
        loginPath,
        handleEmailChange,
        handlePasswordChange,
        handlePasswordConfirmChange,
        handleVerificationCodeChange,
        handleInfoSubmit,
        handleVerificationSubmit,
        handleBackToInfo,
    };
}
