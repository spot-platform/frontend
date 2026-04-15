const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignupInfoValues = {
    email: string;
    password: string;
    passwordConfirm: string;
};

export type SignupFormErrors = {
    email?: string;
    password?: string;
    passwordConfirm?: string;
    verificationCode?: string;
    form?: string;
};

export function validateSignupInfo({
    email,
    password,
    passwordConfirm,
}: SignupInfoValues): SignupFormErrors {
    const errors: SignupFormErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
        errors.email = '이메일을 입력해 주세요.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
        errors.email = '이메일 형식을 확인해 주세요.';
    }

    if (!password) {
        errors.password = '비밀번호를 입력해 주세요.';
    }

    if (!passwordConfirm) {
        errors.passwordConfirm = '비밀번호를 한 번 더 입력해 주세요.';
    } else if (password !== passwordConfirm) {
        errors.passwordConfirm = '비밀번호가 일치하지 않아요.';
    }

    return errors;
}

export function validateVerificationCode(value: string): string | undefined {
    if (!value) {
        return '인증 코드를 입력해 주세요.';
    }

    if (!/^\d{6}$/.test(value)) {
        return '6자리 숫자 코드를 입력해 주세요.';
    }

    return undefined;
}
