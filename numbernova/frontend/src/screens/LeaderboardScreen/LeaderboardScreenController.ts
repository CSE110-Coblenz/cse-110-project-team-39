import Konva from 'konva';
import { LeaderboardScreenView } from './LeaderboardScreenView';
import { LeaderboardScreenModel } from './LeaderboardScreenModel';
import { MenuScreenController } from '../MenuScreen/MenuScreenController';

export class LeaderboardScreenController {
    private layer: Konva.Layer;
    private view: LeaderboardScreenView;
    private model: LeaderboardScreenModel;

    constructor(layer: Konva.Layer) {
        this.layer = layer;
        this.model = new LeaderboardScreenModel();
        this.view = new LeaderboardScreenView(layer);

        this.initialize();
        this.setupEventListeners();
    }

    private async initialize(): Promise<void> {
        try {
            // Fetch leaderboard data
            const leaderboard = await this.model.getLeaderboard();

            // Get current user ID
            const currentUserId = await this.model.getCurrentUser();

            // Check if user is in top 10 and fetch their data if not
            let finalLeaderboard = [...leaderboard];

            if (currentUserId) {
                const userInTop10 = leaderboard.some(user => user.id === currentUserId);

                if (!userInTop10) {
                    // Fetch the current user's profile to add at the bottom
                    const currentUserProfile = await this.model.getUserProfile(currentUserId);
                    if (currentUserProfile) {
                        // The user's rank should be set by the backend
                        // We'll add them as the 11th entry
                        finalLeaderboard.push(currentUserProfile);
                    }
                }
            }

            // Display the leaderboard
            this.view.displayLeaderboard(finalLeaderboard, currentUserId);

            console.log('LeaderboardScreen loaded successfully!');
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }

    private setupEventListeners(): void {
        const returnButton = this.view.getReturnButton();

        returnButton.on('click', () => {
            this.navigateToMenuScreen();
        });
    }

    private navigateToMenuScreen(): void {
        const stage = this.layer.getStage();
        if (!stage) return;

        // Clear the stage
        stage.destroyChildren();

        // Create new layer for menu screen
        const menuLayer = new Konva.Layer();
        stage.add(menuLayer);

        // Initialize menu screen
        new MenuScreenController(menuLayer);

        stage.draw();
        console.log('Navigated back to Menu Screen');
    }
}