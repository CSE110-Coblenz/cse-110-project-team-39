import { Database } from './database';

export interface UserProfile {
    id: Database['public']['Tables']['user_profiles']['Row']['id'];
    score: Database['public']['Tables']['user_profiles']['Row']['score'];
    level: Database['public']['Tables']['user_profiles']['Row']['level'];
    ship_color: Database['public']['Tables']['user_profiles']['Row']['ship_color'];
    rank: Database['public']['Tables']['user_profiles']['Row']['rank'];
    created_at: Database['public']['Tables']['user_profiles']['Row']['created_at'];
    updated_at: Database['public']['Tables']['user_profiles']['Row']['updated_at'];
    profile_name: Database['public']['Tables']['user_profiles']['Row']['profile_name'];
    profile_picture_url: Database['public']['Tables']['user_profiles']['Row']['profile_picture_url'];
    games_played: Database['public']['Tables']['user_profiles']['Row']['games_played'];
    games_won: Database['public']['Tables']['user_profiles']['Row']['games_won'];
    tokens: Database['public']['Tables']['user_profiles']['Row']['tokens'];
    unlocked_colors: Database['public']['Tables']['user_profiles']['Row']['unlocked_colors'];
}