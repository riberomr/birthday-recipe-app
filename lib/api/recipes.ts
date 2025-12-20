import { supabase } from "../supabase/client"
import { Recipe, RecipeCategory } from "@/types"
import { getAverageRating } from "../utils"

export async function getCategories(): Promise<RecipeCategory[]> {
    const { data, error } = await supabase
        .from("recipe_categories")
        .select("*")
        .order("name")

    if (error) {
        console.error("Error fetching categories:", error)
        return []
    }

    return data || []
}

export type RecipeFilters = {
    search?: string
    category?: string
    difficulty?: string
    time?: string
    tags?: string[]
    user_id?: string
}

export async function getRecipes(
    page: number = 1,
    limit: number = 6,
    filters: RecipeFilters = {}
): Promise<{ recipes: Recipe[]; total: number }> {

    const hasTagsFilter = !!(filters.tags && filters.tags.length > 0)

    let query = supabase
        .from("recipes")
        .select(`
      *,
      recipe_ingredients (*),
      recipe_categories (*),
      ratings (rating),
      recipe_tags${hasTagsFilter ? '!inner' : ''} (
      tag_id,
      tags (*)
        ),
      profile:profiles (
        id,
        email,
        full_name,
        avatar_url,
        updated_at
      )
    `, { count: 'exact' })
        .eq("is_deleted", false)

    // Apply filters
    if (filters.category) {
        query = query.eq("category_id", filters.category)
    }

    if (filters.difficulty) {
        query = query.eq("difficulty", filters.difficulty)
    }

    if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        // Note: This is a simple ILIKE search. For more complex search, consider full text search.
        // Searching in multiple columns with OR in Supabase requires specific syntax
        query = query.or(`title.ilike.%${searchLower}%,description.ilike.%${searchLower}%`)
    }

    // Time filter needs to be handled carefully as it involves calculation or range
    // Ideally, we would filter this on the DB side.
    // "fast" < 20, "medium" 20-60, "slow" > 60
    if (filters.time) {
        if (filters.time === "fast") {
            // This is tricky because total time is sum of prep + cook.
            // We might need a computed column or just filter in memory if dataset is small,
            // but for pagination we should try to filter in DB.
            // For now, let's assume we can't easily filter sum of columns in simple query builder without RPC.
            // We will filter by cook_time_minutes as a proxy or skip this filter in DB and do it in memory?
            // "make the page of recipes... a page with infinite scroll... params in the get endpoint"
            // Let's try to use a raw filter or just filter by cook_time for now to keep it simple,
            // or use a greater limit and filter in memory (not ideal for pagination).
            // BETTER APPROACH: Use Supabase RPC or just filter on cook_time for simplicity in this demo,
            // OR since we are using client side filtering before, maybe we can keep it simple.
            // Let's try to filter by cook_time_minutes for now.
            query = query.lt("cook_time_minutes", 20)
        } else if (filters.time === "medium") {
            query = query.gte("cook_time_minutes", 20).lte("cook_time_minutes", 60)
        } else if (filters.time === "slow") {
            query = query.gt("cook_time_minutes", 60)
        }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
        // if tags is an array, we need to filter on the joined table
        // we need recipes that have ANY of the tags
        // !inner join is needed to filter parent by child
        // thats the reason to have a condition in the select
        query = query.in("recipe_tags.tag_id", filters.tags)
    }

    // User filter
    if (filters.user_id) {
        query = query.eq("user_id", filters.user_id)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order("created_at", { ascending: false })

    const { data, error, count } = await query

    if (error) {
        console.error("Error fetching recipes:", error)
        return { recipes: [], total: 0 }
    }

    const recipes = (data || []).map((recipe) => {
        const average_rating = getAverageRating(recipe.ratings)
        return { ...recipe, average_rating }
    })

    return { recipes: recipes, total: count || 0 }
}

export async function getRecipe(id: string): Promise<Recipe | null> {
    const { data, error } = await supabase
        .from("recipes")
        .select(`
      *,
      recipe_ingredients (*),
      recipe_steps (*),
      recipe_categories (*),
      recipe_nutrition (*),
      ratings (rating),
      recipe_tags (tags (*)),
      profile:profiles (
        id,
        email,
        full_name,
        avatar_url,
        updated_at
      )
    `)
        .eq("id", id)
        .eq("is_deleted", false)
        .single()

    if (error) {
        console.error("Error fetching recipe:", error)
        return null
    }

    if (!data) return null

    data.average_rating = getAverageRating(data.ratings)
    // Sort steps by order
    if (data && data.recipe_steps) {
        data.recipe_steps.sort((a: any, b: any) => a.step_order - b.step_order)
    }

    return data
}

type RecipeCommunityPhoto = {
    image_url: string
}
export async function getRecipeCommunityPhotos(recipeId: string): Promise<RecipeCommunityPhoto[] | null> {
    const { data, error } = await supabase
        .from("comments")
        .select(`
                image_url
            `)
        .eq("recipe_id", recipeId)
        .not("image_url", "is", null)
        .neq("image_url", "")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching community photos:", error)
        return null
    }

    return data
}

import { auth } from "@/lib/firebase/client";

export async function createRecipe(formData: FormData) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const token = await user.getIdToken();

    const response = await fetch('/api/create-recipe-with-image', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error desconocido al crear la receta');
    }

    return result;
}

export async function updateRecipe(recipeId: string, formData: FormData) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const token = await user.getIdToken();

    // Append recipe_id to formData
    formData.append('recipe_id', recipeId);

    const response = await fetch('/api/update-recipe-with-image', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error desconocido al actualizar la receta');
    }

    return result;
}

/**
 * Performs a logical delete of a recipe.
 *
 * This function sets the `is_deleted` flag to true in the database, effectively hiding the recipe
 * from the application UI while preserving the data for potential restoration or audit purposes.
 * It does NOT remove the record from the database.
 *
 * We separate logical and permanent delete operations to ensure safety and prevent accidental data loss.
 * Logical delete is the default action for users.
 *
 * @param id - The unique identifier of the recipe to delete.
 * @returns A promise that resolves to the API response result.
 * @throws Error if the user is not authenticated or the operation fails.
 */
export async function deleteRecipe(id: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const token = await user.getIdToken();

    const response = await fetch(`/api/recipes/${id}/delete`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error desconocido al eliminar la receta');
    }

    return result;
}

/**
 * Performs a permanent (physical) delete of a recipe.
 *
 * This function IRREVERSIBLY removes the recipe record from the database.
 * Once executed, the data cannot be recovered. This should be used with extreme caution,
 * typically for administrative purposes or GDPR compliance.
 *
 * We keep this separate from the standard delete to enforce a clear distinction between
 * reversible (soft) and irreversible (hard) actions.
 *
 * @param id - The unique identifier of the recipe to permanently delete.
 * @returns A promise that resolves to the API response result.
 * @throws Error if the user is not authenticated or the operation fails.
 */
export async function deleteRecipePermanently(id: string) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const token = await user.getIdToken();

    const response = await fetch(`/api/recipes/${id}/permanent-delete`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error desconocido al eliminar la receta permanentemente');
    }

    return result;
}

