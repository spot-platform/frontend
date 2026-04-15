'use client';

import { Section } from '@/shared/ui';
import { useLoginForm } from '../model/use-login-form';
import { DummyLoginCard } from './login/DummyLoginCard';
import { LoginCredentialsForm } from './login/LoginCredentialsForm';
import { LoginHero } from './login/LoginHero';
import { LoginSupportCard } from './login/LoginSupportCard';
import { SocialLoginButtons } from './login/SocialLoginButtons';

type LoginPageClientProps = {
    allowDummyLogin?: boolean;
    nextPath?: string;
};

export function LoginPageClient({
    allowDummyLogin = false,
    nextPath,
}: LoginPageClientProps) {
    const {
        email,
        password,
        errors,
        helpPath,
        signupPath,
        supportPath,
        oauthLinks,
        isPending,
        isDummyPending,
        handleEmailChange,
        handlePasswordChange,
        handleSubmit,
        handleDummyLogin,
    } = useLoginForm({ nextPath });

    return (
        <div className="w-full">
            <Section
                gap="lg"
                className="rounded-xl border border-gray-200 bg-white p-6"
            >
                <LoginHero />

                <LoginCredentialsForm
                    email={email}
                    password={password}
                    emailError={errors.email}
                    passwordError={errors.password}
                    formError={errors.form}
                    helpPath={helpPath}
                    isPending={isPending}
                    onEmailChange={handleEmailChange}
                    onPasswordChange={handlePasswordChange}
                    onSubmit={handleSubmit}
                />

                <SocialLoginButtons
                    kakaoHref={oauthLinks.kakao}
                    googleHref={oauthLinks.google}
                />

                {allowDummyLogin && (
                    <DummyLoginCard
                        isPending={isPending || isDummyPending}
                        onClick={handleDummyLogin}
                    />
                )}

                <LoginSupportCard
                    signupPath={signupPath}
                    supportPath={supportPath}
                />
            </Section>
        </div>
    );
}
