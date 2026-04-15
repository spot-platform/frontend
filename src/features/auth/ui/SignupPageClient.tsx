'use client';

import { Section } from '@/shared/ui';
import { useSignupForm } from '../model/use-signup-form';
import { SignupHero } from './signup/SignupHero';
import { SignupInfoForm } from './signup/SignupInfoForm';
import { SignupStepIndicator } from './signup/SignupStepIndicator';
import { SignupVerificationForm } from './signup/SignupVerificationForm';

type SignupPageClientProps = {
    nextPath?: string;
};

export function SignupPageClient({ nextPath }: SignupPageClientProps) {
    const {
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
    } = useSignupForm({ nextPath });

    return (
        <div className="w-full">
            <Section
                gap="lg"
                className="rounded-xl border border-gray-200 bg-white p-6"
            >
                <SignupHero email={email} step={step} isComplete={isComplete} />

                <SignupStepIndicator currentStep={step} />

                {step === 'info' ? (
                    <SignupInfoForm
                        email={email}
                        password={password}
                        passwordConfirm={passwordConfirm}
                        emailError={errors.email}
                        passwordError={errors.password}
                        passwordConfirmError={errors.passwordConfirm}
                        loginPath={loginPath}
                        onEmailChange={handleEmailChange}
                        onPasswordChange={handlePasswordChange}
                        onPasswordConfirmChange={handlePasswordConfirmChange}
                        onSubmit={handleInfoSubmit}
                    />
                ) : (
                    <SignupVerificationForm
                        email={email}
                        verificationCode={verificationCode}
                        verificationCodeError={errors.verificationCode}
                        loginPath={loginPath}
                        isComplete={isComplete}
                        onBack={handleBackToInfo}
                        onChange={handleVerificationCodeChange}
                        onSubmit={handleVerificationSubmit}
                    />
                )}
            </Section>
        </div>
    );
}
