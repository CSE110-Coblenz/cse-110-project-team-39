import { ProfileScreenModel } from './ProfileScreenModel';
import { getUserProfiles, getCurrentUser, getUserProfile } from '../../lib/supabase';

jest.mock('../../lib/supabase', () => ({
  getUserProfiles: jest.fn(),
  getCurrentUser: jest.fn(),
  getUserProfile: jest.fn(),
}));

const mockedGetUserProfiles = getUserProfiles as jest.MockedFunction<typeof getUserProfiles>;
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockedGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;

describe('ProfileScreenModel', () => {
  let model: ProfileScreenModel;

  beforeEach(() => {
    jest.clearAllMocks();
    model = new ProfileScreenModel();
  });

  it('returns null when there is no current user', async () => {
    mockedGetCurrentUser.mockResolvedValue(null as any);

    const result = await model.getProfileWithRank();

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('returns profile data with username, email, score and rank when user is on leaderboard', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 'u2',
      email: 'player2@example.com',
    } as any);

    mockedGetUserProfile.mockResolvedValue({
      id: 'u2',
      profile_name: 'PlayerTwo',
      score: 150,
    } as any);

    const leaderboard: any[] = [
      { id: 'u1', profile_name: 'PlayerOne', score: 200 },
      { id: 'u2', profile_name: 'PlayerTwo', score: 150 },
      { id: 'u3', profile_name: 'PlayerThree', score: 100 },
    ];

    mockedGetUserProfiles.mockResolvedValue(leaderboard as any);

    const result = await model.getProfileWithRank();

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockedGetUserProfile).toHaveBeenCalledWith('u2');
    expect(mockedGetUserProfiles).toHaveBeenCalledTimes(1);

    expect(result).not.toBeNull();
    expect(result).toEqual({
      username: 'PlayerTwo',
      email: 'player2@example.com',
      maskedPassword: '********',
      score: 150,
      rank: 2, // second in sorted leaderboard
    });
  });

  it('falls back to email prefix when profile_name is empty', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 'u5',
      email: 'mystery@example.com',
    } as any);

    mockedGetUserProfile.mockResolvedValue({
      id: 'u5',
      profile_name: '',
      score: 50,
    } as any);

    mockedGetUserProfiles.mockResolvedValue([
      { id: 'u4', profile_name: 'Other', score: 80 },
      { id: 'u5', profile_name: '', score: 50 },
    ] as any);

    const result = await model.getProfileWithRank();

    expect(result).not.toBeNull();
    expect(result!.username).toBe('mystery');
    expect(result!.score).toBe(50);
    expect(result!.rank).toBe(2);
  });

  it('returns rank null when user is not on leaderboard but still returns score', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 'ux',
      email: 'lonely@example.com',
    } as any);

    mockedGetUserProfile.mockResolvedValue({
      id: 'ux',
      profile_name: 'LonelyPlayer',
      score: 75,
    } as any);

    mockedGetUserProfiles.mockResolvedValue([
      { id: 'u1', profile_name: 'A', score: 200 },
      { id: 'u2', profile_name: 'B', score: 100 },
    ] as any);

    const result = await model.getProfileWithRank();

    expect(result).not.toBeNull();
    expect(result!.username).toBe('LonelyPlayer');
    expect(result!.score).toBe(75);
    expect(result!.rank).toBeNull();
  });

  it('handles empty leaderboard and uses profile score with rank null', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 'u0',
      email: 'blank@example.com',
    } as any);

    mockedGetUserProfile.mockResolvedValue({
      id: 'u0',
      profile_name: 'Blank',
      score: 30,
    } as any);

    mockedGetUserProfiles.mockResolvedValue([] as any);

    const result = await model.getProfileWithRank();

    expect(result).not.toBeNull();
    expect(result!.username).toBe('Blank');
    expect(result!.score).toBe(30);
    expect(result!.rank).toBeNull();
  });
});
