import { LeaderboardScreenController } from './LeaderboardScreenController';
import { LeaderboardScreenModel } from './LeaderboardScreenModel';
import { LeaderboardScreenView } from './LeaderboardScreenView';
import { getUserProfiles, getCurrentUser, getUserProfile } from '../../lib/supabase';

// Mock Supabase so Jest never touches import.meta.env in supabase.ts
jest.mock('../../lib/supabase', () => ({
  getUserProfiles: jest.fn(),
  getCurrentUser: jest.fn(),
  getUserProfile: jest.fn(),
}));

jest.mock('./LeaderboardScreenModel');
jest.mock('./LeaderboardScreenView');

const getLeaderboardMock = jest.fn();
const getCurrentUserMock = jest.fn();
const getUserProfileMock = jest.fn();

const displayLeaderboardMock = jest.fn();
const getReturnButtonMock = jest.fn();

// Wire our mocks into the auto-mocked classes
(LeaderboardScreenModel as jest.Mock).mockImplementation(() => ({
  getLeaderboard: getLeaderboardMock,
  getCurrentUser: getCurrentUserMock,
  getUserProfile: getUserProfileMock,
}));

(LeaderboardScreenView as jest.Mock).mockImplementation(() => ({
  displayLeaderboard: displayLeaderboardMock,
  getReturnButton: getReturnButtonMock,
}));

// Use setTimeout instead of setImmediate so it works in jsdom too
const flushPromises = () =>
  new Promise<void>(resolve => setTimeout(resolve, 0));

describe('LeaderboardScreenController', () => {
  let controller: LeaderboardScreenController;
  let mockScreenManager: { switchTo: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockScreenManager = { switchTo: jest.fn() } as any;
  });

  it('loads leaderboard data and displays it with current user in top results', async () => {
    const leaderboard: any[] = [
      { id: 'u1', display_name: 'Alice', high_score: 100, avatar_url: null },
      { id: 'u2', display_name: 'Bob', high_score: 80, avatar_url: null },
    ];
    const currentUserId = 'u1';

    getLeaderboardMock.mockResolvedValue(leaderboard);
    getCurrentUserMock.mockResolvedValue(currentUserId);
    getUserProfileMock.mockResolvedValue(null);

    const onMock = jest.fn();
    getReturnButtonMock.mockReturnValue({ on: onMock });

    controller = new LeaderboardScreenController(mockScreenManager as any);

    await flushPromises();

    expect(getLeaderboardMock).toHaveBeenCalledTimes(1);
    expect(getCurrentUserMock).toHaveBeenCalledTimes(1);
    expect(displayLeaderboardMock).toHaveBeenCalledWith(leaderboard, currentUserId);
  });

  it('adds current user to leaderboard if not in top list', async () => {
    const leaderboard: any[] = [
      { id: 'u1', display_name: 'Alice', high_score: 100, avatar_url: null },
      { id: 'u2', display_name: 'Bob', high_score: 80, avatar_url: null },
    ];
    const currentUserId = 'u3';
    const currentUserProfile: any = {
      id: 'u3',
      display_name: 'Charlie',
      high_score: 60,
      avatar_url: null,
    };

    getLeaderboardMock.mockResolvedValue(leaderboard);
    getCurrentUserMock.mockResolvedValue(currentUserId);
    getUserProfileMock.mockResolvedValue(currentUserProfile);

    const onMock = jest.fn();
    getReturnButtonMock.mockReturnValue({ on: onMock });

    controller = new LeaderboardScreenController(mockScreenManager as any);

    await flushPromises();

    const expectedFinal: any[] = [...leaderboard, currentUserProfile];

    expect(getLeaderboardMock).toHaveBeenCalledTimes(1);
    expect(getCurrentUserMock).toHaveBeenCalledTimes(1);
    expect(getUserProfileMock).toHaveBeenCalledWith(currentUserId);
    expect(displayLeaderboardMock).toHaveBeenCalledWith(expectedFinal, currentUserId);
  });

  it('handles case with no current user', async () => {
    const leaderboard: any[] = [
      { id: 'u1', display_name: 'Alice', high_score: 100, avatar_url: null },
    ];

    getLeaderboardMock.mockResolvedValue(leaderboard);
    getCurrentUserMock.mockResolvedValue(null);
    getUserProfileMock.mockResolvedValue(null);

    const onMock = jest.fn();
    getReturnButtonMock.mockReturnValue({ on: onMock });

    controller = new LeaderboardScreenController(mockScreenManager as any);

    await flushPromises();

    expect(displayLeaderboardMock).toHaveBeenCalledWith(leaderboard, null);
  });

  it('wires return button to navigate back to menu', async () => {
    const leaderboard: any[] = [];

    getLeaderboardMock.mockResolvedValue(leaderboard);
    getCurrentUserMock.mockResolvedValue(null);
    getUserProfileMock.mockResolvedValue(null);

    const onMock = jest.fn();
    getReturnButtonMock.mockReturnValue({ on: onMock });

    controller = new LeaderboardScreenController(mockScreenManager as any);

    await flushPromises();

    expect(onMock).toHaveBeenCalledTimes(1);
    expect(onMock).toHaveBeenCalledWith('click', expect.any(Function));

    const handler = onMock.mock.calls[0][1] as () => void;
    handler();

    expect(mockScreenManager.switchTo).toHaveBeenCalledWith('menu');
  });

  it('show calls BaseScreen show without crashing', async () => {
    const leaderboard: any[] = [];

    getLeaderboardMock.mockResolvedValue(leaderboard);
    getCurrentUserMock.mockResolvedValue(null);
    getUserProfileMock.mockResolvedValue(null);

    const onMock = jest.fn();
    getReturnButtonMock.mockReturnValue({ on: onMock });

    controller = new LeaderboardScreenController(mockScreenManager as any);

    // Inject a fake container with a visible() fn so BaseScreen.show works
    (controller as any).container = { visible: jest.fn() };

    expect(() => controller.show()).not.toThrow();
    expect((controller as any).container.visible).toHaveBeenCalledWith(true);
  });
});
