-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- This triggers a profile creation when a user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Add user_id to recipes table
alter table public.recipes 
add column user_id uuid references public.profiles(id) on delete set null;

-- Create comments table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Create ratings table
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default now(),
  unique(recipe_id, user_id)
);

-- Create recipe_photos table (for user uploads)
create table public.recipe_photos (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  url text not null,
  caption text,
  created_at timestamp with time zone default now()
);

-- Create recipe_nutrition table
create table public.recipe_nutrition (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  name text not null,
  amount text not null,
  unit text
);

-- Enable RLS for new tables
alter table public.comments enable row level security;
alter table public.ratings enable row level security;
alter table public.recipe_photos enable row level security;
alter table public.recipe_nutrition enable row level security;

-- Policies for comments
create policy "Comments are viewable by everyone." on public.comments for select using (true);
create policy "Authenticated users can create comments." on public.comments for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own comments." on public.comments for update using (auth.uid() = user_id);
create policy "Users can delete their own comments." on public.comments for delete using (auth.uid() = user_id);

-- Policies for ratings
create policy "Ratings are viewable by everyone." on public.ratings for select using (true);
create policy "Authenticated users can create ratings." on public.ratings for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own ratings." on public.ratings for update using (auth.uid() = user_id);
create policy "Users can delete their own ratings." on public.ratings for delete using (auth.uid() = user_id);

-- Policies for recipe_photos
create policy "Photos are viewable by everyone." on public.recipe_photos for select using (true);
create policy "Authenticated users can upload photos." on public.recipe_photos for insert with check (auth.role() = 'authenticated');
create policy "Users can delete their own photos." on public.recipe_photos for delete using (auth.uid() = user_id);

-- Policies for recipe_nutrition
create policy "Nutrition info is viewable by everyone." on public.recipe_nutrition for select using (true);
-- Assuming nutrition is managed by recipe creator (via recipe update) or admin. 
-- For simplicity, if users can create recipes, they should be able to add nutrition.
create policy "Authenticated users can add nutrition." on public.recipe_nutrition for insert with check (auth.role() = 'authenticated');


-- ===========================================
-- SEED DATA (Example)
-- ===========================================

-- Note: In a real scenario, you'd need valid UUIDs for users and recipes.
-- This block assumes you might manually run parts of it or have existing IDs.
-- Here is an example of how to insert nutrition data for a hypothetical recipe.

/*
INSERT INTO public.recipe_nutrition (recipe_id, name, amount, unit)
VALUES 
  ('e761dd82-845a-499b-90fc-499c4630fccd', 'Calorías', '350', 'kcal'),
  ('e761dd82-845a-499b-90fc-499c4630fccd', 'Proteínas', '12', 'g'),
  ('e761dd82-845a-499b-90fc-499c4630fccd', 'Grasas', '15', 'g');
*/
