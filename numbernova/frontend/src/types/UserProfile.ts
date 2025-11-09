export interface UserProfile {
    id: string;
    username?: string;
    profile_name?: string;
    score: number;
    rank?: number;
    level?: number;
    ship_color?: string;
    tokens?: number;
    profile_picture_url?: string;
}