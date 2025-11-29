import { LoginScreenModel } from './LoginScreenModel';

describe('LoginScreenModel', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('sets loading true during login and false after resolve', async () => {
        const model = new LoginScreenModel();

        expect(model.getIsLoading()).toBe(false);

        const loginPromise = model.login('test@example.com', 'password123');

        expect(model.getIsLoading()).toBe(true);

        jest.runAllTimers();
        const result = await loginPromise;

        expect(result).toBe(true);
        expect(model.getIsLoading()).toBe(false);
    });

    it('handles multiple logins sequentially', async () => {
        const model = new LoginScreenModel();

        const firstLogin = model.login('a@a.com', 'pass1');
        expect(model.getIsLoading()).toBe(true);

        jest.runOnlyPendingTimers();
        await firstLogin;
        expect(model.getIsLoading()).toBe(false);

        const secondLogin = model.login('b@b.com', 'pass2');
        expect(model.getIsLoading()).toBe(true);

        jest.runOnlyPendingTimers();
        await secondLogin;
        expect(model.getIsLoading()).toBe(false);
    });
});
