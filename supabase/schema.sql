-- ===========================================
-- TABLE: recipe_categories
-- ===========================================

create table public.recipe_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- ===========================================
-- TABLE: recipes
-- ===========================================

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  prep_time_minutes integer default 0,
  cook_time_minutes integer default 0,
  category_id uuid references public.recipe_categories(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- ===========================================
-- TABLE: recipe_ingredients
-- ===========================================

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  name text not null,
  amount text,
  optional boolean default false
);

create index idx_recipe_ingredients_recipe_id
  on public.recipe_ingredients(recipe_id);

-- ===========================================
-- TABLE: recipe_steps
-- ===========================================

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  step_order integer not null,
  content text not null
);

create unique index idx_recipe_steps_unique_order
  on public.recipe_steps(recipe_id, step_order);

create index idx_recipe_steps_recipe_id
  on public.recipe_steps(recipe_id);

-- ===========================================
-- SEED DATA
-- ===========================================

insert into recipe_categories (name)
values ('Pastas'), ('Postres'), ('Sopas'), ('Cocina Rápida'), ('Cumpleaños Kawaii')
on conflict do nothing;
