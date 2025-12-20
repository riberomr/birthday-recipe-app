-- Add is_deleted column to recipes table for logical delete
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- ===========================================
-- IMPROVEMENTS BASED ON TODOs
-- ===========================================

-- 1. Add ON DELETE CASCADE to foreign keys where appropriate
-- Recipes: When a user is deleted, their recipes should be deleted (or handled by business logic, but CASCADE is safer for cleanup)
ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipes_user_id_fkey;
ALTER TABLE public.recipes ADD CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Comments: When a recipe is deleted, comments should be deleted
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_recipe_id_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;

-- Comments: When a user is deleted, their comments should be deleted
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Favorites: When a recipe is deleted, favorites should be deleted
ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_recipe_id_fkey;
ALTER TABLE public.favorites ADD CONSTRAINT favorites_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;

-- Ratings: When a recipe is deleted, ratings should be deleted
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_recipe_id_fkey;
ALTER TABLE public.ratings ADD CONSTRAINT ratings_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;

-- Ratings: When a user is deleted, their ratings should be deleted
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_user_id_fkey;
ALTER TABLE public.ratings ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Recipe Ingredients: When a recipe is deleted, ingredients should be deleted
ALTER TABLE public.recipe_ingredients DROP CONSTRAINT IF EXISTS recipe_ingredients_recipe_id_fkey;
ALTER TABLE public.recipe_ingredients ADD CONSTRAINT recipe_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;

-- Recipe Nutrition: When a recipe is deleted, nutrition info should be deleted
ALTER TABLE public.recipe_nutrition DROP CONSTRAINT IF EXISTS recipe_nutrition_recipe_id_fkey;
ALTER TABLE public.recipe_nutrition ADD CONSTRAINT recipe_nutrition_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;
-- Recipe Photos: When a recipe is deleted, photos should be deleted
ALTER TABLE public.recipe_photos DROP CONSTRAINT IF EXISTS recipe_photos_recipe_id_fkey;
ALTER TABLE public.recipe_photos ADD CONSTRAINT recipe_photos_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;
-- Recipe Steps: When a recipe is deleted, steps should be deleted
ALTER TABLE public.recipe_steps DROP CONSTRAINT IF EXISTS recipe_steps_recipe_id_fkey;
ALTER TABLE public.recipe_steps ADD CONSTRAINT recipe_steps_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;
-- Recipe Tags: When a recipe is deleted, tag associations should be deleted
ALTER TABLE public.recipe_tags DROP CONSTRAINT IF EXISTS recipe_tags_recipe_id_fkey;
ALTER TABLE public.recipe_tags ADD CONSTRAINT recipe_tags_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


-- 2. Indexes for performance
-- Index on recipes.user_id for filtering by user
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);

-- Index on recipes.category_id for filtering by category
CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON public.recipes(category_id);

-- Composite indexes for filtering by user/category and logical deletion status
CREATE INDEX IF NOT EXISTS idx_recipes_user_id_not_deleted ON public.recipes(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_recipes_category_id_not_deleted ON public.recipes(category_id, is_deleted);

-- Index on comments.recipe_id for fetching comments for a recipe
CREATE INDEX IF NOT EXISTS idx_comments_recipe_id ON public.comments(recipe_id);

-- Index on ratings.recipe_id for calculating average rating
CREATE INDEX IF NOT EXISTS idx_ratings_recipe_id ON public.ratings(recipe_id);

-- Index on recipe_ingredients.recipe_id
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);

-- Index on recipe_steps.recipe_id
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON public.recipe_steps(recipe_id);


-- 3. Check constraints
-- Ensure prep_time and cook_time are non-negative
ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS check_prep_time_non_negative;
ALTER TABLE public.recipes ADD CONSTRAINT check_prep_time_non_negative CHECK (prep_time_minutes >= 0);
ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS check_cook_time_non_negative;
ALTER TABLE public.recipes ADD CONSTRAINT check_cook_time_non_negative CHECK (cook_time_minutes >= 0);
-- Ensure servings is positive
ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS check_servings_positive;
ALTER TABLE public.recipes ADD CONSTRAINT check_servings_positive CHECK (servings > 0);
