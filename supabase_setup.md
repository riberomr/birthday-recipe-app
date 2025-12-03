# Supabase Setup Guide

Follow these steps to connect your Birthday Recipe App to Supabase.

## 1. Create a Supabase Project
1.  Go to [Supabase](https://supabase.com/) and sign in.
2.  Click "New Project".
3.  Enter a name (e.g., "Birthday Recipe App"), database password, and choose a region.
4.  Click "Create new project".

## 2. Get API Credentials
1.  Once the project is created, go to **Settings** (cog icon) > **API**.
2.  Copy the `Project URL` and `anon public` key.
3.  In your local project, rename `.env.example` to `.env.local` (if you haven't already) and paste the values:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

## 3. Set up Authentication
1.  Go to **Authentication** > **Providers** in the Supabase dashboard.
2.  Ensure **Email** is enabled.
3.  (Optional) Disable "Confirm email" in **Authentication** > **URL Configuration** if you want users to log in immediately without email verification for testing.

## 4. Run Database Scripts
1.  Go to the **SQL Editor** in the Supabase dashboard.
2.  Click "New Query".
3.  Copy the contents of `supabase/schema.sql` (the base schema) and paste it into the editor. Click "Run".
4.  Clear the editor (or create a new query).
5.  Copy the contents of `supabase/schema_updates.sql` (the new tables and policies) and paste it into the editor. Click "Run".

## 5. Enable Real Authentication in App
1.  Open `components/AuthContext.tsx`.
2.  Change `const USE_MOCK_AUTH = true` to `const USE_MOCK_AUTH = false`.
3.  Restart your development server (`npm run dev`).

## 6. Verify
1.  Click "Entrar" in the app. You should see a login form (or be redirected to Supabase login if using a different flow).
2.  Sign up a new user.
3.  Verify you can create recipes, rate, and comment.
