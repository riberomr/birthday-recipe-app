-- Add is_deleted column to comments table
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policies if necessary
-- (Assuming existing policies might need adjustment, but usually simple updates don't require policy changes if the user owns the row. 
-- However, for logical delete we are doing an UPDATE. 
-- We need to ensure the user can UPDATE the row if they are the author OR the recipe owner.)

-- Policy for updating comments (Logical Delete)
-- Users can update their own comments OR the owner of the recipe can update comments on their recipe
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;

CREATE POLICY "Users can update their own comments or recipe owners" 
ON public.comments FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE recipes.id = comments.recipe_id 
    AND recipes.user_id = auth.uid()
  )
);
