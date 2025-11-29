export class ProfileScreenModel {

    private userId: string;
    private score: number;
    private level: number
    private shipColor: string;
    private rank: string
    private profileName: string;
    private profilePictureUrl: string;
    private gamesPlayed: number;
    private gamesWon: number;

    constructor(userId: string, initialData?: { score?: number; level?: number; ship_color?: string; rank?: string; profile_name?: string; profile_picture_url?: string; games_played?: number; games_won?: number; }) {
        //Todo: fetch user data from supabase
        this.userId = userId;
        this.score = initialData?.score ?? 0;
        this.level = initialData?.level ?? 1;
        this.shipColor = initialData?.ship_color ?? 'red';
        this.rank = initialData?.rank ?? 'Rookie';
        this.profileName = initialData?.profile_name ?? 'Player';
        this.profilePictureUrl = initialData?.profile_picture_url ?? '';
        this.gamesPlayed = initialData?.games_played ?? 0;
        this.gamesWon = initialData?.games_won ?? 0;

        // In a real implementation, you would fetch this data from a backend service
    }

    public getUserId(): string {
        return this.userId;
    }

    public getScore(): number {
        return this.score;
    }

    public getLevel(): number {
        return this.level;
    }

    public getShipColor(): string {
        return this.shipColor;
    }

    public getRank(): string {
        return this.rank;
    }

    public getProfileName(): string {
        return this.profileName;
    }

    public getProfilePictureUrl(): string {
        return this.profilePictureUrl;
    }

    public getGamesPlayed(): number {
        return this.gamesPlayed;
    }

    public getGamesWon(): number {
        return this.gamesWon;
    }   

    public async updateProfileName(newName: string): Promise<void> {
        this.profileName = newName;
        // Update backend with new profile name
    }

    public async updateProfilePicture(newUrl: string): Promise<void> {
        this.profilePictureUrl = newUrl;
        // Update backend with new profile picture URL
    }
}