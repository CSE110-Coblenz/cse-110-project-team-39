-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, score, level, ship_color)
    VALUES (NEW.id, 0, 1, 'blue');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up (drop and recreate to ensure consistency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column (drop and recreate to ensure consistency)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to recalculate ranks based on scores
-- Rank 1 = highest score, Rank 2 = second highest, etc.
CREATE OR REPLACE FUNCTION public.update_user_ranks()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all ranks based on score ranking (highest score = rank 1)
    UPDATE public.user_profiles
    SET rank = ranked.rank_position
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) AS rank_position
        FROM public.user_profiles
    ) AS ranked
    WHERE public.user_profiles.id = ranked.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate ranks when a new user is inserted
DROP TRIGGER IF EXISTS update_ranks_on_insert ON public.user_profiles;
CREATE TRIGGER update_ranks_on_insert
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_ranks();

-- Trigger to recalculate ranks when score changes (only on UPDATE, not INSERT)
DROP TRIGGER IF EXISTS update_ranks_on_score_change ON public.user_profiles;
CREATE TRIGGER update_ranks_on_score_change
    AFTER UPDATE OF score ON public.user_profiles
    FOR EACH ROW
    WHEN (OLD.score IS DISTINCT FROM NEW.score)
    EXECUTE FUNCTION public.update_user_ranks();

-- Initialize ranks for existing users (safe to run multiple times)
UPDATE public.user_profiles
SET rank = ranked.rank_position
FROM (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) AS rank_position
    FROM public.user_profiles
) AS ranked
WHERE public.user_profiles.id = ranked.id;