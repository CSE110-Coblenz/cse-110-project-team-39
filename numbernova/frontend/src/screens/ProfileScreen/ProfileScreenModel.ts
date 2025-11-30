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
        this.profilePictureUrl = initialData?.profile_picture_url ?? '';
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