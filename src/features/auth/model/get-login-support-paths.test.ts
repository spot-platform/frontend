import { describe, expect, it } from 'vitest';
import { getLoginSupportPaths } from './get-login-support-paths';

describe('getLoginSupportPaths', () => {
    it('points signup support to the real signup route', () => {
        expect(getLoginSupportPaths().signupPath).toBe('/signup');
    });

    it('preserves next for login anchors and signup route', () => {
        expect(getLoginSupportPaths('/feed?tab=latest')).toEqual({
            helpPath: '/login?next=%2Ffeed%3Ftab%3Dlatest#help',
            signupPath: '/signup?next=%2Ffeed%3Ftab%3Dlatest',
            supportPath: '/login?next=%2Ffeed%3Ftab%3Dlatest#support',
        });
    });
});
