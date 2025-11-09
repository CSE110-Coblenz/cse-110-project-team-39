import { getUserProfiles, getCurrentUser, getUserProfile } from '../../lib/supabase';
import { Database } from '../../types/database';
import { UserProfile } from '../../types/UserProfile';

export class LeaderboardScreenModel {
    private isLoading: boolean = false;
    
    public async getLeaderboard(): Promise<Array<UserProfile>> {
        this.isLoading = true;
        const userProfiles = await getUserProfiles();
        this.isLoading = false;
        if (!userProfiles) {
            return [];
        }
        return userProfiles;
    }

    public async getUserProfile(userId: string): Promise<UserProfile | null> {
        const userProfile = await getUserProfile(userId);
        if (!userProfile) {
            return null;
        }
        return userProfile;
    }

    public async getCurrentUser(): Promise<string | null> {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return null;
        }
        return currentUser.id;
    }
    
    public getIsLoading(): boolean {
        return this.isLoading;
    }
}