// src/screens/ProfileScreen/ProfileScreenController.test.ts
import { ProfileScreenController } from './ProfileScreenController';
import { ProfileScreenModel } from './ProfileScreenModel';
import { ProfileScreenView } from './ProfileScreenView';

// Use manual mock factories so TS doesn't whine
const mockGetProfileWithRank = jest.fn();

jest.mock('./ProfileScreenModel', () => ({
  ProfileScreenModel: jest.fn().mockImplementation(() => ({
    getProfileWithRank: mockGetProfileWithRank,
  })),
}));

const mockRenderProfile = jest.fn();
const mockGetBackButton = jest.fn();

jest.mock('./ProfileScreenView', () => ({
  ProfileScreenView: jest.fn().mockImplementation(() => ({
    renderProfile: mockRenderProfile,
    getBackButton: mockGetBackButton,
  })),
}));

describe('ProfileScreenController', () => {
  let mockScreenManager: { switchTo: jest.Mock };
  let mockContainer: { getStage: jest.Mock };
  let mockStageDraw: jest.Mock;

  let mockBackButton: { on: jest.Mock };
  let clickHandler: ((e?: any) => void) | undefined;

  const mockProfileData = {
    id: 'user-id-123',
    displayName: 'Ashish',
    rank: 3,
    totalScore: 4200,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockStageDraw = jest.fn();
    mockContainer = {
      getStage: jest.fn(() => ({
        draw: mockStageDraw,
      })),
    };

    mockScreenManager = {
      switchTo: jest.fn(),
    };

    clickHandler = undefined;
    mockBackButton = {
      on: jest.fn((event: string, handler: (e: any) => void) => {
        if (event === 'click') {
          clickHandler = handler;
        }
      }),
    };

    mockGetBackButton.mockReturnValue(mockBackButton);
  });

  function createController(): ProfileScreenController {
    const controller = new ProfileScreenController(
      mockScreenManager as any // BaseScreen ctor takes only the screenManager
    );

    // Patch in our fake container so this.container.getStage() works
    (controller as any).container = mockContainer;

    return controller;
  }

  test('loads and renders profile data when user exists', async () => {
    mockGetProfileWithRank.mockResolvedValue(mockProfileData);

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const controller = createController();

    await (controller as any).loadProfile();

    expect(mockGetProfileWithRank).toHaveBeenCalledTimes(1);
    expect(mockRenderProfile).toHaveBeenCalledWith(mockProfileData);
    expect(mockContainer.getStage).toHaveBeenCalledTimes(1);
    expect(mockStageDraw).toHaveBeenCalledTimes(1);
    expect(mockScreenManager.switchTo).not.toHaveBeenCalledWith('login');

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test('redirects to login when no current user', async () => {
    mockGetProfileWithRank.mockResolvedValue(null);

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const controller = createController();

    await (controller as any).loadProfile();

    expect(mockGetProfileWithRank).toHaveBeenCalledTimes(1);
    expect(mockRenderProfile).not.toHaveBeenCalled();
    expect(mockContainer.getStage).not.toHaveBeenCalled();
    expect(mockStageDraw).not.toHaveBeenCalled();
    expect(mockScreenManager.switchTo).toHaveBeenCalledWith('login');

    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test('back button switches to menu screen', () => {
    const controller = createController();

    expect(mockGetBackButton).toHaveBeenCalledTimes(1);
    expect(mockBackButton.on).toHaveBeenCalledWith('click', expect.any(Function));

    expect(clickHandler).toBeDefined();
    clickHandler && clickHandler();

    expect(mockScreenManager.switchTo).toHaveBeenCalledWith('menu');
  });
});
