-- ===========================================
-- TABLE: tags
-- ===========================================

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text -- e.g., 'diet', 'occasion', 'difficulty' (though difficulty is also a column, tags can be flexible)
);

-- ===========================================
-- TABLE: recipe_tags
-- ===========================================

create table public.recipe_tags (
  recipe_id uuid references public.recipes(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (recipe_id, tag_id)
);

-- ===========================================
-- TABLE: favorites
-- ===========================================

create table public.favorites (
  user_id uuid not null, -- Assuming we link to auth.users but keeping it loose for now or strictly referencing if auth schema is available
  recipe_id uuid references public.recipes(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, recipe_id)
);

-- ===========================================
-- UPDATES: recipes
-- ===========================================

alter table public.recipes 
add column if not exists difficulty text, -- 'easy', 'medium', 'hard'
add column if not exists servings integer default 4;

-- ===========================================
-- SEED DATA: tags
-- ===========================================

insert into tags (name, type) values
('Vegana', 'diet'),
('Sin Gluten', 'diet'),
('Rápida', 'time'), -- < 20 mins
('Cumpleaños', 'occasion'),
('Navidad', 'occasion')
on conflict do nothing;
