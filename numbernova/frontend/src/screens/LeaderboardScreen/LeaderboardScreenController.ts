import Konva from 'konva';
import { LeaderboardScreenView } from './LeaderboardScreenView';
import { LeaderboardScreenModel } from './LeaderboardScreenModel';
import { BaseScreen } from '../../core/BaseScreen';

export class LeaderboardScreenController extends BaseScreen {
    private view: LeaderboardScreenView;
    private model: LeaderboardScreenModel;

    protected initialize(): void {
        this.model = new LeaderboardScreenModel();
        this.view = new LeaderboardScreenView(this.container);

        this.setupEventListeners();
        this.loadLeaderboardData();
    }

    private async loadLeaderboardData(): Promise<void> {
        try {
            console.log('Loading leaderboard data...');
            
            // ACTUALLY LOAD THE DATA NOW
            const leaderboard = await this.model.getLeaderboard();
            const currentUserId = await this.model.getCurrentUser();
            
            console.log('Leaderboard data:', leaderboard);
            console.log('Current user ID:', currentUserId);
            
            // Check if user is in top 10 and add them if not
            let finalLeaderboard = [...leaderboard];
            
            if (currentUserId) {
                const userInTop = leaderboard.some(user => user.id === currentUserId);
                if (!userInTop) {
                    const currentUserProfile = await this.model.getUserProfile(currentUserId);
                    if (currentUserProfile) {
                        finalLeaderboard.push(currentUserProfile);
                    }
                }
            }
            
            this.view.displayLeaderboard(finalLeaderboard, currentUserId);
            console.log('LeaderboardScreen loaded successfully!');
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }

    private setupEventListeners(): void {
        // Handle return/back button
        this.view.getReturnButton()?.on('click', () => {
            this.screenManager.switchTo('menu');
        });
    }

    public async show(): Promise<void> {
        super.show();
        // Reload leaderboard data every time screen is shown to reflect updated stats
        await this.loadLeaderboardData();
    }
}