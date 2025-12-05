import { getUserProfiles, getCurrentUser, getUserProfile } from '../../lib/supabase';
import type { Database } from '../../types/database';

export interface ProfileViewData {
  username: string;
  email: string;
  maskedPassword: string;
  score: number;
  rank: number | null;
}

// Use the actual table name from your Database type: user_profiles
type ProfileRow = Database['public']['Tables']['user_profiles']['Row'];

export class ProfileScreenModel {
  public async getProfileWithRank(): Promise<ProfileViewData | null> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return null;
    }

    const userId = currentUser.id;
    const email = currentUser.email ?? '';

    // Strongly typed profile + leaderboard
    const [profileRaw, leaderboardRaw] = await Promise.all([
      getUserProfile(userId) as Promise<ProfileRow | null>,
      getUserProfiles() as Promise<ProfileRow[] | null>,
    ]);

    const profile = profileRaw ?? null;
    const leaderboard = leaderboardRaw ?? [];

    let score = profile?.score ?? 0;
    let rank: number | null = null;

    if (leaderboard.length > 0) {
      // Sort by score descending
      const sorted = [...leaderboard].sort(
        (a, b) => (b.score ?? 0) - (a.score ?? 0)
      );

      const idx = sorted.findIndex(p => p.id === userId);
      if (idx >= 0) {
        rank = idx + 1;

        // If profile.score was null/0 but row in leaderboard has a score, use that
        if (!score) {
          const row = sorted[idx];
          if (row && typeof row.score === 'number') {
            score = row.score;
          }
        }
      }
    }

    const username =
      (profile?.profile_name && profile.profile_name.trim()) ||
      (email ? email.split('@')[0] : '') ||
      'Player';

    return {
      username,
      email,
      maskedPassword: '********', // still just a placeholder
      score,
      rank,
    };
  }
}
