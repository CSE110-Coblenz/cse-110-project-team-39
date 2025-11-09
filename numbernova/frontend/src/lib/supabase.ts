import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const signInWithEmail = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
        email,
        password,
    });
};

export const signUpWithEmail = async (email: string, password: string) => {
    return await supabase.auth.signUp({
        email,
        password,
    });
};

export const signOut = async () => {
    return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};