import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const forceMockFlag = import.meta.env.VITE_SUPABASE_FORCE_MOCK === 'true';

const looksMissing = (value: string | undefined | null) => !value || value.trim().length === 0;
const looksPlaceholder = (value: string | undefined | null) =>
  !value || /your_supabase/i.test(value) || /anon_key_here/i.test(value) || value === 'mock-anon-key';

const shouldTreatUrlMissing = looksMissing(supabaseUrl) || looksPlaceholder(supabaseUrl);
const shouldTreatKeyMissing = looksMissing(supabaseAnonKey) || looksPlaceholder(supabaseAnonKey);

const isMissingEnv = shouldTreatUrlMissing || shouldTreatKeyMissing;

const MOCK_MODE = forceMockFlag || isMissingEnv;
const resolvedUrl = supabaseUrl ?? 'https://placeholder.supabase.co';
const resolvedAnonKey = supabaseAnonKey ?? 'placeholder-anon-key';

if (!MOCK_MODE && isMissingEnv) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

if (MOCK_MODE) {
  console.warn(
    '[Supabase] Running in mock mode. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or set VITE_SUPABASE_FORCE_MOCK=false) to enable the real backend.'
  );
}

// Create a single supabase client for interacting with your database
export const supabase = !MOCK_MODE
  ? createClient<Database>(resolvedUrl, resolvedAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

const simulateNetworkDelay = (ms = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_USER_ID = 'mock-user-id';

const mockAuthPayload = (email: string) => ({
  user: {
    id: MOCK_USER_ID,
    email,
  },
  session: {
    access_token: 'mock-access-token',
    token_type: 'bearer',
    expires_in: 3600,
  },
});

type MockAuthResponse = {
  data: ReturnType<typeof mockAuthPayload>;
  error: null;
};

const mockSuccess = async (email: string): Promise<MockAuthResponse> => {
  await simulateNetworkDelay();
  console.info(`[Mock Supabase] Auth success for ${email}`);
  return { data: mockAuthPayload(email), error: null };
};

// Helper function to sign up with email and password
export async function signUpWithEmail(email: string, password: string) {
  if (MOCK_MODE) {
    return mockSuccess(email);
  }

  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
  });

  return { data, error };
}

// Helper function to sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  if (MOCK_MODE) {
    return mockSuccess(email);
  }

  const { data, error } = await supabase!.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

// Helper function to get the current user
export const getCurrentUser = async () => {
  if (MOCK_MODE) {
    return mockAuthPayload('mock-user@example.com').user;
  }

  const {
    data: { user },
    error,
  } = await supabase!.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  if (MOCK_MODE) {
    await simulateNetworkDelay(300);
    console.info(`[Mock Supabase] Returning profile for ${userId}`);
    return {
      id: userId,
      score: 0,
      level: 1,
      ship_color: 'blue',
    };
  }

  const { data, error } = await supabase!
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

// Helper function to update user profile
export const updateUserProfile = async (
  userId: string,
  updates: { score?: number; level?: number; ship_color?: string }
) => {
  if (MOCK_MODE) {
    await simulateNetworkDelay(300);
    console.info(`[Mock Supabase] Updating profile for ${userId}`, updates);
    return {
      id: userId,
      ...updates,
    };
  }

  const { data, error } = await supabase!
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
};
