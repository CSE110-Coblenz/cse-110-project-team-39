import Konva from 'konva';
import { COLORS, DIMENSIONS } from '../../constants';
import { UserProfile } from '../../types/UserProfile';

export class LeaderboardScreenView {
    private layer: Konva.Layer;
    private background: Konva.Rect;
    private returnButton: Konva.Group;
    private title: Konva.Text;
    private container: Konva.Group;
    private leaderboardEntries: Konva.Group[] = [];

    constructor(layer: Konva.Layer) {
        this.layer = layer;
        this.createBackground();
        this.createReturnButton();
        this.createTitle();
        this.createContainer();
    }

    private createBackground(): void {
        this.background = new Konva.Rect({
            x: 0,
            y: 0,
            width: DIMENSIONS.width,
            height: DIMENSIONS.height,
            fill: 'transparent'
        });
        this.layer.add(this.background);
    }

    private createReturnButton(): void {
        this.returnButton = new Konva.Group({
            x: 50,
            y: 40,
        });

        const buttonBg = new Konva.Rect({
            width: 180,
            height: 45,
            fill: COLORS.primary,
            cornerRadius: 20,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: { x: 0, y: 4 },
            shadowOpacity: 0.3,
        });

        const buttonText = new Konva.Text({
            text: 'Return to Main Menu',
            fontSize: 16,
            fontFamily: 'Jersey 10',
            fill: COLORS.text,
            width: 180,
            height: 45,
            align: 'center',
            verticalAlign: 'middle',
        });

        this.returnButton.add(buttonBg);
        this.returnButton.add(buttonText);

        // Add hover effect
        this.returnButton.on('mouseenter', () => {
            buttonBg.fill(COLORS.buttonHover);
            document.body.style.cursor = 'pointer';
        });

        this.returnButton.on('mouseleave', () => {
            buttonBg.fill(COLORS.primary);
            document.body.style.cursor = 'default';
        });

        this.layer.add(this.returnButton);
    }

    private createTitle(): void {
        this.title = new Konva.Text({
            x: DIMENSIONS.width / 2,
            y: 50,
            text: 'Leaderboard',
            fontSize: 42,
            fontFamily: 'Jersey 10',
            fill: COLORS.text,
            align: 'center',
            offsetX: 100, // Approximate half width of text
        });
        this.layer.add(this.title);
    }

    private createContainer(): void {
        this.container = new Konva.Group({
            x: DIMENSIONS.width / 2 - 300,
            y: 130,
        });

        // Container background
        const containerBg = new Konva.Rect({
            width: 600,
            height: 550,
            fill: COLORS.primary,
            cornerRadius: 25,
            opacity: 0.8,
            shadowColor: 'black',
            shadowBlur: 20,
            shadowOffset: { x: 0, y: 10 },
            shadowOpacity: 0.3,
        });

        this.container.add(containerBg);
        this.layer.add(this.container);
    }

    public displayLeaderboard(leaderboard: UserProfile[], currentUserId: string | null): void {
        // Clear existing entries
        this.leaderboardEntries.forEach(entry => entry.destroy());
        this.leaderboardEntries = [];

        let currentUserInTop10 = false;
        let currentUserData: UserProfile | null = null;

        // Check if current user is in the leaderboard
        if (currentUserId) {
            const userIndex = leaderboard.findIndex(user => user.id === currentUserId);
            if (userIndex !== -1) {
                currentUserInTop10 = userIndex < 10;
                currentUserData = leaderboard[userIndex];
            }
        }

        // Display top 10 entries
        const topEntries = leaderboard.slice(0, 10);
        topEntries.forEach((user, index) => {
            const isCurrentUser = currentUserId && user.id === currentUserId;
            
            // Use username if available, otherwise fall back to profile_name or 'Anonymous'
            const displayName =
                (user as any).username ||
                (user as any).profile_name ||
                'Anonymous';

            const displayScore = user.score || 0;
            const displayRank = user.rank || (index + 1);
            
            const entry = this.createLeaderboardEntry(
                displayRank,
                displayName,
                displayScore,
                index,
                !isCurrentUser
            );
            this.container.add(entry);
            this.leaderboardEntries.push(entry);
        });

        // If current user is not in top 10, add them at the bottom
        if (currentUserId && !currentUserInTop10 && currentUserData) {
            const displayName =
                (currentUserData as any).username ||
                (currentUserData as any).profile_name ||
                'You';

            const displayScore = currentUserData.score || 0;
            const displayRank = currentUserData.rank || leaderboard.length + 1;
            
            const userEntry = this.createLeaderboardEntry(
                displayRank,
                displayName,
                displayScore,
                10, // Position at index 10 (11th position)
                true // Always highlight as current user
            );
            this.container.add(userEntry);
            this.leaderboardEntries.push(userEntry);
        }

        this.layer.batchDraw();
    }

    private createLeaderboardEntry(
        rank: number,
        name: string,
        score: number,
        position: number,
        isCurrentUser: boolean
    ): Konva.Group {
        const entry = new Konva.Group({
            x: 30,
            y: 40 + position * 45,
        });

        // Determine background color based on rank
        let bgColor = COLORS.primaryLight;
        if (rank === 1) {
            bgColor = '#FFD700'; // Gold
        } else if (rank === 2) {
            bgColor = '#C0C0C0'; // Silver
        } else if (rank === 3) {
            bgColor = '#CD7F32'; // Bronze
        }

        // Rank number
        const rankText = new Konva.Text({
            x: 0,
            y: 10,
            text: rank.toString(),
            fontSize: 20,
            fontFamily: 'Jersey 10',
            fill: COLORS.text,
            width: 50,
            align: 'center',
        });

        // Player name background
        const nameBg = new Konva.Rect({
            x: 60,
            y: 0,
            width: 480,
            height: 38,
            fill: bgColor,
            cornerRadius: 19,
            opacity: 0.8,
            stroke: isCurrentUser ? '#d8b3e0' : undefined,
            strokeWidth: isCurrentUser ? 3 : 0,
            shadowColor: isCurrentUser ? '#9B6DD6' : undefined,
            shadowBlur: isCurrentUser ? 10 : 0,
            shadowOpacity: isCurrentUser ? 0.6 : 0,
        });

        // Player name text
        const nameText = new Konva.Text({
            x: 75,
            y: 10,
            text: name,
            fontSize: 18,
            fontFamily: 'Jersey 10',
            fill: rank <= 3 ? '#000000' : COLORS.text,
            width: 350,
            align: 'left',
        });

        // Score text
        const scoreText = new Konva.Text({
            x: 460,
            y: 10,
            text: score.toString(),
            fontSize: 18,
            fontFamily: 'Jersey 10',
            fill: rank <= 3 ? '#000000' : COLORS.text,
            width: 70,
            align: 'right',
        });

        entry.add(nameBg);
        entry.add(rankText);
        entry.add(nameText);
        entry.add(scoreText);

        return entry;
    }

    public getReturnButton(): Konva.Group {
        return this.returnButton;
    }
}