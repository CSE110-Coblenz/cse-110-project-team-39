import { ProfileScreenController } from './ProfileScreenController';
import { ProfileScreenModel } from './ProfileScreenModel';
import { ProfileScreenView } from './ProfileScreenView';

// Block import.meta.env in supabase.ts via model imports
jest.mock('../../lib/supabase', () => ({
  getUserProfiles: jest.fn(),
  getCurrentUser: jest.fn(),
  getUserProfile: jest.fn(),
}));

jest.mock('./ProfileScreenModel');
jest.mock('./ProfileScreenView');

const getProfileWithRankMock = jest.fn();
const renderProfileMock = jest.fn();
const getBackButtonMock = jest.fn();

// Wire model + view mocks
(ProfileScreenModel as jest.Mock).mockImplementation(() => ({
  getProfileWithRank: getProfileWithRankMock,
}));

(ProfileScreenView as jest.Mock).mockImplementation(() => ({
  renderProfile: renderProfileMock,
  getBackButton: getBackButtonMock,
}));

const flushPromises = () =>
  new Promise<void>(resolve => setTimeout(resolve, 0));

describe('ProfileScreenController', () => {
  let controller: ProfileScreenController;
  let mockScreenManager: { switchTo: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockScreenManager = { switchTo: jest.fn() } as any;
  });

  it('loads profile data and renders it when model returns data', async () => {
    const profileData = {
      username: 'PlayerTwo',
      email: 'player2@example.com',
      maskedPassword: '********',
      score: 150,
      rank: 2,
    };

    getProfileWithRankMock.mockResolvedValue(profileData);

    const onMock = jest.fn();
    getBackButtonMock.mockReturnValue({ on: onMock });

    controller = new ProfileScreenController(mockScreenManager as any);

    await flushPromises();

    expect(getProfileWithRankMock).toHaveBeenCalledTimes(1);
    expect(renderProfileMock).toHaveBeenCalledWith(profileData);
  });

  it('does not render profile when model returns null (no current user)', async () => {
    getProfileWithRankMock.mockResolvedValue(null);

    const onMock = jest.fn();
    getBackButtonMock.mockReturnValue({ on: onMock });

    controller = new ProfileScreenController(mockScreenManager as any);

    await flushPromises();

    expect(getProfileWithRankMock).toHaveBeenCalledTimes(1);
    expect(renderProfileMock).not.toHaveBeenCalled();
  });

  it('wires back button to navigate to menu', async () => {
    getProfileWithRankMock.mockResolvedValue({
      username: 'Player',
      email: 'player@example.com',
      maskedPassword: '********',
      score: 100,
      rank: 1,
    });

    const onMock = jest.fn();
    getBackButtonMock.mockReturnValue({ on: onMock });

    controller = new ProfileScreenController(mockScreenManager as any);

    await flushPromises();

    expect(onMock).toHaveBeenCalledWith('click', expect.any(Function));

    const handler = onMock.mock.calls[0][1] as () => void;
    handler();

    expect(mockScreenManager.switchTo).toHaveBeenCalledWith('menu');
  });

  it('show calls BaseScreen.show and sets container visible', async () => {
    getProfileWithRankMock.mockResolvedValue({
      username: 'Player',
      email: 'player@example.com',
      maskedPassword: '********',
      score: 100,
      rank: 1,
    });

    const onMock = jest.fn();
    getBackButtonMock.mockReturnValue({ on: onMock });

    controller = new ProfileScreenController(mockScreenManager as any);

    // Inject fake container so BaseScreen.show() doesn't crash
    (controller as any).container = { visible: jest.fn() };

    expect(() => controller.show()).not.toThrow();
    expect((controller as any).container.visible).toHaveBeenCalledWith(true);
  });
});
