# Number Nova Backend - Database Documentation

## Overview
This backend folder contains the database schema and Supabase configuration for the Number Nova game.

## Structure

```
backend/
├── .env                    # Supabase environment variables
├── DATABASE.md            # This documentation file
└── migrations/            # SQL migration files documenting database schema
    ├── 001_user_profiles.sql    # User profiles table
    ├── 002_rls_policies.sql     # Row Level Security policies
    └── 003_triggers.sql         # Database triggers
```

## Database Schema

### Tables

#### `user_profiles`
Stores game-related user profile information.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | - | Primary key, references auth.users(id) |
| score | INTEGER | 0 | Player's current score |
| level | INTEGER | 1 | Player's current level |
| ship_color | TEXT | 'blue' | Player's ship color |
| created_at | TIMESTAMPTZ | NOW() | Profile creation timestamp |
| updated_at | TIMESTAMPTZ | NOW() | Last update timestamp |

### Authentication
Uses Supabase's built-in authentication system (`auth.users` table).

### Security
- Row Level Security (RLS) enabled on `user_profiles`
- Users can only view and update their own profiles
- Profiles are automatically created when users sign up

### Triggers
1. **on_auth_user_created**: Auto-creates user profile when new user signs up
2. **update_user_profiles_updated_at**: Updates the `updated_at` timestamp on profile changes

## Environment Variables

The `.env` file contains:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Frontend Integration

The frontend accesses the database through:
- `/frontend/src/lib/supabase.ts` - Supabase client initialization
- `/frontend/src/types/database.ts` - TypeScript types

The frontend's Vite configuration loads environment variables from this backend folder.