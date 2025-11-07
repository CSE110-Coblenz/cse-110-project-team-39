import { getUserProfiles, getCurrentUser } from '../../lib/supabase';
import { Database } from '../../types/database';

export class LeaderboardScreenModel {
    private isLoading: boolean = false;
    
    public async getLeaderboard(): Promise<Array<Database['public']['Tables']['user_profiles']['Row']>> {
    this.isLoading = true;
        const userProfiles = await getUserProfiles();
        if (!userProfiles) {
            return [];
        }
        return userProfiles;
    }
    
    public getIsLoading(): boolean {
        return this.isLoading;
    }
}