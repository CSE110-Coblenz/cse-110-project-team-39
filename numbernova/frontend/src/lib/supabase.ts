import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
// Note: In Vite, we use import.meta.env to access environment variables from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}
// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper function to sign up with email and password
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  })
  return { data, error };
}

// Helper function to sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
  return { data, error };
}
// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};
// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
};

// Helper function to get all user profiles
export const getUserProfiles = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(10)
    .order('score', { ascending: false });
  if (error) {
    console.error('Error fetching user profiles:', error);
    return null;
  }
  return data;
};

// Helper function to update user profile
export const updateUserProfile = async (
  userId: string,
  updates: { score?: number; level?: number; ship_color?: string; tokens?: number; profile_name?: string; profile_picture_url?: string; unlocked_colors?: Record<string, boolean> }
) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId);
  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
  return data;
};