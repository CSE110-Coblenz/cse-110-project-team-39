import { LoginScreenController } from './LoginScreenController';
import { LoginScreenView } from './LoginScreenView';
import { LoginScreenModel } from './LoginScreenModel';
import { signInWithEmail } from '../../lib/supabase';
import { createNotification } from '../../lib/toast';

// Mock Supabase so Jest never evaluates import.meta.env inside supabase.ts
jest.mock('../../lib/supabase', () => ({
  signInWithEmail: jest.fn(),
}));

// Mock toast notifications
jest.mock('../../lib/toast', () => ({
  createNotification: jest.fn(),
}));

// Mock view + model
jest.mock('./LoginScreenView');
jest.mock('./LoginScreenModel');

const signInWithEmailMock =
  signInWithEmail as jest.MockedFunction<typeof signInWithEmail>;
const createNotificationMock =
  createNotification as jest.MockedFunction<typeof createNotification>;

const getEmailValueMock = jest.fn();
const getPasswordValueMock = jest.fn();
const getLoginButtonMock = jest.fn();
const getCreateAccountButtonMock = jest.fn();

(LoginScreenView as jest.Mock).mockImplementation(() => ({
  getEmailValue: getEmailValueMock,
  getPasswordValue: getPasswordValueMock,
  getLoginButton: getLoginButtonMock,
  getCreateAccountButton: getCreateAccountButtonMock,
}));

describe('LoginScreenController', () => {
  let controller: LoginScreenController;
  let mockScreenManager: { switchTo: jest.Mock };
  let loginButtonOnMock: jest.Mock;
  let createAccountButtonOnMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockScreenManager = { switchTo: jest.fn() } as any;

    loginButtonOnMock = jest.fn();
    createAccountButtonOnMock = jest.fn();

    getLoginButtonMock.mockReturnValue({
      on: loginButtonOnMock,
    });

    getCreateAccountButtonMock.mockReturnValue({
      on: createAccountButtonOnMock,
    });

    controller = new LoginScreenController(mockScreenManager as any);
  });

  it('calls signInWithEmail and navigates to menu on successful login', async () => {
    getEmailValueMock.mockReturnValue('test@example.com');
    getPasswordValueMock.mockReturnValue('password123');

    signInWithEmailMock.mockResolvedValue({
      data: { user: { id: 'user-id-1' } },
      error: null,
    } as any);

    await (controller as any).handleLogin();

    expect(signInWithEmailMock).toHaveBeenCalledWith(
      'test@example.com',
      'password123'
    );
    expect(mockScreenManager.switchTo).toHaveBeenCalledWith('menu');
    expect(createNotificationMock).toHaveBeenCalledWith(
      'Login successful!',
      'success'
    );
  });

  it('shows error notification and does not navigate on failed login', async () => {
    getEmailValueMock.mockReturnValue('test@example.com');
    getPasswordValueMock.mockReturnValue('wrongpw');

    signInWithEmailMock.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    } as any);

    await (controller as any).handleLogin();

    expect(signInWithEmailMock).toHaveBeenCalledWith(
      'test@example.com',
      'wrongpw'
    );
    expect(mockScreenManager.switchTo).not.toHaveBeenCalled();
    expect(createNotificationMock).toHaveBeenCalledWith(
      'Invalid email or password',
      'error'
    );
  });

  it('wires login button click to handleLogin', async () => {
    expect(loginButtonOnMock).toHaveBeenCalledWith(
      'click',
      expect.any(Function)
    );

    getEmailValueMock.mockReturnValue('clicktest@example.com');
    getPasswordValueMock.mockReturnValue('clickpw');

    signInWithEmailMock.mockResolvedValue({
      data: { user: { id: 'user-id-click' } },
      error: null,
    } as any);

    const handler = loginButtonOnMock.mock.calls[0][1] as () => Promise<void>;
    await handler();

    expect(signInWithEmailMock).toHaveBeenCalledWith(
      'clicktest@example.com',
      'clickpw'
    );
    expect(mockScreenManager.switchTo).toHaveBeenCalledWith('menu');
  });

  it('wires create account button to navigate to signup screen', () => {
    expect(createAccountButtonOnMock).toHaveBeenCalledWith(
      'click',
      expect.any(Function)
    );

    const handler =
      createAccountButtonOnMock.mock.calls[0][1] as () => void;
    handler();

    expect(mockScreenManager.switchTo).toHaveBeenCalledWith('signup');
  });
});
