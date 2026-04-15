import { describe, expect, it } from 'vitest';
import {
    validateSignupInfo,
    validateVerificationCode,
} from './signup-validation';

describe('signup validation helpers', () => {
    it('validates required info fields and matching passwords', () => {
        expect(
            validateSignupInfo({
                email: '',
                password: '',
                passwordConfirm: '',
            }),
        ).toEqual({
            email: '이메일을 입력해 주세요.',
            password: '비밀번호를 입력해 주세요.',
            passwordConfirm: '비밀번호를 한 번 더 입력해 주세요.',
        });

        expect(
            validateSignupInfo({
                email: 'hello@example.com',
                password: 'secret123',
                passwordConfirm: 'secret456',
            }),
        ).toEqual({
            passwordConfirm: '비밀번호가 일치하지 않아요.',
        });
    });

    it('accepts a valid email and matching passwords', () => {
        expect(
            validateSignupInfo({
                email: ' hello@example.com ',
                password: 'secret123',
                passwordConfirm: 'secret123',
            }),
        ).toEqual({});
    });

    it('requires a six digit verification code', () => {
        expect(validateVerificationCode('')).toBe('인증 코드를 입력해 주세요.');
        expect(validateVerificationCode('12ab')).toBe(
            '6자리 숫자 코드를 입력해 주세요.',
        );
        expect(validateVerificationCode('123456')).toBeUndefined();
    });
});
