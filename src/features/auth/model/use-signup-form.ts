'use client';

import { useMemo, useState, type ChangeEventHandler } from 'react';
import { getAuthPathWithNext } from './get-auth-path-with-next';
import {
    validateSignupInfo,
    validateVerificationCode,
    type SignupFormErrors,
} from './signup-validation';

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

    const handleInfoSubmit = () => {
        const nextErrors = validateSignupInfo({
            email,
            password,
            passwordConfirm,
        });

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setEmail(email.trim());
        setVerificationCode('');
        setErrors({});
        setIsComplete(false);
        setStep('verify');
    };

    const handleVerificationSubmit = () => {
        const verificationCodeError =
            validateVerificationCode(verificationCode);

        if (verificationCodeError) {
            setErrors({ verificationCode: verificationCodeError });
            return;
        }

        setErrors({});
        setIsComplete(true);
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
