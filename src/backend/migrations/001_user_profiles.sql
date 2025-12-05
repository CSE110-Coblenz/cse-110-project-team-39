-- Create user_profiles table for Number Nova game
CREATE TABLE IF NOT EXISTS public.user_profiles (
    -- Primary key that references the auth.users table
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Game-related fields
    score INTEGER NOT NULL DEFAULT 0,
    rank INTEGER NULL DEFAULT NULL,
    tokens INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    ship_color TEXT NOT NULL DEFAULT '#ff6b6b',
    games_played INTEGER NOT NULL DEFAULT 0,
    games_won INTEGER NOT NULL DEFAULT 0,
    profile_picture_url TEXT NULL DEFAULT NULL,
    profile_name TEXT NULL DEFAULT NULL,
    

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- Add check constraints to ensure valid data (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'score_non_negative'
    ) THEN
        ALTER TABLE public.user_profiles
            ADD CONSTRAINT score_non_negative CHECK (score >= 0);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'level_positive'
    ) THEN
        ALTER TABLE public.user_profiles
            ADD CONSTRAINT level_positive CHECK (level >= 1);
    END IF;
END $$;

-- Create an index on id for faster lookups (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);

-- Create an index on score for faster ranking calculations (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_user_profiles_score ON public.user_profiles(score DESC);

-- Add a comment to describe the table
COMMENT ON TABLE public.user_profiles IS 'Stores game-related user profile information for Number Nova';
