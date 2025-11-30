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
    private currency: number;

    constructor(userId: string) {
        //Todo: fetch user data from supabase
        const initialData = {
            score: null,
            level: null,
            ship_color: null,
            rank: null,
            profile_name: null,
            profile_picture_url: null,
            games_played: null,
            games_won: null,
            currency: null
        };

        this.userId = userId;
        this.score = initialData?.score ?? 0;
        this.level = initialData?.level ?? 1;
        this.shipColor = initialData?.ship_color ?? 'red';
        this.rank = initialData?.rank ?? 'Rookie';
        this.profileName = initialData?.profile_name ?? 'Player';
        this.profilePictureUrl = initialData?.profile_picture_url ?? 'data:image/png;base64,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';
        this.gamesPlayed = initialData?.games_played ?? 0;
        this.gamesWon = initialData?.games_won ?? 0;
        this.currency = initialData?.currency ?? 0;

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

    public getCurrency(): number {
        return this.currency;
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