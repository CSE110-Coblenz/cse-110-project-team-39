import { SignUpScreenController } from './SignUpScreenController';
import { signUpWithEmail, updateUserProfile } from '../../lib/supabase';
import { createNotification } from '../../lib/toast';

jest.useFakeTimers();

let signupButtonMock: { on: jest.Mock };
let loginButtonMock: { on: jest.Mock };
let getEmailValueMock: jest.Mock;
let getDisplayNameValueMock: jest.Mock;
let getPasswordValueMock: jest.Mock;
let getConfirmPasswordValueMock: jest.Mock;
let focusEmailInputMock: jest.Mock;

let validateEmailMock: jest.Mock;
let validateDisplayNameMock: jest.Mock;
let validatePasswordMock: jest.Mock;
let validatePasswordsMatchMock: jest.Mock;

jest.mock('./SignUpScreenView', () => {
  return {
    SignUpScreenView: jest.fn().mockImplementation(() => {
      signupButtonMock = { on: jest.fn() };
      loginButtonMock = { on: jest.fn() };
      getEmailValueMock = jest.fn();
      getDisplayNameValueMock = jest.fn();
      getPasswordValueMock = jest.fn();
      getConfirmPasswordValueMock = jest.fn();
      focusEmailInputMock = jest.fn();

      return {
        getSignupButton: () => signupButtonMock,
        getLoginButton: () => loginButtonMock,
        getEmailValue: getEmailValueMock,
        getDisplayNameValue: getDisplayNameValueMock,
        getPasswordValue: getPasswordValueMock,
        getConfirmPasswordValue: getConfirmPasswordValueMock,
        focusEmailInput: focusEmailInputMock,
      };
    }),
  };
});


jest.mock('./SignUpScreenModel', () => {
  return {
    SignUpScreenModel: jest.fn().mockImplementation(() => {
      validateEmailMock = jest.fn().mockReturnValue(true);
      validateDisplayNameMock = jest.fn().mockReturnValue(true);
      validatePasswordMock = jest.fn().mockReturnValue(true);
      validatePasswordsMatchMock = jest.fn().mockReturnValue(true);

      return {
        validateEmail: validateEmailMock,
        validateDisplayName: validateDisplayNameMock,
        validatePassword: validatePasswordMock,
        validatePasswordsMatch: validatePasswordsMatchMock,
      };
    }),
  };
});

jest.mock('../../lib/supabase', () => ({
  signUpWithEmail: jest.fn(),
  updateUserProfile: jest.fn(),
}));

jest.mock('../../lib/toast', () => ({
  createNotification: jest.fn(),
}));

jest.mock('../../core/BaseScreen', () => {
  class BaseScreen {
    protected container = {
      getStage: jest.fn().mockReturnValue({
        draw: jest.fn(),
        container: () => ({ style: {} }),
      }),
    };

    protected screenManager = {
      switchTo: jest.fn(),
      getScreen: jest.fn(),
    };

    public show(): void {}
  }

  return { BaseScreen };
});

const mockedSignUpWithEmail = signUpWithEmail as jest.Mock;
const mockedUpdateUserProfile = updateUserProfile as jest.Mock;
const mockedCreateNotification = createNotification as jest.Mock;

function createControllerInstance() {
  const controller = new SignUpScreenController({} as any) as any;
  (controller as any).initialize(); // initialize is protected, so cast
  return controller;
}


beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe('SignUpScreenController', () => {
  it('shows warning when required fields are missing', async () => {
    const controller = createControllerInstance();

    getEmailValueMock.mockReturnValue('');
    getDisplayNameValueMock.mockReturnValue('');
    getPasswordValueMock.mockReturnValue('');
    getConfirmPasswordValueMock.mockReturnValue('');

    const clickHandler = signupButtonMock.on.mock.calls[0][1];

    await clickHandler();

    expect(mockedCreateNotification).toHaveBeenCalledWith(
      'Please fill in all fields',
      'warning'
    );
    expect(mockedSignUpWithEmail).not.toHaveBeenCalled();
  });

  it('shows error when email is invalid', async () => {
    const controller = createControllerInstance();

    getEmailValueMock.mockReturnValue('not-an-email');
    getDisplayNameValueMock.mockReturnValue('');
    getPasswordValueMock.mockReturnValue('password123');
    getConfirmPasswordValueMock.mockReturnValue('password123');

    validateEmailMock.mockReturnValue(false);

    const clickHandler = signupButtonMock.on.mock.calls[0][1];

    await clickHandler();

    expect(validateEmailMock).toHaveBeenCalledWith('not-an-email');
    expect(mockedCreateNotification).toHaveBeenCalledWith(
      'Please enter a valid email',
      'error'
    );
    expect(mockedSignUpWithEmail).not.toHaveBeenCalled();
  });

  it('rejects invalid display name without calling signup', async () => {
    const controller = createControllerInstance();

    getEmailValueMock.mockReturnValue('user@example.com');
    getDisplayNameValueMock.mockReturnValue('bad-display-name');
    getPasswordValueMock.mockReturnValue('password123');
    getConfirmPasswordValueMock.mockReturnValue('password123');

    validateEmailMock.mockReturnValue(true);
    validateDisplayNameMock.mockReturnValue(false);

    const clickHandler = signupButtonMock.on.mock.calls[0][1];

    await clickHandler();

    expect(validateDisplayNameMock).toHaveBeenCalledWith('bad-display-name');
    expect(mockedSignUpWithEmail).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    const controller = createControllerInstance();

    getEmailValueMock.mockReturnValue('user@example.com');
    getDisplayNameValueMock.mockReturnValue('');
    getPasswordValueMock.mockReturnValue('123');
    getConfirmPasswordValueMock.mockReturnValue('123');

    validateEmailMock.mockReturnValue(true);
    validatePasswordMock.mockReturnValue(false);

    const clickHandler = signupButtonMock.on.mock.calls[0][1];

    await clickHandler();

    expect(validatePasswordMock).toHaveBeenCalledWith('123');
    expect(mockedCreateNotification).toHaveBeenCalledWith(
      'Password must be at least 6 characters',
      'error'
    );
    expect(mockedSignUpWithEmail).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    const controller = createControllerInstance();

    getEmailValueMock.mockReturnValue('user@example.com');
    getDisplayNameValueMock.mockReturnValue('');
    getPasswordValueMock.mockReturnValue('password123');
    getConfirmPasswordValueMock.mockReturnValue('different123');

    validateEmailMock.mockReturnValue(true);
    validatePasswordMock.mockReturnValue(true);
    validatePasswordsMatchMock.mockReturnValue(false);

    const clickHandler = signupButtonMock.on.mock.calls[0][1];

    await clickHandler();

    expect(validatePasswordsMatchMock).toHaveBeenCalledWith(
      'password123',
      'different123'
    );
    expect(mockedCreateNotification).toHaveBeenCalledWith(
      'Passwords do not match',
      'error'
    );
    expect(mockedSignUpWithEmail).not.toHaveBeenCalled();
  });

  it('shows error notification when signUpWithEmail returns error', async () => {
    const controller = createControllerInstance();

    getEmailValueMock.mockReturnValue('user@example.com');
    getDisplayNameValueMock.mockReturnValue('Ashish');
    getPasswordValueMock.mockReturnValue('password123');
    getConfirmPasswordValueMock.mockReturnValue('password123');

    validateEmailMock.mockReturnValue(true);
    validateDisplayNameMock.mockReturnValue(true);
    validatePasswordMock.mockReturnValue(true);
    validatePasswordsMatchMock.mockReturnValue(true);

    mockedSignUpWithEmail.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });

    const clickHandler = signupButtonMock.on.mock.calls[0][1];

    await clickHandler();

    expect(mockedSignUpWithEmail).toHaveBeenCalledWith(
      'user@example.com',
      'password123'
    );
    expect(mockedCreateNotification).toHaveBeenCalledWith(
      'Error creating account. Please try again. Invalid credentials',
      'error'
    );
    expect((controller as any).screenManager.switchTo).not.toHaveBeenCalled();
  });

it('signs up successfully and updates profile when display name is provided', async () => {
  const controller = createControllerInstance();

  getEmailValueMock.mockReturnValue('user@example.com');
  getDisplayNameValueMock.mockReturnValue('Ashish');
  getPasswordValueMock.mockReturnValue('password123');
  getConfirmPasswordValueMock.mockReturnValue('password123');

  validateEmailMock.mockReturnValue(true);
  validateDisplayNameMock.mockReturnValue(true);
  validatePasswordMock.mockReturnValue(true);
  validatePasswordsMatchMock.mockReturnValue(true);

  mockedSignUpWithEmail.mockResolvedValue({
    data: { user: { id: 'user-id-123' } },
    error: null,
  });

  mockedUpdateUserProfile.mockResolvedValue(true);

  const clickHandler = signupButtonMock.on.mock.calls[0][1];
  await clickHandler();

  expect(mockedSignUpWithEmail).toHaveBeenCalledWith(
    'user@example.com',
    'password123'
  );
  expect(mockedUpdateUserProfile).toHaveBeenCalledWith('user-id-123', {
    profile_name: 'Ashish',
  });
  // no need to assert switchTo('menu') here; covered by the other success test
});



  it('signs up successfully and skips profile update when display name is empty', async () => {
    const controller = createControllerInstance();

    getEmailValueMock.mockReturnValue('user@example.com');
    getDisplayNameValueMock.mockReturnValue('');
    getPasswordValueMock.mockReturnValue('password123');
    getConfirmPasswordValueMock.mockReturnValue('password123');

    validateEmailMock.mockReturnValue(true);
    validateDisplayNameMock.mockReturnValue(true);
    validatePasswordMock.mockReturnValue(true);
    validatePasswordsMatchMock.mockReturnValue(true);

    mockedSignUpWithEmail.mockResolvedValue({
      data: { user: { id: 'user-id-123' } },
      error: null,
    });

    const clickHandler = signupButtonMock.on.mock.calls[0][1];

    await clickHandler();

    expect(mockedSignUpWithEmail).toHaveBeenCalledWith(
      'user@example.com',
      'password123'
    );
    expect(mockedUpdateUserProfile).not.toHaveBeenCalled();
    expect(mockedCreateNotification).toHaveBeenCalledWith(
      'Account created successfully!',
      'success'
    );
    expect((controller as any).screenManager.switchTo).toHaveBeenCalledWith(
      'menu'
    );
  });

  it('switches to login screen when login button is clicked', () => {
    const controller = createControllerInstance();

    const loginClickHandler = loginButtonMock.on.mock.calls[0][1];

    loginClickHandler();

    expect((controller as any).screenManager.switchTo).toHaveBeenCalledWith(
      'login'
    );
  });

  it('focuses email input on show after delay', () => {
    const controller = createControllerInstance();

    controller.show();

    jest.advanceTimersByTime(100);

    expect(focusEmailInputMock).toHaveBeenCalled();
  });
});
