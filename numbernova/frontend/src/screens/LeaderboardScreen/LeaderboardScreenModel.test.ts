import { LeaderboardScreenModel } from './LeaderboardScreenModel';
import { getUserProfiles, getCurrentUser, getUserProfile } from '../../lib/supabase';

jest.mock('../../lib/supabase', () => ({
  getUserProfiles: jest.fn(),
  getCurrentUser: jest.fn(),
  getUserProfile: jest.fn(),
}));

const mockedGetUserProfiles = getUserProfiles as jest.MockedFunction<typeof getUserProfiles>;
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockedGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;

describe('LeaderboardScreenModel', () => {
  let model: LeaderboardScreenModel;

  beforeEach(() => {
    jest.clearAllMocks();
    model = new LeaderboardScreenModel();
  });

  it('returns leaderboard data and updates loading state', async () => {
    const profiles: any[] = [
      { id: 'u1', display_name: 'Alice', high_score: 100, avatar_url: null },
      { id: 'u2', display_name: 'Bob', high_score: 80, avatar_url: null },
    ];

    mockedGetUserProfiles.mockResolvedValue(profiles as any);

    const result = await model.getLeaderboard();

    expect(mockedGetUserProfiles).toHaveBeenCalledTimes(1);
    expect(result).toEqual(profiles);
    expect(model.getIsLoading()).toBe(false);
  });

  it('returns empty array when no profiles are found', async () => {
    mockedGetUserProfiles.mockResolvedValue(null as any);

    const result = await model.getLeaderboard();

    expect(mockedGetUserProfiles).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
    expect(model.getIsLoading()).toBe(false);
  });

  it('returns user profile when found', async () => {
    const profile: any = {
      id: 'u1',
      display_name: 'Alice',
      high_score: 100,
      avatar_url: null,
    };

    mockedGetUserProfile.mockResolvedValue(profile as any);

    const result = await model.getUserProfile('u1');

    expect(mockedGetUserProfile).toHaveBeenCalledWith('u1');
    expect(result).toEqual(profile);
  });

  it('returns null when user profile is not found', async () => {
    mockedGetUserProfile.mockResolvedValue(null as any);

    const result = await model.getUserProfile('u-missing');

    expect(mockedGetUserProfile).toHaveBeenCalledWith('u-missing');
    expect(result).toBeNull();
  });

  it('returns current user id when logged in', async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: 'u1' } as any);

    const result = await model.getCurrentUser();

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(result).toBe('u1');
  });

  it('returns null when no current user', async () => {
    mockedGetCurrentUser.mockResolvedValue(null as any);

    const result = await model.getCurrentUser();

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});
