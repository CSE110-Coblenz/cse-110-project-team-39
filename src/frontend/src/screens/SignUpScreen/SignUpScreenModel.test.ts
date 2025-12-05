// src/screens/SignUpScreen/SignUpScreenModel.test.ts
import { SignUpScreenModel } from './SignUpScreenModel';

describe('SignUpScreenModel', () => {
    let model: SignUpScreenModel;

    beforeEach(() => {
        model = new SignUpScreenModel();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('validateEmail', () => {
        it('returns true for a valid email', () => {
            expect(model.validateEmail('test@example.com')).toBe(true);
            expect(model.validateEmail('user.name+tag@sub.domain.co.uk')).toBe(true);
        });

        it('returns false for an invalid email', () => {
            expect(model.validateEmail('invalid-email')).toBe(false);
            expect(model.validateEmail('no-at-symbol.com')).toBe(false);
            expect(model.validateEmail('user@')).toBe(false);
            expect(model.validateEmail('user@domain')).toBe(false);
            expect(model.validateEmail('user@domain.')).toBe(false);
            expect(model.validateEmail('user @domain.com')).toBe(false);
        });
    });

    describe('validateDisplayName', () => {
        it('returns true for an empty display name (optional field)', () => {
            expect(model.validateDisplayName('')).toBe(true);
            expect(model.validateDisplayName('   ')).toBe(true);
        });

        it('returns false when display name exceeds 30 characters', () => {
            const longName = 'a'.repeat(31);
            expect(model.validateDisplayName(longName)).toBe(false);
        });

        it('returns true for allowed characters', () => {
            expect(model.validateDisplayName('Ashish')).toBe(true);
            expect(model.validateDisplayName('Ashish_123')).toBe(true);
            expect(model.validateDisplayName('Ashish-User.Name')).toBe(true);
            expect(model.validateDisplayName('Ashish User 01')).toBe(true);
        });

        it('returns false for disallowed characters', () => {
            expect(model.validateDisplayName('Ashish!')).toBe(false);
            expect(model.validateDisplayName('Ashish@User')).toBe(false);
            expect(model.validateDisplayName('Ashish#User')).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('returns true when password length is at least 6', () => {
            expect(model.validatePassword('123456')).toBe(true);
            expect(model.validatePassword('password')).toBe(true);
        });

        it('returns false when password length is less than 6', () => {
            expect(model.validatePassword('')).toBe(false);
            expect(model.validatePassword('123')).toBe(false);
            expect(model.validatePassword('12345')).toBe(false);
        });
    });

    describe('validatePasswordsMatch', () => {
        it('returns true when passwords match', () => {
            expect(model.validatePasswordsMatch('secret123', 'secret123')).toBe(true);
        });

        it('returns false when passwords do not match', () => {
            expect(model.validatePasswordsMatch('secret123', 'secret124')).toBe(false);
        });
    });

    describe('displayName getter and setter', () => {
        it('sets and gets displayName correctly', () => {
            expect(model.getDisplayName()).toBe('');
            model.setDisplayName('Ashish');
            expect(model.getDisplayName()).toBe('Ashish');
        });
    });

    describe('signup', () => {
        it('sets loading state during signup and resolves true', async () => {
            const promise = model.signup('test@example.com', 'password123');

            expect(model.getIsLoading()).toBe(true);

            jest.runAllTimers();

            await expect(promise).resolves.toBe(true);
            expect(model.getIsLoading()).toBe(false);
        });
    });
});
