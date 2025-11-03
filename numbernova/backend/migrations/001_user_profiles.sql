-- Create user_profiles table for Number Nova game
CREATE TABLE IF NOT EXISTS public.user_profiles (
    -- Primary key that references the auth.users table
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Game-related fields
    score INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    ship_color TEXT NOT NULL DEFAULT 'blue',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add check constraints to ensure valid data
ALTER TABLE public.user_profiles
    ADD CONSTRAINT score_non_negative CHECK (score >= 0),
    ADD CONSTRAINT level_positive CHECK (level >= 1);

-- Create an index on id for faster lookups
CREATE INDEX idx_user_profiles_id ON public.user_profiles(id);

-- Add a comment to describe the table
COMMENT ON TABLE public.user_profiles IS 'Stores game-related user profile information for Number Nova';