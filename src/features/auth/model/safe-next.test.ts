import { describe, expect, it } from 'vitest';
import {
    pickSingleQueryValue,
    resolvePostLoginPath,
    sanitizeNextPath,
} from './safe-next';

describe('safe-next helpers', () => {
    it('keeps internal absolute paths', () => {
        expect(sanitizeNextPath('/feed?tab=home')).toBe('/feed?tab=home');
    });

    it('rejects external or malformed redirects', () => {
        expect(sanitizeNextPath('https://evil.example.com')).toBeNull();
        expect(sanitizeNextPath('//evil.example.com')).toBeNull();
        expect(sanitizeNextPath('/\\evil')).toBeNull();
    });

    it('normalizes invalid redirects to feed', () => {
        expect(resolvePostLoginPath(null)).toBe('/feed');
        expect(resolvePostLoginPath('https://evil.example.com')).toBe('/feed');
    });

    it('extracts a single query value safely', () => {
        expect(pickSingleQueryValue('one')).toBe('one');
        expect(pickSingleQueryValue(['first', 'second'])).toBe('first');
        expect(pickSingleQueryValue(undefined)).toBeNull();
    });
});
